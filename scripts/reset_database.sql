-- Reset Database - Remove all test data
-- Execute this in Supabase SQL Editor to clean the database

-- Delete all data in reverse order (respecting foreign keys)
DELETE FROM comments;
DELETE FROM tasks;
DELETE FROM subprojects;
DELETE FROM projects;
DELETE FROM users;

-- Reset sequences (optional - resets IDs to 1)
-- ALTER SEQUENCE comments_id_seq RESTART WITH 1;
-- ALTER SEQUENCE tasks_id_seq RESTART WITH 1;
-- ALTER SEQUENCE subprojects_id_seq RESTART WITH 1;
-- ALTER SEQUENCE projects_id_seq RESTART WITH 1;
-- ALTER SEQUENCE users_id_seq RESTART WITH 1;

-- Verify the database is empty
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'subprojects', COUNT(*) FROM subprojects
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'comments', COUNT(*) FROM comments;
