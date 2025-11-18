# 🚀 Installation Rapide - Nikaia Dashboard

Guide pas-à-pas pour débutants complets.

---

## ✅ CHECKLIST PRÉ-INSTALLATION

- [ ] Python 3.10+ installé ([télécharger](https://www.python.org/downloads/))
- [ ] Compte Supabase créé ([inscription gratuite](https://supabase.com))
- [ ] Projet Supabase créé
- [ ] Fichiers du projet téléchargés/clonés

---

## 📋 ÉTAPES D'INSTALLATION

### 1️⃣ Configuration Supabase (5 min)

#### A. Créer les Tables

1. Ouvrez votre projet Supabase
2. Cliquez sur **SQL Editor** (icône dans le menu gauche)
3. Cliquez sur **New query**
4. Ouvrez le fichier `schema.sql` de ce projet
5. **Copiez tout le contenu** (Ctrl+A puis Ctrl+C)
6. **Collez** dans l'éditeur SQL Supabase
7. Cliquez sur **Run** (ou F5)
8. ✅ Vérifiez le message de succès

#### B. Insérer les Données de Test

1. Dans le même **SQL Editor**
2. Cliquez sur **New query**
3. Ouvrez le fichier `test_data.sql`
4. **Copiez tout le contenu**
5. **Collez** dans l'éditeur SQL
6. Cliquez sur **Run**
7. ✅ Vérifiez les messages de succès

#### C. Récupérer les Clés API

1. Dans Supabase, cliquez sur **Settings** (⚙️)
2. Cliquez sur **API**
3. Notez :
   - **Project URL** : `https://xxx.supabase.co`
   - **anon public key** : `eyJ...` (longue clé)

---

### 2️⃣ Configuration Python (3 min)

#### A. Ouvrir le Terminal

**Windows :**
- Appuyez sur `Win + R`
- Tapez `cmd` et appuyez sur Entrée
- Naviguez vers le dossier : `cd "C:\...\dashboard-nikaia"`

**macOS/Linux :**
- Ouvrez Terminal
- Naviguez vers le dossier : `cd ~/path/to/dashboard-nikaia`

#### B. Créer un Environnement Virtuel (Recommandé)

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

Vous devriez voir `(venv)` au début de votre ligne de commande.

#### C. Installer les Dépendances

```bash
pip install -r requirements.txt
```

Attendez que toutes les dépendances soient installées (1-2 min).

---

### 3️⃣ Configuration des Variables d'Environnement (1 min)

Le fichier `.env` est déjà créé avec vos clés Supabase.

**Si vous devez le modifier :**

1. Ouvrez le fichier `.env` avec un éditeur de texte
2. Vérifiez que `SUPABASE_URL` et `SUPABASE_KEY` sont corrects
3. Sauvegardez et fermez

---

### 4️⃣ Lancement de l'Application (30 sec)

```bash
streamlit run main.py
```

L'application s'ouvre automatiquement dans votre navigateur à :
```
http://localhost:8501
```

**Si ça ne s'ouvre pas automatiquement :**
- Ouvrez manuellement votre navigateur
- Allez à : `http://localhost:8501`

---

### 5️⃣ Connexion (10 sec)

Sur la page de login, utilisez l'un des comptes de test :

| Email | Rôle |
|-------|------|
| `alice@biotech.fr` | Manager (tous droits) |
| `bob@biotech.fr` | Contributor |
| `charlie@biotech.fr` | Contributor |
| `diana@biotech.fr` | Viewer (lecture seule) |

**Pas de mot de passe nécessaire** - juste l'email !

---

## 🎉 C'EST PARTI !

Vous devriez maintenant voir le dashboard fonctionnel avec :
- ✅ 1 projet (YK725 Development)
- ✅ 1 sous-projet (Tests In Vitro)
- ✅ 3 tâches avec différents statuts
- ✅ 3 commentaires

---

## 🐛 Problèmes Courants

### ❌ "Python n'est pas reconnu..."

**Solution :**
- Réinstallez Python en cochant "Add to PATH"
- Redémarrez votre terminal

### ❌ "Module 'streamlit' not found"

**Solution :**
```bash
# Vérifiez que vous êtes dans le bon dossier
cd path/to/dashboard-nikaia

# Réinstallez les dépendances
pip install -r requirements.txt
```

### ❌ "Erreur de connexion Supabase"

**Solution :**
1. Vérifiez que `.env` existe et contient les bonnes clés
2. Vérifiez que votre projet Supabase est actif
3. Vérifiez que `schema.sql` a bien été exécuté

### ❌ "Port 8501 already in use"

**Solution :**
```bash
# Utilisez un autre port
streamlit run main.py --server.port 8502
```

### ❌ "Utilisateur introuvable"

**Solution :**
1. Vérifiez que `test_data.sql` a été exécuté
2. Dans Supabase, allez dans **Table Editor** → **users**
3. Vérifiez que 4 utilisateurs existent

---

## 📞 Besoin d'Aide ?

**Ordre de débogage :**

1. **Vérifiez les logs** : Les erreurs s'affichent dans le terminal
2. **Vérifiez Supabase** : Allez dans Table Editor pour voir les données
3. **Réessayez** : Relancez `streamlit run main.py`
4. **Lisez le README.md** : Section Troubleshooting complète

---

## 🎯 Prochaines Étapes

Une fois que tout fonctionne :

1. **Explorez l'application** :
   - Dashboard : Vue d'ensemble
   - Projets : Créez votre premier projet
   - Tâches : Ajoutez des tâches
   - Kanban : Déplacez les tâches

2. **Créez vos propres données** :
   - Créez un utilisateur avec votre email
   - Créez un nouveau projet
   - Ajoutez des sous-projets et tâches

3. **Personnalisez** :
   - Modifiez les couleurs dans `.streamlit/config.toml`
   - Ajoutez de nouveaux utilisateurs dans Supabase

---

## ✨ Félicitations !

Vous avez maintenant un dashboard collaboratif production-ready ! 🎊

**Bon usage !** 🧬🚀
