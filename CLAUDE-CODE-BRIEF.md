# 🤖 CLAUDE CODE BRIEF - Phase 1 : Module Expériences

**Projet** : Dashboard ELN Nikaia - Extension Collaborative  
**Phase** : Phase 1 - Module Expériences  
**Date** : 19 Novembre 2025  
**Objectif** : Développer le module complet de gestion des expériences scientifiques

---

## 📋 Instructions pour Claude Code

Bonjour Claude Code ! 👋

Tu vas m'aider à développer la **Phase 1 du Dashboard ELN Collaboratif** : le module de gestion des expériences scientifiques.

---

## 🎯 Contexte du Projet

### Application existante
Le Dashboard ELN actuel est une application **Streamlit** connectée à **Supabase (PostgreSQL)** qui gère :
- ✅ Projets et sous-projets
- ✅ Tâches avec système Kanban
- ✅ Commentaires collaboratifs
- ✅ Permissions RBAC (Manager, Contributor, Viewer)

### Repository
**URL** : https://github.com/dsnakex/Dashboard-ELN

### Stack technique
- **Frontend** : Streamlit 1.28.1
- **Backend** : Supabase (PostgreSQL 15+)
- **Visualisation** : Plotly 5.17.0
- **Langage** : Python 3.10+
- **Déploiement** : Vercel

---

## 🎯 Objectif de la Phase 1

Créer un module complet pour gérer les **expériences scientifiques** avec :

1. **Base de données** : Table `experiments` avec relations
2. **Backend** : CRUD complet avec permissions RBAC
3. **Frontend** : Interface Streamlit pour créer/modifier/supprimer/consulter
4. **Intégration** : Liaison avec sous-projets existants
5. **Collaboration** : Commentaires sur expériences

---

## 📊 Structure de Données

### Table `experiments` à créer

```sql
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

-- Indexes
CREATE INDEX idx_experiments_subproject ON experiments(subproject_id);
CREATE INDEX idx_experiments_responsible ON experiments(responsible_user_id);
CREATE INDEX idx_experiments_status ON experiments(status);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_experiments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_experiments_updated_at
BEFORE UPDATE ON experiments
FOR EACH ROW
EXECUTE FUNCTION update_experiments_updated_at();
```

### Extension de la table `comments`

```sql
ALTER TABLE comments ADD COLUMN experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE;

-- Mise à jour de la contrainte
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comment_single_entity_check;
ALTER TABLE comments ADD CONSTRAINT comment_single_entity_check
CHECK (
  (task_id IS NOT NULL AND experiment_id IS NULL) OR
  (task_id IS NULL AND experiment_id IS NOT NULL)
);
```

---

## 🛠️ Fichiers à Créer/Modifier

### 1. Migration SQL
**Fichier** : `migrations/001_create_experiments.sql`

Contenu : Le schéma SQL ci-dessus complet.

---

### 2. Module CRUD Backend
**Fichier** : `utils/experiments_crud.py`

#### Fonctions à implémenter

