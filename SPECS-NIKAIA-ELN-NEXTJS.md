# 🧬 NIKAIA ELN - SPÉCIFICATIONS COMPLÈTES POUR CLAUDE CODE

> **Projet:** Migration Dashboard Nikaia → ELN Complet (Next.js 14)  
> **Date:** 18 Novembre 2025  
> **Pour:** Claude Code (Implémentation séquentielle)  
> **Contexte:** Évolution d'un dashboard Streamlit vers un ELN professionnel inspiré d'eLabJournal

---

## 📋 TABLE DES MATIÈRES

1. [Contexte et Objectifs](#1-contexte-et-objectifs)
2. [Architecture Technique](#2-architecture-technique)
3. [Base de Données - Schéma SQL](#3-base-de-données---schéma-sql)
4. [Structure du Projet](#4-structure-du-projet)
5. [Spécifications Fonctionnelles](#5-spécifications-fonctionnelles)
6. [Design System](#6-design-system)
7. [Prompts Séquentiels pour Claude Code](#7-prompts-séquentiels-pour-claude-code)
8. [Checklist de Validation](#8-checklist-de-validation)
9. [Guide de Migration](#9-guide-de-migration)

---

## 1. CONTEXTE ET OBJECTIFS

### 1.1 Situation Actuelle

**Application existante:**
- **Stack:** Streamlit 1.28.1 + Supabase + PostgreSQL
- **Fonctionnalités:** Dashboard KPIs, Projets, Subprojects, Tasks, Timeline, Kanban
- **Utilisateurs:** 5-10 chercheurs en oncologie
- **Limitations:** Interface Streamlit limitée, pas de fonctionnalités ELN spécifiques

**Fichiers existants:**
```
nikaia-dashboard-streamlit/
├── main.py
├── utils/
│   ├── supabase_client.py
│   ├── auth.py
│   ├── crud.py
│   └── navigation.py
├── pages/
│   ├── 1_dashboard.py
│   ├── 2_projects.py
│   ├── 3_tasks.py
│   ├── 4_timeline.py
│   └── 5_kanban.py
└── .env
```

### 1.2 Objectifs de la Migration

**Transformation en ELN professionnel:**

✅ **Renommages:**
- `tasks` → `experiments` (cœur de l'ELN)
- `subprojects` → `studies` (organisation hiérarchique)

✅ **Nouvelles fonctionnalités:**
1. **Module Experiments** (cahier de labo électronique)
2. **Module Protocols** (protocoles réutilisables)
3. **Module Inventory** (samples, storage, equipment)
4. **File Storage** (gestion de fichiers)
5. **Recherche globale** (Cmd+K)
6. **Rich text editor** (TipTap)
7. **Timeline des expériences**
8. **Templates d'expériences**

✅ **Amélioration UX:**
- Navigation professionnelle (Header + Sidebar)
- Breadcrumbs
- États vides descriptifs
- Recherche avancée multi-critères
- Design system cohérent (inspiré eLabJournal)

### 1.3 Résultats Attendus

**Application Next.js 14 complète:**
- ✅ Migration de toutes les fonctionnalités existantes
- ✅ Ajout des modules ELN (Experiments, Protocols, Inventory)
- ✅ Interface utilisateur moderne et professionnelle
- ✅ Performance optimisée (React Server Components)
- ✅ TypeScript pour la maintenabilité
- ✅ Tests de base (Vitest)

---

## 2. ARCHITECTURE TECHNIQUE

### 2.1 Stack Technique

#### Frontend
| Technologie | Version | Rôle |
|------------|---------|------|
| **Next.js** | 14.2+ | Framework React (App Router) |
| **React** | 18.3+ | UI Library |
| **TypeScript** | 5.3+ | Typage statique |
| **Tailwind CSS** | 3.4+ | Styling |
| **Shadcn/ui** | Latest | Composants UI |
| **Radix UI** | Latest | Primitives UI accessibles |
| **TanStack Query** | 5.x | Data fetching/caching |
| **Zustand** | 4.x | State management |
| **TipTap** | 2.x | Rich text editor |
| **Recharts** | 2.x | Graphiques |
| **cmdk** | Latest | Command palette (Cmd+K) |
| **date-fns** | 3.x | Manipulation dates |
| **React DnD** | 16.x | Drag & drop (Kanban) |
| **react-hot-toast** | 2.x | Notifications |

#### Backend
| Technologie | Rôle |
|------------|------|
| **Supabase** | BaaS (Auth, Database, Storage) |
| **PostgreSQL** | Base de données (via Supabase) |
| **Row Level Security** | Permissions granulaires |
| **Supabase Storage** | Stockage fichiers |

#### DevOps
| Technologie | Rôle |
|------------|------|
| **Vercel** | Hosting Next.js |
| **ESLint** | Linting |
| **Prettier** | Formatting |
| **Vitest** | Testing |

### 2.2 Architecture de Données

#### Hiérarchie
```
Organization
  └── Projects
       └── Studies
            └── Experiments
                 ├── Protocols (reference)
                 ├── Files (attachments)
                 └── Samples (used in experiment)
```

#### Relations principales
```
users ←→ user_roles (RBAC: admin, researcher, viewer)
projects → studies → experiments
protocols (standalone, reusable)
samples → storage_units
experiments → protocols (FK)
experiments ↔ files (many-to-many)
```

### 2.3 Patterns Architecturaux

**Next.js App Router:**
- **Server Components** par défaut (performance)
- **Client Components** (`'use client'`) pour interactivité
- **API Routes** pour endpoints custom
- **Middleware** pour auth guards

**Data Fetching:**
- **TanStack Query** pour client-side data fetching
- **Server Actions** pour mutations
- **Optimistic updates** pour meilleure UX

**State Management:**
- **Zustand** pour global state (user, UI preferences)
- **React Query cache** pour server state
- **URL state** pour filtres/pagination

**Security:**
- **Row Level Security (RLS)** sur Supabase
- **Middleware auth** sur Next.js
- **CSRF protection** (Next.js built-in)
- **Input validation** (Zod schemas)

---

## 3. BASE DE DONNÉES - SCHÉMA SQL

### 3.1 Instructions d'Exécution

**⚠️ IMPORTANT:** Exécuter ces scripts dans l'ordre sur Supabase SQL Editor.

**Étapes:**
1. Backup de la base actuelle (`pg_dump`)
2. Exécuter `01_rename_tables.sql`
3. Exécuter `02_new_tables.sql`
4. Exécuter `03_rls_policies.sql`
5. Exécuter `04_triggers.sql`
6. Vérifier avec `05_verification.sql`

### 3.2 Scripts SQL

#### 📄 `01_rename_tables.sql`

```sql
-- ============================================
-- SCRIPT 1: RENOMMAGE DES TABLES EXISTANTES
-- ============================================
-- Renommer 'tasks' en 'experiments'
ALTER TABLE tasks RENAME TO experiments;

-- Renommer 'subprojects' en 'studies'
ALTER TABLE subprojects RENAME TO studies;

-- Mettre à jour les colonnes de référence
ALTER TABLE experiments RENAME COLUMN task_name TO name;
ALTER TABLE experiments RENAME COLUMN subproject_id TO study_id;

-- Ajouter nouvelles colonnes à 'experiments'
ALTER TABLE experiments
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'configuring' 
  CHECK (status IN ('configuring', 'pending', 'in_progress', 'completed', 'signed')),
ADD COLUMN IF NOT EXISTS protocol_id UUID REFERENCES protocols(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES experiment_templates(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS content JSONB DEFAULT '{"type":"doc","content":[]}', -- TipTap JSON
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS signed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS signed_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Ajouter project_id à 'studies'
ALTER TABLE studies
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE CASCADE;

-- Mettre à jour les index
CREATE INDEX IF NOT EXISTS idx_experiments_status ON experiments(status);
CREATE INDEX IF NOT EXISTS idx_experiments_study ON experiments(study_id);
CREATE INDEX IF NOT EXISTS idx_studies_project ON studies(project_id);

-- Vérification
SELECT 'Tables renommées avec succès' AS status;
```

#### 📄 `02_new_tables.sql`

```sql
-- ============================================
-- SCRIPT 2: CRÉATION DES NOUVELLES TABLES
-- ============================================

-- Enable UUID extension (si pas déjà activée)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: protocols
-- ============================================
CREATE TABLE IF NOT EXISTS protocols (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  content JSONB DEFAULT '{"type":"doc","content":[]}', -- TipTap JSON
  category VARCHAR(100), 
  -- Categories: 'Antibiotics', 'Buffers', 'Enzymes', 'Media', 'Staining', 'Other'
  visibility VARCHAR(20) DEFAULT 'personal' 
    CHECK (visibility IN ('personal', 'group', 'public')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tags TEXT[] DEFAULT '{}',
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  -- Metadata
  estimated_duration_minutes INTEGER,
  difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard'))
);

CREATE INDEX idx_protocols_category ON protocols(category);
CREATE INDEX idx_protocols_visibility ON protocols(visibility);
CREATE INDEX idx_protocols_created_by ON protocols(created_by);
CREATE INDEX idx_protocols_tags ON protocols USING GIN(tags);
CREATE INDEX idx_protocols_active ON protocols(is_active);

-- ============================================
-- TABLE: experiment_templates
-- ============================================
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

CREATE INDEX idx_templates_category ON experiment_templates(category);
CREATE INDEX idx_templates_created_by ON experiment_templates(created_by);

-- ============================================
-- TABLE: storage_units
-- ============================================
CREATE TABLE IF NOT EXISTS storage_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  unit_type VARCHAR(50) 
    CHECK (unit_type IN ('freezer_minus80', 'freezer_minus20', 'fridge', 'room_temp', 'liquid_nitrogen', 'incubator', 'other')),
  description TEXT,
  
  -- Location
  building VARCHAR(100),
  room VARCHAR(100),
  
  -- Configuration
  temperature DECIMAL(5,2), -- en °C
  capacity INTEGER, -- nombre de positions
  
  -- Hierarchy (pour racks, étagères, etc.)
  parent_unit_id UUID REFERENCES storage_units(id) ON DELETE CASCADE,
  position_format VARCHAR(50), -- e.g., 'A1-H12' pour microplates
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_storage_units_type ON storage_units(unit_type);
CREATE INDEX idx_storage_units_parent ON storage_units(parent_unit_id);

-- ============================================
-- TABLE: samples
-- ============================================
CREATE TABLE IF NOT EXISTS samples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  sample_type VARCHAR(50) NOT NULL 
    CHECK (sample_type IN ('antibody', 'cell_line', 'oligo', 'protein', 'rna', 'vector', 'chemical', 'reagent', 'other')),
  description TEXT,
  
  -- Quantité
  quantity DECIMAL(10,2),
  unit VARCHAR(50), -- 'µg', 'mg', 'mL', 'µL', 'units', etc.
  concentration DECIMAL(10,4),
  concentration_unit VARCHAR(50), -- 'µg/mL', 'ng/µL', 'M', 'mM', etc.
  
  -- Location
  storage_unit_id UUID REFERENCES storage_units(id) ON DELETE SET NULL,
  position VARCHAR(50), -- e.g., "A1", "Rack 2, Shelf 3"
  
  -- Dates
  received_date DATE,
  expiration_date DATE,
  
  -- Provenance
  supplier VARCHAR(255),
  catalog_number VARCHAR(100),
  lot_number VARCHAR(100),
  barcode VARCHAR(100) UNIQUE,
  
  -- Metadata personnalisée par type
  custom_fields JSONB DEFAULT '{}',
  -- Exemples pour Antibody:
  -- {
  --   "host": "rabbit",
  --   "clonality": "monoclonal",
  --   "clone_number": "EP1234",
  --   "target": "PD-L1",
  --   "application": "IHC, WB",
  --   "dilution": "1:1000"
  -- }
  
  -- Ownership
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  status VARCHAR(20) DEFAULT 'available' 
    CHECK (status IN ('available', 'in_use', 'depleted', 'expired', 'disposed'))
);

CREATE INDEX idx_samples_type ON samples(sample_type);
CREATE INDEX idx_samples_storage ON samples(storage_unit_id);
CREATE INDEX idx_samples_barcode ON samples(barcode);
CREATE INDEX idx_samples_status ON samples(status);
CREATE INDEX idx_samples_expiration ON samples(expiration_date);
CREATE INDEX idx_samples_created_by ON samples(created_by);

-- ============================================
-- TABLE: equipment
-- ============================================
CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  equipment_type VARCHAR(100),
  manufacturer VARCHAR(255),
  model VARCHAR(255),
  serial_number VARCHAR(100) UNIQUE,
  
  -- Location
  building VARCHAR(100),
  room VARCHAR(100),
  
  -- Maintenance
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  maintenance_interval_days INTEGER,
  maintenance_notes TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'operational' 
    CHECK (status IN ('operational', 'maintenance', 'out_of_service', 'reserved')),
  
  -- Booking
  is_bookable BOOLEAN DEFAULT FALSE,
  booking_url TEXT, -- Lien externe calendrier booking
  
  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_equipment_type ON equipment(equipment_type);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_next_maintenance ON equipment(next_maintenance_date);

-- ============================================
-- TABLE: files
-- ============================================
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL, -- Chemin dans Supabase Storage
  file_size BIGINT, -- en bytes
  mime_type VARCHAR(100),
  
  -- Organization
  folder_path TEXT DEFAULT '/', -- e.g., "/Projects/Project1/Study1"
  
  -- Relations polymorphiques
  entity_type VARCHAR(50), -- 'experiment', 'protocol', 'sample', 'project', 'study'
  entity_id UUID,
  
  -- Metadata
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_files_entity ON files(entity_type, entity_id);
CREATE INDEX idx_files_folder ON files(folder_path);
CREATE INDEX idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX idx_files_tags ON files USING GIN(tags);

-- ============================================
-- TABLE: experiment_samples (many-to-many)
-- ============================================
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

CREATE INDEX idx_exp_samples_experiment ON experiment_samples(experiment_id);
CREATE INDEX idx_exp_samples_sample ON experiment_samples(sample_id);

-- ============================================
-- TABLE: activity_log (Audit trail)
-- ============================================
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL, 
  -- Actions: 'created', 'updated', 'deleted', 'signed', 'exported', 'shared'
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  changes JSONB DEFAULT '{}', -- Détail des changements
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_log_user ON activity_log(user_id);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_log_created ON activity_log(created_at DESC);
CREATE INDEX idx_activity_log_action ON activity_log(action);

-- ============================================
-- TABLE: notifications
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  notification_type VARCHAR(50), -- 'experiment_signed', 'sample_expiring', 'equipment_maintenance', etc.
  entity_type VARCHAR(50),
  entity_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- Vérification
SELECT 'Nouvelles tables créées avec succès' AS status;
```

#### 📄 `03_rls_policies.sql`

```sql
-- ============================================
-- SCRIPT 3: ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS sur toutes les nouvelles tables
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES: protocols
-- ============================================

-- SELECT: Tous peuvent voir leurs propres protocoles + group + public
CREATE POLICY "Users can view accessible protocols"
ON protocols FOR SELECT
USING (
  visibility = 'public' OR
  created_by = auth.uid() OR
  (visibility = 'group' AND auth.uid() IN (
    SELECT user_id FROM user_roles
  ))
);

-- INSERT: Researchers et Admins peuvent créer
CREATE POLICY "Researchers can create protocols"
ON protocols FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role IN ('admin', 'researcher')
  )
);

-- UPDATE: Seulement créateur ou admin
CREATE POLICY "Users can update own protocols"
ON protocols FOR UPDATE
USING (
  created_by = auth.uid() OR
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

-- DELETE: Seulement créateur ou admin
CREATE POLICY "Users can delete own protocols"
ON protocols FOR DELETE
USING (
  created_by = auth.uid() OR
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

-- ============================================
-- POLICIES: samples
-- ============================================

CREATE POLICY "Users can view all samples"
ON samples FOR SELECT
USING (
  auth.uid() IN (SELECT user_id FROM user_roles)
);

CREATE POLICY "Researchers can create samples"
ON samples FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role IN ('admin', 'researcher')
  )
);

CREATE POLICY "Researchers can update samples"
ON samples FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role IN ('admin', 'researcher')
  )
);

CREATE POLICY "Admins can delete samples"
ON samples FOR DELETE
USING (
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

-- ============================================
-- POLICIES: experiments (mise à jour)
-- ============================================

-- Ajouter politique pour experiments si pas déjà existante
CREATE POLICY IF NOT EXISTS "Users can view experiments"
ON experiments FOR SELECT
USING (
  auth.uid() IN (SELECT user_id FROM user_roles)
);

CREATE POLICY IF NOT EXISTS "Researchers can create experiments"
ON experiments FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role IN ('admin', 'researcher')
  )
);

CREATE POLICY IF NOT EXISTS "Users can update own experiments or admins"
ON experiments FOR UPDATE
USING (
  created_by = auth.uid() OR
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

-- ============================================
-- POLICIES: files
-- ============================================

CREATE POLICY "Users can view files"
ON files FOR SELECT
USING (
  auth.uid() IN (SELECT user_id FROM user_roles)
);

CREATE POLICY "Users can upload files"
ON files FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role IN ('admin', 'researcher', 'viewer')
  )
);

CREATE POLICY "Users can update own files"
ON files FOR UPDATE
USING (
  uploaded_by = auth.uid() OR
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

CREATE POLICY "Users can delete own files"
ON files FOR DELETE
USING (
  uploaded_by = auth.uid() OR
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

-- ============================================
-- POLICIES: storage_units & equipment
-- ============================================

CREATE POLICY "Users can view storage units"
ON storage_units FOR SELECT
USING (auth.uid() IN (SELECT user_id FROM user_roles));

CREATE POLICY "Admins can manage storage units"
ON storage_units FOR ALL
USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'));

CREATE POLICY "Users can view equipment"
ON equipment FOR SELECT
USING (auth.uid() IN (SELECT user_id FROM user_roles));

CREATE POLICY "Admins can manage equipment"
ON equipment FOR ALL
USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'));

-- ============================================
-- POLICIES: notifications
-- ============================================

CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
ON notifications FOR INSERT
WITH CHECK (true); -- Sera créée par triggers/functions

CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (user_id = auth.uid());

-- ============================================
-- POLICIES: activity_log
-- ============================================

CREATE POLICY "Users can view own activity"
ON activity_log FOR SELECT
USING (
  user_id = auth.uid() OR
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

CREATE POLICY "System can log activity"
ON activity_log FOR INSERT
WITH CHECK (true);

-- Vérification
SELECT 'RLS Policies créées avec succès' AS status;
```

#### 📄 `04_triggers.sql`

```sql
-- ============================================
-- SCRIPT 4: TRIGGERS & FUNCTIONS
-- ============================================

-- ============================================
-- FUNCTION: update_updated_at_column
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS: updated_at
-- ============================================

CREATE TRIGGER update_experiments_updated_at 
BEFORE UPDATE ON experiments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_protocols_updated_at 
BEFORE UPDATE ON protocols
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experiment_templates_updated_at 
BEFORE UPDATE ON experiment_templates
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_samples_updated_at 
BEFORE UPDATE ON samples
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_storage_units_updated_at 
BEFORE UPDATE ON storage_units
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at 
BEFORE UPDATE ON equipment
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_files_updated_at 
BEFORE UPDATE ON files
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION: log_activity
-- ============================================
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO activity_log (user_id, action, entity_type, entity_id, changes)
    VALUES (auth.uid(), 'created', TG_TABLE_NAME, NEW.id, row_to_json(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO activity_log (user_id, action, entity_type, entity_id, changes)
    VALUES (auth.uid(), 'updated', TG_TABLE_NAME, NEW.id, 
            jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW)));
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO activity_log (user_id, action, entity_type, entity_id, changes)
    VALUES (auth.uid(), 'deleted', TG_TABLE_NAME, OLD.id, row_to_json(OLD));
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS: activity_log (sur entités principales)
-- ============================================

CREATE TRIGGER log_experiments_activity
AFTER INSERT OR UPDATE OR DELETE ON experiments
FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_protocols_activity
AFTER INSERT OR UPDATE OR DELETE ON protocols
FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_samples_activity
AFTER INSERT OR UPDATE OR DELETE ON samples
FOR EACH ROW EXECUTE FUNCTION log_activity();

-- ============================================
-- FUNCTION: notify_sample_expiring
-- ============================================
CREATE OR REPLACE FUNCTION notify_sample_expiring()
RETURNS void AS $$
BEGIN
  INSERT INTO notifications (user_id, title, message, notification_type, entity_type, entity_id)
  SELECT 
    created_by,
    'Sample Expiring Soon',
    'Sample "' || name || '" expires on ' || expiration_date::text,
    'sample_expiring',
    'sample',
    id
  FROM samples
  WHERE expiration_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
    AND status = 'available'
    AND is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM notifications 
      WHERE entity_type = 'sample' 
        AND entity_id = samples.id 
        AND notification_type = 'sample_expiring'
        AND created_at > CURRENT_DATE - INTERVAL '7 days'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: notify_equipment_maintenance
-- ============================================
CREATE OR REPLACE FUNCTION notify_equipment_maintenance()
RETURNS void AS $$
BEGIN
  INSERT INTO notifications (user_id, title, message, notification_type, entity_type, entity_id)
  SELECT 
    ur.user_id,
    'Equipment Maintenance Due',
    'Equipment "' || e.name || '" requires maintenance on ' || e.next_maintenance_date::text,
    'equipment_maintenance',
    'equipment',
    e.id
  FROM equipment e
  CROSS JOIN user_roles ur
  WHERE e.next_maintenance_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
    AND e.status = 'operational'
    AND e.is_active = true
    AND ur.role IN ('admin', 'researcher')
    AND NOT EXISTS (
      SELECT 1 FROM notifications 
      WHERE entity_type = 'equipment' 
        AND entity_id = e.id 
        AND notification_type = 'equipment_maintenance'
        AND created_at > CURRENT_DATE - INTERVAL '7 days'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Ces fonctions doivent être appelées par un cron job (Supabase Edge Function ou externe)

-- Vérification
SELECT 'Triggers et functions créés avec succès' AS status;
```

#### 📄 `05_verification.sql`

```sql
-- ============================================
-- SCRIPT 5: VÉRIFICATION DE L'INSTALLATION
-- ============================================

-- Vérifier que toutes les tables existent
SELECT 
  table_name,
  CASE 
    WHEN table_name IN (
      'users', 'user_roles', 'projects', 'studies', 'experiments', 
      'protocols', 'experiment_templates', 'samples', 'storage_units', 
      'equipment', 'files', 'experiment_samples', 'activity_log', 'notifications'
    ) THEN '✅ OK'
    ELSE '❌ MISSING'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'users', 'user_roles', 'projects', 'studies', 'experiments', 
    'protocols', 'experiment_templates', 'samples', 'storage_units', 
    'equipment', 'files', 'experiment_samples', 'activity_log', 'notifications'
  )
ORDER BY table_name;

-- Vérifier les colonnes de experiments
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'experiments'
ORDER BY ordinal_position;

-- Vérifier les RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Vérifier les triggers
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Compter les enregistrements (doit être 0 pour nouvelles tables)
SELECT 
  'experiments' as table_name, COUNT(*) as count FROM experiments
UNION ALL
SELECT 'protocols', COUNT(*) FROM protocols
UNION ALL
SELECT 'samples', COUNT(*) FROM samples
UNION ALL
SELECT 'storage_units', COUNT(*) FROM storage_units
UNION ALL
SELECT 'equipment', COUNT(*) FROM equipment;

SELECT '✅ Vérification terminée' AS status;
```

### 3.3 Données de Test (Optionnel)

#### 📄 `06_sample_data.sql`

```sql
-- ============================================
-- SCRIPT 6: DONNÉES DE TEST (OPTIONNEL)
-- ============================================

-- Insérer des catégories de protocoles
INSERT INTO protocols (name, description, category, visibility, created_by)
VALUES
  ('PCR Protocol - Standard', 'Standard PCR amplification protocol', 'Enzymes', 'public', (SELECT id FROM users LIMIT 1)),
  ('Western Blot - Basic', 'Basic western blot procedure', 'Staining', 'group', (SELECT id FROM users LIMIT 1)),
  ('Cell Culture - HeLa', 'HeLa cell line culture protocol', 'Media', 'personal', (SELECT id FROM users LIMIT 1));

-- Insérer des storage units
INSERT INTO storage_units (name, unit_type, building, room, temperature)
VALUES
  ('Freezer -80°C Lab A', 'freezer_minus80', 'Building A', 'Room 101', -80),
  ('Fridge 4°C Lab A', 'fridge', 'Building A', 'Room 101', 4),
  ('Liquid Nitrogen Tank', 'liquid_nitrogen', 'Building A', 'Room 102', -196);

-- Insérer des samples
INSERT INTO samples (name, sample_type, quantity, unit, storage_unit_id, received_date, expiration_date, supplier, status)
VALUES
  ('Anti-PD-L1 Antibody', 'antibody', 500, 'µg', (SELECT id FROM storage_units WHERE name = 'Freezer -80°C Lab A'), '2024-01-15', '2026-01-15', 'Cell Signaling', 'available'),
  ('HeLa Cell Line', 'cell_line', 10, 'vials', (SELECT id FROM storage_units WHERE name = 'Liquid Nitrogen Tank'), '2023-06-01', NULL, 'ATCC', 'available'),
  ('Plasmid pCDNA3.1', 'vector', 100, 'µg', (SELECT id FROM storage_units WHERE name = 'Freezer -80°C Lab A'), '2024-03-20', NULL, 'Invitrogen', 'available');

-- Insérer des equipment
INSERT INTO equipment (name, equipment_type, manufacturer, model, building, room, status, is_bookable)
VALUES
  ('PCR Thermocycler', 'Thermal Cycler', 'Bio-Rad', 'C1000 Touch', 'Building A', 'Room 101', 'operational', true),
  ('Microscope Confocal', 'Microscopy', 'Zeiss', 'LSM 980', 'Building A', 'Room 103', 'operational', true),
  ('Centrifuge', 'Centrifuge', 'Eppendorf', '5424 R', 'Building A', 'Room 101', 'operational', false);

SELECT '✅ Données de test insérées' AS status;
```

---

## 4. STRUCTURE DU PROJET

### 4.1 Arborescence Complète

```
nikaia-eln/
├── .env.local
├── .env.example
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── README.md
│
├── app/
│   ├── layout.tsx                    # Root layout (metadata, fonts)
│   ├── globals.css                   # Global styles + Tailwind
│   ├── providers.tsx                 # React Query Provider
│   │
│   ├── (auth)/                       # Route group (sans layout)
│   │   ├── login/
│   │   │   └── page.tsx              # Page login
│   │   ├── register/
│   │   │   └── page.tsx              # Page register
│   │   └── layout.tsx                # Layout auth (centré)
│   │
│   ├── (dashboard)/                  # Route group (avec layout)
│   │   ├── layout.tsx                # Layout principal (Header + Sidebar)
│   │   ├── page.tsx                  # Dashboard home (KPIs)
│   │   │
│   │   ├── projects/
│   │   │   ├── page.tsx              # Liste projets
│   │   │   ├── new/
│   │   │   │   └── page.tsx          # Créer projet
│   │   │   └── [id]/
│   │   │       ├── page.tsx          # Détail projet
│   │   │       ├── edit/
│   │   │       │   └── page.tsx      # Éditer projet
│   │   │       └── studies/
│   │   │           ├── new/
│   │   │           │   └── page.tsx  # Créer study
│   │   │           └── [studyId]/
│   │   │               ├── page.tsx  # Détail study
│   │   │               └── experiments/
│   │   │                   └── new/
│   │   │                       └── page.tsx
│   │   │
│   │   ├── experiments/
│   │   │   ├── page.tsx              # Experiment Browser
│   │   │   ├── new/
│   │   │   │   └── page.tsx          # Créer experiment
│   │   │   ├── timeline/
│   │   │   │   └── page.tsx          # Timeline view
│   │   │   └── [id]/
│   │   │       ├── page.tsx          # Détail experiment (read-only)
│   │   │       ├── edit/
│   │   │       │   └── page.tsx      # Éditer experiment
│   │   │       └── sign/
│   │   │           └── page.tsx      # Sign experiment
│   │   │
│   │   ├── protocols/
│   │   │   ├── page.tsx              # Protocol Browser
│   │   │   ├── new/
│   │   │   │   └── page.tsx          # Créer protocol
│   │   │   └── [id]/
│   │   │       ├── page.tsx          # Détail protocol
│   │   │       └── edit/
│   │   │           └── page.tsx      # Éditer protocol
│   │   │
│   │   ├── inventory/
│   │   │   ├── page.tsx              # Inventory home
│   │   │   ├── samples/
│   │   │   │   ├── page.tsx          # Sample browser
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx      # Créer sample
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Détail sample
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx  # Éditer sample
│   │   │   ├── storage/
│   │   │   │   ├── page.tsx          # Storage units
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Storage detail
│   │   │   └── equipment/
│   │   │       ├── page.tsx          # Equipment list
│   │   │       └── [id]/
│   │   │           └── page.tsx      # Equipment detail
│   │   │
│   │   ├── files/
│   │   │   └── page.tsx              # File browser
│   │   │
│   │   ├── templates/
│   │   │   ├── page.tsx              # Experiment templates
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   │
│   │   └── settings/
│   │       ├── page.tsx              # Settings home
│   │       ├── profile/
│   │       │   └── page.tsx
│   │       ├── users/
│   │       │   └── page.tsx          # User management (admin)
│   │       └── organization/
│   │           └── page.tsx
│   │
│   └── api/
│       ├── auth/
│       │   └── route.ts
│       ├── experiments/
│       │   ├── route.ts              # GET /api/experiments, POST
│       │   └── [id]/
│       │       ├── route.ts          # GET /api/experiments/:id, PUT, DELETE
│       │       └── sign/
│       │           └── route.ts      # POST /api/experiments/:id/sign
│       ├── protocols/
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       ├── samples/
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       └── search/
│           └── route.ts              # Global search
│
├── components/
│   ├── ui/                           # Shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   ├── toast.tsx
│   │   ├── badge.tsx
│   │   ├── calendar.tsx
│   │   ├── command.tsx
│   │   ├── popover.tsx
│   │   └── separator.tsx
│   │
│   ├── layout/
│   │   ├── header.tsx                # Header global
│   │   ├── sidebar.tsx               # Sidebar navigation
│   │   ├── breadcrumb.tsx            # Breadcrumb navigation
│   │   ├── command-palette.tsx       # Cmd+K search
│   │   ├── user-menu.tsx             # User dropdown
│   │   └── notifications-dropdown.tsx
│   │
│   ├── dashboard/
│   │   ├── kpi-card.tsx
│   │   ├── recent-experiments.tsx
│   │   ├── activity-feed.tsx
│   │   └── stats-chart.tsx
│   │
│   ├── experiments/
│   │   ├── experiment-browser.tsx    # Liste avec filtres
│   │   ├── experiment-card.tsx       # Card dans browser
│   │   ├── experiment-form.tsx       # Formulaire création/édition
│   │   ├── experiment-detail.tsx     # Vue détail
│   │   ├── experiment-timeline.tsx   # Timeline view
│   │   ├── rich-text-editor.tsx      # TipTap editor
│   │   ├── status-badge.tsx          # Badge statut
│   │   ├── status-select.tsx         # Dropdown statut
│   │   ├── sign-experiment-dialog.tsx
│   │   └── filters/
│   │       ├── status-filter.tsx
│   │       ├── date-filter.tsx
│   │       └── project-filter.tsx
│   │
│   ├── protocols/
│   │   ├── protocol-browser.tsx
│   │   ├── protocol-card.tsx
│   │   ├── protocol-form.tsx
│   │   ├── protocol-detail.tsx
│   │   ├── category-select.tsx
│   │   └── visibility-toggle.tsx
│   │
│   ├── inventory/
│   │   ├── sample-browser.tsx
│   │   ├── sample-card.tsx
│   │   ├── sample-form.tsx
│   │   ├── sample-detail.tsx
│   │   ├── sample-type-select.tsx
│   │   ├── storage-tree.tsx          # Arbre hiérarchique storage
│   │   ├── storage-unit-card.tsx
│   │   ├── equipment-list.tsx
│   │   ├── equipment-card.tsx
│   │   └── barcode-scanner.tsx
│   │
│   ├── projects/
│   │   ├── project-card.tsx
│   │   ├── project-form.tsx
│   │   ├── project-detail.tsx
│   │   └── study-list.tsx
│   │
│   ├── files/
│   │   ├── file-browser.tsx
│   │   ├── file-upload.tsx
│   │   ├── file-card.tsx
│   │   ├── folder-tree.tsx
│   │   └── file-preview.tsx
│   │
│   └── shared/
│       ├── data-table.tsx            # Table réutilisable
│       ├── data-table-pagination.tsx
│       ├── date-picker.tsx
│       ├── date-range-picker.tsx
│       ├── user-avatar.tsx
│       ├── user-select.tsx
│       ├── loading-spinner.tsx
│       ├── empty-state.tsx
│       ├── error-boundary.tsx
│       └── confirm-dialog.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Client-side Supabase
│   │   ├── server.ts                 # Server-side Supabase
│   │   ├── middleware.ts             # Auth middleware
│   │   └── types.ts                  # Supabase types générés
│   │
│   ├── hooks/
│   │   ├── use-experiments.ts        # React Query hooks
│   │   ├── use-protocols.ts
│   │   ├── use-samples.ts
│   │   ├── use-projects.ts
│   │   ├── use-storage-units.ts
│   │   ├── use-equipment.ts
│   │   ├── use-files.ts
│   │   ├── use-auth.ts
│   │   ├── use-notifications.ts
│   │   └── use-activity-log.ts
│   │
│   ├── stores/
│   │   ├── auth-store.ts             # Zustand store - Auth
│   │   ├── ui-store.ts               # Zustand store - UI state
│   │   └── search-store.ts           # Zustand store - Search
│   │
│   ├── api/
│   │   ├── experiments.ts            # API client functions
│   │   ├── protocols.ts
│   │   ├── samples.ts
│   │   ├── projects.ts
│   │   ├── files.ts
│   │   └── search.ts
│   │
│   ├── utils/
│   │   ├── cn.ts                     # Tailwind class merge
│   │   ├── format.ts                 # Date/number formatting
│   │   ├── validators.ts             # Zod schemas
│   │   ├── constants.ts              # App constants
│   │   └── permissions.ts            # Permission checks
│   │
│   └── types/
│       ├── database.types.ts         # Supabase generated types
│       ├── experiments.ts
│       ├── protocols.ts
│       ├── samples.ts
│       ├── projects.ts
│       ├── storage.ts
│       ├── equipment.ts
│       └── index.ts
│
├── public/
│   ├── fonts/
│   ├── images/
│   └── icons/
│
└── tests/                            # (Optionnel)
    ├── unit/
    └── integration/
```

### 4.2 Fichiers de Configuration

#### 📄 `package.json`

```json
{
  "name": "nikaia-eln",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@supabase/ssr": "^0.1.0",
    "@supabase/supabase-js": "^2.39.3",
    "@tanstack/react-query": "^5.17.19",
    "@tanstack/react-table": "^8.11.6",
    "@tiptap/extension-link": "^2.1.13",
    "@tiptap/extension-placeholder": "^2.1.13",
    "@tiptap/react": "^2.1.13",
    "@tiptap/starter-kit": "^2.1.13",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "cmdk": "^0.2.0",
    "date-fns": "^3.0.6",
    "lucide-react": "^0.312.0",
    "next": "14.2.0",
    "react": "^18.2.0",
    "react-day-picker": "^8.10.0",
    "react-dnd": "^16.0.1",
    "react-dnd-html5-backend": "^16.0.1",
    "react-dom": "^18.2.0",
    "react-hot-toast": "^2.4.1",
    "recharts": "^2.10.4",
    "tailwind-merge": "^2.2.0",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.22.4",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "eslint": "^8",
    "eslint-config-next": "14.2.0",
    "postcss": "^8",
    "prettier": "^3.1.1",
    "tailwindcss": "^3.4.0",
    "typescript": "^5"
  }
}
```

#### 📄 `.env.example`

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Analytics, Sentry, etc.
```

#### 📄 `tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Couleurs custom ELN
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
        },
        orange: {
          500: '#f97316',
          600: '#ea580c',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
```

#### 📄 `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 172 66% 50%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 172 66% 50%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 172 66% 50%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 172 66% 50%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* Custom styles for TipTap editor */
.ProseMirror {
  @apply min-h-[200px] p-4 border rounded-md focus:outline-none;
}

.ProseMirror p.is-editor-empty:first-child::before {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-secondary;
}

::-webkit-scrollbar-thumb {
  @apply bg-muted-foreground/30 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-muted-foreground/50;
}
```

---

## 5. SPÉCIFICATIONS FONCTIONNELLES

### 5.1 Module Experiments (CORE)

#### 5.1.1 Experiment Browser (`/experiments`)

**Fonctionnalités:**
- ✅ Liste paginée des expériences (20 par page)
- ✅ Vue Grid (cards) ou List (table) - toggle
- ✅ Filtres multiples:
  - Statut (all, configuring, pending, in_progress, completed, signed)
  - Projet/Study (dropdown hiérarchique)
  - Date range (date-fns picker)
  - Créateur (user select)
- ✅ Recherche full-text (nom, description, contenu)
- ✅ Tri par colonnes (nom, date, statut)
- ✅ Bouton "New Experiment" (top-right)
- ✅ Quick actions: View, Edit, Duplicate, Delete

**Composants:**
- `ExperimentBrowser` (container)
- `ExperimentCard` (grid view)
- `ExperimentTable` (list view)
- `Filters/StatusFilter`, `Filters/DateFilter`, `Filters/ProjectFilter`

**Data Fetching:**
```typescript
// lib/hooks/use-experiments.ts
const { data, isLoading } = useExperiments({
  status: 'in_progress',
  studyId: 'uuid',
  dateRange: { from: Date, to: Date },
  page: 1,
  limit: 20,
})
```

#### 5.1.2 Experiment Detail (`/experiments/[id]`)

**Vue Read-Only:**
- ✅ Header: Titre, statut, dates, créateur
- ✅ Breadcrumb: Project > Study > Experiment
- ✅ Tabs:
  - **Overview**: Contenu rich-text (TipTap read-only)
  - **Protocol**: Lien vers protocole utilisé (si existe)
  - **Samples**: Liste samples utilisés dans l'expérience
  - **Files**: Fichiers attachés
  - **Activity**: Historique modifications (activity_log)
- ✅ Actions toolbar:
  - Edit (si permissions)
  - Sign (si status = 'completed')
  - Export PDF
  - Duplicate
  - Delete (admin only)

**Composants:**
- `ExperimentDetail`
- `ExperimentHeader`
- `RichTextEditor` (mode read-only)
- `SampleList`
- `FileList`
- `ActivityLog`

#### 5.1.3 Experiment Form (`/experiments/new`, `/experiments/[id]/edit`)

**Champs:**
- ✅ **Name** (required, text input)
- ✅ **Study** (required, select hierarchical: Project > Study)
- ✅ **Protocol** (optional, select from protocols)
- ✅ **Template** (optional, select from templates - pre-fill content)
- ✅ **Status** (select: configuring, pending, in_progress, completed)
- ✅ **Description** (textarea)
- ✅ **Content** (TipTap rich-text editor)
  - Toolbar: Bold, Italic, Underline, Headings, Lists, Links, Code
  - Image upload support (via files)
- ✅ **Tags** (multi-select ou input chips)
- ✅ **Samples** (multi-select samples, avec quantity used)
- ✅ **Files** (upload multiple)

**Validation (Zod):**
```typescript
const experimentSchema = z.object({
  name: z.string().min(3).max(255),
  study_id: z.string().uuid(),
  protocol_id: z.string().uuid().optional(),
  status: z.enum(['configuring', 'pending', 'in_progress', 'completed']),
  content: z.any(), // TipTap JSON
  // ...
})
```

**Actions:**
- ✅ Save as Draft (status = 'configuring')
- ✅ Save & Start (status = 'in_progress')
- ✅ Cancel (navigate back)

**Composants:**
- `ExperimentForm`
- `RichTextEditor` (TipTap)
- `StudySelect` (hierarchical)
- `ProtocolSelect`
- `SampleMultiSelect`
- `FileUpload`

#### 5.1.4 Experiment Timeline (`/experiments/timeline`)

**Fonctionnalités:**
- ✅ Vue chronologique des expériences
- ✅ Axe temporel horizontal (dates)
- ✅ Filtres: Projects, Studies, Status, Date Range
- ✅ Regroupement par Study
- ✅ Click sur expérience → modal détail rapide
- ✅ Breadcrumb latéral (navigation facile)

**Composants:**
- `ExperimentTimeline`
- `TimelineItem`
- `TimelineFilters`
- `QuickViewModal`

#### 5.1.5 Sign Experiment (`/experiments/[id]/sign`)

**Workflow:**
1. Vérifier que status = 'completed'
2. Afficher récapitulatif complet (read-only)
3. Demander confirmation + optionnel commentaire
4. Update status → 'signed', signed_at, signed_by
5. Créer notification pour collaborateurs
6. Log activity

**Composants:**
- `SignExperimentDialog`
- Confirmation avec password ou 2FA (optionnel futur)

---

### 5.2 Module Protocols

#### 5.2.1 Protocol Browser (`/protocols`)

**Fonctionnalités:**
- ✅ Tabs: My Protocols, Group Protocols, Public Protocols
- ✅ Filtres:
  - Category (Antibiotics, Buffers, Enzymes, Media, Staining, Other)
  - Tags
  - Visibility
- ✅ Recherche full-text
- ✅ Tri par nom, date, popularité (nombre d'utilisations)
- ✅ Actions: View, Edit, Duplicate, Delete, Export

**Composants:**
- `ProtocolBrowser`
- `ProtocolCard`
- `CategoryFilter`
- `VisibilityToggle`

#### 5.2.2 Protocol Detail & Form

**Champs:**
- ✅ Name, Description
- ✅ Category (select)
- ✅ Visibility (personal, group, public)
- ✅ Content (TipTap editor)
  - Sections: Materials, Steps, Notes
- ✅ Estimated Duration (minutes)
- ✅ Difficulty (easy, medium, hard)
- ✅ Tags

**Relations:**
- ✅ Liste des expériences utilisant ce protocole (read-only)

**Composants:**
- `ProtocolForm`
- `ProtocolDetail`
- `UsedInExperiments` (liste)

---

### 5.3 Module Inventory

#### 5.3.1 Sample Browser (`/inventory/samples`)

**Fonctionnalités:**
- ✅ Panneau latéral: Arbre hiérarchique (ALL SAMPLES, STORAGE UNITS)
- ✅ Filtres:
  - Sample Type (antibody, cell_line, oligo, protein, rna, vector, chemical)
  - Status (available, in_use, depleted, expired)
  - Location (storage unit)
  - Expiration (expiring soon < 30 days)
- ✅ Recherche avancée:
  - Barcode scan
  - Supplier, Catalog number, Lot number
  - Custom fields (type-specific)
- ✅ Vue Grid ou List
- ✅ Actions: View, Edit, Use in Experiment, Move, Dispose

**Composants:**
- `SampleBrowser`
- `SampleCard`
- `StorageTree` (sidebar)
- `SampleTypeFilter`
- `BarcodeScanner`

#### 5.3.2 Sample Detail & Form

**Champs communs:**
- ✅ Name, Sample Type, Description
- ✅ Quantity, Unit, Concentration
- ✅ Storage Unit + Position
- ✅ Received Date, Expiration Date
- ✅ Supplier, Catalog Number, Lot Number, Barcode

**Champs type-specific (custom_fields JSONB):**

**Antibody:**
- Host (rabbit, mouse, goat, etc.)
- Clonality (monoclonal, polyclonal)
- Clone Number
- Target (protein name)
- Application (IHC, WB, IF, FC)
- Dilution

**Cell Line:**
- Organism
- Tissue/Origin
- Disease
- Growth Properties
- Culture Medium
- Passage Number

**Oligo:**
- Sequence (5' to 3')
- Length (bp)
- Tm (°C)
- Modification (biotin, fluorophore, etc.)
- Application (PCR, qPCR, sequencing)

**Protein:**
- Molecular Weight (kDa)
- Purity (%)
- Source (recombinant, purified)
- Tag (His, GST, FLAG, etc.)

**RNA:**
- Type (mRNA, siRNA, miRNA)
- Length (nt)
- Sequence

**Vector:**
- Vector Type (plasmid, viral)
- Insert
- Resistance
- Promoter

**Chemical/Reagent:**
- Molecular Formula
- CAS Number
- Purity
- Safety (hazard symbols)

**Validation:**
- Champs requis selon sample_type
- Validation format barcode
- Alerte expiration proche

**Composants:**
- `SampleForm`
- `SampleTypeSelect` (change form fields dynamically)
- `CustomFieldsForm` (dynamic based on type)
- `StorageLocationPicker`

#### 5.3.3 Storage Units (`/inventory/storage`)

**Fonctionnalités:**
- ✅ Arbre hiérarchique: Building > Room > Unit > Rack > Shelf
- ✅ Visualisation capacité (occupé/total)
- ✅ Température monitoring
- ✅ Liste samples par unit
- ✅ Actions: Add Unit, Edit, Move samples, Delete

**Composants:**
- `StorageTree`
- `StorageUnitCard`
- `CapacityIndicator`
- `SamplesByUnit`

#### 5.3.4 Equipment (`/inventory/equipment`)

**Fonctionnalités:**
- ✅ Liste équipements avec filtres (Type, Status, Location)
- ✅ Statut: Operational, Maintenance, Out of Service, Reserved
- ✅ Maintenance tracking:
  - Last maintenance, Next maintenance (colored alert if soon)
  - Maintenance interval
- ✅ Booking (si is_bookable = true):
  - Lien externe calendrier ou modal booking simple
- ✅ Actions: View, Edit, Log Maintenance, Delete

**Composants:**
- `EquipmentList`
- `EquipmentCard`
- `MaintenanceIndicator`
- `MaintenanceForm`

---

### 5.4 Module Files (`/files`)

**Fonctionnalités:**
- ✅ File browser avec arborescence de dossiers (folder_path)
- ✅ Vue List ou Grid (thumbnails si images)
- ✅ Upload multiple (drag & drop)
- ✅ Actions: Download, Rename, Move, Delete
- ✅ Recherche par nom, tags, mime_type
- ✅ Filtres: Type de fichier (PDF, Images, Excel, etc.), Date upload
- ✅ Lien vers entité (experiment, protocol, sample, etc.)

**Composants:**
- `FileBrowser`
- `FolderTree`
- `FileCard`
- `FileUpload` (drag & drop)
- `FilePreview` (images, PDF viewer)

---

### 5.5 Module Projects & Studies

**Adapté depuis Streamlit existant:**

**Projects (`/projects`):**
- ✅ Liste projets (cards ou table)
- ✅ Filtres: Statut (active, completed, archived)
- ✅ Création/édition projet
- ✅ Vue détail: KPIs, Studies, Recent experiments

**Studies (`/projects/[id]/studies/[studyId]`):**
- ✅ Liste studies sous un projet
- ✅ Création/édition study
- ✅ Vue détail: Experiments, Timeline

**Composants:**
- `ProjectCard`, `ProjectForm`, `ProjectDetail`
- `StudyList`, `StudyForm`, `StudyDetail`

---

### 5.6 Dashboard (`/`)

**KPIs:**
- ✅ Total Experiments (all time)
- ✅ Active Experiments (in_progress)
- ✅ Signed Experiments (last 30 days)
- ✅ Samples Expiring Soon (< 30 days)
- ✅ Equipment Needing Maintenance (next 7 days)
- ✅ Active Projects, Studies

**Widgets:**
- ✅ Recent Experiments (last 10)
- ✅ Activity Feed (activity_log last 20)
- ✅ Notifications (unread)
- ✅ Graphiques:
  - Experiments created per month (bar chart)
  - Experiments by status (pie chart)
  - Samples by type (bar chart)

**Composants:**
- `KpiCard`
- `RecentExperiments`
- `ActivityFeed`
- `StatsChart` (Recharts)

---

### 5.7 Recherche Globale (Cmd+K)

**Fonctionnalités:**
- ✅ Command Palette (cmdk)
- ✅ Recherche omnibar: Experiments, Protocols, Samples, Projects, Studies, Files
- ✅ Keyboard navigation (↑↓ Enter Esc)
- ✅ Raccourcis clavier:
  - Cmd+K : Ouvrir recherche
  - Cmd+P : Projects
  - Cmd+E : Experiments
  - Cmd+Shift+N : New Experiment

**Composants:**
- `CommandPalette` (cmdk)
- `SearchResults` (grouped by entity type)

---

### 5.8 Notifications (`/notifications`)

**Fonctionnalités:**
- ✅ Dropdown dans header (icône cloche + badge count)
- ✅ Liste notifications non-lues
- ✅ Types:
  - experiment_signed
  - sample_expiring
  - equipment_maintenance
  - experiment_assigned
  - comment_added
- ✅ Mark as read
- ✅ Mark all as read
- ✅ Page dédiée: `/notifications` (toutes les notifications)

**Composants:**
- `NotificationsDropdown`
- `NotificationItem`
- `NotificationsList` (page complète)

---

### 5.9 Settings (`/settings`)

**Sections:**

**Profile (`/settings/profile`):**
- ✅ Avatar, Name, Email
- ✅ Change password
- ✅ Preferences (language, timezone)

**Users (`/settings/users`)** - Admin only:
- ✅ Liste utilisateurs
- ✅ Gérer rôles (admin, researcher, viewer)
- ✅ Inviter utilisateurs

**Organization (`/settings/organization`)** - Admin only:
- ✅ Nom organisation
- ✅ Logo
- ✅ Paramètres globaux

**Composants:**
- `ProfileSettings`
- `UserManagement`
- `OrganizationSettings`

---

## 6. DESIGN SYSTEM

### 6.1 Couleurs

**Palette principale (eLabJournal inspired):**

```css
/* Teal (Primary) */
--primary-50: #f0fdfa;
--primary-100: #ccfbf1;
--primary-500: #14b8a6; /* Main */
--primary-600: #0d9488;
--primary-700: #0f766e;

/* Orange (Accent) */
--accent-500: #f97316;
--accent-600: #ea580c;

/* Neutral */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-500: #6b7280;
--gray-700: #374151;
--gray-900: #111827;
```

**Statuts expériences:**
```css
--status-configuring: #94a3b8; /* Slate */
--status-pending: #fbbf24; /* Amber */
--status-in-progress: #3b82f6; /* Blue */
--status-completed: #10b981; /* Green */
--status-signed: #8b5cf6; /* Purple */
```

**Statuts samples:**
```css
--sample-available: #10b981; /* Green */
--sample-in-use: #3b82f6; /* Blue */
--sample-depleted: #ef4444; /* Red */
--sample-expired: #ef4444; /* Red */
```

### 6.2 Typographie

```css
/* Font Family */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

### 6.3 Spacing

```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

### 6.4 Composants Shadcn/ui

**À installer:**
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add table
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add command
npx shadcn-ui@latest add popover
npx shadcn-ui@latest add separator
```

### 6.5 États Vides

**Pattern:**
```tsx
<EmptyState
  icon={<BeakerIcon className="w-12 h-12" />}
  title="No experiments yet"
  description="Get started by creating your first experiment"
  action={
    <Button onClick={createExperiment}>
      <PlusIcon /> New Experiment
    </Button>
  }
/>
```

---

## 7. PROMPTS SÉQUENTIELS POUR CLAUDE CODE

### 🎯 WORKFLOW D'IMPLÉMENTATION

**Principe:** Implémenter par modules séquentiels, chacun testable indépendamment.

---

### PROMPT 1 : Setup Initial & Configuration

```markdown
# CONTEXTE
Je migre mon dashboard Streamlit Nikaia vers Next.js 14. Voici les specs complètes (partager ce document).

# TÂCHE
Créer la structure Next.js complète avec configuration de base.

# LIVRABLES
1. Initialiser projet Next.js 14 (App Router)
2. Installer toutes les dépendances (voir package.json dans specs)
3. Configurer Tailwind CSS + Shadcn/ui
4. Créer fichiers de configuration:
   - tailwind.config.ts
   - .env.example
   - .eslintrc.json
   - .prettierrc
   - tsconfig.json
5. Créer app/layout.tsx et app/globals.css (design system)
6. Configurer Supabase client (lib/supabase/client.ts et server.ts)
7. Créer types de base (lib/types/database.types.ts - générer depuis Supabase)

# VALIDATION
- ✅ `npm run dev` fonctionne
- ✅ Page d'accueil affiche "Nikaia ELN"
- ✅ Tailwind CSS appliqué
- ✅ Connexion Supabase OK (tester avec console.log)
```

---

### PROMPT 2 : Authentication & Layout

```markdown
# CONTEXTE
Setup initial terminé. Maintenant implémenter authentification et layout principal.

# TÂCHE
1. Créer système d'authentification complet
2. Créer layout principal avec Header + Sidebar

# LIVRABLES

## Authentication
- app/(auth)/login/page.tsx
- app/(auth)/register/page.tsx
- app/(auth)/layout.tsx (centré, sans sidebar)
- lib/stores/auth-store.ts (Zustand)
- lib/hooks/use-auth.ts
- middleware.ts (protection routes)

## Layout Principal
- app/(dashboard)/layout.tsx (Header + Sidebar)
- components/layout/header.tsx
  - Logo, User menu, Notifications dropdown
- components/layout/sidebar.tsx
  - Navigation: Dashboard, Projects, Experiments, Protocols, Inventory, Files, Settings
  - Icônes Lucide React
  - Active state
- components/layout/breadcrumb.tsx
- components/layout/user-menu.tsx
- components/layout/notifications-dropdown.tsx

# FONCTIONNALITÉS
- Login/Register avec Supabase Auth
- Protected routes (middleware redirect si non-auth)
- Sidebar collapsible (state dans Zustand)
- User menu: Profile, Settings, Logout
- Notifications: Fetch depuis table notifications, mark as read

# VALIDATION
- ✅ Login/Register fonctionnels
- ✅ Redirection automatique si non-auth
- ✅ Sidebar navigation opérationnelle
- ✅ User menu affiche info utilisateur
- ✅ Notifications dropdown affiche count
```

---

### PROMPT 3 : Dashboard & KPIs

```markdown
# CONTEXTE
Auth et layout OK. Créer page d'accueil (Dashboard) avec KPIs.

# TÂCHE
Implémenter dashboard avec statistiques et widgets.

# LIVRABLES

## Page Dashboard
- app/(dashboard)/page.tsx

## Composants
- components/dashboard/kpi-card.tsx
  - Props: title, value, icon, trend, color
- components/dashboard/recent-experiments.tsx
  - Liste 10 dernières expériences avec statut
- components/dashboard/activity-feed.tsx
  - Feed depuis activity_log (20 derniers)
- components/dashboard/stats-chart.tsx
  - Recharts: Experiments par mois (bar chart)

## Data Fetching
- lib/hooks/use-dashboard.ts
  - useKpis() → Fetch KPIs depuis Supabase
  - useRecentExperiments()
  - useActivityLog()

## KPIs à afficher
1. Total Experiments (count all)
2. Active Experiments (status = 'in_progress')
3. Signed Experiments (last 30 days)
4. Samples Expiring Soon (< 30 days)
5. Active Projects
6. Equipment Maintenance Due (next 7 days)

# VALIDATION
- ✅ Dashboard affiche 6 KPI cards
- ✅ Recent experiments liste fonctionnelle
- ✅ Activity feed affiche logs
- ✅ Chart affiche données (même si données test)
- ✅ Responsive design (grid adaptatif)
```

---

### PROMPT 4 : Module Projects & Studies

```markdown
# CONTEXTE
Dashboard OK. Migrer module Projects depuis Streamlit.

# TÂCHE
Implémenter CRUD complet Projects + Studies (anciennement subprojects).

# LIVRABLES

## Pages
- app/(dashboard)/projects/page.tsx (liste)
- app/(dashboard)/projects/new/page.tsx
- app/(dashboard)/projects/[id]/page.tsx (détail)
- app/(dashboard)/projects/[id]/edit/page.tsx
- app/(dashboard)/projects/[id]/studies/new/page.tsx
- app/(dashboard)/projects/[id]/studies/[studyId]/page.tsx

## Composants
- components/projects/project-card.tsx
- components/projects/project-form.tsx (création/édition)
- components/projects/project-detail.tsx
- components/projects/study-list.tsx
- components/projects/study-form.tsx

## Data Hooks
- lib/hooks/use-projects.ts
  - useProjects({ status, page, limit })
  - useProject(id)
  - useCreateProject()
  - useUpdateProject()
  - useDeleteProject()
- lib/hooks/use-studies.ts
  - useStudies({ projectId })
  - useStudy(id)
  - useCreateStudy()
  - useUpdateStudy()
  - useDeleteStudy()

## Fonctionnalités
- Liste projets: filtres (active, completed, archived), recherche
- Création projet: name, description, status, dates
- Détail projet: KPIs, liste studies, bouton "New Study"
- CRUD Studies similaire (sous un projet)

# VALIDATION
- ✅ CRUD Projects complet fonctionnel
- ✅ CRUD Studies complet fonctionnel
- ✅ Hiérarchie Project → Studies affichée
- ✅ Breadcrumb navigation fonctionnel
- ✅ Filtres et recherche opérationnels
```

---

### PROMPT 5 : Module Experiments (CORE - Partie 1)

```markdown
# CONTEXTE
Projects/Studies OK. Créer module Experiments (cœur de l'ELN).

# TÂCHE PARTIE 1
Implémenter Experiment Browser et formulaire création/édition.

# LIVRABLES

## Pages
- app/(dashboard)/experiments/page.tsx (browser)
- app/(dashboard)/experiments/new/page.tsx
- app/(dashboard)/experiments/[id]/page.tsx (détail)
- app/(dashboard)/experiments/[id]/edit/page.tsx

## Composants
- components/experiments/experiment-browser.tsx
- components/experiments/experiment-card.tsx
- components/experiments/experiment-table.tsx (vue liste)
- components/experiments/experiment-form.tsx
- components/experiments/status-badge.tsx
- components/experiments/status-select.tsx
- components/experiments/filters/
  - status-filter.tsx
  - date-filter.tsx
  - project-filter.tsx

## Rich Text Editor
- components/experiments/rich-text-editor.tsx
  - TipTap integration
  - Toolbar: Bold, Italic, Underline, Headings, Lists, Link, Code
  - Placeholder
  - Read-only mode toggle

## Data Hooks
- lib/hooks/use-experiments.ts
  - useExperiments({ status, studyId, dateRange, page, limit })
  - useExperiment(id)
  - useCreateExperiment()
  - useUpdateExperiment()
  - useDeleteExperiment()

## Fonctionnalités Experiment Form
Champs:
- Name (required)
- Study (select hierarchical: Project > Study)
- Protocol (select, optional)
- Status (select: configuring, pending, in_progress, completed)
- Description (textarea)
- Content (TipTap editor)
- Tags (array input)

Validation: Zod schema (lib/utils/validators.ts)

Actions:
- Save as Draft (status = 'configuring')
- Save & Start (status = 'in_progress')
- Cancel

## Experiment Browser
- Toggle vue: Grid (cards) / List (table)
- Filtres: Statut, Project/Study, Date range, Créateur
- Recherche full-text
- Pagination (20/page)
- Bouton "New Experiment"

# VALIDATION
- ✅ Experiment Browser affiche liste
- ✅ Filtres fonctionnels
- ✅ Toggle Grid/List fonctionne
- ✅ Formulaire création fonctionne
- ✅ TipTap editor fonctionnel (write & read)
- ✅ Sauvegarde dans Supabase OK
- ✅ Validation Zod appliquée
```

---

### PROMPT 6 : Module Experiments (CORE - Partie 2)

```markdown
# CONTEXTE
Experiment CRUD de base OK. Ajouter fonctionnalités avancées.

# TÂCHE PARTIE 2
Implémenter Timeline, Sign, Tabs détail, Files attachments.

# LIVRABLES

## Timeline
- app/(dashboard)/experiments/timeline/page.tsx
- components/experiments/experiment-timeline.tsx
- components/experiments/timeline-item.tsx
- components/experiments/timeline-filters.tsx

Fonctionnalités:
- Axe temporel horizontal (dates)
- Regroupement par Study
- Filtres: Projects, Studies, Status, Date Range
- Click → Modal quick view

## Sign Experiment
- app/(dashboard)/experiments/[id]/sign/page.tsx
- components/experiments/sign-experiment-dialog.tsx

Workflow:
1. Vérifier status = 'completed'
2. Afficher récap complet (read-only)
3. Confirmation + commentaire optionnel
4. Update: status = 'signed', signed_at, signed_by
5. Log activity
6. Notification collaborateurs

## Experiment Detail - Tabs
Modifier app/(dashboard)/experiments/[id]/page.tsx:

Tabs (Radix UI):
- **Overview**: Content rich-text (read-only)
- **Protocol**: Display linked protocol (si existe)
- **Samples**: Liste samples utilisés (table)
- **Files**: Fichiers attachés (liste + upload)
- **Activity**: Activity log (historique)

Composants:
- components/experiments/experiment-detail.tsx
- components/experiments/experiment-header.tsx
- components/experiments/sample-list.tsx
- components/experiments/file-list.tsx
- components/experiments/activity-log.tsx

## Files Attachments
- components/shared/file-upload.tsx
  - Drag & drop
  - Multiple files
  - Upload vers Supabase Storage
  - Insert record dans table `files`
- Relation many-to-many via `experiment_files` (implicite via entity_type/entity_id)

# VALIDATION
- ✅ Timeline affiche expériences chronologiquement
- ✅ Sign experiment fonctionne (status → signed)
- ✅ Tabs détail fonctionnels
- ✅ Upload fichiers fonctionne
- ✅ Files affichés dans tab Files
- ✅ Activity log affiche historique
```

---

### PROMPT 7 : Module Protocols

```markdown
# CONTEXTE
Experiments OK. Créer module Protocols.

# TÂCHE
Implémenter CRUD complet Protocols.

# LIVRABLES

## Pages
- app/(dashboard)/protocols/page.tsx (browser)
- app/(dashboard)/protocols/new/page.tsx
- app/(dashboard)/protocols/[id]/page.tsx (détail)
- app/(dashboard)/protocols/[id]/edit/page.tsx

## Composants
- components/protocols/protocol-browser.tsx
- components/protocols/protocol-card.tsx
- components/protocols/protocol-form.tsx
- components/protocols/protocol-detail.tsx
- components/protocols/category-select.tsx
- components/protocols/visibility-toggle.tsx
- components/protocols/used-in-experiments.tsx (liste expériences utilisant ce protocole)

## Data Hooks
- lib/hooks/use-protocols.ts
  - useProtocols({ category, visibility, tags })
  - useProtocol(id)
  - useCreateProtocol()
  - useUpdateProtocol()
  - useDeleteProtocol()

## Fonctionnalités Protocol Browser
- Tabs: My Protocols, Group Protocols, Public Protocols
- Filtres: Category (select), Tags (multi-select)
- Recherche full-text
- Actions: View, Edit, Duplicate, Delete, Export PDF

## Protocol Form
Champs:
- Name, Description
- Category (select: Antibiotics, Buffers, Enzymes, Media, Staining, Other)
- Visibility (radio: personal, group, public)
- Content (TipTap editor - sections: Materials, Steps, Notes)
- Estimated Duration (number input, minutes)
- Difficulty (select: easy, medium, hard)
- Tags (array input)

## Protocol Detail
- Afficher contenu (read-only)
- Liste expériences utilisant ce protocole (composant UsedInExperiments)
- Actions toolbar: Edit, Duplicate, Delete, Export PDF

# VALIDATION
- ✅ Protocol Browser affiche liste avec tabs
- ✅ Filtres category/tags fonctionnels
- ✅ CRUD Protocols complet
- ✅ TipTap editor pour contenu
- ✅ Liste "Used in Experiments" affichée
- ✅ Lien Experiment → Protocol fonctionne (affichage dans experiment detail)
```

---

### PROMPT 8 : Module Inventory - Samples

```markdown
# CONTEXTE
Protocols OK. Créer module Inventory - Samples (core inventory).

# TÂCHE
Implémenter CRUD Samples avec types et custom fields.

# LIVRABLES

## Pages
- app/(dashboard)/inventory/page.tsx (home inventory)
- app/(dashboard)/inventory/samples/page.tsx (browser)
- app/(dashboard)/inventory/samples/new/page.tsx
- app/(dashboard)/inventory/samples/[id]/page.tsx (détail)
- app/(dashboard)/inventory/samples/[id]/edit/page.tsx

## Composants
- components/inventory/sample-browser.tsx
- components/inventory/sample-card.tsx
- components/inventory/sample-form.tsx
- components/inventory/sample-detail.tsx
- components/inventory/sample-type-select.tsx
- components/inventory/custom-fields-form.tsx (dynamic based on type)
- components/inventory/storage-location-picker.tsx
- components/inventory/barcode-scanner.tsx (optionnel futur)

## Data Hooks
- lib/hooks/use-samples.ts
  - useSamples({ sampleType, status, storageUnitId })
  - useSample(id)
  - useCreateSample()
  - useUpdateSample()
  - useDeleteSample()

## Fonctionnalités Sample Browser
- Panneau latéral: Arbre hiérarchique (ALL SAMPLES, par type)
- Filtres:
  - Sample Type (multi-select)
  - Status (available, in_use, depleted, expired)
  - Location (storage unit select)
  - Expiring Soon (checkbox < 30 days)
- Recherche: Barcode, Supplier, Catalog number, Name
- Vue Grid ou List
- Actions: View, Edit, Use in Experiment, Move, Dispose

## Sample Form - Champs Communs
- Name, Sample Type (select), Description
- Quantity, Unit, Concentration, Concentration Unit
- Storage Unit (select hierarchical), Position (text)
- Received Date, Expiration Date
- Supplier, Catalog Number, Lot Number, Barcode

## Sample Form - Custom Fields (JSONB)
Affichage dynamique selon `sample_type`:

**Antibody:**
- Host, Clonality, Clone Number, Target, Application, Dilution

**Cell Line:**
- Organism, Tissue, Disease, Growth Properties, Culture Medium, Passage Number

**Oligo:**
- Sequence, Length (bp), Tm, Modification, Application

**Protein:**
- Molecular Weight, Purity, Source, Tag

**RNA:**
- Type (mRNA, siRNA, miRNA), Length (nt), Sequence

**Vector:**
- Vector Type, Insert, Resistance, Promoter

**Chemical/Reagent:**
- Molecular Formula, CAS Number, Purity, Safety

Implémentation:
- Composant `CustomFieldsForm` affiche champs selon `sample_type`
- Sauvegarde dans `custom_fields` JSONB

## Validation
- Zod schema avec champs requis selon type
- Validation format barcode (unique)
- Alerte si expiration < 30 days

# VALIDATION
- ✅ Sample Browser affiche liste
- ✅ Filtres type/status fonctionnels
- ✅ CRUD Samples complet
- ✅ Custom fields affichés dynamiquement selon type
- ✅ Storage location picker fonctionne
- ✅ Validation Zod appliquée
- ✅ Alert expiration affichée
```

---

### PROMPT 9 : Module Inventory - Storage & Equipment

```markdown
# CONTEXTE
Samples OK. Ajouter Storage Units et Equipment.

# TÂCHE
Implémenter CRUD Storage Units et Equipment.

# LIVRABLES

## Storage Units

### Pages
- app/(dashboard)/inventory/storage/page.tsx
- app/(dashboard)/inventory/storage/[id]/page.tsx (détail)

### Composants
- components/inventory/storage-tree.tsx (arbre hiérarchique)
- components/inventory/storage-unit-card.tsx
- components/inventory/capacity-indicator.tsx
- components/inventory/samples-by-unit.tsx

### Data Hooks
- lib/hooks/use-storage-units.ts
  - useStorageUnits({ unitType, parentUnitId })
  - useStorageUnit(id)
  - useCreateStorageUnit()
  - useUpdateStorageUnit()
  - useDeleteStorageUnit()

### Fonctionnalités
- Arbre hiérarchique: Building > Room > Unit > Rack > Shelf
- Création units avec parent (hierarchical select)
- Affichage capacité (samples count / capacity)
- Liste samples dans unit
- Actions: Add Unit, Edit, Move Samples, Delete

## Equipment

### Pages
- app/(dashboard)/inventory/equipment/page.tsx
- app/(dashboard)/inventory/equipment/[id]/page.tsx (détail)

### Composants
- components/inventory/equipment-list.tsx
- components/inventory/equipment-card.tsx
- components/inventory/maintenance-indicator.tsx
- components/inventory/maintenance-form.tsx

### Data Hooks
- lib/hooks/use-equipment.ts
  - useEquipment({ equipmentType, status })
  - useEquipmentItem(id)
  - useCreateEquipment()
  - useUpdateEquipment()
  - useDeleteEquipment()

### Fonctionnalités
- Liste équipements avec filtres (Type, Status, Location)
- Statut: Operational, Maintenance, Out of Service, Reserved
- Maintenance tracking:
  - Last/Next maintenance dates
  - Alert si maintenance due (< 7 days)
  - Modal "Log Maintenance" (update dates)
- Booking (si is_bookable):
  - Lien externe calendrier ou simple toggle reserved
- Actions: View, Edit, Log Maintenance, Delete

# VALIDATION
- ✅ Storage tree affiche hiérarchie
- ✅ CRUD Storage Units complet
- ✅ Capacity indicator fonctionne
- ✅ Equipment list affiche liste
- ✅ CRUD Equipment complet
- ✅ Maintenance indicator alerte si due
- ✅ Log maintenance update dates
```

---

### PROMPT 10 : Module Files

```markdown
# CONTEXTE
Inventory OK. Créer module Files standalone.

# TÂCHE
Implémenter File Browser complet avec arborescence.

# LIVRABLES

## Pages
- app/(dashboard)/files/page.tsx

## Composants
- components/files/file-browser.tsx
- components/files/folder-tree.tsx (sidebar)
- components/files/file-card.tsx
- components/files/file-upload.tsx (drag & drop)
- components/files/file-preview.tsx (images, PDF viewer)

## Data Hooks
- lib/hooks/use-files.ts
  - useFiles({ folderPath, entityType, entityId, tags })
  - useFile(id)
  - useUploadFile()
  - useDeleteFile()
  - useRenameFile()
  - useMoveFile()

## Fonctionnalités
- Arborescence dossiers (folder_path) avec création dossiers
- Upload multiple (drag & drop)
  - Upload vers Supabase Storage
  - Insert record dans `files`
- Vue List ou Grid (toggle)
  - Grid: Thumbnails si images/PDF
  - List: Table avec colonnes (name, size, type, uploaded_by, date)
- Recherche: Nom, Tags, Mime Type
- Filtres: Type fichier (Images, PDF, Excel, etc.), Date upload
- Actions: Download, Rename, Move, Delete
- Preview: Modal pour images, iframe PDF

## Supabase Storage
- Bucket: `eln-files`
- Path structure: `/{entity_type}/{entity_id}/{filename}`
- Public ou private selon configuration

# VALIDATION
- ✅ File browser affiche arborescence
- ✅ Upload drag & drop fonctionne
- ✅ Files sauvegardés dans Supabase Storage + table files
- ✅ Toggle Grid/List fonctionne
- ✅ Preview images/PDF fonctionne
- ✅ Actions Rename/Move/Delete fonctionnent
- ✅ Filtres et recherche opérationnels
```

---

### PROMPT 11 : Recherche Globale (Cmd+K)

```markdown
# CONTEXTE
Tous modules OK. Ajouter recherche globale omnibar.

# TÂCHE
Implémenter Command Palette (Cmd+K) avec recherche multi-entités.

# LIVRABLES

## Composants
- components/layout/command-palette.tsx (cmdk)
- components/layout/search-results.tsx

## Data Hooks
- lib/hooks/use-global-search.ts
  - useGlobalSearch(query)
  - Recherche dans: experiments, protocols, samples, projects, studies, files

## API Route
- app/api/search/route.ts
  - POST /api/search
  - Body: { query: string }
  - Response: { experiments: [], protocols: [], samples: [], projects: [], studies: [], files: [] }

Implémentation:
- Full-text search sur colonnes name, description, content
- Utiliser `to_tsvector` PostgreSQL (optionnel) ou `ILIKE` simple
- Limiter 5 résultats par entité

## Fonctionnalités Command Palette
- Raccourci: Cmd+K (Mac) / Ctrl+K (Win)
- Input recherche avec debounce (300ms)
- Résultats groupés par type:
  - Experiments (icône BeakerIcon)
  - Protocols (icône DocumentIcon)
  - Samples (icône CubeIcon)
  - Projects (icône FolderIcon)
  - Files (icône DocumentTextIcon)
- Keyboard navigation (↑↓ Enter Esc)
- Click résultat → Navigate to detail page

## Raccourcis supplémentaires (optionnel)
- Cmd+P: Quick navigate Projects
- Cmd+E: Quick navigate Experiments
- Cmd+Shift+N: New Experiment

# VALIDATION
- ✅ Cmd+K ouvre palette
- ✅ Recherche fonctionne avec debounce
- ✅ Résultats affichés groupés par type
- ✅ Keyboard navigation fonctionne
- ✅ Click résultat navigate vers détail
- ✅ Esc ferme palette
```

---

### PROMPT 12 : Notifications

```markdown
# CONTEXTE
Recherche OK. Implémenter système notifications complet.

# TÂCHE
Créer système notifications avec dropdown et page dédiée.

# LIVRABLES

## Composants
- components/layout/notifications-dropdown.tsx
  - Dropdown dans header (icône cloche + badge count)
  - Liste 5 dernières notifications non-lues
  - Bouton "Mark all as read"
  - Lien "View all" → /notifications
- components/notifications/notification-item.tsx
- components/notifications/notifications-list.tsx (page complète)

## Pages
- app/(dashboard)/notifications/page.tsx
  - Liste toutes notifications (read + unread)
  - Filtres: Type, Read/Unread, Date range
  - Actions: Mark as read, Delete

## Data Hooks
- lib/hooks/use-notifications.ts
  - useNotifications({ isRead, type, limit })
  - useNotificationCount() (unread count)
  - useMarkAsRead(id)
  - useMarkAllAsRead()
  - useDeleteNotification(id)

## Types de Notifications
- experiment_signed
- sample_expiring
- equipment_maintenance
- experiment_assigned
- comment_added (futur)

## Fonctionnalités
- Polling notifications (React Query refetchInterval: 30s)
- Badge count dans header (unread)
- Click notification → Navigate to entity + mark as read
- Real-time avec Supabase Realtime (optionnel futur)

## Triggers (Supabase Functions)
Créer notifications automatiques:
- Sample expiring (via cron job quotidien)
- Equipment maintenance due (via cron job quotidien)
- Experiment signed (via trigger après update status)

# VALIDATION
- ✅ Notifications dropdown affiche liste
- ✅ Badge count affiche nombre unread
- ✅ Mark as read fonctionne
- ✅ Mark all as read fonctionne
- ✅ Page /notifications affiche toutes
- ✅ Filtres fonctionnels
- ✅ Click notification navigate + mark as read
```

---

### PROMPT 13 : Settings & User Management

```markdown
# CONTEXTE
Notifications OK. Créer section Settings.

# TÂCHE
Implémenter pages Settings (Profile, Users, Organization).

# LIVRABLES

## Pages
- app/(dashboard)/settings/page.tsx (redirect vers profile)
- app/(dashboard)/settings/profile/page.tsx
- app/(dashboard)/settings/users/page.tsx (admin only)
- app/(dashboard)/settings/organization/page.tsx (admin only)

## Composants
- components/settings/profile-settings.tsx
- components/settings/user-management.tsx
- components/settings/organization-settings.tsx
- components/settings/change-password-dialog.tsx
- components/settings/invite-user-dialog.tsx

## Profile Settings
Champs:
- Avatar (upload image)
- Name, Email (read-only)
- Change Password (modal)
- Preferences:
  - Language (select: en, fr)
  - Timezone (select)
  - Email notifications (toggle)

## User Management (Admin only)
- Liste utilisateurs (table)
- Colonnes: Avatar, Name, Email, Role, Status, Created
- Actions:
  - Edit role (dropdown: admin, researcher, viewer)
  - Deactivate/Activate user
  - Delete user
- Bouton "Invite User" (dialog):
  - Email, Role
  - Send invitation email (Supabase Auth)

## Organization Settings (Admin only)
Champs:
- Organization Name
- Logo (upload)
- Settings globaux:
  - Require experiment signature (toggle)
  - Default experiment template (select)
  - Maintenance reminder days (number input)

## Data Hooks
- lib/hooks/use-users.ts (admin)
  - useUsers()
  - useUpdateUserRole(userId, role)
  - useInviteUser()
  - useDeleteUser()
- lib/hooks/use-organization.ts
  - useOrganization()
  - useUpdateOrganization()

## Permissions
- Middleware check: Admin only pour /settings/users et /settings/organization
- Profile accessible à tous

# VALIDATION
- ✅ Profile settings affiche infos user
- ✅ Change password fonctionne
- ✅ Avatar upload fonctionne
- ✅ User management liste users (admin only)
- ✅ Edit role fonctionne
- ✅ Invite user envoie email
- ✅ Organization settings affiche config
- ✅ Update organization fonctionne
- ✅ Middleware protège routes admin
```

---

### PROMPT 14 : Templates d'Expériences

```markdown
# CONTEXTE
Settings OK. Ajouter Templates d'expériences (optionnel mais utile).

# TÂCHE
Implémenter CRUD Templates d'expériences.

# LIVRABLES

## Pages
- app/(dashboard)/templates/page.tsx
- app/(dashboard)/templates/new/page.tsx
- app/(dashboard)/templates/[id]/page.tsx

## Composants
- components/templates/template-browser.tsx
- components/templates/template-card.tsx
- components/templates/template-form.tsx

## Data Hooks
- lib/hooks/use-templates.ts
  - useTemplates({ category })
  - useTemplate(id)
  - useCreateTemplate()
  - useUpdateTemplate()
  - useDeleteTemplate()

## Fonctionnalités
- Template Browser: Liste templates avec filtres category
- Template Form:
  - Name, Description, Category
  - Content (TipTap editor - structure pré-remplie)
- Création template depuis expérience existante:
  - Bouton "Save as Template" dans experiment detail
  - Copie content, metadata
- Application template → nouvelle expérience:
  - Sélecteur template dans experiment form
  - Pre-fill content avec template content

# VALIDATION
- ✅ Template Browser affiche liste
- ✅ CRUD Templates complet
- ✅ "Save as Template" depuis experiment fonctionne
- ✅ Application template dans experiment form pré-remplit content
```

---

### PROMPT 15 : Activity Log & Audit Trail

```markdown
# CONTEXTE
Templates OK. Finaliser système Activity Log complet.

# TÂCHE
Assurer logging complet de toutes actions + affichage.

# LIVRABLES

## Composants
- components/experiments/activity-log.tsx (déjà créé, améliorer)
- components/shared/activity-item.tsx

## Data Hooks
- lib/hooks/use-activity-log.ts
  - useActivityLog({ entityType, entityId, userId, action, limit })
  - Format results: user, action, entity, timestamp, changes

## Fonctionnalités
- Affichage activity log:
  - Dans experiment detail (tab Activity)
  - Dans dashboard (widget Activity Feed)
  - Page dédiée (optionnel): /activity
- Format:
  - "User X created Experiment Y" (timestamp)
  - "User X updated Sample Y: quantity changed from 100 to 80" (détail changes)
  - "User X signed Experiment Y" (timestamp)

## Triggers
Vérifier que triggers log_activity sont actifs sur toutes tables principales:
- experiments
- protocols
- samples
- projects
- studies
- storage_units
- equipment

## Permissions
- Admin voit tout activity log
- Users voient seulement leurs actions + actions sur entités accessibles

# VALIDATION
- ✅ Activity log affiché dans experiment detail
- ✅ Activity feed dashboard affiche 20 derniers
- ✅ Format lisible avec détails changes
- ✅ Permissions respectées (admin vs user)
- ✅ Triggers actifs sur toutes tables
```

---

### PROMPT 16 : Polissage & Optimisation

```markdown
# CONTEXTE
Toutes fonctionnalités implémentées. Phase polissage final.

# TÂCHE
Optimisation, error handling, loading states, responsive.

# LIVRABLES

## Error Handling
- Créer components/shared/error-boundary.tsx
- Implémenter error.tsx dans app routes
- Toast notifications pour erreurs (react-hot-toast)
- Validation errors affichés clairement (formulaires)

## Loading States
- Créer components/shared/loading-spinner.tsx
- Loading skeletons pour listes (Shadcn/ui Skeleton)
- Suspense boundaries

## Empty States
- components/shared/empty-state.tsx
- États vides descriptifs pour:
  - No experiments
  - No protocols
  - No samples
  - No files
  - Avec CTA (bouton création)

## Responsive Design
- Vérifier responsive sur toutes pages:
  - Mobile (< 768px): Sidebar collapsible, stacked layout
  - Tablet (768-1024px): Adaptations grids
  - Desktop (> 1024px): Full layout
- Tester navigation mobile (hamburger menu)

## Performance
- React Query cache optimizations (staleTime, cacheTime)
- Image optimization (next/image)
- Code splitting (dynamic imports)
- Lazy loading listes (virtual scroll pour grandes listes - optionnel)

## Accessibilité
- Aria labels sur boutons/icônes
- Focus states visibles
- Keyboard navigation fonctionnelle (Tab, Enter, Esc)
- Contrast ratios respectés (WCAG AA)

## Documentation
- README.md complet:
  - Installation
  - Configuration Supabase
  - Run locally
  - Deploy Vercel
  - Scripts SQL
  - Architecture overview

# VALIDATION
- ✅ Error boundaries capturent erreurs
- ✅ Loading states affichés partout
- ✅ Empty states descriptifs
- ✅ Responsive sur mobile/tablet/desktop
- ✅ Performance optimisée (Lighthouse > 90)
- ✅ Accessibilité respectée (a11y)
- ✅ README complet
```

---

### PROMPT 17 : Tests & Déploiement

```markdown
# CONTEXTE
App complète et polie. Phase tests et déploiement.

# TÂCHE
Tests basiques et déploiement sur Vercel.

# LIVRABLES

## Tests (Optionnel - Basiques)
- Configurer Vitest
- Tests unitaires pour:
  - Utilities (lib/utils/format.ts, validators.ts)
  - Hooks custom (use-experiments, use-protocols)
- Tests intégration pour:
  - Login flow
  - Experiment CRUD flow

## Déploiement Vercel
- Connecter repo GitHub
- Configurer variables d'environnement (Vercel Dashboard):
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY
- Déployer sur Vercel
- Configurer domaine custom (optionnel)

## Scripts Supabase
- Vérifier que tous scripts SQL (01-06) ont été exécutés
- Configurer RLS policies actives
- Configurer Supabase Storage bucket `eln-files` (public/private selon besoin)

## Seed Data (Optionnel)
- Script 06_sample_data.sql pour données de test
- Créer utilisateurs de test (admin, researcher, viewer)

## Documentation Déploiement
- Guide step-by-step dans README.md:
  1. Clone repo
  2. Install dependencies
  3. Setup Supabase (create project, run SQL scripts)
  4. Configure .env.local
  5. Run locally
  6. Deploy to Vercel

# VALIDATION
- ✅ Tests basiques passent (si implémentés)
- ✅ App déployée sur Vercel
- ✅ Variables env configurées
- ✅ App fonctionne en production
- ✅ Supabase RLS actif
- ✅ Storage bucket configuré
- ✅ README complet avec guide déploiement
```

---

## 8. CHECKLIST DE VALIDATION

### ✅ Phase 1 : Setup & Infrastructure

- [ ] Projet Next.js 14 initialisé (App Router)
- [ ] Tailwind CSS + Shadcn/ui configurés
- [ ] Supabase client/server configurés
- [ ] Types générés depuis Supabase
- [ ] Scripts SQL exécutés (01-06)
- [ ] RLS policies actives
- [ ] Storage bucket créé

### ✅ Phase 2 : Authentication & Layout

- [ ] Login/Register fonctionnels
- [ ] Middleware auth protège routes
- [ ] Header avec user menu, notifications
- [ ] Sidebar navigation opérationnelle
- [ ] Breadcrumbs fonctionnels

### ✅ Phase 3 : Dashboard

- [ ] 6 KPI cards affichées
- [ ] Recent experiments widget
- [ ] Activity feed widget
- [ ] Charts (Recharts) affichés

### ✅ Phase 4 : Projects & Studies

- [ ] CRUD Projects complet
- [ ] CRUD Studies complet
- [ ] Hiérarchie Project > Studies affichée
- [ ] Filtres et recherche fonctionnels

### ✅ Phase 5 : Experiments (Core)

- [ ] Experiment Browser avec filtres
- [ ] Toggle Grid/List fonctionne
- [ ] CRUD Experiments complet
- [ ] TipTap editor fonctionnel (write & read)
- [ ] Experiment Timeline affichée
- [ ] Sign Experiment fonctionne (status → signed)
- [ ] Tabs détail (Overview, Protocol, Samples, Files, Activity)
- [ ] Upload fichiers fonctionne

### ✅ Phase 6 : Protocols

- [ ] Protocol Browser avec tabs (My, Group, Public)
- [ ] CRUD Protocols complet
- [ ] TipTap editor pour contenu
- [ ] Liste "Used in Experiments" affichée
- [ ] Lien Experiment → Protocol fonctionne

### ✅ Phase 7 : Inventory - Samples

- [ ] Sample Browser avec filtres
- [ ] CRUD Samples complet
- [ ] Custom fields dynamiques selon type
- [ ] Storage location picker fonctionne
- [ ] Validation et alertes expiration

### ✅ Phase 8 : Inventory - Storage & Equipment

- [ ] Storage tree hiérarchique affiché
- [ ] CRUD Storage Units complet
- [ ] Capacity indicator fonctionne
- [ ] CRUD Equipment complet
- [ ] Maintenance tracking fonctionne

### ✅ Phase 9 : Files

- [ ] File browser avec arborescence
- [ ] Upload drag & drop fonctionne
- [ ] Toggle Grid/List fonctionne
- [ ] Preview images/PDF fonctionne
- [ ] Actions Rename/Move/Delete fonctionnent

### ✅ Phase 10 : Recherche Globale

- [ ] Cmd+K ouvre command palette
- [ ] Recherche multi-entités fonctionne
- [ ] Keyboard navigation opérationnelle
- [ ] Click résultat navigate vers détail

### ✅ Phase 11 : Notifications

- [ ] Notifications dropdown affiche unread
- [ ] Badge count affiché
- [ ] Mark as read fonctionne
- [ ] Page /notifications complète
- [ ] Filtres fonctionnels

### ✅ Phase 12 : Settings

- [ ] Profile settings fonctionnel
- [ ] Change password fonctionne
- [ ] User management (admin) fonctionnel
- [ ] Organization settings fonctionnel
- [ ] Permissions respectées

### ✅ Phase 13 : Templates

- [ ] CRUD Templates complet
- [ ] "Save as Template" depuis experiment
- [ ] Application template pré-remplit experiment

### ✅ Phase 14 : Activity Log

- [ ] Activity log affiché dans experiment detail
- [ ] Activity feed dashboard affiche logs
- [ ] Triggers actifs sur toutes tables
- [ ] Permissions respectées

### ✅ Phase 15 : Polissage

- [ ] Error handling complet
- [ ] Loading states partout
- [ ] Empty states descriptifs
- [ ] Responsive mobile/tablet/desktop
- [ ] Performance optimisée (Lighthouse > 90)
- [ ] Accessibilité respectée

### ✅ Phase 16 : Déploiement

- [ ] Tests basiques (si implémentés)
- [ ] App déployée sur Vercel
- [ ] Variables env configurées
- [ ] App fonctionne en production
- [ ] README complet

---

## 9. GUIDE DE MIGRATION

### 9.1 Migration des Données

**Étapes:**

1. **Backup Supabase actuel:**
```bash
# Exporter données existantes
pg_dump -h [SUPABASE_HOST] -U postgres -d postgres > backup.sql
```

2. **Exécuter scripts SQL de migration:**
```bash
# Dans Supabase SQL Editor, exécuter séquentiellement:
01_rename_tables.sql
02_new_tables.sql
03_rls_policies.sql
04_triggers.sql
05_verification.sql
06_sample_data.sql (optionnel)
```

3. **Migrer données existantes:**
```sql
-- Les tables tasks et subprojects sont automatiquement renommées
-- Vérifier que les données sont présentes:
SELECT COUNT(*) FROM experiments; -- Devrait afficher ancien count de tasks
SELECT COUNT(*) FROM studies; -- Devrait afficher ancien count de subprojects

-- Ajouter valeurs par défaut pour nouvelles colonnes:
UPDATE experiments 
SET status = 'configuring' 
WHERE status IS NULL;

UPDATE experiments 
SET content = '{"type":"doc","content":[]}' 
WHERE content IS NULL;
```

4. **Générer types TypeScript:**
```bash
# Installer Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref [PROJECT_ID]

# Générer types
supabase gen types typescript --project-id [PROJECT_ID] > lib/types/database.types.ts
```

### 9.2 Migration du Code

**Mapping Streamlit → Next.js:**

| Streamlit File | Next.js Equivalent |
|----------------|-------------------|
| `main.py` | `app/(auth)/login/page.tsx` |
| `pages/1_dashboard.py` | `app/(dashboard)/page.tsx` |
| `pages/2_projects.py` | `app/(dashboard)/projects/page.tsx` |
| `pages/3_tasks.py` | `app/(dashboard)/experiments/page.tsx` |
| `pages/4_timeline.py` | `app/(dashboard)/experiments/timeline/page.tsx` |
| `pages/5_kanban.py` | Intégrer dans `experiments/page.tsx` (vue Kanban) |
| `utils/supabase_client.py` | `lib/supabase/client.ts` |
| `utils/auth.py` | `lib/hooks/use-auth.ts` + `middleware.ts` |
| `utils/crud.py` | `lib/api/*.ts` + `lib/hooks/*.ts` |

**Migration étapes:**

1. **Auth:**
   - Streamlit `st.session_state` → Next.js Zustand store
   - Supabase Auth reste identique

2. **Data Fetching:**
   - Streamlit `@st.cache_data` → React Query `useQuery`
   - Direct Supabase calls → API routes (optionnel) ou client-side

3. **UI Components:**
   - Streamlit widgets → Shadcn/ui components
   - `st.dataframe` → `DataTable` component
   - `st.plotly_chart` → Recharts

4. **State Management:**
   - `st.session_state` → Zustand stores

---

## 10. RESSOURCES & RÉFÉRENCES

### Documentation Officielle

- [Next.js 14 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Shadcn/ui](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [TipTap Editor](https://tiptap.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

### Tutoriels Utiles

- [Next.js + Supabase Auth](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
- [TanStack Query Best Practices](https://tkdodo.eu/blog/practical-react-query)
- [TipTap React Integration](https://tiptap.dev/installation/react)

---

## 🎯 COMMENT UTILISER CE DOCUMENT AVEC CLAUDE CODE

### Workflow Recommandé

1. **Partagez ce document complet** en début de conversation avec Claude Code
2. **Exécutez les prompts séquentiellement** (PROMPT 1, puis 2, puis 3, etc.)
3. **Validez chaque phase** avant de passer à la suivante (checklist)
4. **Testez fonctionnalités** après chaque prompt
5. **Committez changements** régulièrement (Git)

### Format des Prompts

Copiez-collez chaque PROMPT tel quel dans Claude Code, en ajoutant:

```
Voici les specs complètes du projet (lien vers ce document).

[PROMPT N copié-collé]

Génère le code complet pour cette phase.
```

### Debugging

Si problème:
- **Vérifier scripts SQL** (logs Supabase)
- **Vérifier variables env** (.env.local)
- **Vérifier types** (régénérer si nécessaire)
- **Console browser** (erreurs client)
- **Console terminal** (erreurs server)

---

## ✅ CONCLUSION

Ce document contient **TOUTES les spécifications** nécessaires pour implémenter l'ELN complet avec Claude Code.

**Prochaine étape:** Commencez avec **PROMPT 1** ! 🚀

---

**Version:** 1.0  
**Dernière mise à jour:** 18 Novembre 2025  
**Auteur:** Spécifications pour Migration Nikaia Dashboard → ELN Next.js
