# 📋 TASK TRACKER - PHASE 1 : Module Expériences

**Phase** : Phase 1 - Foundation  
**Durée** : 2 semaines (10 jours ouvrés)  
**Objectif** : Créer le module complet de gestion des expériences scientifiques  
**Date de début** : À définir  
**Statut global** : 🔵 Not Started

---

## 📊 Vue d'ensemble de la Phase 1

### Objectifs
- ✅ Créer la structure de base de données pour les expériences
- ✅ Implémenter le CRUD complet côté backend
- ✅ Développer l'interface Streamlit pour les expériences
- ✅ Intégrer les permissions RBAC
- ✅ Lier les expériences aux sous-projets existants

### Métriques de succès
- Base de données `experiments` créée et testée
- Page Expériences accessible et fonctionnelle
- Création/modification/suppression opérationnelles
- Permissions respectées (Manager, Contributor, Viewer)
- Tests utilisateurs validés

---

## 🗓️ Planning Détaillé

### **SEMAINE 1 : Backend & Database**

#### **Jour 1 : Setup & Database Schema**
**Durée** : 1 jour  
**Statut** : ⚪ À faire  
**Priorité** : 🔴 Critique

##### Tâches
- [ ] **T1.1** - Analyser la structure DB existante
  - Examiner `schema.sql` actuel
  - Identifier les relations avec `subprojects`
  - Documenter les contraintes existantes
  - *Temps estimé : 1h*

- [ ] **T1.2** - Concevoir le schéma `experiments`
  - Définir tous les champs nécessaires
  - Établir les relations (FK vers subprojects, users)
  - Définir les contraintes et index
  - *Temps estimé : 2h*

- [ ] **T1.3** - Créer le fichier de migration SQL
  - Rédiger `migrations/001_create_experiments.sql`
  - Ajouter les triggers pour timestamps
  - Inclure les index pour performance
  - *Temps estimé : 2h*

- [ ] **T1.4** - Tester la migration en local
  - Exécuter la migration sur DB de test
  - Vérifier toutes les contraintes
  - Insérer des données de test
  - *Temps estimé : 1h*

##### Livrables
- ✅ `migrations/001_create_experiments.sql`
- ✅ Documentation du schéma dans `docs/database/experiments-schema.md`
- ✅ Données de test dans `test_data/experiments.sql`

---

#### **Jour 2 : CRUD Backend - Partie 1**
**Durée** : 1 jour  
**Statut** : ⚪ À faire  
**Priorité** : 🔴 Critique

##### Tâches
- [ ] **T2.1** - Créer le module `utils/experiments_crud.py`
  - Initialiser la structure du fichier
  - Importer les dépendances nécessaires
  - Définir les fonctions de base
  - *Temps estimé : 30min*

- [ ] **T2.2** - Implémenter `get_all_experiments()`
  - Fonction avec filtres (statut, subproject, responsable)
  - Gestion de la pagination
  - Jointures avec tables liées
  - *Temps estimé : 2h*

- [ ] **T2.3** - Implémenter `get_experiment_by_id()`
  - Récupération d'une expérience par ID
  - Inclure toutes les relations
  - Gestion des erreurs
  - *Temps estimé : 1h*

- [ ] **T2.4** - Implémenter `create_experiment()`
  - Validation des données d'entrée
  - Insertion en base
  - Retour de l'objet créé
  - *Temps estimé : 2h*

- [ ] **T2.5** - Tests unitaires des fonctions GET et CREATE
  - Écrire les tests dans `tests/test_experiments_crud.py`
  - Tester tous les cas nominaux
  - Tester les cas d'erreur
  - *Temps estimé : 1h*

##### Livrables
- ✅ `utils/experiments_crud.py` (fonctions GET et CREATE)
- ✅ `tests/test_experiments_crud.py`

---

#### **Jour 3 : CRUD Backend - Partie 2**
**Durée** : 1 jour  
**Statut** : ⚪ À faire  
**Priorité** : 🔴 Critique

##### Tâches
- [ ] **T3.1** - Implémenter `update_experiment()`
  - Validation des permissions (propriétaire ou Manager)
  - Update partiel ou complet
  - Gestion des erreurs
  - *Temps estimé : 2h*

- [ ] **T3.2** - Implémenter `delete_experiment()`
  - Vérification des permissions
  - Suppression en cascade (commentaires liés)
  - Gestion des erreurs
  - *Temps estimé : 1h*