```python
from utils.supabase_client import supabase
from utils.permissions import can_create_experiment, can_edit_experiment, can_delete_experiment
import logging

logger = logging.getLogger(__name__)

def get_all_experiments(filters=None):
    """
    Récupère toutes les expériences avec filtres optionnels.
    
    Args:
        filters (dict): Filtres optionnels
            - status: Filtrer par statut
            - subproject_id: Filtrer par sous-projet
            - responsible_user_id: Filtrer par responsable
            - search: Recherche texte dans titre/description
    
    Returns:
        list: Liste des expériences
    """
    query = supabase.table('experiments') \
        .select('*, subprojects(name, project_id, projects(name)), users!experiments_responsible_user_id_fkey(name, email)') \
        .order('created_at', desc=True)
    
    if filters:
        if 'status' in filters and filters['status']:
            query = query.eq('status', filters['status'])
        if 'subproject_id' in filters and filters['subproject_id']:
            query = query.eq('subproject_id', filters['subproject_id'])
        if 'responsible_user_id' in filters and filters['responsible_user_id']:
            query = query.eq('responsible_user_id', filters['responsible_user_id'])
        if 'search' in filters and filters['search']:
            query = query.or_(f'title.ilike.%{filters["search"]}%,description.ilike.%{filters["search"]}%')
    
    try:
        result = query.execute()
        return result.data
    except Exception as e:
        logger.error(f"Error fetching experiments: {str(e)}")
        raise


def get_experiment_by_id(experiment_id):
    """
    Récupère une expérience par son ID.
    
    Args:
        experiment_id (str): UUID de l'expérience
    
    Returns:
        dict: Expérience avec relations
    """
    try:
        result = supabase.table('experiments') \
            .select('*, subprojects(*, projects(*)), users!experiments_responsible_user_id_fkey(*)') \
            .eq('id', experiment_id) \
            .single() \
            .execute()
        return result.data
    except Exception as e:
        logger.error(f"Error fetching experiment {experiment_id}: {str(e)}")
        raise


def create_experiment(experiment_data, user):
    """
    Crée une nouvelle expérience.
    
    Args:
        experiment_data (dict): Données de l'expérience
        user (dict): Utilisateur créateur
    
    Returns:
        dict: Expérience créée
    
    Raises:
        PermissionError: Si l'utilisateur n'a pas les permissions
    """
    if not can_create_experiment(user):
        raise PermissionError("Vous n'avez pas la permission de créer une expérience")
    
    # Ajouter l'ID du créateur
    experiment_data['created_by'] = user['id']
    
    try:
        result = supabase.table('experiments').insert(experiment_data).execute()
        logger.info(f"Experiment created by user {user['id']}: {result.data[0]['id']}")
        return result.data[0]
    except Exception as e:
        logger.error(f"Error creating experiment: {str(e)}")
        raise


def update_experiment(experiment_id, updates, user):
    """
    Met à jour une expérience existante.
    
    Args:
        experiment_id (str): UUID de l'expérience
        updates (dict): Champs à mettre à jour
        user (dict): Utilisateur effectuant la modification
    
    Returns:
        dict: Expérience mise à jour
    
    Raises:
        PermissionError: Si l'utilisateur n'a pas les permissions
    """
    # Récupérer l'expérience existante
    experiment = get_experiment_by_id(experiment_id)
    
    if not can_edit_experiment(user, experiment):
        raise PermissionError("Vous n'avez pas la permission de modifier cette expérience")
    
    try:
        result = supabase.table('experiments') \
            .update(updates) \
            .eq('id', experiment_id) \
            .execute()
        logger.info(f"Experiment {experiment_id} updated by user {user['id']}")
        return result.data[0]
    except Exception as e:
        logger.error(f"Error updating experiment {experiment_id}: {str(e)}")
        raise


def delete_experiment(experiment_id, user):
    """
    Supprime une expérience.
    
    Args:
        experiment_id (str): UUID de l'expérience
        user (dict): Utilisateur effectuant la suppression
    
    Raises:
        PermissionError: Si l'utilisateur n'a pas les permissions
    """
    # Récupérer l'expérience existante
    experiment = get_experiment_by_id(experiment_id)
    
    if not can_delete_experiment(user, experiment):
        raise PermissionError("Vous n'avez pas la permission de supprimer cette expérience")
    
    try:
        supabase.table('experiments').delete().eq('id', experiment_id).execute()
        logger.info(f"Experiment {experiment_id} deleted by user {user['id']}")
    except Exception as e:
        logger.error(f"Error deleting experiment {experiment_id}: {str(e)}")
        raise


def get_experiments_by_subproject(subproject_id):
    """Récupère toutes les expériences d'un sous-projet."""
    return get_all_experiments({'subproject_id': subproject_id})


def get_experiments_by_user(user_id):
    """Récupère toutes les expériences d'un utilisateur."""
    return get_all_experiments({'responsible_user_id': user_id})
```

---

### 3. Module Permissions
**Fichier** : `utils/permissions.py`

```python
def can_create_experiment(user):
    """Manager et Contributor peuvent créer des expériences."""
    return user['role'] in ['manager', 'contributor']


def can_edit_experiment(user, experiment):
    """Manager ou propriétaire de l'expérience peut modifier."""
    if user['role'] == 'manager':
        return True
    if user['role'] == 'contributor':
        return experiment['responsible_user_id'] == user['id'] or experiment['created_by'] == user['id']
    return False


def can_delete_experiment(user, experiment):
    """Seul Manager ou créateur peut supprimer."""
    if user['role'] == 'manager':
        return True
    if user['role'] == 'contributor':
        return experiment['created_by'] == user['id']
    return False


def can_view_experiment(user, experiment):
    """Tous les utilisateurs peuvent voir les expériences."""
    return True
```

---

