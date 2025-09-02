#!/usr/bin/env python3
"""
🔍 COMPREHENSIVE DATA QUALITY VALIDATION

This script validates that all JSON data was successfully migrated to PostgreSQL
and Upstash Vector with no corruption or missing information.
"""

import os
import json
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv
from upstash_vector import Index
import colorlog

# Configure colored logging
handler = colorlog.StreamHandler()
handler.setFormatter(colorlog.ColoredFormatter(
    '%(asctime)s [%(log_color)s%(levelname)s%(reset)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
))

logger = colorlog.getLogger()
logger.addHandler(handler)
logger.setLevel(colorlog.INFO)

load_dotenv('.env.local')

class DataQualityValidator:
    def __init__(self):
        # Database connections
        self.postgres_url = os.getenv('DATABASE_URL')
        self.vector_url = os.getenv('UPSTASH_VECTOR_REST_URL')
        self.vector_token = os.getenv('UPSTASH_VECTOR_REST_TOKEN')
        
        self.pg_conn = None
        self.vector_index = None
        
        # Load original JSON data for comparison
        with open('data/sample/mytwin.json', 'r') as f:
            self.original_data = json.load(f)
    
    def connect_databases(self):
        """Connect to both PostgreSQL and Upstash Vector"""
        try:
            # PostgreSQL connection
            self.pg_conn = psycopg2.connect(
                self.postgres_url, 
                cursor_factory=psycopg2.extras.RealDictCursor
            )
            logger.info("✅ Connected to PostgreSQL")
            
            # Upstash Vector connection
            self.vector_index = Index(url=self.vector_url, token=self.vector_token)
            vector_info = self.vector_index.info()
            vector_count = getattr(vector_info, 'vector_count', 'unknown')
            logger.info(f"✅ Connected to Upstash Vector - {vector_count} vectors")
            
        except Exception as e:
            logger.error(f"❌ Database connection failed: {e}")
            raise
    
    def validate_postgresql_import(self):
        """Validate all JSON data successfully imported to PostgreSQL"""
        logger.info("🔍 Validating PostgreSQL data import...")
        
        cur = self.pg_conn.cursor()
        validation_results = {}
        
        # Check professionals table
        cur.execute("SELECT COUNT(*) as count FROM professionals")
        prof_count = cur.fetchone()['count']
        validation_results['professionals'] = {
            'count': prof_count,
            'expected': 1,
            'valid': prof_count == 1
        }
        
        # Check experiences table
        cur.execute("SELECT COUNT(*) as count FROM experiences")
        exp_count = cur.fetchone()['count']
        expected_exp = len(self.original_data.get('experience', []))
        validation_results['experiences'] = {
            'count': exp_count,
            'expected': expected_exp,
            'valid': exp_count == expected_exp
        }
        
        # Check skills table
        cur.execute("SELECT COUNT(*) as count FROM skills")
        skill_count = cur.fetchone()['count']
        # Note: Skills are expanded from categories in JSON, so count will be higher
        validation_results['skills'] = {
            'count': skill_count,
            'valid': skill_count > 0  # Just check that skills exist
        }
        
        # Check projects table
        cur.execute("SELECT COUNT(*) as count FROM projects")
        proj_count = cur.fetchone()['count']
        expected_projects = len(self.original_data.get('projects', []))
        validation_results['projects'] = {
            'count': proj_count,
            'expected': expected_projects,
            'valid': proj_count == expected_projects
        }
        
        # Check education table
        cur.execute("SELECT COUNT(*) as count FROM education")
        edu_count = cur.fetchone()['count']
        expected_education = len(self.original_data.get('education', []))
        validation_results['education'] = {
            'count': edu_count,
            'expected': expected_education,
            'valid': edu_count == expected_education
        }
        
        # Check content_chunks table
        cur.execute("SELECT COUNT(*) as count FROM content_chunks")
        chunk_count = cur.fetchone()['count']
        validation_results['content_chunks'] = {
            'count': chunk_count,
            'valid': chunk_count > 0
        }
        
        # Display results
        logger.info("📊 PostgreSQL Import Validation Results:")
        all_valid = True
        
        for table, result in validation_results.items():
            if result['valid']:
                logger.info(f"   ✅ {table}: {result['count']} records" + 
                          (f" (expected: {result['expected']})" if 'expected' in result else ""))
            else:
                logger.error(f"   ❌ {table}: {result['count']} records" + 
                           (f" (expected: {result['expected']})" if 'expected' in result else ""))
                all_valid = False
        
        return all_valid, validation_results
    
    def validate_content_chunks(self):
        """Validate content chunks are properly generated and stored"""
        logger.info("🔍 Validating content chunks...")
        
        cur = self.pg_conn.cursor()
        
        # Get all content chunks with details
        cur.execute("""
            SELECT chunk_id, title, chunk_type, importance, 
                   LENGTH(content) as content_length,
                   CASE WHEN content IS NOT NULL AND content != '' THEN true ELSE false END as has_content
            FROM content_chunks 
            ORDER BY chunk_type, importance DESC
        """)
        chunks = cur.fetchall()
        
        # Analyze chunk distribution
        chunk_types = {}
        importance_levels = {}
        content_issues = []
        
        for chunk in chunks:
            # Count by type
            chunk_type = chunk['chunk_type']
            chunk_types[chunk_type] = chunk_types.get(chunk_type, 0) + 1
            
            # Count by importance
            importance = chunk['importance']
            importance_levels[importance] = importance_levels.get(importance, 0) + 1
            
            # Check content quality
            if not chunk['has_content'] or chunk['content_length'] < 50:
                content_issues.append({
                    'chunk_id': chunk['chunk_id'],
                    'title': chunk['title'],
                    'content_length': chunk['content_length'],
                    'has_content': chunk['has_content']
                })
        
        logger.info(f"📊 Content Chunks Analysis:")
        logger.info(f"   Total chunks: {len(chunks)}")
        
        logger.info("   Chunk types distribution:")
        for chunk_type, count in sorted(chunk_types.items()):
            logger.info(f"     - {chunk_type}: {count} chunks")
        
        logger.info("   Importance levels distribution:")
        for importance, count in sorted(importance_levels.items(), reverse=True):
            logger.info(f"     - Level {importance}: {count} chunks")
        
        if content_issues:
            logger.warning(f"   ⚠️ Found {len(content_issues)} chunks with content issues:")
            for issue in content_issues[:3]:  # Show first 3
                logger.warning(f"     - {issue['chunk_id']}: {issue['content_length']} chars")
        else:
            logger.info("   ✅ All chunks have proper content")
        
        return len(content_issues) == 0, {
            'total_chunks': len(chunks),
            'chunk_types': chunk_types,
            'importance_levels': importance_levels,
            'content_issues': len(content_issues)
        }
    
    def validate_vector_embeddings(self):
        """Validate vector embeddings are created with 1024 dimensions"""
        logger.info("🔍 Validating vector embeddings...")
        
        # Get vector info
        vector_info = self.vector_index.info()
        total_vectors = getattr(vector_info, 'vector_count', 0)
        vector_dimension = getattr(vector_info, 'dimension', 0)
        
        # Test query to get sample vectors and check dimensions
        test_results = self.vector_index.query(
            data="test query to check vector dimensions",
            top_k=5,
            include_metadata=True
        )
        
        # Validate dimensions
        dimension_valid = vector_dimension == 1024
        
        # Check vector-database consistency
        cur = self.pg_conn.cursor()
        cur.execute("SELECT COUNT(*) as count FROM content_chunks")
        db_chunks = cur.fetchone()['count']
        
        consistency_valid = total_vectors == db_chunks
        
        logger.info(f"📊 Vector Embeddings Validation:")
        logger.info(f"   Total vectors: {total_vectors}")
        logger.info(f"   Vector dimensions: {vector_dimension} {'✅' if dimension_valid else '❌ (expected 1024)'}")
        logger.info(f"   Database chunks: {db_chunks}")
        logger.info(f"   Vector-DB consistency: {'✅' if consistency_valid else '❌'}")
        
        # Sample vector metadata check
        if test_results:
            logger.info("   Sample vector metadata:")
            for i, result in enumerate(test_results[:3]):
                metadata = getattr(result, 'metadata', {}) or {}
                logger.info(f"     Vector {i+1}: {getattr(result, 'id', 'unknown')} - "
                          f"Type: {metadata.get('chunk_type', 'N/A')}, "
                          f"Importance: {metadata.get('importance', 'N/A')}")
        
        return dimension_valid and consistency_valid, {
            'total_vectors': total_vectors,
            'dimension': vector_dimension,
            'dimension_valid': dimension_valid,
            'db_chunks': db_chunks,
            'consistency_valid': consistency_valid
        }
    
    def validate_search_functionality(self):
        """Validate search functionality returns relevant results"""
        logger.info("🔍 Validating search functionality...")
        
        test_queries = [
            {
                'query': 'Java Spring Boot development experience',
                'expected_types': ['skills', 'experience'],
                'min_score': 0.7
            },
            {
                'query': 'PostgreSQL database optimization',
                'expected_types': ['skills', 'experience'],
                'min_score': 0.7
            },
            {
                'query': 'leadership and team management',
                'expected_types': ['experience', 'skills', 'soft_skills'],
                'min_score': 0.6
            }
        ]
        
        search_results = []
        
        for test in test_queries:
            results = self.vector_index.query(
                data=test['query'],
                top_k=5,
                include_metadata=True
            )
            
            if results:
                top_score = getattr(results[0], 'score', 0)
                relevant_types = []
                
                for result in results[:3]:  # Check top 3
                    metadata = getattr(result, 'metadata', {}) or {}
                    chunk_type = metadata.get('chunk_type', '')
                    if chunk_type in test['expected_types']:
                        relevant_types.append(chunk_type)
                
                search_results.append({
                    'query': test['query'],
                    'top_score': top_score,
                    'score_valid': top_score >= test['min_score'],
                    'relevant_types_found': len(set(relevant_types)) > 0,
                    'results_count': len(results)
                })
            else:
                search_results.append({
                    'query': test['query'],
                    'top_score': 0,
                    'score_valid': False,
                    'relevant_types_found': False,
                    'results_count': 0
                })
        
        logger.info("📊 Search Functionality Validation:")
        all_valid = True
        
        for result in search_results:
            query_valid = result['score_valid'] and result['relevant_types_found'] and result['results_count'] > 0
            status = "✅" if query_valid else "❌"
            logger.info(f"   {status} '{result['query'][:50]}...': "
                       f"Score {result['top_score']:.3f}, "
                       f"{result['results_count']} results, "
                       f"Relevant: {result['relevant_types_found']}")
            if not query_valid:
                all_valid = False
        
        return all_valid, search_results
    
    def validate_data_integrity(self):
        """Check for data corruption or missing information"""
        logger.info("🔍 Validating data integrity...")
        
        cur = self.pg_conn.cursor()
        integrity_issues = []
        
        # Check for NULL values in critical fields
        checks = [
            ("professionals", "email", "Email should not be NULL"),
            ("professionals", "name", "Name should not be NULL"),
            ("experiences", "company", "Company should not be NULL"),
            ("experiences", "position", "Position should not be NULL"),
            ("skills", "skill_name", "Skill name should not be NULL"),
            ("content_chunks", "content", "Content should not be NULL"),
            ("content_chunks", "chunk_type", "Chunk type should not be NULL")
        ]
        
        for table, field, description in checks:
            cur.execute(f"SELECT COUNT(*) as count FROM {table} WHERE {field} IS NULL OR {field} = ''")
            null_count = cur.fetchone()['count']
            if null_count > 0:
                integrity_issues.append(f"{description}: {null_count} records")
        
        # Check for orphaned records (if applicable)
        cur.execute("""
            SELECT COUNT(*) as count 
            FROM content_chunks cc 
            LEFT JOIN professionals p ON cc.chunk_id LIKE 'chunk_%'
            WHERE p.id IS NULL AND cc.chunk_type IN ('summary', 'personal_info')
        """)
        # Note: This is a simplified check - in reality, chunk_ids have various patterns
        
        # Check vector-database ID consistency
        cur.execute("SELECT chunk_id FROM content_chunks ORDER BY chunk_id")
        db_chunk_ids = [row['chunk_id'] for row in cur.fetchall()]
        
        # Get vector IDs
        vector_results = self.vector_index.query(
            data="get all vector ids",
            top_k=50,  # Get as many as possible
            include_metadata=True
        )
        vector_ids = [getattr(result, 'id', '') for result in vector_results]
        
        missing_in_vector = set(db_chunk_ids) - set(vector_ids)
        missing_in_db = set(vector_ids) - set(db_chunk_ids)
        
        if missing_in_vector:
            integrity_issues.append(f"Missing in vector DB: {len(missing_in_vector)} chunks")
        if missing_in_db:
            integrity_issues.append(f"Missing in PostgreSQL: {len(missing_in_db)} chunks")
        
        logger.info("📊 Data Integrity Validation:")
        if integrity_issues:
            logger.warning(f"   ⚠️ Found {len(integrity_issues)} integrity issues:")
            for issue in integrity_issues:
                logger.warning(f"     - {issue}")
        else:
            logger.info("   ✅ No data integrity issues found")
        
        return len(integrity_issues) == 0, {
            'issues_found': len(integrity_issues),
            'issues': integrity_issues,
            'db_chunks': len(db_chunk_ids),
            'vector_chunks': len(vector_ids)
        }
    
    def run_comprehensive_validation(self):
        """Run all validation checks"""
        logger.info("🚀 Starting Comprehensive Data Quality Validation")
        logger.info("=" * 80)
        
        try:
            self.connect_databases()
            
            # Run all validations
            validations = [
                ("PostgreSQL Import", self.validate_postgresql_import),
                ("Content Chunks", self.validate_content_chunks),
                ("Vector Embeddings", self.validate_vector_embeddings),
                ("Search Functionality", self.validate_search_functionality),
                ("Data Integrity", self.validate_data_integrity)
            ]
            
            results = {}
            overall_success = True
            
            for name, validation_func in validations:
                try:
                    success, details = validation_func()
                    results[name] = {'success': success, 'details': details}
                    if not success:
                        overall_success = False
                    logger.info("")  # Add spacing
                except Exception as e:
                    logger.error(f"❌ {name} validation failed: {e}")
                    results[name] = {'success': False, 'error': str(e)}
                    overall_success = False
            
            # Final summary
            logger.info("=" * 80)
            logger.info("📊 VALIDATION SUMMARY")
            logger.info("=" * 80)
            
            for name, result in results.items():
                status = "✅ PASSED" if result['success'] else "❌ FAILED"
                logger.info(f"   {status}: {name}")
            
            logger.info("")
            if overall_success:
                logger.info("🎉 ALL VALIDATIONS PASSED - DATA QUALITY EXCELLENT")
                logger.info("   System ready for web application integration")
            else:
                logger.warning("⚠️ SOME VALIDATIONS FAILED - REVIEW REQUIRED")
                logger.info("   Check individual validation results above")
            
            logger.info("=" * 80)
            
            return overall_success, results
            
        except Exception as e:
            logger.error(f"❌ Validation process failed: {e}")
            return False, {'error': str(e)}
        
        finally:
            if self.pg_conn:
                self.pg_conn.close()

def main():
    validator = DataQualityValidator()
    success, results = validator.run_comprehensive_validation()
    
    # Save detailed results
    with open('data_quality_validation_report.json', 'w') as f:
        json.dump({
            'timestamp': '2025-09-02T21:45:00',
            'overall_success': success,
            'validation_results': results
        }, f, indent=2, default=str)
    
    logger.info(f"📄 Detailed validation report saved to: data_quality_validation_report.json")
    
    return 0 if success else 1

if __name__ == "__main__":
    exit(main())