- [ ] **T3.3** - Implémenter fonctions utilitaires
  - `get_experiments_by_subproject(subproject_id)`
  - `get_experiments_by_user(user_id)`
  - `get_experiments_by_status(status)`
  - *Temps estimé : 2h*

- [ ] **T3.4** - Tests unitaires UPDATE et DELETE
  - Compléter `tests/test_experiments_crud.py`
  - Tester les permissions
  - Tester les cas limites
  - *Temps estimé : 1h*

##### Livrables
- ✅ `utils/experiments_crud.py` (complet)
- ✅ Tests complets et passants

---

#### **Jour 4 : Permissions & RBAC**
**Durée** : 1 jour  
**Statut** : ⚪ À faire  
**Priorité** : 🟡 Important

##### Tâches
- [ ] **T4.1** - Analyser le système RBAC existant
  - Examiner `utils/auth.py`
  - Comprendre la logique des rôles
  - Identifier les patterns à réutiliser
  - *Temps estimé : 1h*

- [ ] **T4.2** - Créer les fonctions de vérification de permissions
  - `can_create_experiment(user)`
  - `can_edit_experiment(user, experiment)`
  - `can_delete_experiment(user, experiment)`
  - `can_view_experiment(user, experiment)`
  - *Temps estimé : 2h*

- [ ] **T4.3** - Intégrer les permissions dans CRUD
  - Ajouter les checks dans chaque fonction CRUD
  - Gérer les erreurs de permission
  - Logger les tentatives non autorisées
  - *Temps estimé : 2h*

- [ ] **T4.4** - Tests des permissions
  - Tester chaque rôle (Manager, Contributor, Viewer)
  - Vérifier les restrictions
  - Documenter les cas limites
  - *Temps estimé : 1h*

##### Livrables
- ✅ Système de permissions complet
- ✅ Tests de permissions validés
- ✅ Documentation des règles RBAC pour expériences

---

#### **Jour 5 : Interface Streamlit - Setup**
**Durée** : 1 jour  
**Statut** : ⚪ À faire  
**Priorité** : 🔴 Critique

##### Tâches
- [ ] **T5.1** - Créer la page `pages/5_experiments.py`
  - Structure de base Streamlit
  - Imports et configuration
  - Layout général
  - *Temps estimé : 1h*

- [ ] **T5.2** - Développer la vue liste des expériences
  - Affichage en tableau
  - Filtres (statut, sous-projet, responsable)
  - Barre de recherche
  - *Temps estimé : 3h*

- [ ] **T5.3** - Créer les boutons d'action
  - Bouton "Nouvelle expérience"
  - Boutons "Modifier" et "Supprimer" par ligne
  - Bouton "Voir détails"
  - *Temps estimé : 1h*

- [ ] **T5.4** - Ajouter la navigation
  - Lien depuis le menu principal
  - Breadcrumb de navigation
  - Icône et titre de page
  - *Temps estimé : 30min*

##### Livrables
- ✅ `pages/5_experiments.py` (vue liste fonctionnelle)
- ✅ Navigation accessible

---

### **SEMAINE 2 : Frontend & Integration**

#### **Jour 6 : Formulaires - Création**
**Durée** : 1 jour  
**Statut** : ⚪ À faire  
**Priorité** : 🔴 Critique

##### Tâches
- [ ] **T6.1** - Concevoir le formulaire de création
  - Définir tous les champs nécessaires
  - Organiser en sections logiques
  - Définir les validations
  - *Temps estimé : 1h*

- [ ] **T6.2** - Implémenter le formulaire Streamlit
  - Champs texte (titre, description, objectif)
  - Sélecteurs (sous-projet, responsable, statut, priorité)
  - Champs date (date de réalisation, deadline)
  - Champs numériques (durée estimée)
  - *Temps estimé : 3h*

- [ ] **T6.3** - Ajouter les validations côté client
  - Champs obligatoires
  - Formats de dates
  - Limites de caractères
  - *Temps estimé : 1h*

- [ ] **T6.4** - Connecter au backend
  - Appel à `create_experiment()`
  - Gestion des erreurs
  - Messages de succès/erreur
  - *Temps estimé : 1h*

##### Livrables
- ✅ Formulaire de création fonctionnel
- ✅ Validations opérationnelles
- ✅ Création d'expériences testée

---

#### **Jour 7 : Formulaires - Édition & Détails**
**Durée** : 1 jour  
**Statut** : ⚪ À faire  
**Priorité** : 🔴 Critique

