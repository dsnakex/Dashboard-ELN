# 🚀 START HERE - Nikaia Dashboard Deployment

## 📊 Votre Dashboard est Prêt !

Tout est **100% en anglais** et prêt pour la production.

---

## ⚡ Déploiement Rapide (5 minutes)

### Option A : Script Automatique (Windows)

```powershell
.\deploy.ps1
```

Le script va :
- ✅ Initialiser Git
- ✅ Commit les fichiers
- ✅ Pousser vers GitHub
- ✅ Afficher les prochaines étapes

### Option B : Manuel

Suivez le guide : **[QUICK_DEPLOY.md](QUICK_DEPLOY.md)**

---

## 📋 Checklist Avant Déploiement

### 1️⃣ Nettoyer la Base de Données

**Ouvrir Supabase:** https://app.supabase.com

**Dans SQL Editor, exécuter:**
```sql
-- Supprimer données de test
DELETE FROM comments;
DELETE FROM tasks;
DELETE FROM subprojects;
DELETE FROM projects;
DELETE FROM users;
```

### 2️⃣ Créer Vos Vrais Utilisateurs

**Éditer:** `scripts/create_real_users.sql`

**Remplacer avec vos emails:**
```sql
INSERT INTO users (email, name, role) VALUES
('alice@nikaia.com', 'Alice Martin', 'manager'),
('bob@nikaia.com', 'Bob Durand', 'contributor'),
('charlie@nikaia.com', 'Charlie Dubois', 'contributor');
```

**Exécuter dans Supabase SQL Editor**

### 3️⃣ Vérifier la Migration Timeline

**Dans Supabase SQL Editor:**
```sql
-- Vérifier que la colonne start_date existe
SELECT column_name FROM information_schema.columns
WHERE table_name = 'tasks' AND column_name = 'start_date';
```

**Si vide, exécuter:** `migration_add_task_dates.sql`

### 4️⃣ Pousser vers GitHub

```bash
# Option 1 : Utiliser le script PowerShell
.\deploy.ps1

# Option 2 : Commandes manuelles
git init
git add .
git commit -m "Initial commit - Nikaia Dashboard"
git remote add origin https://github.com/VOTRE_USERNAME/nikaia-dashboard.git
git push -u origin main
```

### 5️⃣ Déployer sur Streamlit Cloud

1. **Aller sur:** https://share.streamlit.io
2. **Cliquer:** "New app"
3. **Configurer:**
   - Repository: `votre-username/nikaia-dashboard`
   - Branch: `main`
   - Main file: `main.py`
4. **Advanced settings > Secrets:**
   ```toml
   SUPABASE_URL = "https://lwdpqfcnvacnciofqxfa.supabase.co"
   SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3ZHBxZmNudmFjbmNpb2ZxeGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NzA5NjAsImV4cCI6MjA3ODQ0Njk2MH0.UqVnpZh6pa1aZiy0Kw-R6V8271xVCs-muhvVt4tVusM"
   ```
5. **Cliquer:** "Deploy" 🚀

---

## ✅ Après le Déploiement

### Test Immédiat

1. **Ouvrir votre app:** `https://votre-app.streamlit.app`
2. **Se connecter** avec un email créé (ex: alice@nikaia.com)
3. **Vérifier:**
   - ✅ Dashboard s'affiche
   - ✅ Peut créer un projet
   - ✅ Peut créer une tâche
   - ✅ Kanban fonctionne
   - ✅ Timeline affiche le Gantt

### Premiers Pas

1. **Créer votre premier projet:**
   - Aller sur "Projects"
   - Cliquer "Create New Project"
   - Remplir le formulaire
   - Créer un sous-projet

2. **Ajouter des tâches:**
   - Aller sur "Tasks"
   - Cliquer "Create New Task"
   - **Important:** Ajouter dates de début et fin pour Timeline !

3. **Voir le Gantt:**
   - Aller sur "Timeline"
   - Sélectionner vue "By Project"
   - Admirer votre planning ! 📅

