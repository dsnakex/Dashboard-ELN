-- ============================================
-- ÉTAPE 3: STORAGE (OPTIONNEL)
-- ============================================
-- EXÉCUTER CE SCRIPT SEULEMENT SI VOUS VOULEZ LE BUCKET AVATARS
-- Si vous avez des erreurs, ignorez ce script
-- ============================================

-- Créer le bucket avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policies storage (très simples)
CREATE POLICY "Public can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated can upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated can update avatars"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated can delete avatars"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

SELECT '✅ Storage bucket créé avec succès' AS status;
