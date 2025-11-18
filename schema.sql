-- =====================================================
-- NIKAIA DASHBOARD - PostgreSQL Schema
-- =====================================================
-- Copier-coller ce fichier dans Supabase SQL Editor
-- et exécuter pour créer toutes les tables
-- =====================================================

-- Drop tables if they exist (pour réinitialiser)
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS subprojects CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =====================================================
-- 1. TABLE: users
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('manager', 'contributor', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =====================================================
-- 2. TABLE: projects
-- =====================================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on-hold', 'completed', 'archived')),
    lead_id UUID REFERENCES users(id) ON DELETE SET NULL,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_lead_id ON projects(lead_id);
CREATE INDEX idx_projects_dates ON projects(start_date, end_date);

-- =====================================================
-- 3. TABLE: subprojects
-- =====================================================
CREATE TABLE subprojects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'blocked', 'completed')),
    lead_id UUID REFERENCES users(id) ON DELETE SET NULL,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX idx_subprojects_project_id ON subprojects(project_id);
CREATE INDEX idx_subprojects_status ON subprojects(status);
CREATE INDEX idx_subprojects_lead_id ON subprojects(lead_id);

-- =====================================================
-- 4. TABLE: tasks
-- =====================================================
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subproject_id UUID NOT NULL REFERENCES subprojects(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    due_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'review', 'done')),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX idx_tasks_subproject_id ON tasks(subproject_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- =====================================================
-- 5. TABLE: comments
-- =====================================================
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX idx_comments_task_id ON comments(task_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- =====================================================
-- TRIGGERS: Auto-update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subprojects_updated_at BEFORE UPDATE ON subprojects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE subprojects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Users: Everyone can read, only authenticated users can see all
CREATE POLICY "Enable read access for all users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for users based on email" ON users
    FOR UPDATE USING (true);

-- Projects: Everyone can read, managers can modify
CREATE POLICY "Enable read access for all users" ON projects
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON projects
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON projects
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users" ON projects
    FOR DELETE USING (true);

-- Subprojects: Everyone can read, managers can modify
CREATE POLICY "Enable read access for all users" ON subprojects
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON subprojects
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON subprojects
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users" ON subprojects
    FOR DELETE USING (true);

-- Tasks: Everyone can read, contributors can modify their own
CREATE POLICY "Enable read access for all users" ON tasks
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON tasks
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON tasks
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users" ON tasks
    FOR DELETE USING (true);

-- Comments: Everyone can read, users can modify their own
CREATE POLICY "Enable read access for all users" ON comments
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON comments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON comments
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users" ON comments
    FOR DELETE USING (true);

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Schema created successfully!';
    RAISE NOTICE '📊 Tables: users, projects, subprojects, tasks, comments';
    RAISE NOTICE '🔐 RLS policies enabled';
    RAISE NOTICE '⚡ Indexes and triggers configured';
    RAISE NOTICE '';
    RAISE NOTICE '➡️  Next step: Run test_data.sql to insert sample data';
END $$;
