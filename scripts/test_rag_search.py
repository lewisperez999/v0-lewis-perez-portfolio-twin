#!/usr/bin/env python3
"""
Portfolio RAG Search Testing Script

This script comprehensively tests the vector search and RAG functionality
for the portfolio data that was migrated to PostgreSQL and Upstash Vector.

Features:
- Professional query testing with realistic use cases
- Search result relevance and accuracy assessment
- Performance benchmarking and latency measurement
- Metadata filtering validation
- Concurrent search testing
- Detailed reporting and analytics

Usage:
    python scripts/test_rag_search.py

Requirements:
    - Completed data migration
    - PostgreSQL database with portfolio data
    - Upstash Vector database with embeddings
"""

import os
import sys
import json
import logging
import time
import statistics
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

import psycopg2
import psycopg2.extras
from upstash_vector import Index
from dotenv import load_dotenv
from colorlog import ColoredFormatter
import pandas as pd
from tqdm import tqdm

# Setup logging
def setup_logging():
    """Setup colored logging"""
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    
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
class SearchQuery:
    """Represents a search query test case"""
    id: str
    query: str
    category: str
    expected_content_types: List[str]
    expected_keywords: List[str]
    min_relevance_score: float = 0.7
    description: str = ""

@dataclass
class SearchResult:
    """Represents a search result with analysis"""
    query_id: str
    query_text: str
    vector_id: str
    content: str
    score: float
    metadata: Dict[str, Any]
    relevance_assessment: str = "unknown"
    contains_keywords: List[str] = None

@dataclass
class TestMetrics:
    """Performance and quality metrics"""
    query_id: str
    query_text: str
    latency_ms: float
    results_count: int
    avg_score: float
    top_score: float
    relevant_results: int
    keyword_matches: int
    metadata_accuracy: float
    overall_quality: str

