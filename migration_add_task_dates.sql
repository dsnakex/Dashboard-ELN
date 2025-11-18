-- =====================================================
-- MIGRATION: Add start_date to tasks table
-- =====================================================
-- Exécuter ce fichier dans Supabase SQL Editor
-- pour ajouter la colonne start_date aux tâches
-- =====================================================

-- Add start_date column to tasks table
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS start_date DATE;

-- Update existing tasks with a default start_date
-- (7 days before due_date, or today if no due_date)
UPDATE tasks
SET start_date = COALESCE(due_date - INTERVAL '7 days', CURRENT_DATE)
WHERE start_date IS NULL;

-- Add comment to column
COMMENT ON COLUMN tasks.start_date IS 'Date de début de la tâche';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Migration completed successfully!';
    RAISE NOTICE '📅 Column start_date added to tasks table';
    RAISE NOTICE '🔄 Existing tasks updated with default start dates';
END $$;
