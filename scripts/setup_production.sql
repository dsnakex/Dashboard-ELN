-- ============================================
-- NIKAIA DASHBOARD - Production Setup
-- ============================================
-- Execute this script in Supabase SQL Editor
-- https://app.supabase.com -> SQL Editor
-- ============================================

-- STEP 1: Clean all test data
-- ============================================
DELETE FROM comments;
DELETE FROM tasks;
DELETE FROM subprojects;
DELETE FROM projects;
DELETE FROM users;

-- Verify cleanup
SELECT 'Database cleaned!' as status;

-- STEP 2: Create real users
-- ============================================

-- Managers (full access)
INSERT INTO users (email, name, role) VALUES
('p.dao@nikaia-pharmaceuticals.com', 'Pascal Dao', 'manager'),
('g.beranger@nikaia-pharmaceuticals.com', 'Guillaume Béranger', 'manager');

-- Contributors (can create and manage own projects/tasks)
INSERT INTO users (email, name, role) VALUES
('a.mahler@nikaia-pharmaceuticals.com', 'Adrien Mahler', 'contributor');

-- Verify user creation
SELECT
    id,
    email,
    name,
    role,
    created_at
FROM users
ORDER BY role, name;

-- ============================================
-- DONE! Your database is ready for production.
--
-- Login with: p.dao@nikaia-pharmaceuticals.com
-- ============================================
