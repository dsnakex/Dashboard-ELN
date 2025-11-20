-- ============================================
-- ÉTAPE 1: NETTOYAGE COMPLET DES POLICIES
-- ============================================
-- EXÉCUTER CE SCRIPT EN PREMIER
-- ============================================

-- Supprimer TOUTES les policies de storage.objects
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', r.policyname);
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;
END $$;

-- Supprimer TOUTES les policies des tables publiques
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
        RAISE NOTICE 'Dropped policy: % on %', r.policyname, r.tablename;
    END LOOP;
END $$;

SELECT '✅ Toutes les policies ont été supprimées' AS status;