##### Tâches
- [ ] **T7.1** - Créer la vue détaillée d'une expérience
  - Layout avec toutes les informations
  - Design clair et lisible
  - Sections organisées
  - *Temps estimé : 2h*

- [ ] **T7.2** - Implémenter le formulaire d'édition
  - Pré-remplir avec données existantes
  - Permettre modifications
  - Bouton "Enregistrer les modifications"
  - *Temps estimé : 2h*

- [ ] **T7.3** - Ajouter la fonction de suppression
  - Bouton "Supprimer l'expérience"
  - Confirmation avant suppression
  - Redirection après suppression
  - *Temps estimé : 1h*

- [ ] **T7.4** - Tester les formulaires
  - Création complète
  - Édition de tous les champs
  - Suppression avec confirmation
  - *Temps estimé : 1h*

##### Livrables
- ✅ Vue détaillée complète
- ✅ Formulaire d'édition fonctionnel
- ✅ Suppression opérationnelle

---

#### **Jour 8 : Relations & Intégrations**
**Durée** : 1 jour  
**Statut** : ⚪ À faire  
**Priorité** : 🟡 Important

##### Tâches
- [ ] **T8.1** - Afficher les expériences dans la page Sous-projets
  - Ajouter un onglet "Expériences" dans les détails de sous-projet
  - Liste des expériences liées
  - Bouton "Créer une expérience" depuis sous-projet
  - *Temps estimé : 2h*

- [ ] **T8.2** - Ajouter les liens de navigation
  - Depuis expérience vers sous-projet parent
  - Depuis sous-projet vers expériences
  - Breadcrumb cohérent
  - *Temps estimé : 1h*

- [ ] **T8.3** - Mettre à jour le Dashboard
  - Ajouter KPI "Nombre d'expériences"
  - Ajouter KPI "Expériences en cours"
  - Graphique de répartition par statut
  - *Temps estimé : 2h*

- [ ] **T8.4** - Tester les intégrations
  - Navigation entre modules
  - Cohérence des données
  - Performance des requêtes
  - *Temps estimé : 1h*

##### Livrables
- ✅ Intégration avec sous-projets complète
- ✅ Dashboard mis à jour
- ✅ Navigation fluide

---

#### **Jour 9 : Commentaires & Collaboration**
**Durée** : 1 jour  
**Statut** : ⚪ À faire  
**Priorité** : 🟡 Important

##### Tâches
- [ ] **T9.1** - Adapter le système de commentaires existant
  - Étendre la table `comments` pour supporter les expériences
  - Ajouter champ `experiment_id` (nullable)
  - Mettre à jour les fonctions CRUD commentaires
  - *Temps estimé : 2h*

- [ ] **T9.2** - Intégrer les commentaires dans la vue expérience
  - Section commentaires en bas de la vue détaillée
  - Affichage des commentaires existants
  - Formulaire d'ajout de commentaire
  - *Temps estimé : 2h*

- [ ] **T9.3** - Ajouter les notifications
  - Notification lors d'un nouveau commentaire
  - Notification lors de modification d'expérience
  - Badge de notifications non lues
  - *Temps estimé : 1h*

- [ ] **T9.4** - Tester la collaboration
  - Créer des commentaires avec différents utilisateurs
  - Vérifier les notifications
  - Tester les permissions sur commentaires
  - *Temps estimé : 1h*

##### Livrables
- ✅ Système de commentaires fonctionnel
- ✅ Notifications opérationnelles
- ✅ Collaboration testée

---

#### **Jour 10 : Tests, Documentation & Déploiement**
**Durée** : 1 jour  
**Statut** : ⚪ À faire  
**Priorité** : 🔴 Critique

##### Tâches
- [ ] **T10.1** - Tests end-to-end complets
  - Parcours utilisateur complet (Manager)
  - Parcours utilisateur complet (Contributor)
  - Parcours utilisateur complet (Viewer)
  - Identifier et corriger les bugs
  - *Temps estimé : 2h*

- [ ] **T10.2** - Rédiger la documentation utilisateur
  - Guide d'utilisation du module Expériences
  - Screenshots et exemples
  - FAQ et troubleshooting
  - *Temps estimé : 2h*

- [ ] **T10.3** - Mettre à jour le README
  - Documenter les nouvelles fonctionnalités
  - Mettre à jour les instructions d'installation
  - Ajouter les nouveaux endpoints/fonctions
  - *Temps estimé : 1h*

