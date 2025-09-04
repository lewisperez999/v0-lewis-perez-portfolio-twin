# Database Schema Comparison Analysis

## Key Discrepancies Between schema.sql and Actual Database

### 🔍 **SKILLS Table**
**Schema.sql**: 
- Primary Key: `id UUID`
- Skill name: `name VARCHAR(255)`
- Proficiency: `proficiency_level INTEGER (1-5)`

**Actual Database**:
- Primary Key: `id INTEGER`
- Skill name: `skill_name VARCHAR(255)`
- Proficiency: `proficiency VARCHAR(50)`
- Additional fields: `professional_id`, `experience_years`, `context`, `projects`, `skill_type`

### 🔍 **PROJECTS Table**
**Schema.sql**:
- Primary Key: `id UUID`
- Project name: `name VARCHAR(255)`
- URLs: `github_url`, `demo_url`

**Actual Database**:
- Primary Key: `id INTEGER`
- Project name: `name VARCHAR(255)` ✅ (matches)
- URLs: `repository_url`, `demo_url`
- Additional fields: `professional_id`, `role`, `outcomes`, `challenges`, `documentation_url`

### 🔍 **EXPERIENCES Table**
**Schema.sql**:
- Primary Key: `id UUID`
- Company: `company VARCHAR(255)`
- Role: `position VARCHAR(255)`

**Actual Database**:
- Primary Key: `id INTEGER`
- Company: `company VARCHAR(255)` ✅ (matches)
- Role: `position VARCHAR(255)` ✅ (matches)
- Additional fields: `professional_id`, `duration`, `skills_developed`, `impact`, `keywords`

### 🔍 **PERSONAL_INFO Table**
**Schema.sql**: Not defined in schema.sql file

**Actual Database**: Exists with 16 columns including name, title, email, phone, etc.

### 🔍 **CONTENT_CHUNKS Table**
**Schema.sql**:
- Primary Key: `chunk_id VARCHAR(255)`

**Actual Database**:
- Primary Key: `id INTEGER`
- Additional field: `chunk_id VARCHAR(255)` (as regular column)
- Additional fields: `professional_id`, `importance`, `date_range`, `search_weight`, `vector_id`

## 🎯 **Root Cause Analysis**

The schema.sql file appears to be an **initial/ideal schema design**, while the actual database has evolved to include:

1. **Professional ID relationships** - All tables link to a `professional_id`
2. **Integer primary keys** instead of UUIDs
3. **Additional business logic fields** for enhanced functionality
4. **More detailed metadata** for search and categorization

## 📋 **Impact on MCP Tools**

This explains why MCP tools were failing:
- `lookup_skills` was looking for `name` instead of `skill_name`
- `lookup_skills` was looking for `proficiency_level` instead of `proficiency`
- Column types and constraints don't match between schema.sql and reality

## ✅ **Recommended Action**

Use the **actual database schema** as the source of truth and update:
1. MCP server.ts to match actual column names
2. Update schema.sql to reflect the current database structure (optional)
3. Fix remaining column mismatches in MCP tools