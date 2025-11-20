-- ============================================
-- NETTOYAGE COMPLET DE TOUTES LES POLICIES
-- ============================================
-- Exécutez ce script AVANT le script de création
-- ============================================

DO $$
DECLARE
    r RECORD;
    policy_count INTEGER := 0;
BEGIN
    -- Supprimer TOUTES les policies du schema public
    FOR r IN (
        SELECT tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    ) LOOP
        BEGIN
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
            policy_count := policy_count + 1;
            RAISE NOTICE 'Supprimé: % sur %', r.policyname, r.tablename;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Erreur lors de la suppression de % sur %: %', r.policyname, r.tablename, SQLERRM;
        END;
    END LOOP;

    -- Supprimer TOUTES les policies du schema storage
    FOR r IN (
        SELECT tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'storage'
    ) LOOP
        BEGIN
            EXECUTE format('DROP POLICY IF EXISTS %I ON storage.%I', r.policyname, r.tablename);
            policy_count := policy_count + 1;
            RAISE NOTICE 'Supprimé storage: % sur %', r.policyname, r.tablename;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Erreur storage: % sur %: %', r.policyname, r.tablename, SQLERRM;
        END;
    END LOOP;

    RAISE NOTICE 'Total de policies supprimées: %', policy_count;
END $$;

-- Vérification finale
SELECT
    '✅ Nettoyage terminé' AS message,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') AS policies_publiques_restantes,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'storage') AS policies_storage_restantes;
