-- Initialize Medplum database
-- This script runs automatically when PostgreSQL container starts for the first time

-- Create extensions if they don't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE medplum TO medplum;
GRANT ALL PRIVILEGES ON SCHEMA public TO medplum;

-- Set timezone
SET timezone = 'UTC';

-- Log initialization
SELECT 'Medplum database initialized successfully' as status;