- [ ] **T10.4** - Déployer sur Vercel
  - Pousser les changements sur GitHub
  - Vérifier le déploiement automatique
  - Tester en production
  - *Temps estimé : 1h*

##### Livrables
- ✅ Tests complets passants
- ✅ Documentation complète
- ✅ Application déployée en production
- ✅ Phase 1 terminée ✅

---

## 📝 Schéma SQL - Table `experiments`

```sql
-- Migration 001: Create experiments table
CREATE TABLE experiments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  objective TEXT NOT NULL,
  protocol TEXT,
  conditions TEXT,
  observations TEXT,
  
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
  tags TEXT[], -- Array of tags for filtering
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled', 'validated')),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
);

-- Indexes for performance
CREATE INDEX idx_experiments_subproject ON experiments(subproject_id);
CREATE INDEX idx_experiments_responsible ON experiments(responsible_user_id);
CREATE INDEX idx_experiments_status ON experiments(status);
CREATE INDEX idx_experiments_dates ON experiments(planned_date, start_date, completion_date);

-- Trigger for updated_at
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

-- Comments for documentation
COMMENT ON TABLE experiments IS 'Scientific experiments linked to subprojects';
COMMENT ON COLUMN experiments.status IS 'Experiment status: planned, in_progress, completed, cancelled, validated';
COMMENT ON COLUMN experiments.priority IS 'Priority level: low, medium, high, urgent';
```

---

## 🎯 Checklist de Validation Phase 1

### Base de données
- [ ] Table `experiments` créée avec tous les champs
- [ ] Relations avec `subprojects` et `users` fonctionnelles
- [ ] Indexes créés pour performance
- [ ] Triggers et contraintes opérationnels
- [ ] Données de test insérées

### Backend
- [ ] Toutes les fonctions CRUD implémentées
- [ ] Permissions RBAC intégrées et testées
- [ ] Gestion d'erreurs complète
- [ ] Tests unitaires passants (>90% coverage)
- [ ] Fonctions utilitaires créées

### Frontend
- [ ] Page Expériences accessible
- [ ] Vue liste avec filtres fonctionnelle
- [ ] Formulaire création opérationnel
- [ ] Formulaire édition opérationnel
- [ ] Suppression avec confirmation
- [ ] Navigation cohérente

### Intégrations
- [ ] Lien avec sous-projets établi
- [ ] Dashboard mis à jour
- [ ] Commentaires fonctionnels
- [ ] Notifications activées

### Qualité
- [ ] Code reviewé et commenté
- [ ] Documentation utilisateur complète
- [ ] Tests end-to-end passants
- [ ] Déploiement en production réussi

---

## 📊 Suivi de Progression

| Jour | Tâches | Statut | Temps estimé | Temps réel | Notes |
|------|--------|--------|--------------|------------|-------|
| 1 | T1.1 - T1.4 | ⚪ À faire | 6h | - | - |
| 2 | T2.1 - T2.5 | ⚪ À faire | 6.5h | - | - |
| 3 | T3.1 - T3.4 | ⚪ À faire | 6h | - | - |
| 4 | T4.1 - T4.4 | ⚪ À faire | 6h | - | - |
| 5 | T5.1 - T5.4 | ⚪ À faire | 5.5h | - | - |
| 6 | T6.1 - T6.4 | ⚪ À faire | 6h | - | - |
| 7 | T7.1 - T7.4 | ⚪ À faire | 6h | - | - |
| 8 | T8.1 - T8.4 | ⚪ À faire | 6h | - | - |
| 9 | T9.1 - T9.4 | ⚪ À faire | 6h | - | - |
| 10 | T10.1 - T10.4 | ⚪ À faire | 6h | - | - |

**Total estimé : 60 heures (10 jours × 6h)**

---

## 🚀 Pour Commencer

### Étape 1 : Préparer l'environnement
```bash
# Créer une branche pour Phase 1
git checkout -b feature/phase1-experiments

# Créer les dossiers nécessaires
mkdir -p migrations
mkdir -p tests
mkdir -p docs/database
```

### Étape 2 : Lancer Claude Code
Utilisez le prompt du fichier `CLAUDE-CODE-BRIEF.md` pour démarrer le développement avec Claude Code.

### Étape 3 : Suivre le planning
Cochez les tâches au fur et à mesure et notez le temps réel pour ajuster les estimations.

---

**✅ Phase 1 complète = Module Expériences opérationnel !**
