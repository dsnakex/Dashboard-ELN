-- ============================================
-- NIKAIA ELN - SCRIPTS SQL SÉCURISÉS
-- ============================================
-- Ce script peut être exécuté même si certaines tables existent déjà
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- SUPPRESSION DES CONTRAINTES EXISTANTES (éviter les doublons)
-- ============================================

ALTER TABLE IF EXISTS experiments DROP CONSTRAINT IF EXISTS fk_experiments_protocol;
ALTER TABLE IF EXISTS experiments DROP CONSTRAINT IF EXISTS fk_experiments_template;

-- ============================================
-- TABLES DE BASE
-- ============================================

-- Table users (si pas existante)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  organization VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table user_roles
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) CHECK (role IN ('admin', 'researcher', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Table projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table studies
CREATE TABLE IF NOT EXISTS studies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table protocols
CREATE TABLE IF NOT EXISTS protocols (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  content JSONB DEFAULT '{"type":"doc","content":[]}',
  category VARCHAR(100),
  visibility VARCHAR(20) DEFAULT 'personal'
    CHECK (visibility IN ('personal', 'group', 'public')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tags TEXT[] DEFAULT '{}',
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  estimated_duration_minutes INTEGER,
  difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard'))
);

-- Table experiment_templates
CREATE TABLE IF NOT EXISTS experiment_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  content JSONB DEFAULT '{"type":"doc","content":[]}',
  category VARCHAR(100),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Table experiments
CREATE TABLE IF NOT EXISTS experiments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  study_id UUID REFERENCES studies(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'configuring'
    CHECK (status IN ('configuring', 'pending', 'in_progress', 'completed', 'signed')),
  content JSONB DEFAULT '{"type":"doc","content":[]}',
  metadata JSONB DEFAULT '{}',
  protocol_id UUID,
  template_id UUID,
  signed_at TIMESTAMP WITH TIME ZONE,
  signed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table storage_units
CREATE TABLE IF NOT EXISTS storage_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  unit_type VARCHAR(50)
    CHECK (unit_type IN ('freezer_minus80', 'freezer_minus20', 'fridge', 'room_temp', 'liquid_nitrogen', 'incubator', 'other')),
  description TEXT,
  building VARCHAR(100),
  room VARCHAR(100),
  temperature DECIMAL(5,2),
  capacity INTEGER,
  parent_unit_id UUID REFERENCES storage_units(id) ON DELETE CASCADE,
  position_format VARCHAR(50),
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Table samples
CREATE TABLE IF NOT EXISTS samples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  sample_type VARCHAR(50) NOT NULL
    CHECK (sample_type IN ('antibody', 'cell_line', 'oligo', 'protein', 'rna', 'vector', 'chemical', 'reagent', 'other')),
  description TEXT,
  quantity DECIMAL(10,2),
  unit VARCHAR(50),
  concentration DECIMAL(10,4),
  concentration_unit VARCHAR(50),
  storage_unit_id UUID REFERENCES storage_units(id) ON DELETE SET NULL,
  position VARCHAR(50),
  received_date DATE,
  expiration_date DATE,
  supplier VARCHAR(255),
  catalog_number VARCHAR(100),
  lot_number VARCHAR(100),
  barcode VARCHAR(100) UNIQUE,
  custom_fields JSONB DEFAULT '{}',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  status VARCHAR(20) DEFAULT 'available'
    CHECK (status IN ('available', 'in_use', 'depleted', 'expired', 'disposed'))
);

-- Table equipment
CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  equipment_type VARCHAR(100),
  manufacturer VARCHAR(255),
  model VARCHAR(255),
  serial_number VARCHAR(100) UNIQUE,
  building VARCHAR(100),
  room VARCHAR(100),
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  maintenance_interval_days INTEGER,
  maintenance_notes TEXT,
  status VARCHAR(20) DEFAULT 'operational'
    CHECK (status IN ('operational', 'maintenance', 'out_of_service', 'reserved')),
  is_bookable BOOLEAN DEFAULT FALSE,
  booking_url TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Table files
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type VARCHAR(100),
  folder_path TEXT DEFAULT '/',
  entity_type VARCHAR(50),
  entity_id UUID,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Table experiment_samples
CREATE TABLE IF NOT EXISTS experiment_samples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE,
  sample_id UUID REFERENCES samples(id) ON DELETE CASCADE,
  quantity_used DECIMAL(10,4),
  unit VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(experiment_id, sample_id)
);

-- Table activity_log
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  changes JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  type VARCHAR(50),
  entity_type VARCHAR(50),
  entity_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table comments
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  content TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table tasks
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- AJOUT DES FOREIGN KEYS (si pas déjà existantes)
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_experiments_protocol'
  ) THEN
    ALTER TABLE experiments
    ADD CONSTRAINT fk_experiments_protocol
    FOREIGN KEY (protocol_id) REFERENCES protocols(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_experiments_template'
  ) THEN
    ALTER TABLE experiments
    ADD CONSTRAINT fk_experiments_template
    FOREIGN KEY (template_id) REFERENCES experiment_templates(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================
-- INDEX
-- ============================================

CREATE INDEX IF NOT EXISTS idx_experiments_status ON experiments(status);
CREATE INDEX IF NOT EXISTS idx_experiments_study ON experiments(study_id);
CREATE INDEX IF NOT EXISTS idx_studies_project ON studies(project_id);
CREATE INDEX IF NOT EXISTS idx_protocols_category ON protocols(category);
CREATE INDEX IF NOT EXISTS idx_protocols_visibility ON protocols(visibility);
CREATE INDEX IF NOT EXISTS idx_protocols_created_by ON protocols(created_by);
CREATE INDEX IF NOT EXISTS idx_protocols_tags ON protocols USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_protocols_active ON protocols(is_active);
CREATE INDEX IF NOT EXISTS idx_templates_category ON experiment_templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_created_by ON experiment_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_storage_units_type ON storage_units(unit_type);
CREATE INDEX IF NOT EXISTS idx_storage_units_parent ON storage_units(parent_unit_id);
CREATE INDEX IF NOT EXISTS idx_samples_type ON samples(sample_type);
CREATE INDEX IF NOT EXISTS idx_samples_storage ON samples(storage_unit_id);
CREATE INDEX IF NOT EXISTS idx_samples_barcode ON samples(barcode);
CREATE INDEX IF NOT EXISTS idx_samples_status ON samples(status);
CREATE INDEX IF NOT EXISTS idx_samples_expiration ON samples(expiration_date);
CREATE INDEX IF NOT EXISTS idx_samples_created_by ON samples(created_by);
CREATE INDEX IF NOT EXISTS idx_equipment_type ON equipment(equipment_type);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
CREATE INDEX IF NOT EXISTS idx_equipment_next_maintenance ON equipment(next_maintenance_date);
CREATE INDEX IF NOT EXISTS idx_files_entity ON files(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_files_folder ON files(folder_path);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_files_tags ON files USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_exp_samples_experiment ON experiment_samples(experiment_id);
CREATE INDEX IF NOT EXISTS idx_exp_samples_sample ON experiment_samples(sample_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON activity_log(action);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Users can view projects" ON projects;
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Users can update projects" ON projects;
DROP POLICY IF EXISTS "Users can delete projects" ON projects;

DROP POLICY IF EXISTS "Users can view studies" ON studies;
DROP POLICY IF EXISTS "Users can create studies" ON studies;
DROP POLICY IF EXISTS "Users can update studies" ON studies;
DROP POLICY IF EXISTS "Users can delete studies" ON studies;

DROP POLICY IF EXISTS "Users can view experiments" ON experiments;
DROP POLICY IF EXISTS "Users can create experiments" ON experiments;
DROP POLICY IF EXISTS "Users can update experiments" ON experiments;
DROP POLICY IF EXISTS "Users can delete experiments" ON experiments;

DROP POLICY IF EXISTS "Users can view protocols" ON protocols;
DROP POLICY IF EXISTS "Users can create protocols" ON protocols;
DROP POLICY IF EXISTS "Users can update protocols" ON protocols;
DROP POLICY IF EXISTS "Users can delete protocols" ON protocols;

DROP POLICY IF EXISTS "Users can view templates" ON experiment_templates;
DROP POLICY IF EXISTS "Users can create templates" ON experiment_templates;
DROP POLICY IF EXISTS "Users can update templates" ON experiment_templates;
DROP POLICY IF EXISTS "Users can delete templates" ON experiment_templates;

DROP POLICY IF EXISTS "Users can view samples" ON samples;
DROP POLICY IF EXISTS "Users can create samples" ON samples;
DROP POLICY IF EXISTS "Users can update samples" ON samples;
DROP POLICY IF EXISTS "Users can delete samples" ON samples;

DROP POLICY IF EXISTS "Users can view storage_units" ON storage_units;
DROP POLICY IF EXISTS "Users can create storage_units" ON storage_units;
DROP POLICY IF EXISTS "Users can update storage_units" ON storage_units;
DROP POLICY IF EXISTS "Users can delete storage_units" ON storage_units;

DROP POLICY IF EXISTS "Users can view equipment" ON equipment;
DROP POLICY IF EXISTS "Users can create equipment" ON equipment;
DROP POLICY IF EXISTS "Users can update equipment" ON equipment;
DROP POLICY IF EXISTS "Users can delete equipment" ON equipment;

DROP POLICY IF EXISTS "Users can view files" ON files;
DROP POLICY IF EXISTS "Users can create files" ON files;
DROP POLICY IF EXISTS "Users can update files" ON files;
DROP POLICY IF EXISTS "Users can delete files" ON files;

DROP POLICY IF EXISTS "Users can view experiment_samples" ON experiment_samples;
DROP POLICY IF EXISTS "Users can create experiment_samples" ON experiment_samples;
DROP POLICY IF EXISTS "Users can update experiment_samples" ON experiment_samples;
DROP POLICY IF EXISTS "Users can delete experiment_samples" ON experiment_samples;

DROP POLICY IF EXISTS "Users can view activity_log" ON activity_log;
DROP POLICY IF EXISTS "System can create activity_log" ON activity_log;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

DROP POLICY IF EXISTS "Users can view comments" ON comments;
DROP POLICY IF EXISTS "Users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;

DROP POLICY IF EXISTS "Users can view all tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own tasks or assigned tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;

-- Créer les nouvelles policies
CREATE POLICY "Users can view projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Users can create projects" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update projects" ON projects FOR UPDATE USING (true);
CREATE POLICY "Users can delete projects" ON projects FOR DELETE USING (true);

CREATE POLICY "Users can view studies" ON studies FOR SELECT USING (true);
CREATE POLICY "Users can create studies" ON studies FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update studies" ON studies FOR UPDATE USING (true);
CREATE POLICY "Users can delete studies" ON studies FOR DELETE USING (true);

CREATE POLICY "Users can view experiments" ON experiments FOR SELECT USING (true);
CREATE POLICY "Users can create experiments" ON experiments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update experiments" ON experiments FOR UPDATE USING (true);
CREATE POLICY "Users can delete experiments" ON experiments FOR DELETE USING (true);

CREATE POLICY "Users can view protocols" ON protocols FOR SELECT USING (true);
CREATE POLICY "Users can create protocols" ON protocols FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update protocols" ON protocols FOR UPDATE USING (true);
CREATE POLICY "Users can delete protocols" ON protocols FOR DELETE USING (true);

CREATE POLICY "Users can view templates" ON experiment_templates FOR SELECT USING (true);
CREATE POLICY "Users can create templates" ON experiment_templates FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update templates" ON experiment_templates FOR UPDATE USING (true);
CREATE POLICY "Users can delete templates" ON experiment_templates FOR DELETE USING (true);

CREATE POLICY "Users can view samples" ON samples FOR SELECT USING (true);
CREATE POLICY "Users can create samples" ON samples FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update samples" ON samples FOR UPDATE USING (true);
CREATE POLICY "Users can delete samples" ON samples FOR DELETE USING (true);

CREATE POLICY "Users can view storage_units" ON storage_units FOR SELECT USING (true);
CREATE POLICY "Users can create storage_units" ON storage_units FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update storage_units" ON storage_units FOR UPDATE USING (true);
CREATE POLICY "Users can delete storage_units" ON storage_units FOR DELETE USING (true);

CREATE POLICY "Users can view equipment" ON equipment FOR SELECT USING (true);
CREATE POLICY "Users can create equipment" ON equipment FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update equipment" ON equipment FOR UPDATE USING (true);
CREATE POLICY "Users can delete equipment" ON equipment FOR DELETE USING (true);

CREATE POLICY "Users can view files" ON files FOR SELECT USING (true);
CREATE POLICY "Users can create files" ON files FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update files" ON files FOR UPDATE USING (true);
CREATE POLICY "Users can delete files" ON files FOR DELETE USING (true);

CREATE POLICY "Users can view experiment_samples" ON experiment_samples FOR SELECT USING (true);
CREATE POLICY "Users can create experiment_samples" ON experiment_samples FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update experiment_samples" ON experiment_samples FOR UPDATE USING (true);
CREATE POLICY "Users can delete experiment_samples" ON experiment_samples FOR DELETE USING (true);

CREATE POLICY "Users can view activity_log" ON activity_log FOR SELECT USING (true);
CREATE POLICY "System can create activity_log" ON activity_log FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view all tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "Users can create tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks or assigned tasks" ON tasks FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = assignee_id);
CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_studies_updated_at ON studies;
CREATE TRIGGER update_studies_updated_at
BEFORE UPDATE ON studies
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_experiments_updated_at ON experiments;
CREATE TRIGGER update_experiments_updated_at
BEFORE UPDATE ON experiments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_protocols_updated_at ON protocols;
CREATE TRIGGER update_protocols_updated_at
BEFORE UPDATE ON protocols
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_experiment_templates_updated_at ON experiment_templates;
CREATE TRIGGER update_experiment_templates_updated_at
BEFORE UPDATE ON experiment_templates
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_samples_updated_at ON samples;
CREATE TRIGGER update_samples_updated_at
BEFORE UPDATE ON samples
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_storage_units_updated_at ON storage_units;
CREATE TRIGGER update_storage_units_updated_at
BEFORE UPDATE ON storage_units
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_equipment_updated_at ON equipment;
CREATE TRIGGER update_equipment_updated_at
BEFORE UPDATE ON equipment
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_files_updated_at ON files;
CREATE TRIGGER update_files_updated_at
BEFORE UPDATE ON files
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON comments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STORAGE BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT DO NOTHING;

-- Supprimer anciennes policies storage
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;

-- Créer nouvelles policies storage
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- DONNÉES DE TEST
-- ============================================

-- Créer un utilisateur de test si la table est vide
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users LIMIT 1) THEN
    INSERT INTO users (id, email, full_name)
    VALUES (gen_random_uuid(), 'test@nikaia.com', 'Test User');
  END IF;
END $$;

-- Ajouter le rôle admin
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin' FROM users WHERE email = 'test@nikaia.com'
ON CONFLICT DO NOTHING;

-- Projet de test
INSERT INTO projects (name, description, status)
VALUES ('Oncology Research Project', 'Main research project for cancer treatment studies', 'active')
ON CONFLICT DO NOTHING;

-- Study de test
INSERT INTO studies (name, description, project_id)
SELECT 'PD-L1 Expression Study', 'Study of PD-L1 expression in tumor samples', id
FROM projects WHERE name = 'Oncology Research Project'
ON CONFLICT DO NOTHING;

-- Storage units
INSERT INTO storage_units (name, unit_type, building, room, temperature) VALUES
  ('Freezer -80°C Lab A', 'freezer_minus80', 'Building A', 'Room 101', -80),
  ('Fridge 4°C Lab A', 'fridge', 'Building A', 'Room 101', 4),
  ('Liquid Nitrogen Tank', 'liquid_nitrogen', 'Building A', 'Room 102', -196)
ON CONFLICT DO NOTHING;

-- Protocols de test
INSERT INTO protocols (name, description, category, visibility) VALUES
  ('PCR Protocol - Standard', 'Standard PCR amplification protocol', 'enzymes', 'public'),
  ('Western Blot - Basic', 'Basic western blot procedure', 'staining', 'group'),
  ('Cell Culture - HeLa', 'HeLa cell line culture protocol', 'media', 'personal')
ON CONFLICT DO NOTHING;

-- Equipment de test
INSERT INTO equipment (name, equipment_type, manufacturer, model, building, room, status, is_bookable) VALUES
  ('PCR Thermocycler', 'Thermal Cycler', 'Bio-Rad', 'C1000 Touch', 'Building A', 'Room 101', 'operational', true),
  ('Microscope Confocal', 'Microscopy', 'Zeiss', 'LSM 980', 'Building A', 'Room 103', 'operational', true),
  ('Centrifuge', 'Centrifuge', 'Eppendorf', '5424 R', 'Building A', 'Room 101', 'operational', false)
ON CONFLICT DO NOTHING;

-- ============================================
-- VÉRIFICATION FINALE
-- ============================================

SELECT
  '✅ Installation terminée!' AS message,
  (SELECT COUNT(*) FROM projects) AS projects,
  (SELECT COUNT(*) FROM studies) AS studies,
  (SELECT COUNT(*) FROM experiments) AS experiments,
  (SELECT COUNT(*) FROM protocols) AS protocols,
  (SELECT COUNT(*) FROM samples) AS samples,
  (SELECT COUNT(*) FROM storage_units) AS storage_units,
  (SELECT COUNT(*) FROM equipment) AS equipment,
  (SELECT COUNT(*) FROM tasks) AS tasks,
  (SELECT COUNT(*) FROM comments) AS comments;
