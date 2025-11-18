# 🚀 Démarrage Rapide - Dashboard Nikaia (CORRIGÉ)

## ⚡ Actions Immédiates (5 minutes)

### ✅ ÉTAPE 1: Exécuter la Migration SQL

1. Ouvrez [votre projet Supabase](https://app.supabase.com)
2. Cliquez sur "SQL Editor"
3. Cliquez sur "New query"
4. Copiez le contenu du fichier `migration_add_task_dates.sql` ci-dessous:

```sql
-- Add start_date column to tasks table
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS start_date DATE;

-- Update existing tasks with a default start_date
UPDATE tasks
SET start_date = COALESCE(due_date - INTERVAL '7 days', CURRENT_DATE)
WHERE start_date IS NULL;
```

5. Collez dans l'éditeur SQL
6. Cliquez sur "Run"
7. ✅ Vérifiez le message de succès

---

### ✅ ÉTAPE 2: Lancer l'Application

Ouvrez votre terminal/CMD et exécutez:

```bash
cd "C:\Users\dpasc\OneDrive\Documents\Application Development\dashboard-nikaia"
streamlit run main.py
```

---

### ✅ ÉTAPE 3: Login

1. Le navigateur s'ouvre sur `http://localhost:8501`
2. Entrez: `alice@biotech.fr`
3. Cliquez "Se connecter"

---

## 🎉 C'EST FAIT !

Vous devriez maintenant voir:

### Sidebar Navigation (6 boutons):
```
🧬 Nikaia Dashboard
─────────────────────
👤 Alice Martin
👔 Manager
📧 alice@biotech.fr
─────────────────────
📍 Navigation

[🏠 Accueil]
[📊 Dashboard]
[📁 Projets]
[✅ Tâches]
[📋 Kanban]
[📅 Timeline]  ← NOUVEAU!
─────────────────────
[🚪 Déconnexion]
```

---

## 🆕 Nouvelle Fonctionnalité: Timeline / Gantt

### Test Rapide:

**1. Créer une tâche avec dates:**
```
1. Cliquez sur "✅ Tâches"
2. Cliquez "Créer une Nouvelle Tâche"
3. Remplissez:
   - Titre: "Test Timeline"
   - Sous-projet: Tests In Vitro
   - Assigné: Alice Martin
   - Statut: En cours
   - Priorité: Moyenne
   - Date de début: Aujourd'hui
   - Date de fin: Dans 7 jours
4. Cliquez "Créer la Tâche"
```

**2. Voir dans la Timeline:**
```
1. Cliquez sur "📅 Timeline"
2. ✅ Votre tâche apparaît dans le Gantt chart!
3. Passez la souris sur la barre pour voir les détails
```

---

## 🎯 Fonctionnalités Timeline

### Diagramme de Gantt Interactif:
- ✅ Barres colorées par priorité
- ✅ Dates de début et fin visibles
- ✅ Durée des tâches calculée
- ✅ Hover pour détails

### 3 Vues:
- 📁 **Par Projet** - Voir toutes les tâches groupées par projet
- 👤 **Par Assigné** - Voir la charge de travail par personne
- 📋 **Par Tâche** - Vue complète de toutes les tâches

### Filtres:
- 📋 Par statut (Todo, En cours, Review, Done)
- 🎯 Par priorité (Basse, Moyenne, Haute, Urgente)

### Vue Calendrier:
- 📅 Tâches groupées par semaine
- ⏰ Vision chronologique

---

## ✅ Vérification Rapide

Si tout fonctionne, vous devriez pouvoir:

- [x] Login avec alice@biotech.fr
- [x] Voir 6 boutons de navigation dans la sidebar
- [x] Cliquer sur chaque page sans erreur
- [x] Créer une tâche avec dates de début et fin
- [x] Voir cette tâche dans la Timeline/Gantt
- [x] Changer les vues (Par Projet, Par Assigné, Par Tâche)
- [x] Utiliser les filtres

---

## 🐛 Si Ça Ne Marche Pas

### Erreur: "column start_date does not exist"

```sql
-- Exécutez dans Supabase SQL Editor:
ALTER TABLE tasks ADD COLUMN start_date DATE;
```

### Erreur: "st.switch_page not found"

```bash
# Mettez à jour Streamlit:
pip install --upgrade streamlit==1.28.1

# Relancez:
streamlit run main.py
```

### Navigation buttons ne font rien

```bash
# Arrêtez complètement (Ctrl+C)
# Relancez:
streamlit run main.py
```

---

## 📊 Données de Test

Les tâches de test existantes ont maintenant des dates:

1. **Préparer lignées cellulaires**
   - Start: ~ 8 jours avant échéance
   - End: 15/02/2025

2. **Réaliser tests MTT**
   - Start: ~ 8 jours avant échéance
   - End: 01/03/2025

3. **Analyser Western Blot**
   - Start: ~ 8 jours avant échéance
   - End: 20/02/2025

Elles apparaissent automatiquement dans la Timeline!

---

## 🎓 Utilisation Avancée

### Créer un Planning Complet:

1. **Définir les projets** (page Projets)
2. **Créer des sous-projets** (dans chaque projet)
3. **Ajouter des tâches avec dates** (page Tâches)
4. **Visualiser la timeline** (page Timeline)
5. **Suivre l'avancement** (page Kanban + Dashboard)

### Bonnes Pratiques:

✅ **Date de début toujours < Date de fin**
✅ **Utilisez des dates réalistes**
✅ **Groupez les tâches par sous-projet**
✅ **Assignez chaque tâche à une personne**
✅ **Utilisez les priorités correctement**

---

## 📞 Support

**Fichiers de référence:**
- `CORRECTION_RAPIDE.md` - Détails des corrections
- `README.md` - Documentation complète
- `migration_add_task_dates.sql` - Migration SQL

---

## 🎊 Félicitations!

Votre dashboard Nikaia est maintenant opérationnel avec la vue Timeline/Gantt ! 🚀

**Profitez-en pour planifier vos projets R&D ! 🧬**
