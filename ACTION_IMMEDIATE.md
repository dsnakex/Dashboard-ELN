# ⚡ ACTION IMMÉDIATE - Dashboard Nikaia

## 🔴 À FAIRE MAINTENANT (2 minutes)

### ÉTAPE 1: Migration SQL (30 secondes)

1. Ouvrez: https://app.supabase.com
2. Cliquez: SQL Editor
3. Copiez-collez ce code:

```sql
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS start_date DATE;

UPDATE tasks
SET start_date = COALESCE(due_date - INTERVAL '7 days', CURRENT_DATE)
WHERE start_date IS NULL;
```

4. Cliquez "Run"
5. ✅ Message de succès

---

### ÉTAPE 2: Lancer l'App (30 secondes)

Dans votre terminal actuel (celui où vous êtes):

```bash
streamlit run main.py
```

---

### ÉTAPE 3: Test (1 minute)

1. Le navigateur s'ouvre
2. Login: `alice@biotech.fr`
3. ✅ Vous voyez 6 boutons dans la sidebar:
   - 🏠 Accueil
   - 📊 Dashboard
   - 📁 Projets
   - ✅ Tâches
   - 📋 Kanban
   - 📅 Timeline ← NOUVEAU

4. Cliquez sur "📅 Timeline"
5. ✅ Vous voyez un diagramme de Gantt avec vos tâches!

---

## ✅ Si Ça Marche

**Félicitations ! Le dashboard est opérationnel !** 🎉

Vous pouvez maintenant:
- Créer des tâches avec dates de début et fin
- Visualiser la timeline de votre projet
- Utiliser les 3 vues (Projet/Assigné/Tâche)
- Filtrer par statut et priorité

---

## ❌ Si Erreur

### Erreur: "column start_date does not exist"

**Vous avez oublié l'ÉTAPE 1**

→ Retournez à l'ÉTAPE 1 et exécutez le SQL

---

### Erreur: "st.switch_page not found"

```bash
pip install --upgrade streamlit==1.28.1
streamlit run main.py
```

---

### Erreur: "ModuleNotFoundError"

```bash
pip install -r requirements.txt
streamlit run main.py
```

---

## 📋 Checklist Rapide

- [ ] Migration SQL exécutée dans Supabase
- [ ] Streamlit lancé (`streamlit run main.py`)
- [ ] Login avec alice@biotech.fr fonctionne
- [ ] Sidebar affiche 6 boutons
- [ ] Page Timeline accessible
- [ ] Tâches visibles dans le Gantt

---

## 🆘 Besoin d'Aide ?

**Lisez dans l'ordre:**

1. `CORRECTION_RAPIDE.md` - Détails du fix
2. `DEMARRAGE_RAPIDE.md` - Guide complet
3. `README.md` - Documentation

**Pour Claude Chat:**

Ouvrez `RESUME_POUR_CLAUDE_CHAT.md` et copiez-collez le contexte dans une nouvelle conversation sur claude.ai

---

## 🎯 Une Fois Que Ça Marche

**Test complet:**

1. **Créer une tâche:**
   - Tâches → Créer
   - Titre: "Test Gantt"
   - Dates: Aujourd'hui → Dans 1 semaine
   - Créer

2. **Voir dans Timeline:**
   - Timeline → Voir votre tâche
   - Changer de vue
   - Utiliser les filtres

3. **Suivre dans Dashboard:**
   - Dashboard → Voir les KPIs mis à jour

---

**C'EST TOUT ! Lancez `streamlit run main.py` maintenant ! ⚡**
