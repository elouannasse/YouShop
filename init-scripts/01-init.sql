-- ================================
-- YouShop Database Initialization
-- ================================

-- This script runs automatically when PostgreSQL container starts
-- Only if the database doesn't already exist

-- Ensure the database exists
SELECT 'CREATE DATABASE youshop'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'youshop')\gexec

-- Connect to the database
\c youshop

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'YouShop database initialized successfully!';
END $$;
