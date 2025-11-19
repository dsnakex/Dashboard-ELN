# 🏗️ TECHNICAL ARCHITECTURE - Dashboard ELN Collaborative

**Projet** : Dashboard ELN Nikaia - Extension Collaborative  
**Version** : 1.0  
**Date** : 19 Novembre 2025  
**Auteur** : Architecture Team

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture Existante](#architecture-existante)
3. [Nouvelle Architecture](#nouvelle-architecture)
4. [Modèle de Données](#modèle-de-données)
5. [Stack Technique](#stack-technique)
6. [Sécurité](#sécurité)
7. [Performance](#performance)
8. [Déploiement](#déploiement)

---

## 🎯 Vue d'ensemble

### Contexte
Le Dashboard ELN actuel est une application Streamlit connectée à Supabase (PostgreSQL) avec gestion de projets, sous-projets, tâches et commentaires.

### Objectif de l'extension
Ajouter des modules pour :
- Expériences scientifiques
- Analyses et résultats
- Hypothèses et perspectives
- Collaboration enrichie

### Principes architecturaux
- **Modularité** : Chaque nouveau module est indépendant
- **Extensibilité** : Architecture prête pour futures extensions
- **Réutilisation** : Leverage des composants existants
- **Performance** : Optimisation des requêtes et cache
- **Sécurité** : RBAC strict et audit trail

---

## 🏛️ Architecture Existante

### Structure actuelle

```
Dashboard-ELN/
├── main.py                     # Point d'entrée Streamlit
├── .streamlit/
│   └── config.toml            # Configuration Streamlit
├── utils/
│   ├── supabase_client.py     # Connexion Supabase
│   ├── auth.py                # Authentification
│   └── crud.py                # CRUD projets/tâches
└── pages/
    ├── 1_dashboard.py         # Dashboard KPIs
    ├── 2_projects.py          # Gestion projets
    ├── 3_tasks.py             # Gestion tâches
    └── 4_kanban.py            # Vue Kanban
```

### Base de données existante

```
users
├── id (PK)
├── email
├── name
├── role (manager/contributor/viewer)
└── timestamps

projects
├── id (PK)
├── name
├── description
├── responsible_user_id (FK → users)
├── status
└── timestamps

subprojects
├── id (PK)
├── project_id (FK → projects)
├── name
├── description
├── responsible_user_id (FK → users)
├── status
└── timestamps

tasks
├── id (PK)
├── subproject_id (FK → subprojects)
├── title
├── description
├── assigned_to (FK → users)
├── status
├── priority
├── estimated_hours
├── deadline
└── timestamps

comments
├── id (PK)
├── task_id (FK → tasks)
├── user_id (FK → users)
├── content
└── timestamps
```

### Flux de données actuel

```
User → Streamlit UI → utils/crud.py → Supabase Client → PostgreSQL
                                    ↓
                                Supabase Auth
```

---

## 🆕 Nouvelle Architecture

### Structure étendue

```
Dashboard-ELN/
├── main.py
├── .streamlit/
│   └── config.toml
├── utils/
│   ├── supabase_client.py
│   ├── auth.py
│   ├── crud.py                    # CRUD existant
│   ├── experiments_crud.py        # 🆕 CRUD expériences
│   ├── analyses_crud.py           # 🆕 CRUD analyses
│   ├── hypotheses_crud.py         # 🆕 CRUD hypothèses
│   ├── files_storage.py           # 🆕 Gestion fichiers
│   ├── notifications.py           # 🆕 Système notifications
│   └── permissions.py             # 🆕 Gestion permissions centralisée
├── pages/
│   ├── 1_dashboard.py             # ✏️ Enrichi avec nouveaux KPIs
│   ├── 2_projects.py
│   ├── 3_tasks.py
│   ├── 4_kanban.py
│   ├── 5_experiments.py           # 🆕 Module Expériences
│   ├── 6_analyses.py              # 🆕 Module Analyses
│   └── 7_hypotheses.py            # 🆕 Module Hypothèses
├── components/                     # 🆕 Composants réutilisables
│   ├── forms/
│   │   ├── experiment_form.py
│   │   ├── analysis_form.py
│   │   └── hypothesis_form.py
│   ├── views/
│   │   ├── experiment_detail.py
│   │   ├── analysis_detail.py
│   │   └── hypothesis_detail.py
│   └── widgets/
│       ├── comment_section.py
│       ├── file_upload.py
│       └── status_badge.py
├── migrations/                     # 🆕 Migrations SQL
│   ├── 001_create_experiments.sql
│   ├── 002_create_analyses.sql
│   ├── 003_create_hypotheses.sql
│   └── 004_extend_comments.sql
└── tests/                          # 🆕 Tests
    ├── test_experiments_crud.py
    ├── test_analyses_crud.py
    └── test_hypotheses_crud.py
```

---

## 🗄️ Modèle de Données

### Nouveau schéma complet

```sql
-- NOUVEAUX MODULES

-- Table: experiments
CREATE TABLE experiments (
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
  
  CONSTRAINT valid_status CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled', 'validated')),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
);

-- Table: analyses
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  analysis_type VARCHAR(100) NOT NULL,
  methodology TEXT,
  results TEXT NOT NULL,
  conclusions TEXT,
  statistical_significance TEXT,
  
  -- Relations
  experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  analyst_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  
  -- Dates
  analysis_date DATE NOT NULL,
  validation_date DATE,
  
  -- Metadata
  data_files TEXT[], -- URLs vers fichiers Supabase Storage
  visualization_files TEXT[],
  tags TEXT[],
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  validated_by UUID REFERENCES users(id),
  
  CONSTRAINT valid_status CHECK (status IN ('draft', 'in_review', 'validated', 'rejected'))
);

-- Table: hypotheses
CREATE TABLE hypotheses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  rationale TEXT,
  expected_outcomes TEXT,
  proposed_experiments TEXT,
  
  -- Relations
  analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
  responsible_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  confidence_level VARCHAR(50),
  
  -- Dates
  proposed_date DATE NOT NULL,
  review_date DATE,
  validation_date DATE,
  
  -- Metadata
  priority VARCHAR(50) NOT NULL DEFAULT 'medium',
  tags TEXT[],
  literature_references TEXT[],
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  CONSTRAINT valid_status CHECK (status IN ('active', 'in_review', 'validated', 'rejected', 'archived')),
  CONSTRAINT valid_confidence CHECK (confidence_level IN ('low', 'medium', 'high')),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'critical'))
);

-- Extension de la table comments pour supporter tous les modules
ALTER TABLE comments ADD COLUMN experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE;
ALTER TABLE comments ADD COLUMN analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE;
ALTER TABLE comments ADD COLUMN hypothesis_id UUID REFERENCES hypotheses(id) ON DELETE CASCADE;

-- Contrainte : un commentaire doit être lié à exactement une entité
ALTER TABLE comments ADD CONSTRAINT comment_single_entity_check
CHECK (
  (task_id IS NOT NULL AND experiment_id IS NULL AND analysis_id IS NULL AND hypothesis_id IS NULL) OR
  (task_id IS NULL AND experiment_id IS NOT NULL AND analysis_id IS NULL AND hypothesis_id IS NULL) OR
  (task_id IS NULL AND experiment_id IS NULL AND analysis_id IS NOT NULL AND hypothesis_id IS NULL) OR
  (task_id IS NULL AND experiment_id IS NULL AND analysis_id IS NULL AND hypothesis_id IS NOT NULL)
);

-- Table: notifications (nouveau)
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_type CHECK (type IN ('comment', 'mention', 'status_change', 'assignment', 'deadline'))
);

-- Table: file_attachments (nouveau)
CREATE TABLE file_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size_bytes BIGINT,
  file_type VARCHAR(100),
  
  -- Relations polymorphiques
  experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE,
  analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
  hypothesis_id UUID REFERENCES hypotheses(id) ON DELETE CASCADE,
  
  -- Audit
  uploaded_by UUID NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT attachment_single_entity_check
  CHECK (
    (experiment_id IS NOT NULL AND analysis_id IS NULL AND hypothesis_id IS NULL) OR
    (experiment_id IS NULL AND analysis_id IS NOT NULL AND hypothesis_id IS NULL) OR
    (experiment_id IS NULL AND analysis_id IS NULL AND hypothesis_id IS NOT NULL)
  )
);
```

### Diagramme des relations

```
users
  ↓ (responsible_user_id, created_by, etc.)
  ├─→ projects
  │    ↓ (project_id)
  │    └─→ subprojects
  │         ↓ (subproject_id)
  │         ├─→ tasks
  │         │    ↓ (task_id)
  │         │    └─→ comments
  │         └─→ experiments
  │              ↓ (experiment_id)
  │              ├─→ comments
  │              ├─→ file_attachments
  │              └─→ analyses
  │                   ↓ (analysis_id)
  │                   ├─→ comments
  │                   ├─→ file_attachments
  │                   └─→ hypotheses
  │                        ↓ (hypothesis_id)
  │                        ├─→ comments
  │                        └─→ file_attachments
```

---

## 🛠️ Stack Technique

### Frontend
| Composant | Technologie | Version | Usage |
|-----------|-------------|---------|-------|
| Framework UI | Streamlit | 1.28.1 | Interface utilisateur |
| Visualisation | Plotly | 5.17.0 | Graphiques et KPIs |
| Data processing | Pandas | 2.0.0 | Manipulation données |
| Forms | Streamlit forms | - | Formulaires |

### Backend
| Composant | Technologie | Version | Usage |
|-----------|-------------|---------|-------|
| Language | Python | 3.10+ | Backend logic |
| Database | PostgreSQL | 15+ | Base de données |
| BaaS | Supabase | 2.1.0 | Backend as a Service |
| ORM | Supabase Client | - | Requêtes DB |
| Storage | Supabase Storage | - | Fichiers |

### Infrastructure
| Composant | Technologie | Version | Usage |
|-----------|-------------|---------|-------|
| Hosting | Vercel | - | Déploiement frontend |
| Database | Supabase Cloud | - | Hébergement DB |
| CI/CD | GitHub Actions | - | Pipeline déploiement |
| Version Control | Git/GitHub | - | Gestion code |

---

## 🔐 Sécurité

### RBAC - Matrice de permissions étendue

| Rôle | Projets | Sous-projets | Tâches | Expériences | Analyses | Hypothèses | Commentaires | Fichiers |
|------|---------|--------------|--------|-------------|----------|------------|--------------|----------|
| **Manager** | CRUD All | CRUD All | CRUD All | CRUD All | CRUD All | CRUD All | CRUD All | CRUD All |
| **Contributor** | Read | Read | CRUD Own | CRUD Own | CRUD Own | CRUD Own | CRUD Own | CRUD Own |
| **Viewer** | Read | Read | Read | Read | Read | Read | Read | Read |

### Implémentation des permissions

```python
# utils/permissions.py

def can_create_experiment(user):
    """Vérifie si l'utilisateur peut créer une expérience"""
    return user['role'] in ['manager', 'contributor']

def can_edit_experiment(user, experiment):
    """Vérifie si l'utilisateur peut modifier une expérience"""
    if user['role'] == 'manager':
        return True
    if user['role'] == 'contributor':
        return experiment['responsible_user_id'] == user['id']
    return False

def can_delete_experiment(user, experiment):
    """Vérifie si l'utilisateur peut supprimer une expérience"""
    if user['role'] == 'manager':
        return True
    if user['role'] == 'contributor':
        return experiment['created_by'] == user['id']
    return False

def can_view_experiment(user, experiment):
    """Vérifie si l'utilisateur peut voir une expérience"""
    return True  # Tous les rôles peuvent voir

# Même pattern pour analyses et hypothèses
```

### Audit Trail

Tous les modules incluent :
- `created_at` : Date de création
- `updated_at` : Date de dernière modification
- `created_by` : Utilisateur créateur
- Triggers automatiques pour `updated_at`

### Sécurité des fichiers

```python
# utils/files_storage.py

def upload_file(file, entity_type, entity_id, user_id):
    """Upload sécurisé vers Supabase Storage"""
    # Validation du type de fichier
    allowed_extensions = ['.pdf', '.csv', '.xlsx', '.png', '.jpg', '.txt']
    if not any(file.name.endswith(ext) for ext in allowed_extensions):
        raise ValueError("Type de fichier non autorisé")
    
    # Validation de la taille (max 50MB)
    if file.size > 50 * 1024 * 1024:
        raise ValueError("Fichier trop volumineux (max 50MB)")
    
    # Path structuré
    path = f"{entity_type}/{entity_id}/{user_id}_{file.name}"
    
    # Upload vers Supabase Storage
    supabase.storage.from_('eln-files').upload(path, file)
    
    # Enregistrer metadata en DB
    file_record = {
        'file_name': file.name,
        'file_path': path,
        'file_size_bytes': file.size,
        'file_type': file.type,
        f'{entity_type}_id': entity_id,
        'uploaded_by': user_id
    }
    supabase.table('file_attachments').insert(file_record).execute()
    
    return path
```

---

## ⚡ Performance

### Optimisations de requêtes

```python
# Utiliser des index pour les recherches fréquentes
CREATE INDEX idx_experiments_subproject ON experiments(subproject_id);
CREATE INDEX idx_experiments_status ON experiments(status);
CREATE INDEX idx_analyses_experiment ON analyses(experiment_id);
CREATE INDEX idx_hypotheses_analysis ON hypotheses(analysis_id);

# Requêtes avec jointures optimisées
def get_experiments_with_details(filters=None):
    query = supabase.table('experiments') \
        .select('*, subprojects(name, projects(name)), users(name, email)') \
        .order('created_at', desc=True)
    
    if filters:
        if 'status' in filters:
            query = query.eq('status', filters['status'])
        if 'subproject_id' in filters:
            query = query.eq('subproject_id', filters['subproject_id'])
    
    return query.execute()
```

### Caching Streamlit

```python
import streamlit as st

@st.cache_data(ttl=300)  # Cache 5 minutes
def load_experiments():
    """Charge les expériences avec cache"""
    return get_all_experiments()

@st.cache_data(ttl=600)  # Cache 10 minutes
def load_dashboard_kpis():
    """Charge les KPIs du dashboard"""
    return calculate_kpis()
```

### Pagination

```python
def get_experiments_paginated(page=1, per_page=20):
    """Récupère les expériences avec pagination"""
    offset = (page - 1) * per_page
    
    data = supabase.table('experiments') \
        .select('*', count='exact') \
        .range(offset, offset + per_page - 1) \
        .execute()
    
    return {
        'data': data.data,
        'total': data.count,
        'page': page,
        'per_page': per_page,
        'total_pages': (data.count + per_page - 1) // per_page
    }
```

---

## 🚀 Déploiement

### Architecture de déploiement

```
GitHub Repository
     ↓
  Git Push
     ↓
GitHub Actions (CI/CD)
     ↓
  Run Tests
     ↓
Vercel Deployment
     ↓
Production App
     ↓
Supabase (Database + Storage)
```

### Configuration Vercel

```json
// vercel.json
{
  "buildCommand": "pip install -r requirements.txt",
  "devCommand": "streamlit run main.py",
  "framework": null,
  "installCommand": "pip install -r requirements.txt"
}
```

### Variables d'environnement

```bash
# .env (production)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your-anon-key
APP_NAME=Nikaia Dashboard ELN
DEBUG_MODE=False
ENVIRONMENT=production
```

### Workflow CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.10'
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run tests
        run: pytest tests/
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 📊 Monitoring & Logs

### Logging

```python
import logging

# Configuration logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Usage dans le code
logger.info(f"User {user_id} created experiment {experiment_id}")
logger.warning(f"Failed permission check for user {user_id}")
logger.error(f"Database error: {str(error)}")
```

### Métriques à surveiller

- **Performance** : Temps de réponse des requêtes
- **Usage** : Nombre d'utilisateurs actifs, actions par jour
- **Erreurs** : Taux d'erreurs, types d'erreurs
- **Données** : Nombre d'expériences, analyses, hypothèses créées

---

## 🔄 Migrations

### Stratégie de migration

1. **Développement** : Tester les migrations en local
2. **Staging** : Appliquer sur environnement de test
3. **Production** : Appliquer avec backup préalable

### Process de migration

```bash
# 1. Backup de la DB
pg_dump -h supabase-host -U postgres -d postgres > backup_$(date +%Y%m%d).sql

# 2. Appliquer la migration
psql -h supabase-host -U postgres -d postgres -f migrations/001_create_experiments.sql

# 3. Vérifier l'application
psql -h supabase-host -U postgres -d postgres -c "\d experiments"

# 4. Rollback si nécessaire
psql -h supabase-host -U postgres -d postgres -f migrations/001_rollback.sql
```

---

## 📚 Documentation Technique

### Documentation API

Chaque fonction CRUD doit être documentée :

```python
def create_experiment(experiment_data: dict, user_id: str) -> dict:
    """
    Crée une nouvelle expérience scientifique.
    
    Args:
        experiment_data (dict): Données de l'expérience
            - title (str): Titre de l'expérience
            - description (str): Description détaillée
            - objective (str): Objectif scientifique
            - subproject_id (str): ID du sous-projet parent
            - status (str): Statut initial (default: 'planned')
        user_id (str): ID de l'utilisateur créateur
    
    Returns:
        dict: Expérience créée avec tous les champs
    
    Raises:
        PermissionError: Si l'utilisateur n'a pas les permissions
        ValueError: Si les données sont invalides
        DatabaseError: Si l'insertion échoue
    
    Example:
        >>> experiment = create_experiment({
        ...     'title': 'Test efficacité molécule X',
        ...     'objective': 'Mesurer IC50',
        ...     'subproject_id': 'uuid-123'
        ... }, user_id='uuid-456')
    """
    pass
```

---

**✅ Architecture complète documentée et prête pour implémentation !**