### 4. Page Streamlit
**Fichier** : `pages/5_experiments.py`

#### Structure de la page

```python
import streamlit as st
import pandas as pd
from datetime import datetime, date
from utils.auth import require_auth
from utils.experiments_crud import (
    get_all_experiments,
    get_experiment_by_id,
    create_experiment,
    update_experiment,
    delete_experiment
)
from utils.permissions import can_create_experiment, can_edit_experiment, can_delete_experiment
from utils.crud import get_all_subprojects, get_all_users

# Configuration de la page
st.set_page_config(page_title="Expériences", page_icon="🧪", layout="wide")

# Authentification requise
current_user = require_auth()

st.title("🧪 Gestion des Expériences")
st.markdown("---")

# Tabs pour organiser l'interface
tab1, tab2 = st.tabs(["📋 Liste des expériences", "➕ Nouvelle expérience"])

# TAB 1: Liste des expériences
with tab1:
    st.subheader("Liste des expériences")
    
    # Filtres
    col1, col2, col3 = st.columns(3)
    with col1:
        filter_status = st.selectbox(
            "Filtrer par statut",
            options=["Tous", "planned", "in_progress", "completed", "cancelled", "validated"],
            key="filter_status"
        )
    with col2:
        subprojects = get_all_subprojects()
        subproject_options = {sp['id']: sp['name'] for sp in subprojects}
        filter_subproject = st.selectbox(
            "Filtrer par sous-projet",
            options=["Tous"] + list(subproject_options.keys()),
            format_func=lambda x: "Tous" if x == "Tous" else subproject_options.get(x, x),
            key="filter_subproject"
        )
    with col3:
        search_query = st.text_input("🔍 Recherche", key="search")
    
    # Bouton rafraîchir
    if st.button("🔄 Actualiser", key="refresh_experiments"):
        st.rerun()
    
    # Construire les filtres
    filters = {}
    if filter_status != "Tous":
        filters['status'] = filter_status
    if filter_subproject != "Tous":
        filters['subproject_id'] = filter_subproject
    if search_query:
        filters['search'] = search_query
    
    # Charger les expériences
    try:
        experiments = get_all_experiments(filters)
        
        if not experiments:
            st.info("Aucune expérience trouvée. Créez-en une dans l'onglet 'Nouvelle expérience'.")
        else:
            # Affichage en cartes
            for exp in experiments:
                with st.expander(f"🧪 {exp['title']} - {exp['status'].upper()}", expanded=False):
                    col1, col2 = st.columns([3, 1])
                    
                    with col1:
                        st.markdown(f"**Objectif:** {exp['objective']}")
                        if exp['description']:
                            st.markdown(f"**Description:** {exp['description']}")
                        st.markdown(f"**Sous-projet:** {exp['subprojects']['name']}")
                        st.markdown(f"**Responsable:** {exp['users']['name']}")
                        st.markdown(f"**Priorité:** {exp['priority']}")
                        
                        if exp['planned_date']:
                            st.markdown(f"**Date prévue:** {exp['planned_date']}")
                    
                    with col2:
                        # Boutons d'action
                        if can_edit_experiment(current_user, exp):
                            if st.button("✏️ Modifier", key=f"edit_{exp['id']}"):
                                st.session_state['editing_experiment'] = exp['id']
                                st.rerun()
                        
                        if can_delete_experiment(current_user, exp):
                            if st.button("🗑️ Supprimer", key=f"delete_{exp['id']}"):
                                if st.session_state.get(f'confirm_delete_{exp["id"]}'):
                                    try:
                                        delete_experiment(exp['id'], current_user)
                                        st.success("Expérience supprimée avec succès!")
                                        st.rerun()
                                    except Exception as e:
                                        st.error(f"Erreur: {str(e)}")
                                else:
                                    st.session_state[f'confirm_delete_{exp["id"]}'] = True
                                    st.warning("Cliquez à nouveau pour confirmer la suppression")
    
    except Exception as e:
        st.error(f"Erreur lors du chargement des expériences: {str(e)}")

# TAB 2: Création d'expérience
with tab2:
    if not can_create_experiment(current_user):
        st.warning("Vous n'avez pas la permission de créer des expériences.")
    else:
        st.subheader("Créer une nouvelle expérience")
        
        with st.form("create_experiment_form"):
            # Informations de base
            st.markdown("### Informations générales")
            title = st.text_input("Titre de l'expérience *", max_chars=255)
            objective = st.text_area("Objectif scientifique *", height=100)
            description = st.text_area("Description détaillée", height=150)
            
            # Protocole et conditions
            st.markdown("### Protocole")
            protocol = st.text_area("Protocole expérimental", height=200)
            conditions = st.text_area("Conditions expérimentales", height=100)
            
            # Métadonnées
            st.markdown("### Organisation")
            col1, col2 = st.columns(2)
            with col1:
                subprojects = get_all_subprojects()
                subproject_options = {sp['id']: sp['name'] for sp in subprojects}
                subproject_id = st.selectbox(
                    "Sous-projet *",
                    options=list(subproject_options.keys()),
                    format_func=lambda x: subproject_options[x]
                )
                
                users = get_all_users()
                user_options = {u['id']: u['name'] for u in users}
                responsible_user_id = st.selectbox(
                    "Responsable *",
                    options=list(user_options.keys()),
                    format_func=lambda x: user_options[x]
                )
            
            with col2:
                status = st.selectbox(
                    "Statut",
                    options=["planned", "in_progress", "completed", "cancelled", "validated"],
                    index=0
                )
                priority = st.selectbox(
                    "Priorité",
                    options=["low", "medium", "high", "urgent"],
                    index=1
                )
            
            # Dates
            st.markdown("### Planning")
            col1, col2, col3 = st.columns(3)
            with col1:
                planned_date = st.date_input("Date prévue", value=None)
            with col2:
                start_date = st.date_input("Date de début", value=None)
            with col3:
                deadline = st.date_input("Deadline", value=None)
            
            estimated_duration = st.number_input("Durée estimée (heures)", min_value=0.0, step=0.5)
            
            # Bouton de soumission
            submitted = st.form_submit_button("✅ Créer l'expérience")
            
            if submitted:
                if not title or not objective or not subproject_id or not responsible_user_id:
                    st.error("Veuillez remplir tous les champs obligatoires (*)")
                else:
                    try:
                        experiment_data = {
                            'title': title,
                            'objective': objective,
                            'description': description,
                            'protocol': protocol,
                            'conditions': conditions,
                            'subproject_id': subproject_id,
                            'responsible_user_id': responsible_user_id,
                            'status': status,
                            'priority': priority,
                            'planned_date': str(planned_date) if planned_date else None,
                            'start_date': str(start_date) if start_date else None,
                            'deadline': str(deadline) if deadline else None,
                            'estimated_duration_hours': estimated_duration if estimated_duration > 0 else None
                        }
                        
                        new_experiment = create_experiment(experiment_data, current_user)
                        st.success(f"✅ Expérience '{new_experiment['title']}' créée avec succès!")
                        st.balloons()
                        
                        # Rediriger vers l'onglet liste
                        st.rerun()
                    
                    except Exception as e:
                        st.error(f"❌ Erreur lors de la création: {str(e)}")
```