---

## 📱 Partager avec l'Équipe

**Template email:**

```
Bonjour l'équipe,

Notre nouveau Nikaia Dashboard est en ligne ! 🎉

🔗 URL : https://votre-app.streamlit.app

📧 Connexion :
Utilisez votre email professionnel pour vous connecter.

📊 Fonctionnalités :
• Dashboard avec KPIs en temps réel
• Gestion de projets et sous-projets
• Suivi de tâches avec commentaires
• Tableau Kanban
• Timeline Gantt interactif

Tout est en anglais et prêt à l'emploi !

N'hésitez pas si vous avez des questions.

Cordialement,
[Votre nom]
```

---

## 🔄 Mettre à Jour l'App

```bash
# Faire des changements dans le code
# Puis :

git add .
git commit -m "Description des changements"
git push

# L'app se redéploie automatiquement en ~2 minutes !
```

---

## 📚 Documentation Disponible

| Fichier | Description |
|---------|-------------|
| **[QUICK_DEPLOY.md](QUICK_DEPLOY.md)** | Guide de déploiement 5 minutes |
| **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** | Guide complet avec troubleshooting |
| **[README_DEPLOY.md](README_DEPLOY.md)** | Documentation technique |
| **[FULL_ENGLISH_TRANSLATION_COMPLETE.md](FULL_ENGLISH_TRANSLATION_COMPLETE.md)** | Référence traduction |
| `scripts/reset_database.sql` | Script nettoyage base |
| `scripts/create_real_users.sql` | Script création utilisateurs |

---

## 🎯 Fonctionnalités Disponibles

### ✅ Dashboard
- 4 KPI cards (Projets actifs, Tâches complétées, etc.)
- 3 graphiques interactifs Plotly
- Mes tâches
- Échéances à venir

### ✅ Projets
- Créer/Éditer/Supprimer projets
- Gestion des sous-projets
- Statuts : Planning, Active, On Hold, Completed, Archived
- Assignation de responsables

### ✅ Tâches
- CRUD complet
- Statuts : Todo, In Progress, Review, Done
- Priorités : Low, Medium, High, Urgent
- Commentaires
- Dates début/fin
- Heures estimées
- 3 vues : All Tasks, My Tasks, Table

### ✅ Kanban
- 4 colonnes drag-and-drop (via boutons)
- Filtres par priorité/assigné
- Statistiques temps réel

### ✅ Timeline
- Diagramme de Gantt interactif
- 3 vues : Par Projet, Par Assigné, Par Tâche
- Vue calendrier hebdomadaire
- Statistiques timeline

---

## 🔐 Rôles Utilisateurs

| Rôle | Permissions |
|------|-------------|
| **Manager** | Accès total (créer, éditer, supprimer tout) |
| **Contributor** | Gérer ses propres projets/tâches |
| **Viewer** | Lecture seule |

---

## 🆘 Besoin d'Aide ?

### Problèmes Courants

**L'app ne démarre pas:**
- Vérifier les secrets dans Streamlit Cloud
- Consulter les logs

**Erreur de connexion base de données:**
- Vérifier SUPABASE_URL et SUPABASE_KEY
- Vérifier que le projet Supabase est actif

**Tasks n'apparaissent pas dans Timeline:**
- Vérifier que les tâches ont start_date ET due_date
- Exécuter migration si nécessaire

**Guide complet:** [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

## 🎊 C'est Parti !

Votre dashboard est **prêt pour la production** !

**Prochaines étapes:**
1. ✅ Nettoyer la base (5 min)
2. ✅ Créer utilisateurs (2 min)
3. ✅ Déployer sur Streamlit (3 min)
4. ✅ Tester et partager ! 🚀

---

**Bonne chance avec votre déploiement !** 🧬✨

---

**Version:** 1.0 Production
**Status:** ✅ Ready to Deploy
**Language:** 🇬🇧 100% English
