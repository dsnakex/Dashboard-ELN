-- Migration 001: Create experiments table
-- Dashboard ELN - Phase 1: Module Expériences
-- Date: 19 Novembre 2025

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TABLE: experiments
-- =============================================================================
CREATE TABLE IF NOT EXISTS experiments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  objective TEXT NOT NULL,
  protocol TEXT,
  conditions TEXT,
  observations TEXT,
  results_summary TEXT,

  -- Relations
  subproject_id UUID NOT NULL REFERENCES subprojects(id) ON DELETE CASCADE,
  responsible_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  -- Status & Priority
  status VARCHAR(50) NOT NULL DEFAULT 'planned',
  priority VARCHAR(50) NOT NULL DEFAULT 'medium',

  -- Dates
  planned_date DATE,
  start_date DATE,
  completion_date DATE,
  deadline DATE,

  -- Metadata
  estimated_duration_hours DECIMAL(10,2),
  actual_duration_hours DECIMAL(10,2),
  tags TEXT[],

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),

  -- Constraints
  CONSTRAINT valid_experiment_status CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled', 'validated')),
  CONSTRAINT valid_experiment_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
);

-- =============================================================================
-- INDEXES for performance
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_experiments_subproject ON experiments(subproject_id);
CREATE INDEX IF NOT EXISTS idx_experiments_responsible ON experiments(responsible_user_id);
CREATE INDEX IF NOT EXISTS idx_experiments_status ON experiments(status);
CREATE INDEX IF NOT EXISTS idx_experiments_priority ON experiments(priority);
CREATE INDEX IF NOT EXISTS idx_experiments_dates ON experiments(planned_date, start_date, completion_date);
CREATE INDEX IF NOT EXISTS idx_experiments_created_by ON experiments(created_by);

-- GIN index for tags array search
CREATE INDEX IF NOT EXISTS idx_experiments_tags ON experiments USING GIN (tags);

-- =============================================================================
-- TRIGGER for automatic updated_at
-- =============================================================================
CREATE OR REPLACE FUNCTION update_experiments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_experiments_updated_at ON experiments;
CREATE TRIGGER trigger_experiments_updated_at
BEFORE UPDATE ON experiments
FOR EACH ROW
EXECUTE FUNCTION update_experiments_updated_at();

-- =============================================================================
-- EXTEND comments table to support experiments
-- =============================================================================
ALTER TABLE comments ADD COLUMN IF NOT EXISTS experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE;

-- Update constraint for single entity reference
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comment_single_entity_check;
ALTER TABLE comments ADD CONSTRAINT comment_single_entity_check
CHECK (
  (task_id IS NOT NULL AND experiment_id IS NULL) OR
  (task_id IS NULL AND experiment_id IS NOT NULL) OR
  (task_id IS NULL AND experiment_id IS NULL)
);

-- Index for experiment comments
CREATE INDEX IF NOT EXISTS idx_comments_experiment ON comments(experiment_id);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) Policies
-- =============================================================================
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view experiments
CREATE POLICY experiments_select_policy ON experiments
FOR SELECT USING (true);

-- Policy: Managers and Contributors can insert
CREATE POLICY experiments_insert_policy ON experiments
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('manager', 'contributor')
  )
);

-- Policy: Managers can update any, Contributors can update their own
CREATE POLICY experiments_update_policy ON experiments
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND (
      role = 'manager'
      OR (role = 'contributor' AND (
        experiments.responsible_user_id = auth.uid()
        OR experiments.created_by = auth.uid()
      ))
    )
  )
);

-- Policy: Managers can delete any, Contributors can delete their own
CREATE POLICY experiments_delete_policy ON experiments
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND (
      role = 'manager'
      OR (role = 'contributor' AND experiments.created_by = auth.uid())
    )
  )
);

-- =============================================================================
-- COMMENTS for documentation
-- =============================================================================
COMMENT ON TABLE experiments IS 'Scientific experiments linked to subprojects';
COMMENT ON COLUMN experiments.status IS 'Experiment status: planned, in_progress, completed, cancelled, validated';
COMMENT ON COLUMN experiments.priority IS 'Priority level: low, medium, high, urgent';
COMMENT ON COLUMN experiments.tags IS 'Array of tags for categorization and filtering';
COMMENT ON COLUMN experiments.protocol IS 'Detailed experimental protocol';
COMMENT ON COLUMN experiments.conditions IS 'Experimental conditions and parameters';
COMMENT ON COLUMN experiments.observations IS 'Observations during the experiment';
COMMENT ON COLUMN experiments.results_summary IS 'Summary of experimental results';

-- =============================================================================
-- TEST DATA (optional - comment out for production)
-- =============================================================================
-- INSERT INTO experiments (title, objective, subproject_id, responsible_user_id, created_by, status, priority, planned_date)
-- SELECT
--   'Test Experiment 1',
--   'Test the experimental workflow',
--   (SELECT id FROM subprojects LIMIT 1),
--   (SELECT id FROM users WHERE role = 'manager' LIMIT 1),
--   (SELECT id FROM users WHERE role = 'manager' LIMIT 1),
--   'planned',
--   'medium',
--   CURRENT_DATE + INTERVAL '7 days'
-- WHERE EXISTS (SELECT 1 FROM subprojects) AND EXISTS (SELECT 1 FROM users);

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