class RAGTester:
    """Main testing class for RAG functionality"""
    
    def __init__(self, postgres_url: str, vector_url: str, vector_token: str):
        self.postgres_url = postgres_url
        self.vector_url = vector_url
        self.vector_token = vector_token
        
        # Database connections
        self.pg_connection = None
        self.vector_index = None
        
        # Test data
        self.test_queries = self._define_test_queries()
        self.results = []
        self.metrics = []
        
    def _define_test_queries(self) -> List[SearchQuery]:
        """Define comprehensive test queries"""
        return [
            # Professional Experience Queries
            SearchQuery(
                id="exp_001",
                query="What experience do you have with AI and machine learning?",
                category="experience",
                expected_content_types=["experience", "skills", "projects"],
                expected_keywords=["AI", "machine learning", "ML", "artificial intelligence"],
                min_relevance_score=0.75,
                description="AI/ML experience inquiry"
            ),
            SearchQuery(
                id="exp_002", 
                query="Tell me about your most challenging project",
                category="projects",
                expected_content_types=["projects", "experience"],
                expected_keywords=["challenging", "complex", "difficult", "migration", "scale"],
                min_relevance_score=0.7,
                description="Challenging project discussion"
            ),
            SearchQuery(
                id="exp_003",
                query="What banking and financial services experience do you have?",
                category="experience",
                expected_content_types=["experience"],
                expected_keywords=["banking", "financial", "ING", "microservices", "security"],
                min_relevance_score=0.8,
                description="Banking domain expertise"
            ),
            
            # Technical Skills Queries
            SearchQuery(
                id="tech_001",
                query="What are your technical skills in web development?",
                category="skills",
                expected_content_types=["skills", "projects", "experience"],
                expected_keywords=["React", "Next.js", "JavaScript", "TypeScript", "web", "frontend"],
                min_relevance_score=0.75,
                description="Web development skills"
            ),
            SearchQuery(
                id="tech_002",
                query="How experienced are you with Java and Spring Boot?",
                category="skills",
                expected_content_types=["skills", "experience"],
                expected_keywords=["Java", "Spring Boot", "microservices", "enterprise", "8 years"],
                min_relevance_score=0.8,
                description="Java/Spring expertise"
            ),
            SearchQuery(
                id="tech_003",
                query="What database technologies have you worked with?",
                category="skills",
                expected_content_types=["skills", "experience"],
                expected_keywords=["PostgreSQL", "MySQL", "Oracle", "database", "SQL", "optimization"],
                min_relevance_score=0.75,
                description="Database technology experience"
            ),
            
            # Project Portfolio Queries
            SearchQuery(
                id="proj_001",
                query="Show me your e-commerce development work",
                category="projects",
                expected_content_types=["projects", "experience"],
                expected_keywords=["Shopify", "e-commerce", "Stripe", "PayPal", "conversion"],
                min_relevance_score=0.8,
                description="E-commerce project showcase"
            ),
            SearchQuery(
                id="proj_002",
                query="What performance optimizations have you implemented?",
                category="performance",
                expected_content_types=["experience", "projects"],
                expected_keywords=["performance", "optimization", "latency", "500ms", "200ms", "30%"],
                min_relevance_score=0.75,
                description="Performance optimization examples"
            ),
            
            # Leadership & Mentoring Queries
            SearchQuery(
                id="lead_001",
                query="Describe your leadership and mentoring experience",
                category="leadership",
                expected_content_types=["experience", "soft_skills"],
                expected_keywords=["mentoring", "leadership", "team", "junior", "Agile", "15%"],
                min_relevance_score=0.75,
                description="Leadership capabilities"
            ),
            SearchQuery(
                id="lead_002",
                query="How do you handle team collaboration and code reviews?",
                category="collaboration",
                expected_content_types=["skills", "experience"],
                expected_keywords=["collaboration", "code review", "team", "knowledge sharing"],
                min_relevance_score=0.7,
                description="Team collaboration approach"
            ),
            
            # Industry & Domain Queries
            SearchQuery(
                id="domain_001",
                query="What telecom industry experience do you have?",
                category="industry",
                expected_content_types=["experience"],
                expected_keywords=["telecom", "Amdocs", "reliability", "availability", "97%"],
                min_relevance_score=0.8,
                description="Telecom domain knowledge"
            ),
            SearchQuery(
                id="domain_002",
                query="Tell me about your cloud and DevOps experience",
                category="devops",
                expected_content_types=["skills", "experience"],
                expected_keywords=["AWS", "Docker", "Jenkins", "CI/CD", "Kubernetes", "cloud"],
                min_relevance_score=0.75,
                description="Cloud/DevOps capabilities"
            ),
            
            # Educational & Learning Queries
            SearchQuery(
                id="edu_001",
                query="What is your educational background?",
                category="education",
                expected_content_types=["education"],
                expected_keywords=["Brighton College", "Electronics Engineering", "Cyber Security"],
                min_relevance_score=0.7,
                description="Educational qualifications"
            ),
            
            # Location & Availability Queries
            SearchQuery(
                id="avail_001",
                query="Are you available for freelance work in Melbourne?",
                category="availability",
                expected_content_types=["personal_info", "summary"],
                expected_keywords=["Melbourne", "freelance", "available", "Australia"],
                min_relevance_score=0.75,
                description="Availability and location"
            ),
            
            # Specific Achievement Queries
            SearchQuery(
                id="achieve_001",
                query="What quantifiable results have you achieved in your career?",
                category="achievements",
                expected_content_types=["experience", "projects"],
                expected_keywords=["20%", "30%", "40%", "500ms", "200ms", "16M", "improvement"],
                min_relevance_score=0.75,
                description="Quantifiable achievements"
            )
        ]
    
    def connect_databases(self) -> bool:
        """Connect to PostgreSQL and Upstash Vector"""
        try:
            # PostgreSQL connection
            self.pg_connection = psycopg2.connect(
                self.postgres_url,
                cursor_factory=psycopg2.extras.RealDictCursor
            )
            logger.info("✅ Connected to PostgreSQL")
            
            # Vector connection
            self.vector_index = Index(url=self.vector_url, token=self.vector_token)
            info = self.vector_index.info()
            logger.info(f"✅ Connected to Upstash Vector - {info.vector_count} vectors available")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Database connection failed: {e}")
            return False
    
    def execute_search_query(self, query: SearchQuery, top_k: int = 10) -> Tuple[List[SearchResult], float]:
        """Execute a single search query and measure performance"""
        start_time = time.time()
        
        try:
            # Perform vector search
            vector_results = self.vector_index.query(
                data=query.query,
                top_k=top_k,
                include_metadata=True
            )
            
            latency = (time.time() - start_time) * 1000  # Convert to milliseconds
            
            # Convert to SearchResult objects
            search_results = []
            for result in vector_results:
                search_result = SearchResult(
                    query_id=query.id,
                    query_text=query.query,
                    vector_id=getattr(result, 'id', 'unknown'),
                    content=self._extract_content_from_metadata(result),
                    score=getattr(result, 'score', 0),
                    metadata=getattr(result, 'metadata', {}) or {}
                )
                
                # Assess relevance
                search_result.relevance_assessment = self._assess_relevance(search_result, query)
                search_result.contains_keywords = self._find_matching_keywords(search_result.content, query.expected_keywords)
                
                search_results.append(search_result)
            
            return search_results, latency
            
        except Exception as e:
            logger.error(f"❌ Search query failed for {query.id}: {e}")
            return [], 0
    
    def _extract_content_from_metadata(self, result) -> str:
        """Extract readable content from search result by fetching from database"""
        try:
            # Get chunk ID from result
            chunk_id = getattr(result, 'id', None)
            if not chunk_id:
                return f"Vector ID: {getattr(result, 'id', 'unknown')}"
            
            # Fetch content from database using chunk ID
            cur = self.pg_connection.cursor()
            cur.execute("SELECT content, title FROM content_chunks WHERE chunk_id = %s", (chunk_id,))
            row = cur.fetchone()
            
            if row:
                title = row['title'] or ''
                content = row['content'] or ''
                if title and content:
                    return f"{title}: {content}"
                elif content:
                    return content
                elif title:
                    return title
            
            # Fallback to metadata if database fetch fails
            metadata = getattr(result, 'metadata', {}) or {}
            title = metadata.get('title', '')
            if title:
                return title
            
            return f"Vector ID: {chunk_id}"
                
        except Exception as e:
            print(f"Error extracting content for {getattr(result, 'id', 'unknown')}: {e}")
            return f"Vector ID: {getattr(result, 'id', 'unknown')}"
    
    def _assess_relevance(self, result: SearchResult, query: SearchQuery) -> str:
        """Assess the relevance of a search result"""
        # Check content type relevance
        result_type = result.metadata.get('chunk_type', 'unknown')
        type_relevant = result_type in query.expected_content_types
        
        # Check keyword presence
        keyword_matches = self._find_matching_keywords(result.content.lower(), 
                                                     [kw.lower() for kw in query.expected_keywords])
        keyword_relevant = len(keyword_matches) > 0
        
        # Check similarity score
        score_relevant = result.score >= query.min_relevance_score
        
        if all([type_relevant, keyword_relevant, score_relevant]):
            return "highly_relevant"
        elif type_relevant and (keyword_relevant or score_relevant):
            return "relevant"
        elif keyword_relevant or score_relevant:
            return "partially_relevant"
        else:
            return "not_relevant"
    
    def _find_matching_keywords(self, content: str, keywords: List[str]) -> List[str]:
        """Find which keywords are present in the content"""
        content_lower = content.lower()
        return [kw for kw in keywords if kw.lower() in content_lower]
    
    def calculate_metrics(self, query: SearchQuery, results: List[SearchResult], latency: float) -> TestMetrics:
        """Calculate performance and quality metrics for a query"""
        if not results:
            return TestMetrics(
                query_id=query.id,
                query_text=query.query,
                latency_ms=latency,
                results_count=0,
                avg_score=0,
                top_score=0,
                relevant_results=0,
                keyword_matches=0,
                metadata_accuracy=0,
                overall_quality="poor"
            )
        
        # Score metrics
        scores = [r.score for r in results]
        avg_score = statistics.mean(scores)
        top_score = max(scores)
        
        # Relevance metrics
        relevant_count = len([r for r in results if r.relevance_assessment in ['highly_relevant', 'relevant']])
        
        # Keyword metrics
        total_keyword_matches = sum(len(r.contains_keywords or []) for r in results)
        
        # Metadata accuracy (check if expected content types are present)
        expected_types = set(query.expected_content_types)
        found_types = set(r.metadata.get('chunk_type', 'unknown') for r in results)
        type_overlap = len(expected_types.intersection(found_types))
        metadata_accuracy = type_overlap / len(expected_types) if expected_types else 0
        
        # Overall quality assessment
        relevance_ratio = relevant_count / len(results)
        if relevance_ratio >= 0.8 and avg_score >= 0.75:
            overall_quality = "excellent"
        elif relevance_ratio >= 0.6 and avg_score >= 0.65:
            overall_quality = "good"
        elif relevance_ratio >= 0.4 and avg_score >= 0.55:
            overall_quality = "fair"
        else:
            overall_quality = "poor"
        
        return TestMetrics(
            query_id=query.id,
            query_text=query.query,
            latency_ms=latency,
            results_count=len(results),
            avg_score=avg_score,
            top_score=top_score,
            relevant_results=relevant_count,
            keyword_matches=total_keyword_matches,
            metadata_accuracy=metadata_accuracy,
            overall_quality=overall_quality
        )
    
    def test_metadata_filtering(self) -> bool:
        """Test metadata filtering capabilities"""
        logger.info("🔍 Testing metadata filtering...")
        
        filter_tests = [
            {
                "name": "Experience Filter",
                "query": "technical skills and development experience",
                "filter": "chunk_type = 'experience'",
                "expected_type": "experience"
            },
            {
                "name": "Skills Filter", 
                "query": "programming languages and frameworks",
                "filter": "chunk_type = 'skills'",
                "expected_type": "skills"
            },
            {
                "name": "Projects Filter",
                "query": "software development projects",
                "filter": "chunk_type = 'project'",
                "expected_type": "project"
            },
            {
                "name": "High Importance Filter",
                "query": "most important professional information",
                "filter": "importance = 'critical'",
                "expected_importance": "critical"
            }
        ]
        
        filter_success = 0
        
        for test in filter_tests:
            try:
                results = self.vector_index.query(
                    data=test["query"],
                    top_k=5,
                    include_metadata=True,
                    filter=test["filter"]
                )
                
                if results:
                    # Check if filter worked correctly
                    filter_accuracy = 0
                    for result in results:
                        metadata = getattr(result, 'metadata', {}) or {}
                        
                        if "expected_type" in test:
                            if metadata.get('chunk_type') == test["expected_type"]:
                                filter_accuracy += 1
                        elif "expected_importance" in test:
                            if metadata.get('importance') == test["expected_importance"]:
                                filter_accuracy += 1
                    
                    accuracy = filter_accuracy / len(results) if results else 0
                    
                    if accuracy >= 0.8:
                        logger.info(f"✅ {test['name']}: {accuracy:.1%} accuracy")
                        filter_success += 1
                    else:
                        logger.warning(f"⚠️ {test['name']}: {accuracy:.1%} accuracy (low)")
                else:
                    logger.warning(f"⚠️ {test['name']}: No results returned")
                    
            except Exception as e:
                logger.error(f"❌ {test['name']} failed: {e}")
        
        success_rate = filter_success / len(filter_tests)
        logger.info(f"📊 Metadata filtering success rate: {success_rate:.1%}")
        
        return success_rate >= 0.75
    
    def test_concurrent_searches(self, max_workers: int = 5) -> Dict[str, float]:
        """Test concurrent search performance"""
        logger.info(f"⚡ Testing concurrent searches with {max_workers} workers...")
        
        # Select a subset of queries for concurrent testing
        test_queries = self.test_queries[:max_workers]
        
        start_time = time.time()
        latencies = []
        
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            # Submit all searches
            future_to_query = {
                executor.submit(self.execute_search_query, query): query 
                for query in test_queries
            }
            
            # Collect results
            for future in as_completed(future_to_query):
                query = future_to_query[future]
                try:
                    results, latency = future.result()
                    latencies.append(latency)
                except Exception as e:
                    logger.error(f"❌ Concurrent search failed for {query.id}: {e}")
                    latencies.append(0)
        
        total_time = time.time() - start_time
        
        metrics = {
            "total_time": total_time,
            "avg_latency": statistics.mean(latencies) if latencies else 0,
            "max_latency": max(latencies) if latencies else 0,
            "min_latency": min(latencies) if latencies else 0,
            "throughput": len(test_queries) / total_time if total_time > 0 else 0
        }
        
        logger.info(f"📊 Concurrent performance:")
        logger.info(f"   Total time: {metrics['total_time']:.2f}s")
        logger.info(f"   Avg latency: {metrics['avg_latency']:.1f}ms")
        logger.info(f"   Throughput: {metrics['throughput']:.1f} queries/sec")
        
        return metrics
    
    def run_comprehensive_tests(self) -> bool:
        """Run all RAG functionality tests"""
        logger.info("🚀 Starting Comprehensive RAG Testing")
        logger.info("=" * 60)
        
        if not self.connect_databases():
            return False
        
        # Test individual queries
        logger.info(f"\n📋 Testing {len(self.test_queries)} search queries...")
        
        for query in tqdm(self.test_queries, desc="Search Queries"):
            results, latency = self.execute_search_query(query)
            metrics = self.calculate_metrics(query, results, latency)
            
            self.results.extend(results)
            self.metrics.append(metrics)
            
            # Log individual query results
            logger.info(f"   {query.id}: {metrics.overall_quality} quality, "
                       f"{metrics.relevant_results}/{metrics.results_count} relevant, "
                       f"{latency:.1f}ms")
        
        # Test metadata filtering
        logger.info(f"\n🔍 Testing metadata filtering...")
        filter_success = self.test_metadata_filtering()
        
        # Test concurrent performance
        logger.info(f"\n⚡ Testing concurrent performance...")
        concurrent_metrics = self.test_concurrent_searches()
        
        # Generate comprehensive report
        logger.info(f"\n📊 Generating test report...")
        self.generate_comprehensive_report(filter_success, concurrent_metrics)
        
        # Overall assessment
        excellent_queries = len([m for m in self.metrics if m.overall_quality == "excellent"])
        good_queries = len([m for m in self.metrics if m.overall_quality in ["excellent", "good"]])
        
        overall_success_rate = good_queries / len(self.metrics) if self.metrics else 0
        
        logger.info(f"\n" + "=" * 60)
        if overall_success_rate >= 0.8:
            logger.info("🎉 RAG SYSTEM VALIDATION: EXCELLENT")
        elif overall_success_rate >= 0.6:
            logger.info("✅ RAG SYSTEM VALIDATION: GOOD")
        elif overall_success_rate >= 0.4:
            logger.info("⚠️ RAG SYSTEM VALIDATION: NEEDS IMPROVEMENT")
        else:
            logger.info("❌ RAG SYSTEM VALIDATION: FAILED")
        
        logger.info(f"Overall Success Rate: {overall_success_rate:.1%}")
        logger.info(f"Excellent Queries: {excellent_queries}/{len(self.metrics)}")
        logger.info("=" * 60)
        
        return overall_success_rate >= 0.6
    
    def generate_comprehensive_report(self, filter_success: bool, concurrent_metrics: Dict[str, float]):
        """Generate detailed test report"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        report_file = f"rag_test_report_{timestamp}.json"
        
        # Aggregate metrics
        total_queries = len(self.metrics)
        avg_latency = statistics.mean([m.latency_ms for m in self.metrics]) if self.metrics else 0
        avg_score = statistics.mean([m.avg_score for m in self.metrics]) if self.metrics else 0
        total_relevant = sum(m.relevant_results for m in self.metrics)
        total_results = sum(m.results_count for m in self.metrics)
        
        quality_distribution = {}
        for metric in self.metrics:
            quality = metric.overall_quality
            quality_distribution[quality] = quality_distribution.get(quality, 0) + 1
        
        # Category analysis
        category_performance = {}
        for metric in self.metrics:
            # Find the original query to get category
            query = next((q for q in self.test_queries if q.id == metric.query_id), None)
            if query:
                category = query.category
                if category not in category_performance:
                    category_performance[category] = []
                category_performance[category].append(metric.overall_quality)
        
        # Create comprehensive report
        report = {
            "test_summary": {
                "timestamp": datetime.now().isoformat(),
                "total_queries": total_queries,
                "avg_latency_ms": avg_latency,
                "avg_relevance_score": avg_score,
                "total_relevant_results": total_relevant,
                "total_results": total_results,
                "relevance_rate": total_relevant / total_results if total_results > 0 else 0,
                "filter_test_success": filter_success,
                "quality_distribution": quality_distribution
            },
            "performance_metrics": {
                "individual_query_avg_latency": avg_latency,
                "concurrent_performance": concurrent_metrics
            },
            "category_analysis": {
                category: {
                    "total_queries": len(qualities),
                    "excellent_count": qualities.count("excellent"),
                    "good_count": qualities.count("good"),
                    "success_rate": (qualities.count("excellent") + qualities.count("good")) / len(qualities)
                }
                for category, qualities in category_performance.items()
            },
            "detailed_results": [
                {
                    "query_id": m.query_id,
                    "query_text": m.query_text,
                    "category": next((q.category for q in self.test_queries if q.id == m.query_id), "unknown"),
                    "latency_ms": m.latency_ms,
                    "results_count": m.results_count,
                    "avg_score": m.avg_score,
                    "top_score": m.top_score,
                    "relevant_results": m.relevant_results,
                    "keyword_matches": m.keyword_matches,
                    "metadata_accuracy": m.metadata_accuracy,
                    "overall_quality": m.overall_quality
                }
                for m in self.metrics
            ],
            "recommendations": self._generate_recommendations()
        }
        
        # Save report
        try:
            with open(report_file, 'w') as f:
                json.dump(report, f, indent=2)
            logger.info(f"📄 Detailed report saved to: {report_file}")
        except Exception as e:
            logger.error(f"⚠️ Could not save report: {e}")
        
        # Display key insights
        logger.info(f"\n📊 KEY INSIGHTS:")
        logger.info(f"   Average Latency: {avg_latency:.1f}ms")
        logger.info(f"   Average Relevance Score: {avg_score:.3f}")
        logger.info(f"   Overall Relevance Rate: {(total_relevant/total_results*100) if total_results > 0 else 0:.1f}%")
        logger.info(f"   Best Performing Categories: {self._get_best_categories(category_performance)}")
        
        return report
    
    def _generate_recommendations(self) -> List[str]:
        """Generate recommendations based on test results"""
        recommendations = []
        
        # Analyze latency
        avg_latency = statistics.mean([m.latency_ms for m in self.metrics]) if self.metrics else 0
        if avg_latency > 1000:
            recommendations.append("Consider optimizing vector search performance - average latency is high")
        
        # Analyze relevance
        poor_quality = len([m for m in self.metrics if m.overall_quality == "poor"])
        if poor_quality > len(self.metrics) * 0.2:
            recommendations.append("Review content chunking strategy - too many poor quality results")
        
        # Analyze keyword matching
        low_keyword_matches = len([m for m in self.metrics if m.keyword_matches == 0])
        if low_keyword_matches > len(self.metrics) * 0.3:
            recommendations.append("Improve keyword coverage in content chunks")
        
        # Analyze metadata accuracy
        low_metadata = len([m for m in self.metrics if m.metadata_accuracy < 0.5])
        if low_metadata > len(self.metrics) * 0.2:
            recommendations.append("Review metadata filtering and content categorization")
        
        if not recommendations:
            recommendations.append("RAG system is performing well - no major improvements needed")
        
        return recommendations
    
    def _get_best_categories(self, category_performance: Dict[str, List[str]]) -> str:
        """Get best performing categories"""
        category_scores = {}
        for category, qualities in category_performance.items():
            excellent_rate = qualities.count("excellent") / len(qualities)
            good_rate = (qualities.count("excellent") + qualities.count("good")) / len(qualities)
            category_scores[category] = good_rate
        
        # Sort by performance
        sorted_categories = sorted(category_scores.items(), key=lambda x: x[1], reverse=True)
        
        if sorted_categories:
            top_3 = [f"{cat} ({score:.1%})" for cat, score in sorted_categories[:3]]
            return ", ".join(top_3)
        
        return "None"
    
    def cleanup(self):
        """Cleanup database connections"""
        if self.pg_connection:
            self.pg_connection.close()

def main():
    """Main execution function"""
    try:
        # Load environment variables
        project_root = Path(__file__).parent.parent
        env_path = project_root / '.env.local'
        load_dotenv(env_path)
        
        # Get configuration
        postgres_url = os.getenv('DATABASE_URL')
        vector_url = os.getenv('UPSTASH_VECTOR_REST_URL')
        vector_token = os.getenv('UPSTASH_VECTOR_REST_TOKEN')
        
        if not all([postgres_url, vector_url, vector_token]):
            logger.error("❌ Missing required environment variables")
            logger.error("Required: DATABASE_URL, UPSTASH_VECTOR_REST_URL, UPSTASH_VECTOR_REST_TOKEN")
            return False
        
        # Run tests
        tester = RAGTester(postgres_url, vector_url, vector_token)
        
        try:
            success = tester.run_comprehensive_tests()
            return success
        finally:
            tester.cleanup()
            
    except KeyboardInterrupt:
        logger.warning("\n⚠️ Testing interrupted by user")
        return False
    except Exception as e:
        logger.error(f"❌ Testing failed: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)