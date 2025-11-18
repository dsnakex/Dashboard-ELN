-- =====================================================
-- NIKAIA DASHBOARD - Test Data
-- =====================================================
-- Copier-coller ce fichier dans Supabase SQL Editor
-- APRÈS avoir exécuté schema.sql
-- =====================================================

-- =====================================================
-- 1. INSERT TEST USERS
-- =====================================================

-- Clear existing data (optional, for testing)
DELETE FROM comments;
DELETE FROM tasks;
DELETE FROM subprojects;
DELETE FROM projects;
DELETE FROM users;

-- Insert 4 test users
INSERT INTO users (email, name, role) VALUES
    ('alice@biotech.fr', 'Alice Martin', 'manager'),
    ('bob@biotech.fr', 'Bob Durand', 'contributor'),
    ('charlie@biotech.fr', 'Charlie Dubois', 'contributor'),
    ('diana@biotech.fr', 'Diana Lopez', 'viewer');

-- =====================================================
-- 2. INSERT TEST PROJECT
-- =====================================================

-- Get Alice's ID for project lead
DO $$
DECLARE
    alice_id UUID;
    bob_id UUID;
    charlie_id UUID;
    project_id UUID;
    subproject_id UUID;
BEGIN
    -- Get user IDs
    SELECT id INTO alice_id FROM users WHERE email = 'alice@biotech.fr';
    SELECT id INTO bob_id FROM users WHERE email = 'bob@biotech.fr';
    SELECT id INTO charlie_id FROM users WHERE email = 'charlie@biotech.fr';

    -- Insert project
    INSERT INTO projects (name, description, status, lead_id, start_date, end_date)
    VALUES (
        'YK725 Development',
        'Développement d''un nouvel inhibiteur de kinase pour le traitement du cancer du poumon. Phase II de recherche incluant synthèse chimique, tests in vitro et in vivo.',
        'active',
        alice_id,
        '2025-01-15',
        '2025-12-31'
    )
    RETURNING id INTO project_id;

    -- =====================================================
    -- 3. INSERT TEST SUBPROJECT
    -- =====================================================

    INSERT INTO subprojects (project_id, name, description, status, lead_id, start_date, end_date)
    VALUES (
        project_id,
        'Tests In Vitro',
        'Évaluation de l''efficacité du composé YK725 sur lignées cellulaires cancéreuses',
        'in-progress',
        bob_id,
        '2025-02-01',
        '2025-06-30'
    )
    RETURNING id INTO subproject_id;

    -- =====================================================
    -- 4. INSERT TEST TASKS
    -- =====================================================

    -- Task 1: High priority, todo
    INSERT INTO tasks (
        subproject_id,
        title,
        description,
        assignee_id,
        due_date,
        status,
        priority,
        estimated_hours
    ) VALUES (
        subproject_id,
        'Préparer les lignées cellulaires A549',
        'Culture et préparation des cellules A549 (cancer du poumon) pour les tests de cytotoxicité',
        bob_id,
        '2025-02-15',
        'todo',
        'high',
        8.0
    );

    -- Task 2: Medium priority, in-progress
    INSERT INTO tasks (
        subproject_id,
        title,
        description,
        assignee_id,
        due_date,
        status,
        priority,
        estimated_hours
    ) VALUES (
        subproject_id,
        'Réaliser tests MTT cytotoxicité',
        'Effectuer les tests MTT pour évaluer la viabilité cellulaire après traitement avec YK725',
        charlie_id,
        '2025-03-01',
        'in-progress',
        'medium',
        16.0
    );

    -- Task 3: Urgent priority, review
    INSERT INTO tasks (
        subproject_id,
        title,
        description,
        assignee_id,
        due_date,
        status,
        priority,
        estimated_hours
    ) VALUES (
        subproject_id,
        'Analyser données Western Blot',
        'Analyse des données Western Blot pour déterminer l''effet de YK725 sur les voies de signalisation',
        bob_id,
        '2025-02-20',
        'review',
        'urgent',
        12.0
    );

    -- =====================================================
    -- 5. INSERT TEST COMMENTS
    -- =====================================================

    -- Get task IDs
    DECLARE
        task1_id UUID;
        task2_id UUID;
    BEGIN
        SELECT id INTO task1_id FROM tasks WHERE title = 'Préparer les lignées cellulaires A549';
        SELECT id INTO task2_id FROM tasks WHERE title = 'Réaliser tests MTT cytotoxicité';

        -- Comments on task 1
        INSERT INTO comments (task_id, user_id, content) VALUES
            (task1_id, alice_id, 'N''oublie pas de commander les milieux de culture avant de commencer.'),
            (task1_id, bob_id, 'OK, j''ai commandé les milieux RPMI hier. Ils devraient arriver demain.');

        -- Comment on task 2
        INSERT INTO comments (task_id, user_id, content) VALUES
            (task2_id, charlie_id, 'J''ai commencé les tests MTT ce matin. Les résultats préliminaires sont prometteurs!');
    END;
END $$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Count inserted records
SELECT
    'users' as table_name,
    COUNT(*) as count
FROM users
UNION ALL
SELECT
    'projects' as table_name,
    COUNT(*) as count
FROM projects
UNION ALL
SELECT
    'subprojects' as table_name,
    COUNT(*) as count
FROM subprojects
UNION ALL
SELECT
    'tasks' as table_name,
    COUNT(*) as count
FROM tasks
UNION ALL
SELECT
    'comments' as table_name,
    COUNT(*) as count
FROM comments;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Test data inserted successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Summary:';
    RAISE NOTICE '   - 4 users (alice, bob, charlie, diana)';
    RAISE NOTICE '   - 1 project (YK725 Development)';
    RAISE NOTICE '   - 1 subproject (Tests In Vitro)';
    RAISE NOTICE '   - 3 tasks (various statuses and priorities)';
    RAISE NOTICE '   - 3 comments';
    RAISE NOTICE '';
    RAISE NOTICE '🔐 Login credentials:';
    RAISE NOTICE '   - alice@biotech.fr (Manager)';
    RAISE NOTICE '   - bob@biotech.fr (Contributor)';
    RAISE NOTICE '   - charlie@biotech.fr (Contributor)';
    RAISE NOTICE '   - diana@biotech.fr (Viewer)';
    RAISE NOTICE '';
    RAISE NOTICE '➡️  Next step: Start your Streamlit app!';
    RAISE NOTICE '   1. Copy .env.template to .env';
    RAISE NOTICE '   2. Add your Supabase credentials to .env';
    RAISE NOTICE '   3. Run: streamlit run main.py';
END $$;
