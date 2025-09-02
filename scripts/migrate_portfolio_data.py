#!/usr/bin/env python3
"""
Portfolio Data Migration Script

This script migrates data from data/mytwin.json to PostgreSQL database and 
generates vector embeddings using Upstash Vector's mixbread-large model.

Features:
- JSON data validation and parsing
- PostgreSQL data insertion with proper schema
- Content chunk extraction and optimization for RAG
- Vector embedding generation with metadata
- Comprehensive error handling and logging
- Progress tracking and recovery mechanisms

Usage:
    python scripts/migrate_portfolio_data.py

Requirements:
    - PostgreSQL database (Neon)
    - Upstash Vector database
    - Environment variables in .env.local
"""

import os
import sys
import json
import logging
import traceback
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path

import psycopg2
import psycopg2.extras
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from upstash_vector import Index
from dotenv import load_dotenv
from tqdm import tqdm
from colorlog import ColoredFormatter
import pandas as pd

# Configure colored logging
def setup_logging():
    """Setup colored logging for better visibility"""
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    
    # Create console handler with colored formatter
    handler = logging.StreamHandler()
    formatter = ColoredFormatter(
        "%(log_color)s%(asctime)s [%(levelname)s] %(message)s",
        datefmt='%Y-%m-%d %H:%M:%S',
        log_colors={
            'DEBUG': 'cyan',
            'INFO': 'green',
            'WARNING': 'yellow',
            'ERROR': 'red',
            'CRITICAL': 'red,bg_white',
        }
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    return logger

logger = setup_logging()

@dataclass
class MigrationConfig:
    """Configuration for migration process"""
    json_file_path: str
    postgres_url: str
    upstash_vector_url: str
    upstash_vector_token: str
    batch_size: int = 50
    chunk_max_length: int = 1000
    chunk_overlap: int = 100
    dry_run: bool = False

@dataclass
class ContentChunk:
    """Represents a content chunk for vector embedding"""
    id: str
    content: str
    chunk_type: str
    title: str
    metadata: Dict[str, Any]
    importance: str
    date_range: Optional[str] = None
    search_weight: int = 5

class DatabaseManager:
    """Handles PostgreSQL database operations"""
    
    def __init__(self, postgres_url: str):
        self.postgres_url = postgres_url
        self.connection = None
        self.cursor = None
    
    def connect(self):
        """Establish database connection"""
        try:
            self.connection = psycopg2.connect(
                self.postgres_url,
                cursor_factory=psycopg2.extras.RealDictCursor
            )
            self.cursor = self.connection.cursor()
            logger.info("✅ Connected to PostgreSQL database")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to connect to PostgreSQL: {e}")
            return False
    
    def close(self):
        """Close database connection"""
        if self.cursor:
            self.cursor.close()
        if self.connection:
            self.connection.close()
        logger.info("🔌 Database connection closed")
    
    def execute_query(self, query: str, params: Optional[tuple] = None, fetch: bool = False):
        """Execute SQL query with error handling"""
        try:
            self.cursor.execute(query, params)
            if fetch:
                return self.cursor.fetchall()
            self.connection.commit()
            return True
        except Exception as e:
            self.connection.rollback()
            logger.error(f"❌ Query execution failed: {e}")
            logger.error(f"Query: {query}")
            raise
    
    def create_tables(self):
        """Create required database tables"""
        logger.info("🔨 Creating database tables...")
        
        # Check existing tables first
        check_query = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
        existing_tables = self.execute_query(check_query, fetch=True)
        existing_table_names = [row['table_name'] for row in existing_tables] if existing_tables else []
        
        logger.info(f"Found existing tables: {existing_table_names}")
        
        # Only drop tables if we have the specific portfolio tables
        portfolio_tables = ['content_chunks', 'projects', 'education', 'skills', 'experiences', 'professionals', 'json_content']
        
        # Check if we need to recreate schema
        if any(table in existing_table_names for table in portfolio_tables):
            logger.info("Portfolio tables detected - cleaning for fresh migration...")
            drop_queries = [
                "DROP TABLE IF EXISTS content_chunks CASCADE",
                "DROP TABLE IF EXISTS projects CASCADE", 
                "DROP TABLE IF EXISTS education CASCADE",
                "DROP TABLE IF EXISTS skills CASCADE",
                "DROP TABLE IF EXISTS experiences CASCADE",
                "DROP TABLE IF EXISTS professionals CASCADE",
                "DROP TABLE IF EXISTS json_content CASCADE"
            ]
            
            for query in drop_queries:
                self.execute_query(query)
        
        # Create tables with proper schema
        create_queries = [
            # Main professionals table
            """
            CREATE TABLE professionals (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                title VARCHAR(255),
                location VARCHAR(255),
                email VARCHAR(255),
                linkedin VARCHAR(500),
                portfolio VARCHAR(500),
                github VARCHAR(500),
                summary TEXT,
                elevator_pitch TEXT,
                availability VARCHAR(255),
                work_authorization VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """,
            
            # Experiences table
            """
            CREATE TABLE experiences (
                id SERIAL PRIMARY KEY,
                professional_id INTEGER REFERENCES professionals(id) ON DELETE CASCADE,
                company VARCHAR(255) NOT NULL,
                position VARCHAR(255) NOT NULL,
                duration VARCHAR(100),
                start_date DATE,
                end_date DATE,
                description TEXT,
                achievements TEXT[],
                technologies TEXT[],
                skills_developed TEXT[],
                impact TEXT,
                keywords TEXT[],
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """,
            
            # Skills table
            """
            CREATE TABLE skills (
                id SERIAL PRIMARY KEY,
                professional_id INTEGER REFERENCES professionals(id) ON DELETE CASCADE,
                category VARCHAR(255),
                skill_name VARCHAR(255) NOT NULL,
                proficiency VARCHAR(50),
                experience_years VARCHAR(20),
                context TEXT,
                projects TEXT[],
                skill_type VARCHAR(50) DEFAULT 'technical', -- technical or soft
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """,
            
            # Projects table
            """
            CREATE TABLE projects (
                id SERIAL PRIMARY KEY,
                professional_id INTEGER REFERENCES professionals(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                technologies TEXT[],
                role VARCHAR(255),
                outcomes TEXT[],
                challenges TEXT[],
                demo_url VARCHAR(500),
                repository_url VARCHAR(500),
                documentation_url VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """,
            
            # Education table  
            """
            CREATE TABLE education (
                id SERIAL PRIMARY KEY,
                professional_id INTEGER REFERENCES professionals(id) ON DELETE CASCADE,
                institution VARCHAR(255) NOT NULL,
                degree VARCHAR(255),
                field VARCHAR(255),
                graduation_year INTEGER,
                achievements TEXT[],
                relevant_coursework TEXT[],
                projects TEXT[],
                gpa VARCHAR(10),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """,
            
            # JSON content table (for complete document storage)
            """
            CREATE TABLE json_content (
                id SERIAL PRIMARY KEY,
                professional_id INTEGER REFERENCES professionals(id) ON DELETE CASCADE,
                content_type VARCHAR(50) DEFAULT 'portfolio',
                json_data JSONB NOT NULL,
                version VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """,
            
            # Content chunks table for RAG optimization
            """
            CREATE TABLE content_chunks (
                id SERIAL PRIMARY KEY,
                professional_id INTEGER REFERENCES professionals(id) ON DELETE CASCADE,
                chunk_id VARCHAR(255) UNIQUE NOT NULL,
                content TEXT NOT NULL,
                chunk_type VARCHAR(100),
                title VARCHAR(500),
                metadata JSONB,
                importance VARCHAR(20),
                date_range VARCHAR(50),
                search_weight INTEGER DEFAULT 5,
                vector_id VARCHAR(255), -- Reference to Upstash Vector ID
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        ]
        
        for i, query in enumerate(create_queries, 1):
            logger.info(f"Creating table {i}/{len(create_queries)}...")
            self.execute_query(query)
        
        # Create indexes for better performance
        index_queries = [
            "CREATE INDEX IF NOT EXISTS idx_experiences_professional ON experiences(professional_id)",
            "CREATE INDEX IF NOT EXISTS idx_skills_professional ON skills(professional_id)",
            "CREATE INDEX IF NOT EXISTS idx_projects_professional ON projects(professional_id)",
            "CREATE INDEX IF NOT EXISTS idx_education_professional ON education(professional_id)",
            "CREATE INDEX IF NOT EXISTS idx_content_chunks_professional ON content_chunks(professional_id)",
            "CREATE INDEX IF NOT EXISTS idx_content_chunks_type ON content_chunks(chunk_type)",
            "CREATE INDEX IF NOT EXISTS idx_content_chunks_importance ON content_chunks(importance)",
            "CREATE INDEX IF NOT EXISTS idx_json_content_professional ON json_content(professional_id)"
        ]
        
        for i, query in enumerate(index_queries, 1):
            try:
                logger.info(f"Creating index {i}/{len(index_queries)}...")
                self.execute_query(query)
            except Exception as e:
                logger.warning(f"⚠️ Index creation {i} failed (continuing): {e}")
        
        logger.info("✅ All database tables created successfully")
        return True  # Add explicit return statement

class VectorManager:
    """Handles Upstash Vector operations"""
    
    def __init__(self, url: str, token: str):
        self.url = url
        self.token = token
        self.index = None
    
    def connect(self):
        """Initialize vector database connection"""
        try:
            self.index = Index(url=self.url, token=self.token)
            info = self.index.info()
            logger.info(f"✅ Connected to Upstash Vector - Dimension: {info.dimension}, Model: {getattr(info.dense_index, 'embedding_model', 'Unknown')}")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to connect to Upstash Vector: {e}")
            return False
    
    def upsert_vectors_batch(self, chunks: List[ContentChunk]) -> bool:
        """Upsert content chunks as vectors in batches"""
        try:
            vectors = []
            for chunk in chunks:
                vector_data = {
                    "id": chunk.id,
                    "data": chunk.content,
                    "metadata": {
                        **chunk.metadata,
                        "chunk_type": chunk.chunk_type,
                        "title": chunk.title,
                        "importance": chunk.importance,
                        "search_weight": chunk.search_weight,
                        "date_range": chunk.date_range or "unknown",
                        "content_length": len(chunk.content)
                    }
                }
                vectors.append(vector_data)
            
            # Upsert vectors
            result = self.index.upsert(vectors=vectors)
            logger.info(f"✅ Upserted {len(vectors)} vectors to Upstash Vector")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to upsert vectors: {e}")
            return False
    
    def test_search(self, query: str, top_k: int = 5) -> List[Dict]:
        """Test vector search functionality"""
        try:
            results = self.index.query(
                data=query,
                top_k=top_k,
                include_metadata=True
            )
            logger.info(f"✅ Search test successful - Found {len(results)} results")
            return results
        except Exception as e:
            logger.error(f"❌ Search test failed: {e}")
            return []

class PortfolioMigrator:
    """Main migration class orchestrating the entire process"""
    
    def __init__(self, config: MigrationConfig):
        self.config = config
        self.db_manager = DatabaseManager(config.postgres_url)
        self.vector_manager = VectorManager(config.upstash_vector_url, config.upstash_vector_token)
        self.portfolio_data = None
        self.professional_id = None
        
    def load_and_validate_json(self) -> bool:
        """Load and validate the portfolio JSON data"""
        logger.info(f"📂 Loading portfolio data from {self.config.json_file_path}")
        
        try:
            with open(self.config.json_file_path, 'r', encoding='utf-8') as file:
                self.portfolio_data = json.load(file)
            
            # Basic validation
            required_sections = ['personalInfo', 'experience', 'skills', 'projects']
            missing_sections = [section for section in required_sections if section not in self.portfolio_data]
            
            if missing_sections:
                logger.error(f"❌ Missing required sections: {missing_sections}")
                return False
            
            logger.info(f"✅ Portfolio data loaded successfully")
            logger.info(f"   - Experiences: {len(self.portfolio_data.get('experience', []))}")
            logger.info(f"   - Skills: {len(self.portfolio_data.get('skills', {}).get('technical', []))}")
            logger.info(f"   - Projects: {len(self.portfolio_data.get('projects', []))}")
            logger.info(f"   - Education: {len(self.portfolio_data.get('education', []))}")
            logger.info(f"   - Content Chunks: {len(self.portfolio_data.get('content_chunks', []))}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to load portfolio data: {e}")
            return False
    
    def insert_professional_data(self) -> bool:
        """Insert main professional information"""
        logger.info("👤 Inserting professional data...")
        
        try:
            personal_info = self.portfolio_data['personalInfo']
            contact = personal_info.get('contact', {})
            
            query = """
                INSERT INTO professionals (
                    name, title, location, email, linkedin, portfolio, github,
                    summary, elevator_pitch, availability, work_authorization
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """
            
            params = (
                personal_info['name'],
                personal_info.get('title'),
                personal_info.get('location'),
                contact.get('email'),
                contact.get('linkedin'),
                contact.get('portfolio'),
                contact.get('github'),
                personal_info.get('summary'),
                personal_info.get('elevator_pitch'),
                personal_info.get('availability'),
                personal_info.get('work_authorization')
            )
            
            result = self.db_manager.execute_query(query, params, fetch=True)
            self.professional_id = result[0]['id']
            
            logger.info(f"✅ Professional data inserted with ID: {self.professional_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to insert professional data: {e}")
            return False
    
    def insert_experiences(self) -> bool:
        """Insert work experience data"""
        logger.info("💼 Inserting experience data...")
        
        try:
            experiences = self.portfolio_data.get('experience', [])
            
            for exp in tqdm(experiences, desc="Experiences"):
                query = """
                    INSERT INTO experiences (
                        professional_id, company, position, duration, description,
                        achievements, technologies, skills_developed, impact, keywords
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                
                params = (
                    self.professional_id,
                    exp['company'],
                    exp['position'],
                    exp['duration'],
                    exp.get('description'),
                    exp.get('achievements', []),
                    exp.get('technologies', []),
                    exp.get('skills_developed', []),
                    exp.get('impact'),
                    exp.get('keywords', [])
                )
                
                self.db_manager.execute_query(query, params)
            
            logger.info(f"✅ Inserted {len(experiences)} experience records")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to insert experience data: {e}")
            return False
    
    def insert_skills(self) -> bool:
        """Insert skills data"""
        logger.info("🛠️ Inserting skills data...")
        
        try:
            skills_data = self.portfolio_data.get('skills', {})
            total_skills = 0
            
            # Insert technical skills
            technical_skills = skills_data.get('technical', [])
            for category in technical_skills:
                category_name = category.get('category', 'General')
                skills = category.get('skills', [])
                
                for skill in skills:
                    query = """
                        INSERT INTO skills (
                            professional_id, category, skill_name, proficiency,
                            experience_years, context, projects, skill_type
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """
                    
                    params = (
                        self.professional_id,
                        category_name,
                        skill['name'],
                        skill.get('proficiency'),
                        skill.get('experience'),
                        skill.get('context'),
                        skill.get('projects', []),
                        'technical'
                    )
                    
                    self.db_manager.execute_query(query, params)
                    total_skills += 1
            
            # Insert soft skills
            soft_skills = skills_data.get('soft_skills', [])
            for soft_skill in soft_skills:
                query = """
                    INSERT INTO skills (
                        professional_id, category, skill_name, proficiency,
                        context, skill_type
                    ) VALUES (%s, %s, %s, %s, %s, %s)
                """
                
                params = (
                    self.professional_id,
                    'Soft Skills',
                    soft_skill['skill'],
                    'Advanced',  # Default for soft skills
                    soft_skill.get('context'),
                    'soft'
                )
                
                self.db_manager.execute_query(query, params)
                total_skills += 1
            
            logger.info(f"✅ Inserted {total_skills} skill records")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to insert skills data: {e}")
            return False
    
    def insert_projects(self) -> bool:
        """Insert project data"""
        logger.info("🚀 Inserting project data...")
        
        try:
            projects = self.portfolio_data.get('projects', [])
            
            for project in tqdm(projects, desc="Projects"):
                query = """
                    INSERT INTO projects (
                        professional_id, name, description, technologies, role,
                        outcomes, challenges, demo_url, repository_url, documentation_url
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                
                links = project.get('links', {})
                params = (
                    self.professional_id,
                    project['name'],
                    project.get('description'),
                    project.get('technologies', []),
                    project.get('role'),
                    project.get('outcomes', []),
                    project.get('challenges', []),
                    links.get('demo'),
                    links.get('repository'),
                    links.get('documentation')
                )
                
                self.db_manager.execute_query(query, params)
            
            logger.info(f"✅ Inserted {len(projects)} project records")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to insert project data: {e}")
            return False
    
    def insert_education(self) -> bool:
        """Insert education data"""
        logger.info("🎓 Inserting education data...")
        
        try:
            education_records = self.portfolio_data.get('education', [])
            
            for edu in tqdm(education_records, desc="Education"):
                query = """
                    INSERT INTO education (
                        professional_id, institution, degree, field, graduation_year,
                        achievements, relevant_coursework, projects, gpa
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                
                # Parse graduation year
                graduation_year = None
                if edu.get('graduation'):
                    try:
                        graduation_year = int(edu['graduation'])
                    except (ValueError, TypeError):
                        pass
                
                params = (
                    self.professional_id,
                    edu['institution'],
                    edu.get('degree'),
                    edu.get('field'),
                    graduation_year,
                    edu.get('achievements', []),
                    edu.get('relevant_coursework', []),
                    edu.get('projects', []),
                    edu.get('gpa')
                )
                
                self.db_manager.execute_query(query, params)
            
            logger.info(f"✅ Inserted {len(education_records)} education records")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to insert education data: {e}")
            return False
    
    def insert_json_content(self) -> bool:
        """Insert complete JSON document"""
        logger.info("📄 Inserting complete JSON content...")
        
        try:
            query = """
                INSERT INTO json_content (
                    professional_id, content_type, json_data, version
                ) VALUES (%s, %s, %s, %s)
            """
            
            metadata = self.portfolio_data.get('metadata', {})
            params = (
                self.professional_id,
                'portfolio',
                json.dumps(self.portfolio_data),
                metadata.get('version', '1.0')
            )
            
            self.db_manager.execute_query(query, params)
            logger.info("✅ Complete JSON content inserted")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to insert JSON content: {e}")
            return False
    
    def extract_content_chunks(self) -> List[ContentChunk]:
        """Extract optimized content chunks for RAG"""
        logger.info("📝 Extracting content chunks for RAG optimization...")
        
        chunks = []
        
        # Use predefined content chunks if available
        predefined_chunks = self.portfolio_data.get('content_chunks', [])
        
        if predefined_chunks:
            logger.info(f"Using {len(predefined_chunks)} predefined content chunks")
            
            for chunk_data in predefined_chunks:
                chunk = ContentChunk(
                    id=chunk_data['id'],
                    content=chunk_data['content'],
                    chunk_type=chunk_data['type'],
                    title=chunk_data['title'],
                    metadata=chunk_data.get('metadata', {}),
                    importance=chunk_data['metadata'].get('importance', 'medium'),
                    date_range=chunk_data['metadata'].get('date_range'),
                    search_weight=chunk_data['metadata'].get('search_weight', 5)
                )
                chunks.append(chunk)
        else:
            # Generate chunks from structured data if no predefined chunks
            logger.info("Generating content chunks from structured data")
            
            # Extract from experiences
            for i, exp in enumerate(self.portfolio_data.get('experience', [])):
                chunk_id = f"exp_{i:03d}_{exp['company'].lower().replace(' ', '_')}"
                content = f"At {exp['company']} as {exp['position']} ({exp['duration']}): {exp.get('description', '')}"
                
                if exp.get('achievements'):
                    content += f" Key achievements: {'; '.join(exp['achievements'])}"
                
                chunk = ContentChunk(
                    id=chunk_id,
                    content=content,
                    chunk_type="experience",
                    title=f"{exp['position']} at {exp['company']}",
                    metadata={
                        "company": exp['company'],
                        "position": exp['position'],
                        "technologies": exp.get('technologies', []),
                        "category": "work_experience"
                    },
                    importance="high",
                    date_range=exp['duration']
                )
                chunks.append(chunk)
            
            # Extract from projects
            for i, project in enumerate(self.portfolio_data.get('projects', [])):
                chunk_id = f"proj_{i:03d}_{project['name'].lower().replace(' ', '_')}"
                content = f"Project: {project['name']}. {project.get('description', '')}"
                
                if project.get('outcomes'):
                    content += f" Outcomes: {'; '.join(project['outcomes'])}"
                
                chunk = ContentChunk(
                    id=chunk_id,
                    content=content,
                    chunk_type="project",
                    title=project['name'],
                    metadata={
                        "technologies": project.get('technologies', []),
                        "role": project.get('role'),
                        "category": "projects"
                    },
                    importance="high"
                )
                chunks.append(chunk)
        
        logger.info(f"✅ Extracted {len(chunks)} content chunks")
        return chunks
    
    def insert_content_chunks(self, chunks: List[ContentChunk]) -> bool:
        """Insert content chunks into database"""
        logger.info("💾 Inserting content chunks...")
        
        try:
            for chunk in tqdm(chunks, desc="Content Chunks"):
                query = """
                    INSERT INTO content_chunks (
                        professional_id, chunk_id, content, chunk_type, title,
                        metadata, importance, date_range, search_weight, vector_id
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                
                params = (
                    self.professional_id,
                    chunk.id,
                    chunk.content,
                    chunk.chunk_type,
                    chunk.title,
                    json.dumps(chunk.metadata),
                    chunk.importance,
                    chunk.date_range,
                    chunk.search_weight,
                    chunk.id  # Using same ID for vector reference
                )
                
                self.db_manager.execute_query(query, params)
            
            logger.info(f"✅ Inserted {len(chunks)} content chunk records")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to insert content chunks: {e}")
            return False
    
    def generate_vector_embeddings(self, chunks: List[ContentChunk]) -> bool:
        """Generate and store vector embeddings"""
        logger.info("🧠 Generating vector embeddings...")
        
        try:
            # Process in batches
            batch_size = self.config.batch_size
            total_batches = (len(chunks) + batch_size - 1) // batch_size
            
            for i in tqdm(range(0, len(chunks), batch_size), desc="Vector Batches", total=total_batches):
                batch = chunks[i:i + batch_size]
                
                if not self.vector_manager.upsert_vectors_batch(batch):
                    logger.error(f"❌ Failed to process batch {i//batch_size + 1}")
                    return False
                
                # Small delay to avoid rate limiting
                import time
                time.sleep(0.5)
            
            logger.info(f"✅ Generated embeddings for {len(chunks)} content chunks")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to generate vector embeddings: {e}")
            return False
    
    def run_migration(self) -> bool:
        """Execute the complete migration process"""
        logger.info("🚀 Starting Portfolio Data Migration")
        logger.info("=" * 60)
        
        migration_steps = [
            ("Loading JSON data", self.load_and_validate_json),
            ("Connecting to databases", self.connect_databases),
            ("Creating database schema", self.create_schema),
            ("Inserting professional data", self.insert_professional_data),
            ("Inserting experience data", self.insert_experiences),
            ("Inserting skills data", self.insert_skills),
            ("Inserting project data", self.insert_projects),
            ("Inserting education data", self.insert_education),
            ("Inserting JSON content", self.insert_json_content),
            ("Processing content chunks", self.process_content_chunks),
            ("Generating vector embeddings", self.generate_embeddings),
            ("Running validation tests", self.run_validation)
        ]
        
        for step_name, step_func in migration_steps:
            logger.info(f"\n📋 {step_name}...")
            
            if self.config.dry_run and "Inserting" in step_name:
                logger.info(f"🔍 DRY RUN: Skipping {step_name}")
                continue
            
            try:
                if not step_func():
                    logger.error(f"❌ Migration failed at step: {step_name}")
                    return False
            except Exception as e:
                logger.error(f"❌ Exception in {step_name}: {e}")
                logger.error(traceback.format_exc())
                return False
        
        logger.info("\n" + "=" * 60)
        logger.info("🎉 Portfolio Data Migration Completed Successfully!")
        logger.info("=" * 60)
        return True
    
    def connect_databases(self) -> bool:
        """Connect to both PostgreSQL and Upstash Vector"""
        pg_connected = self.db_manager.connect()
        vector_connected = self.vector_manager.connect()
        return pg_connected and vector_connected
    
    def create_schema(self) -> bool:
        """Create database schema"""
        if not self.config.dry_run:
            try:
                return self.db_manager.create_tables()
            except Exception as e:
                logger.error(f"❌ Schema creation failed: {e}")
                import traceback
                logger.error(traceback.format_exc())
                return False
        logger.info("🔍 DRY RUN: Database schema creation skipped")
        return True
    
    def process_content_chunks(self) -> bool:
        """Process and insert content chunks"""
        chunks = self.extract_content_chunks()
        if not chunks:
            logger.error("❌ No content chunks extracted")
            return False
        
        self.content_chunks = chunks
        return self.insert_content_chunks(chunks)
    
    def generate_embeddings(self) -> bool:
        """Generate vector embeddings"""
        if not hasattr(self, 'content_chunks'):
            logger.error("❌ No content chunks available for embedding generation")
            return False
        
        return self.generate_vector_embeddings(self.content_chunks)
    
    def run_validation(self) -> bool:
        """Run validation tests"""
        logger.info("🔍 Running validation tests...")
        
        try:
            # Test database records
            query = "SELECT COUNT(*) as count FROM professionals WHERE id = %s"
            result = self.db_manager.execute_query(query, (self.professional_id,), fetch=True)
            prof_count = result[0]['count']
            
            if prof_count != 1:
                logger.error(f"❌ Professional record validation failed: {prof_count}")
                return False
            
            # Test vector search
            test_results = self.vector_manager.test_search(
                "What experience do you have with Java and Spring Boot?",
                top_k=3
            )
            
            if not test_results:
                logger.error("❌ Vector search validation failed")
                return False
            
            logger.info(f"✅ Validation successful - Vector search returned {len(test_results)} results")
            
            # Display top result for verification
            if test_results:
                top_result = test_results[0]
                logger.info(f"📋 Top search result: {getattr(top_result, 'id', 'Unknown')} (Score: {getattr(top_result, 'score', 0):.4f})")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Validation failed: {e}")
            return False
    
    def cleanup(self):
        """Cleanup resources"""
        self.db_manager.close()

def main():
    """Main execution function"""
    try:
        # Load environment variables
        project_root = Path(__file__).parent.parent
        env_path = project_root / '.env.local'
        load_dotenv(env_path)
        
        # Configuration
        config = MigrationConfig(
            json_file_path=str(project_root / 'data' / 'sample' / 'mytwin.json'),
            postgres_url=os.getenv('DATABASE_URL'),
            upstash_vector_url=os.getenv('UPSTASH_VECTOR_REST_URL'),
            upstash_vector_token=os.getenv('UPSTASH_VECTOR_REST_TOKEN'),
            batch_size=20,
            dry_run=False  # Set to True for testing without actual data insertion
        )
        
        # Validate configuration
        if not all([config.postgres_url, config.upstash_vector_url, config.upstash_vector_token]):
            logger.error("❌ Missing required environment variables")
            logger.error("Required: DATABASE_URL, UPSTASH_VECTOR_REST_URL, UPSTASH_VECTOR_REST_TOKEN")
            return False
        
        if not Path(config.json_file_path).exists():
            logger.error(f"❌ JSON file not found: {config.json_file_path}")
            return False
        
        # Run migration
        migrator = PortfolioMigrator(config)
        
        try:
            success = migrator.run_migration()
            return success
        finally:
            migrator.cleanup()
            
    except KeyboardInterrupt:
        logger.warning("\n⚠️ Migration interrupted by user")
        return False
    except Exception as e:
        logger.error(f"❌ Migration failed with exception: {e}")
        logger.error(traceback.format_exc())
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)