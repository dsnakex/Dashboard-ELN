# 🚀 Quick Deploy - 5 Minutes

## Étape 1 : Nettoyer la base de données (2 min)

1. **Ouvrir Supabase:** https://app.supabase.com
2. **Aller dans SQL Editor**
3. **Copier-coller ce script:**

```sql
-- Supprimer toutes les données de test
DELETE FROM comments;
DELETE FROM tasks;
DELETE FROM subprojects;
DELETE FROM projects;
DELETE FROM users;
```

4. **Cliquer sur Run** ✅

---

## Étape 2 : Créer vos vrais utilisateurs (1 min)

**Dans le même SQL Editor, exécuter:**

```sql
-- REMPLACER avec vos vrais emails et noms !

-- Manager
INSERT INTO users (email, name, role) VALUES
('votre.email@nikaia.com', 'Votre Nom', 'manager');

-- Contributors
INSERT INTO users (email, name, role) VALUES
('collaborateur1@nikaia.com', 'Nom Collaborateur 1', 'contributor'),
('collaborateur2@nikaia.com', 'Nom Collaborateur 2', 'contributor');

-- Viewers (optionnel)
INSERT INTO users (email, name, role) VALUES
('lecteur@nikaia.com', 'Nom Lecteur', 'viewer');
```

**Vérifier:**
```sql
SELECT email, name, role FROM users;
```

---

## Étape 3 : Initialiser Git (30 sec)

```bash
cd "c:\Users\dpasc\OneDrive\Documents\Application Development\dashboard-nikaia"

git init
git add .
git commit -m "Initial commit - Nikaia Dashboard (English)"
```

---

## Étape 4 : Créer repo GitHub (1 min)

1. **Aller sur:** https://github.com/new
2. **Nom du repo:** `nikaia-dashboard`
3. **Visibilité:** Private (recommandé) ou Public
4. **Ne PAS cocher** "Initialize with README"
5. **Cliquer sur** "Create repository"

**Puis dans votre terminal:**

```bash
git remote add origin https://github.com/VOTRE_USERNAME/nikaia-dashboard.git
git branch -M main
git push -u origin main
```

---

## Étape 5 : Déployer sur Streamlit Cloud (2 min)

1. **Aller sur:** https://share.streamlit.io
2. **Se connecter** avec GitHub
3. **Cliquer sur** "New app"
4. **Configurer:**
   - **Repository:** `VOTRE_USERNAME/nikaia-dashboard`
   - **Branch:** `main`
   - **Main file:** `main.py`

5. **Cliquer sur "Advanced settings"**
6. **Ajouter ces secrets:**

```toml
SUPABASE_URL = "https://lwdpqfcnvacnciofqxfa.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3ZHBxZmNudmFjbmNpb2ZxeGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NzA5NjAsImV4cCI6MjA3ODQ0Njk2MH0.UqVnpZh6pa1aZiy0Kw-R6V8271xVCs-muhvVt4tVusM"
```

7. **Cliquer sur "Deploy"** 🚀

**Attendre 2-3 minutes...**

---

## ✅ C'est prêt !

Votre app sera disponible à :
```
https://votre-app.streamlit.app
```

**Testez immédiatement:**
- Connectez-vous avec un email que vous avez créé
- Créez votre premier projet
- Ajoutez des tâches

---

## 🎯 Premiers pas

1. **Se connecter** avec votre email manager
2. **Créer un projet** (Projects page)
3. **Ajouter un sous-projet**
4. **Créer des tâches** avec dates de début/fin
5. **Voir le Gantt** dans Timeline !

---

## 🔄 Pour mettre à jour l'app

```bash
git add .
git commit -m "Description des changements"
git push
```

L'app se redéploie automatiquement en ~2 minutes !

---

## 📱 Partager avec l'équipe

```
Bonjour l'équipe,

Notre nouveau Nikaia Dashboard est en ligne ! 🎉

🔗 Lien : https://votre-app.streamlit.app
📧 Connexion : Utilisez votre email (@nikaia.com)

Fonctionnalités :
✅ Dashboard KPIs
✅ Gestion de projets
✅ Tableau Kanban
✅ Timeline Gantt

Tout est en anglais !
```

---

**Besoin d'aide ?** Consultez [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) pour plus de détails.
