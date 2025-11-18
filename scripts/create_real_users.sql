-- Create Real Users for Nikaia Dashboard
-- Execute this in Supabase SQL Editor after resetting the database

-- IMPORTANT: Replace these with your actual team members

-- Example: Insert real users
-- Replace email, name, and role with actual values

-- Manager (full access)
INSERT INTO users (email, name, role) VALUES
('your.manager@company.com', 'Manager Name', 'manager');

-- Contributors (can create and manage their own tasks)
INSERT INTO users (email, name, role) VALUES
('contributor1@company.com', 'Contributor 1 Name', 'contributor'),
('contributor2@company.com', 'Contributor 2 Name', 'contributor'),
('contributor3@company.com', 'Contributor 3 Name', 'contributor');

-- Viewers (read-only access)
INSERT INTO users (email, name, role) VALUES
('viewer1@company.com', 'Viewer 1 Name', 'viewer');

-- Verify users were created
SELECT
    id,
    email,
    name,
    role,
    created_at
FROM users
ORDER BY role, name;
