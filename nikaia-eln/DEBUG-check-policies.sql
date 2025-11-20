-- ============================================
-- SCRIPT DE DEBUG: Lister toutes les policies
-- ============================================
-- Exécutez ce script pour voir TOUTES les policies existantes
-- ============================================

-- Lister toutes les policies du schema public
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Lister toutes les policies storage
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage'
ORDER BY tablename, policyname;