---

## 🔧 Modifications à Apporter

### 1. Mettre à jour le Dashboard
**Fichier** : `pages/1_dashboard.py`

Ajouter les KPIs pour les expériences :

```python
# Après les KPIs existants
from utils.experiments_crud import get_all_experiments

# Charger les expériences
experiments = get_all_experiments()
total_experiments = len(experiments)
experiments_in_progress = len([e for e in experiments if e['status'] == 'in_progress'])
experiments_completed = len([e for e in experiments if e['status'] == 'completed'])

# Afficher les KPIs
col1, col2, col3, col4, col5 = st.columns(5)
# ... KPIs existants ...
with col4:
    st.metric("Expériences totales", total_experiments)
with col5:
    st.metric("Expériences en cours", experiments_in_progress)
```

### 2. Ajouter le lien dans la navigation
**Fichier** : `main.py` (si navigation custom) ou Streamlit se chargera automatiquement d'ajouter la page au menu.

---

## ✅ Checklist de Développement

### Phase 1.1 : Base de données (Jour 1)
- [ ] Créer `migrations/001_create_experiments.sql`
- [ ] Exécuter la migration sur Supabase
- [ ] Vérifier la création de la table `experiments`
- [ ] Vérifier les contraintes et index
- [ ] Insérer quelques données de test

### Phase 1.2 : Backend CRUD (Jours 2-3)
- [ ] Créer `utils/experiments_crud.py`
- [ ] Implémenter `get_all_experiments()`
- [ ] Implémenter `get_experiment_by_id()`
- [ ] Implémenter `create_experiment()`
- [ ] Implémenter `update_experiment()`
- [ ] Implémenter `delete_experiment()`
- [ ] Créer `utils/permissions.py` avec fonctions de permissions

