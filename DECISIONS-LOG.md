# 📝 DECISIONS LOG - Dashboard ELN Collaborative

**Projet** : Dashboard ELN Nikaia - Extension Collaborative  
**Date de création** : 19 Novembre 2025  
**Version** : 1.0

---

## 📋 Table des Matières

1. [Décisions Architecturales](#décisions-architecturales)
2. [Décisions de Design](#décisions-de-design)
3. [Décisions Techniques](#décisions-techniques)
4. [Décisions de Sécurité](#décisions-de-sécurité)
5. [Décisions de Workflow](#décisions-de-workflow)

---

## 🏗️ Décisions Architecturales

### DR-001 : Conserver Streamlit au lieu de migrer vers React/Next.js
**Date** : 19/11/2025  
**Statut** : ✅ Accepté  
**Décideur** : Équipe technique + Product Owner

#### Contexte
L'application existante est en Streamlit. Une migration vers React/Next.js pourrait offrir plus de flexibilité mais demande un effort considérable.

#### Décision
Conserver Streamlit pour les raisons suivantes :
- ✅ Application existante déjà fonctionnelle
- ✅ Équipe familière avec Python/Streamlit
- ✅ Rapidité de développement
- ✅ Moins de complexité (pas de séparation frontend/backend)
- ✅ Adapté pour usage interne en équipe

#### Conséquences
- ✅ Développement plus rapide
- ✅ Moins de code à maintenir
- ⚠️ Limitations UI par rapport à React
- ⚠️ Performance limitée pour usage à très grande échelle

#### Alternatives considérées
- React/Next.js + API REST : Trop complexe pour le besoin actuel
- Vue.js : Même problématique que React
- Gradio : Moins mature que Streamlit

---

### DR-002 : Architecture modulaire avec un module par fonctionnalité
**Date** : 19/11/2025  
**Statut** : ✅ Accepté  
**Décideur** : Équipe technique

#### Contexte
Besoin d'ajouter plusieurs modules (Expériences, Analyses, Hypothèses) sans impacter l'existant.

#### Décision
Adopter une architecture modulaire où chaque fonctionnalité est un module indépendant avec :
- Son propre fichier CRUD (`utils/experiments_crud.py`, `utils/analyses_crud.py`, etc.)
- Sa propre page Streamlit (`pages/5_experiments.py`, `pages/6_analyses.py`, etc.)
- Ses propres tables en base de données

#### Conséquences
- ✅ Modules indépendants, faciles à développer/tester
- ✅ Réduction des conflits de code
- ✅ Facilite les tests unitaires
- ✅ Scalabilité pour futurs modules
- ⚠️ Risque de duplication de code (géré via composants partagés)

---

### DR-003 : Utiliser Supabase Storage pour les fichiers
**Date** : 19/11/2025  
**Statut** : ✅ Accepté  
**Décideur** : Équipe technique

#### Contexte
Les analyses nécessitent de stocker des fichiers (CSV, images, documents).

#### Décision
Utiliser **Supabase Storage** au lieu de stocker les fichiers en base ou sur le filesystem.

#### Raisons
- ✅ Intégré à Supabase (même stack)
- ✅ Gestion des permissions intégrée
- ✅ CDN pour performance
- ✅ Pas de gestion de filesystem serveur
- ✅ Scalable

#### Conséquences
- ✅ Simplicité d'intégration
- ✅ Pas de problème de migration de fichiers
- ⚠️ Coût storage Supabase (acceptable pour l'usage prévu)

#### Alternatives considérées
- AWS S3 : Trop complexe à intégrer
- Stockage local : Non scalable, problématique pour déploiement
- Base64 en DB : Mauvaise performance

---

## 🎨 Décisions de Design

### DD-001 : Structure hiérarchique Projets → Sous-projets → Expériences → Analyses → Hypothèses
**Date** : 19/11/2025  
**Statut** : ✅ Accepté  
**Décideur** : Product Owner + Équipe scientifique

#### Contexte
Besoin d'organiser logiquement le workflow scientifique.

#### Décision
Hiérarchie suivante :
```
Projets
  └── Sous-projets
       ├── Tâches (existant)
       └── Expériences (nouveau)
            └── Analyses (nouveau)
                 └── Hypothèses (nouveau)
```

#### Raisons
- ✅ Reflète le workflow scientifique réel
- ✅ Traçabilité complète de l'hypothèse initiale aux conclusions
- ✅ Navigation intuitive
- ✅ Compatibilité avec l'existant (Tâches restent au niveau Sous-projets)

#### Conséquences
- ✅ Logique métier claire
- ✅ Relations en base de données simples (FK en cascade)
- ⚠️ Profondeur de navigation à gérer (breadcrumbs nécessaires)

---

### DD-002 : Statuts d'expériences : Planned, In Progress, Completed, Cancelled, Validated
**Date** : 19/11/2025  
**Statut** : ✅ Accepté  
**Décideur** : Équipe scientifique

#### Contexte
Besoin de suivre le cycle de vie des expériences.

#### Décision
5 statuts :
- **Planned** : Expérience planifiée mais pas commencée
- **In Progress** : Expérience en cours
- **Completed** : Expérience terminée
- **Cancelled** : Expérience annulée
- **Validated** : Expérience validée scientifiquement

#### Raisons
- ✅ Couvre tous les cas d'usage identifiés
- ✅ Statut "Validated" important pour conformité
- ✅ Simple et clair

#### Alternatives considérées
- Ajouter "On Hold" : Décidé de l'intégrer plus tard si besoin
- Ajouter "Failed" : "Completed" couvre ce cas (avec observations)

---

### DD-003 : Système de tags libre pour tous les modules
**Date** : 19/11/2025  
**Statut** : ✅ Accepté  
**Décideur** : Product Owner

#### Contexte
Besoin de catégoriser les expériences, analyses, hypothèses de manière flexible.

#### Décision
Utiliser un champ `tags` de type `TEXT[]` (array PostgreSQL) pour tous les modules.

#### Raisons
- ✅ Flexibilité maximale
- ✅ Pas de gestion de table de référence tags
- ✅ Facilite la recherche et filtrage
- ✅ Évolutif (nouveaux tags à tout moment)

#### Conséquences
- ✅ Simplicité d'implémentation
- ⚠️ Pas de contrôle de typo (géré via autocomplete dans l'UI)

---

## 🔧 Décisions Techniques

### DT-001 : PostgreSQL array pour tags au lieu de table many-to-many
**Date** : 19/11/2025  
**Statut** : ✅ Accepté  
**Décideur** : Équipe technique

#### Contexte
Choix entre `TEXT[]` et table `tags` avec relation many-to-many.

#### Décision
Utiliser `TEXT[]` (array PostgreSQL).

#### Raisons
- ✅ Simplicité de requêtes
- ✅ Pas de jointures complexes
- ✅ Performance optimale pour recherche (index GIN)
- ✅ Moins de tables à gérer

#### Conséquences
- ✅ Code plus simple
- ⚠️ Pas de normalisation stricte (acceptable pour des tags)

#### Code SQL
```sql
tags TEXT[]
CREATE INDEX idx_experiments_tags ON experiments USING GIN (tags);
```

---

### DT-002 : Trigger automatique pour `updated_at` au lieu de gestion manuelle
**Date** : 19/11/2025  
**Statut** : ✅ Accepté  
**Décideur** : Équipe technique

#### Contexte
Besoin de tracer les modifications avec `updated_at`.

#### Décision
Utiliser un trigger PostgreSQL pour mise à jour automatique.

#### Raisons
- ✅ Garantit la cohérence (impossible d'oublier)
- ✅ Pas de code Python supplémentaire
- ✅ Performance native DB

#### Code SQL
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_experiments_updated_at
BEFORE UPDATE ON experiments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
```

---

### DT-003 : Utiliser les jointures Supabase au lieu de requêtes séparées
**Date** : 19/11/2025  
**Statut** : ✅ Accepté  
**Décideur** : Équipe technique

#### Contexte
Besoin d'afficher les expériences avec leurs relations (sous-projets, utilisateurs).

#### Décision
Utiliser les jointures Supabase dans une seule requête.

#### Exemple
```python
experiments = supabase.table('experiments') \
    .select('*, subprojects(name, projects(name)), users(name, email)') \
    .execute()
```

#### Raisons
- ✅ Une seule requête réseau
- ✅ Performance optimale
- ✅ Moins de code

#### Conséquences
- ✅ Performance améliorée (1 requête au lieu de N+1)
- ⚠️ Syntaxe spécifique Supabase (moins standard que SQL pur)

---

### DT-004 : Caching Streamlit avec TTL pour performance
**Date** : 19/11/2025  
**Statut** : ✅ Accepté  
**Décideur** : Équipe technique

#### Contexte
Les requêtes fréquentes (dashboard, liste expériences) peuvent ralentir l'app.

#### Décision
Utiliser `@st.cache_data(ttl=X)` pour les fonctions de lecture.

#### Exemple
```python
@st.cache_data(ttl=300)  # Cache 5 minutes
def load_experiments():
    return get_all_experiments()
```

#### Raisons
- ✅ Performance améliorée
- ✅ Réduit la charge DB
- ✅ Simple à implémenter

#### Conséquences
- ✅ UX plus fluide
- ⚠️ Données légèrement en retard (max 5min, acceptable)

---

## 🔐 Décisions de Sécurité

### DS-001 : RBAC à 3 rôles : Manager, Contributor, Viewer
**Date** : 19/11/2025  
**Statut** : ✅ Accepté  
**Décideur** : Product Owner + Équipe technique

#### Contexte
Besoin de contrôler les permissions sur les nouveaux modules.

#### Décision
Conserver le système RBAC existant avec 3 rôles :
- **Manager** : CRUD complet sur tout
- **Contributor** : CRUD sur ses propres créations
- **Viewer** : Lecture seule

#### Raisons
- ✅ Système déjà en place et fonctionnel
- ✅ Couvre tous les besoins identifiés
- ✅ Simple à comprendre et maintenir

#### Matrice de permissions
| Rôle | Expériences | Analyses | Hypothèses |
|------|-------------|----------|------------|
| Manager | CRUD All | CRUD All | CRUD All |
| Contributor | CRUD Own | CRUD Own | CRUD Own |
| Viewer | Read All | Read All | Read All |

---

### DS-002 : Audit trail complet avec created_by et updated_at
**Date** : 19/11/2025  
**Statut** : ✅ Accepté  
**Décideur** : Product Owner (conformité réglementaire)

#### Contexte
Besoin de traçabilité pour conformité scientifique et réglementaire.

#### Décision
Tous les modules incluent :
- `created_at` : Date de création (auto)
- `updated_at` : Date de modification (auto via trigger)
- `created_by` : UUID de l'utilisateur créateur

#### Raisons
- ✅ Conformité réglementaire
- ✅ Traçabilité complète
- ✅ Facilite les audits
- ✅ Debug et historique

---

### DS-003 : Validation des types de fichiers uploadés
**Date** : 19/11/2025  
**Statut** : ✅ Accepté  
**Décideur** : Équipe technique

#### Contexte
Risque de sécurité avec upload de fichiers arbitraires.

#### Décision
Whitelist des extensions autorisées :
- Documents : `.pdf`, `.txt`, `.docx`
- Données : `.csv`, `.xlsx`, `.json`
- Images : `.png`, `.jpg`, `.jpeg`, `.svg`

Limite de taille : **50 MB** par fichier.

#### Raisons
- ✅ Sécurité contre fichiers malveillants
- ✅ Couvre tous les besoins scientifiques identifiés
- ✅ Limite raisonnable pour fichiers de résultats

#### Code
```python
ALLOWED_EXTENSIONS = ['.pdf', '.csv', '.xlsx', '.png', '.jpg', '.txt', '.docx', '.json']
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB

def validate_file(file):
    if not any(file.name.endswith(ext) for ext in ALLOWED_EXTENSIONS):
        raise ValueError("Type de fichier non autorisé")
    if file.size > MAX_FILE_SIZE:
        raise ValueError("Fichier trop volumineux (max 50MB)")
```

---

## 🔄 Décisions de Workflow

### DW-001 : Développement par phases de 2 semaines
**Date** : 19/11/2025  
**Statut** : ✅ Accepté  
**Décideur** : Product Owner + Équipe technique

#### Contexte
Besoin de livrer progressivement avec feedback utilisateur.

#### Décision
6 phases de 2 semaines chacune :
1. Phase 1 : Module Expériences
2. Phase 2 : Module Analyses
3. Phase 3 : Module Hypothèses
4. Phase 4 : Collaboration avancée
5. Phase 5 : Dashboard & Reporting
6. Phase 6 : Features avancées

#### Raisons
- ✅ Livraisons fréquentes pour feedback
- ✅ Phases courtes, objectives clairs
- ✅ Permet ajustements entre phases
- ✅ Réduit les risques

---

### DW-002 : Git Flow avec branches feature par phase
**Date** : 19/11/2025  
**Statut** : ✅ Accepté  
**Décideur** : Équipe technique

#### Contexte
Besoin d'organiser le développement multi-phases.

#### Décision
Stratégie Git Flow :
- `main` : Production stable
- `develop` : Intégration continue
- `feature/phase1-experiments` : Phase 1
- `feature/phase2-analyses` : Phase 2
- etc.

#### Workflow
```bash
# Nouvelle phase
git checkout develop
git pull
git checkout -b feature/phase1-experiments

# Développement...
git add .
git commit -m "feat: add experiments CRUD"

# Merge vers develop
git checkout develop
git merge feature/phase1-experiments

# Merge vers main pour production
git checkout main
git merge develop
git push origin main  # Déclenche déploiement Vercel
```

---

### DW-003 : Tests manuels avant chaque merge vers main
**Date** : 19/11/2025  
**Statut** : ✅ Accepté  
**Décideur** : Équipe technique

#### Contexte
Pas de suite de tests automatisés complète (à développer plus tard).

#### Décision
Checklist de tests manuels avant merge :
- [ ] Tester CRUD complet (créer, lire, modifier, supprimer)
- [ ] Tester avec chaque rôle (Manager, Contributor, Viewer)
- [ ] Vérifier les filtres et recherches
- [ ] Tester sur mobile (responsive)
- [ ] Vérifier les logs (pas d'erreur console)

#### Raisons
- ✅ Garantit la qualité avant production
- ✅ Simple à suivre
- ⚠️ Manuel (à automatiser en Phase 6)

---

## 📊 Décisions de Performance

### DP-001 : Pagination des listes à 20 items par page
**Date** : 19/11/2025  
**Statut** : ✅ Accepté  
**Décideur** : Équipe technique

#### Contexte
Les listes longues (expériences, analyses) peuvent ralentir l'interface.

#### Décision
Paginer à 20 items par page par défaut.

#### Raisons
- ✅ Performance optimale
- ✅ UX fluide
- ✅ Standard de l'industrie

#### Implémentation
```python
def get_experiments_paginated(page=1, per_page=20):
    offset = (page - 1) * per_page
    return supabase.table('experiments') \
        .select('*', count='exact') \
        .range(offset, offset + per_page - 1) \
        .execute()
```

---

### DP-002 : Index DB sur colonnes fréquemment filtrées
**Date** : 19/11/2025  
**Statut** : ✅ Accepté  
**Décideur** : Équipe technique

#### Contexte
Filtres fréquents sur `status`, `subproject_id`, `responsible_user_id`.

#### Décision
Créer des index sur ces colonnes.

#### Code SQL
```sql
CREATE INDEX idx_experiments_subproject ON experiments(subproject_id);
CREATE INDEX idx_experiments_responsible ON experiments(responsible_user_id);
CREATE INDEX idx_experiments_status ON experiments(status);
CREATE INDEX idx_experiments_tags ON experiments USING GIN (tags);
```

#### Raisons
- ✅ Requêtes 10-100x plus rapides
- ✅ Scalabilité pour milliers d'expériences
- ⚠️ Légère augmentation de la taille DB (négligeable)

---

## 📝 Historique des Décisions

| ID | Titre | Date | Statut | Impact |
|----|-------|------|--------|--------|
| DR-001 | Conserver Streamlit | 19/11/2025 | ✅ Accepté | 🔴 Critique |
| DR-002 | Architecture modulaire | 19/11/2025 | ✅ Accepté | 🔴 Critique |
| DR-003 | Supabase Storage | 19/11/2025 | ✅ Accepté | 🟡 Moyen |
| DD-001 | Hiérarchie modules | 19/11/2025 | ✅ Accepté | 🔴 Critique |
| DD-002 | Statuts expériences | 19/11/2025 | ✅ Accepté | 🟡 Moyen |
| DD-003 | Système de tags | 19/11/2025 | ✅ Accepté | 🟢 Faible |
| DT-001 | Array pour tags | 19/11/2025 | ✅ Accepté | 🟢 Faible |
| DT-002 | Trigger updated_at | 19/11/2025 | ✅ Accepté | 🟢 Faible |
| DT-003 | Jointures Supabase | 19/11/2025 | ✅ Accepté | 🟡 Moyen |
| DT-004 | Caching Streamlit | 19/11/2025 | ✅ Accepté | 🟡 Moyen |
| DS-001 | RBAC 3 rôles | 19/11/2025 | ✅ Accepté | 🔴 Critique |
| DS-002 | Audit trail | 19/11/2025 | ✅ Accepté | 🔴 Critique |
| DS-003 | Validation fichiers | 19/11/2025 | ✅ Accepté | 🟡 Moyen |
| DW-001 | Phases de 2 semaines | 19/11/2025 | ✅ Accepté | 🟡 Moyen |
| DW-002 | Git Flow | 19/11/2025 | ✅ Accepté | 🟢 Faible |
| DW-003 | Tests manuels | 19/11/2025 | ✅ Accepté | 🟡 Moyen |
| DP-001 | Pagination | 19/11/2025 | ✅ Accepté | 🟡 Moyen |
| DP-002 | Index DB | 19/11/2025 | ✅ Accepté | 🟡 Moyen |

---

## 🔄 Process de Révision

### Quand réviser une décision ?
- ❌ Blocage technique majeur
- ❌ Feedback utilisateur négatif
- ❌ Nouvelle contrainte réglementaire
- ❌ Changement de scope majeur

### Comment réviser ?
1. Documenter le problème rencontré
2. Proposer alternative(s)
3. Évaluer impact sur existant
4. Décision en équipe
5. Mettre à jour ce document

---

**✅ Log de décisions complet et maintenu à jour !**
