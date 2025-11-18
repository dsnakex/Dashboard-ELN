# 🧬 Nikaia Dashboard

**Dashboard collaboratif pour la gestion de projets R&D en oncologie**

Application Streamlit complète avec gestion multi-utilisateurs, permissions RBAC, et synchronisation temps réel via Supabase.

---

## 📋 Table des Matières

- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration Supabase](#-configuration-supabase)
- [Lancement de l'Application](#-lancement-de-lapplication)
- [Structure du Projet](#-structure-du-projet)
- [Utilisation](#-utilisation)
- [Permissions](#-permissions)
- [Troubleshooting](#-troubleshooting)
- [Licence](#-licence)

---

## ✨ Fonctionnalités

### 🎯 Core Features
- ✅ **Multi-utilisateurs** : Authentification simplifiée par email
- ✅ **RBAC** : 3 rôles (Manager, Contributor, Viewer)
- ✅ **CRUD Complet** : Projets → Sous-projets → Tâches → Commentaires
- ✅ **Dashboard KPIs** : Statistiques et graphiques en temps réel
- ✅ **Vue Kanban** : Tableau avec 4 colonnes (Todo, In Progress, Review, Done)
- ✅ **Commentaires** : Collaboration sur les tâches
- ✅ **Filtres avancés** : Par statut, priorité, assigné, dates
- ✅ **Temps réel** : Synchronisation via Supabase

### 📊 Pages
1. **Dashboard** : KPIs, graphiques, statistiques globales
2. **Projets** : Gestion des projets et sous-projets
3. **Tâches** : Gestion détaillée des tâches avec commentaires
4. **Kanban** : Vue tableau pour suivi visuel

---

## 🛠️ Technologies

| Composant | Technologie | Version |
|-----------|-------------|---------|
| **Frontend** | Streamlit | 1.28.1 |
| **Backend** | Supabase (PostgreSQL) | 2.1.0 |
| **Base de données** | PostgreSQL | 15+ |
| **Visualisation** | Plotly | 5.17.0 |
| **Data processing** | Pandas | 2.0.0 |
| **Language** | Python | 3.10+ |

---

## 📦 Prérequis

### Système
- **Python** : 3.10 ou supérieur
- **pip** : gestionnaire de paquets Python
- **Git** : pour cloner le projet (optionnel)

### Compte Supabase
- Créer un compte gratuit sur [supabase.com](https://supabase.com)
- Créer un nouveau projet

---

## 🚀 Installation

### Étape 1 : Cloner ou Télécharger le Projet

```bash
# Option 1: Cloner avec Git
git clone https://github.com/votre-username/dashboard-nikaia.git
cd dashboard-nikaia

# Option 2: Télécharger et extraire le ZIP
# Puis ouvrir le dossier dans votre terminal
```

### Étape 2 : Créer un Environnement Virtuel (Recommandé)

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### Étape 3 : Installer les Dépendances

```bash
pip install -r requirements.txt
```

---

## 🗄️ Configuration Supabase

### Étape 1 : Créer les Tables

1. Connectez-vous à votre projet Supabase
2. Allez dans **SQL Editor**
3. Copiez le contenu de `schema.sql`
4. Collez et exécutez dans l'éditeur SQL
5. Vérifiez que toutes les tables sont créées (users, projects, subprojects, tasks, comments)

### Étape 2 : Insérer les Données de Test

1. Dans le **SQL Editor**
2. Copiez le contenu de `test_data.sql`
3. Collez et exécutez
4. Vérifiez que 4 utilisateurs, 1 projet, 1 sous-projet et 3 tâches sont créés

### Étape 3 : Récupérer les Clés API

1. Allez dans **Settings** → **API**
2. Copiez :
   - **Project URL** (ex: `https://xxx.supabase.co`)
   - **Anon/Public Key** (clé `anon public`)

### Étape 4 : Configurer les Variables d'Environnement

1. Copiez `.env.template` vers `.env` :

```bash
# Windows
copy .env.template .env

# macOS/Linux
cp .env.template .env
```

2. Ouvrez `.env` et remplacez :

```env
SUPABASE_URL=https://votre-project.supabase.co
SUPABASE_KEY=votre-anon-key-ici

APP_NAME=Nikaia Dashboard
DEBUG_MODE=False
```

---

## 🎬 Lancement de l'Application

### Démarrer l'App

```bash
streamlit run main.py
```

L'application s'ouvrira automatiquement dans votre navigateur à l'adresse : `http://localhost:8501`

### Connexion

Utilisez l'un des comptes de test :

| Email | Rôle | Permissions |
|-------|------|-------------|
| `alice@biotech.fr` | **Manager** | Tous droits |
| `bob@biotech.fr` | **Contributor** | Créer/modifier ses tâches |
| `charlie@biotech.fr` | **Contributor** | Créer/modifier ses tâches |
| `diana@biotech.fr` | **Viewer** | Lecture seule |

---

## 📁 Structure du Projet

```
dashboard-nikaia/
├── .env                      # Variables d'environnement (à créer)
├── .env.template             # Template pour .env
├── .gitignore                # Fichiers à ignorer par Git
├── requirements.txt          # Dépendances Python
├── README.md                 # Ce fichier
├── schema.sql                # Schéma PostgreSQL
├── test_data.sql             # Données de test
│
├── .streamlit/
│   └── config.toml           # Configuration Streamlit
│
├── main.py                   # Point d'entrée de l'app
│
├── utils/
│   ├── __init__.py
│   ├── supabase_client.py    # Connexion Supabase
│   ├── auth.py               # Authentification
│   └── crud.py               # Opérations CRUD
│
└── pages/
    ├── 1_dashboard.py        # Page Dashboard
    ├── 2_projects.py         # Page Projets
    ├── 3_tasks.py            # Page Tâches
    └── 4_kanban.py           # Page Kanban
```

---

## 📖 Utilisation

### 1. Dashboard (📊)

**Accès :** Toutes les pages → Dashboard

**Fonctionnalités :**
- Vue d'ensemble des KPIs (projets actifs, tâches complétées, etc.)
- Graphiques :
  - Répartition des projets par statut (pie chart)
  - Tâches par statut (bar chart)
  - Tâches par priorité (bar chart)
- Statistiques générales
- Mes tâches (résumé personnel)
- Deadlines prochaines (7 jours)

**Actions :**
- 🔄 Actualiser : Recharger les données

---

### 2. Projets (📁)

**Accès :** Navigation → Projets

**Fonctionnalités :**
- Liste tous les projets avec filtres par statut
- Voir les détails de chaque projet
- Gérer les sous-projets

**Actions (Manager/Contributor) :**
- ➕ **Créer un projet** : Nom, description, responsable, dates
- ✏️ **Modifier** : Mettre à jour les informations
- 🗑️ **Supprimer** : Supprime le projet et tous ses sous-projets/tâches
- 📂 **Voir sous-projets** : Afficher les sous-projets

**Sous-projets :**
- Créer des sous-projets pour organiser les projets
- Assigner des responsables
- Définir des statuts (Non commencé, En cours, Bloqué, Terminé)

---

### 3. Tâches (✅)

**Accès :** Navigation → Tâches

**Fonctionnalités :**
- Vue liste ou tableau de toutes les tâches
- Filtres : statut, priorité, recherche texte
- Vue "Mes tâches" pour voir uniquement ses tâches
- Commentaires sur les tâches

**Actions (Manager/Contributor) :**
- ➕ **Créer une tâche** :
  - Titre, description
  - Sous-projet parent
  - Assigné à (utilisateur)
  - Statut, priorité
  - Date limite
  - Heures estimées

- ✏️ **Modifier** : Mettre à jour tous les champs
- 🗑️ **Supprimer** : Supprimer la tâche
- 💬 **Commentaires** :
  - Ajouter des commentaires
  - Voir l'historique
  - Supprimer ses propres commentaires

**Vues disponibles :**
- 📋 **Toutes les tâches** : Liste complète
- 👤 **Mes tâches** : Uniquement vos tâches
- 📊 **Vue tableau** : Format tabulaire pour exports

---

### 4. Kanban (📋)

**Accès :** Navigation → Kanban

**Fonctionnalités :**
- Vue tableau avec 4 colonnes :
  - 📋 **À faire** (Todo)
  - 🔄 **En cours** (In Progress)
  - 👁️ **En revue** (Review)
  - ✅ **Terminé** (Done)

**Actions (Manager/Contributor) :**
- ⬅️ **Déplacer à gauche** : Revenir au statut précédent
- ➡️ **Déplacer à droite** : Avancer au statut suivant
- 👁️ **Voir détails** : Ouvre la page Tâches avec les détails

**Filtres :**
- Par priorité (Basse, Moyenne, Haute, Urgente)
- Par assigné (utilisateur)

---

## 🔐 Permissions

### Matrice des Permissions (RBAC)

| Rôle | Projets | Sous-projets | Tâches | Commentaires |
|------|---------|--------------|--------|--------------|
| **Manager** | CRUD complet | CRUD complet | CRUD complet | CRUD complet |
| **Contributor** | Lecture | Lecture | CRUD ses tâches | CRUD ses commentaires |
| **Viewer** | Lecture | Lecture | Lecture | Lecture |

**Légende :**
- **C**reate : Créer
- **R**ead : Lire/Consulter
- **U**pdate : Modifier
- **D**elete : Supprimer

### Règles Spécifiques

1. **Manager** :
   - Accès complet à toutes les fonctionnalités
   - Peut créer/modifier/supprimer tous les objets
   - Peut gérer tous les utilisateurs

2. **Contributor** :
   - Peut créer des tâches et commentaires
   - Peut modifier/supprimer uniquement **ses propres tâches**
   - Ne peut pas créer/modifier de projets ou sous-projets
   - Peut voir tous les projets/tâches

3. **Viewer** :
   - Lecture seule complète
   - Ne peut rien créer, modifier ou supprimer
   - Idéal pour les observateurs externes ou stakeholders

---

## 🐛 Troubleshooting

### Problème : Erreur de connexion Supabase

**Symptômes :**
```
❌ Erreur de connexion Supabase: ...
```

**Solutions :**
1. Vérifiez que `.env` existe et contient les bonnes clés
2. Vérifiez que `SUPABASE_URL` et `SUPABASE_KEY` sont corrects
3. Testez la connexion Supabase depuis l'interface web
4. Vérifiez que RLS est configuré correctement

### Problème : Les tables n'existent pas

**Symptômes :**
```
relation "users" does not exist
```

**Solutions :**
1. Exécutez `schema.sql` dans Supabase SQL Editor
2. Vérifiez que toutes les tables sont créées dans l'interface Supabase
3. Vérifiez les logs Supabase pour les erreurs SQL

### Problème : Impossible de se connecter

**Symptômes :**
```
❌ Utilisateur introuvable
```

**Solutions :**
1. Exécutez `test_data.sql` pour créer les utilisateurs de test
2. Vérifiez que la table `users` contient des données
3. Utilisez exactement les emails de test : `alice@biotech.fr`, etc.

### Problème : Import errors Python

**Symptômes :**
```
ModuleNotFoundError: No module named 'streamlit'
```

**Solutions :**
1. Activez votre environnement virtuel
2. Réinstallez les dépendances : `pip install -r requirements.txt`
3. Vérifiez la version Python : `python --version` (doit être 3.10+)

### Problème : Port déjà utilisé

**Symptômes :**
```
Port 8501 is already in use
```

**Solutions :**
1. Arrêtez les autres instances Streamlit
2. Utilisez un autre port : `streamlit run main.py --server.port 8502`
3. Redémarrez votre terminal

### Problème : Les graphiques ne s'affichent pas

**Symptômes :**
- Graphiques vides ou erreurs Plotly

**Solutions :**
1. Vérifiez que des données existent dans les tables
2. Actualisez la page (F5)
3. Vérifiez la console navigateur pour les erreurs JavaScript

---

## 🔧 Configuration Avancée

### Modifier les Couleurs du Thème

Éditez `.streamlit/config.toml` :

```toml
[theme]
primaryColor = "#0066CC"        # Couleur principale
backgroundColor = "#FFFFFF"      # Fond de page
secondaryBackgroundColor = "#F0F2F6"  # Fond secondaire
textColor = "#262730"           # Couleur du texte
```

### Changer le Port

```bash
streamlit run main.py --server.port 8080
```

### Mode Debug

Dans `.env` :

```env
DEBUG_MODE=True
```

---

## 📚 Ressources

### Documentation Officielle
- [Streamlit Docs](https://docs.streamlit.io)
- [Supabase Docs](https://supabase.com/docs)
- [Plotly Python](https://plotly.com/python/)

### Support
- **Email** : support@nikaia-biotech.fr
- **Issues** : [GitHub Issues](https://github.com/votre-username/dashboard-nikaia/issues)

---

## 🎯 Roadmap

### Phase 2 (Futures Features)
- [ ] Export Excel/PDF des rapports
- [ ] Notifications email automatiques
- [ ] Authentification avancée (OAuth, SSO)
- [ ] API REST pour intégrations externes
- [ ] Mode hors-ligne (PWA)
- [ ] Gestion des fichiers/documents
- [ ] Calendrier intégré
- [ ] Chat temps réel entre utilisateurs

---

## 👥 Contributeurs

- **Alice Martin** - Project Lead
- **Bob Durand** - Backend Developer
- **Charlie Dubois** - Frontend Developer

---

## 📄 Licence

MIT License - Copyright (c) 2025 Nikaia Biotech

---

## 🎉 Remerciements

Merci d'utiliser **Nikaia Dashboard** !

Pour toute question ou suggestion d'amélioration, n'hésitez pas à ouvrir une issue sur GitHub.

**Bon usage !** 🧬🚀