### Phase 1.3 : Frontend Streamlit (Jours 4-7)
- [ ] Créer `pages/5_experiments.py`
- [ ] Implémenter l'onglet "Liste des expériences"
- [ ] Ajouter les filtres (statut, sous-projet, recherche)
- [ ] Implémenter l'onglet "Nouvelle expérience"
- [ ] Créer le formulaire de création complet
- [ ] Ajouter les boutons d'action (modifier, supprimer)
- [ ] Implémenter la vue détaillée d'une expérience

### Phase 1.4 : Intégrations (Jours 8-9)
- [ ] Mettre à jour `pages/1_dashboard.py` avec KPIs expériences
- [ ] Ajouter un onglet "Expériences" dans `pages/2_projects.py`
- [ ] Étendre le système de commentaires pour supporter les expériences
- [ ] Ajouter la navigation entre modules

### Phase 1.5 : Tests & Documentation (Jour 10)
- [ ] Tester tous les parcours utilisateurs
- [ ] Tester les permissions (Manager, Contributor, Viewer)
- [ ] Documenter le code
- [ ] Mettre à jour le README
- [ ] Déployer sur Vercel

---

## 🚀 Comment Commencer

### Étape 1 : Cloner le repository
```bash
git clone https://github.com/dsnakex/Dashboard-ELN.git
cd Dashboard-ELN
git checkout -b feature/phase1-experiments
```

### Étape 2 : Créer la migration SQL
Crée le fichier `migrations/001_create_experiments.sql` avec le schéma fourni ci-dessus.

### Étape 3 : Appliquer la migration
Connecte-toi à ton projet Supabase et exécute la migration dans le SQL Editor.

### Étape 4 : Développer le backend
Crée `utils/experiments_crud.py` et `utils/permissions.py` avec les fonctions fournies.

### Étape 5 : Développer le frontend
Crée `pages/5_experiments.py` avec l'interface Streamlit fournie.

### Étape 6 : Tester localement
```bash
streamlit run main.py
```

### Étape 7 : Commit et push
```bash
git add .
git commit -m "feat: Add experiments module (Phase 1)"
git push origin feature/phase1-experiments
```

---

## 💡 Conseils pour Claude Code

1. **Reste fidèle à l'architecture existante** : Réutilise les patterns du code existant (authentification, CRUD, permissions)

2. **Respecte les conventions de nommage** : Les fichiers et fonctions doivent suivre le style Python (snake_case)

3. **Ajoute des logs** : Utilise `logging` pour tracer les actions importantes

4. **Gère les erreurs** : Tous les try/except doivent avoir des messages d'erreur clairs

5. **Commente le code** : Ajoute des docstrings pour toutes les fonctions

6. **Teste au fur et à mesure** : Ne développe pas tout d'un coup, teste chaque fonction individuellement

7. **Vérifie les permissions** : Assure-toi que les checks RBAC sont bien en place partout

8. **Optimise les requêtes** : Utilise les jointures Supabase pour éviter les requêtes multiples

---

## 📞 Questions Fréquentes

**Q: Comment tester les permissions ?**
R: Connecte-toi avec différents comptes (alice@biotech.fr = Manager, bob@biotech.fr = Contributor, diana@biotech.fr = Viewer) et vérifie les restrictions.

**Q: Comment débugger les erreurs Supabase ?**
R: Active les logs avec `logging.basicConfig(level=logging.DEBUG)` et vérifie les messages d'erreur de Supabase.

**Q: Comment ajouter de nouvelles validations ?**
R: Ajoute des contraintes CHECK en SQL et des validations côté Python dans les fonctions CRUD.

---

## ✅ Résultat Attendu

À la fin de la Phase 1, tu devrais avoir :

- ✅ Table `experiments` créée et opérationnelle
- ✅ CRUD complet fonctionnel avec permissions
- ✅ Page Streamlit "Expériences" accessible
- ✅ Création/modification/suppression d'expériences
- ✅ Filtres et recherche opérationnels
- ✅ Intégration avec sous-projets
- ✅ Dashboard mis à jour avec KPIs expériences
- ✅ Code testé et déployé sur Vercel

---

**🎉 Bonne chance pour le développement ! N'hésite pas à me demander si tu as des questions.**
