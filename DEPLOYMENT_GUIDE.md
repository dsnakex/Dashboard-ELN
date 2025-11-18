# 🚀 Deployment Guide - Nikaia Dashboard

## 📋 Pre-Deployment Checklist

### 1. Clean Database (Remove Test Data)

**Steps:**

1. Open Supabase Dashboard: https://app.supabase.com
2. Navigate to your project
3. Go to **SQL Editor**
4. Copy and paste the content of [`scripts/reset_database.sql`](scripts/reset_database.sql)
5. Click **Run**
6. Verify all tables show `count = 0`

### 2. Create Real Users

**Steps:**

1. Edit [`scripts/create_real_users.sql`](scripts/create_real_users.sql)
2. Replace example emails and names with your actual team members:
   ```sql
   -- Example:
   INSERT INTO users (email, name, role) VALUES
   ('alice@nikaia.com', 'Alice Martin', 'manager'),
   ('bob@nikaia.com', 'Bob Durand', 'contributor'),
   ('charlie@nikaia.com', 'Charlie Dubois', 'contributor');
   ```
3. In Supabase SQL Editor, run the modified script
4. Verify users were created correctly

**User Roles:**
- **manager**: Full access (create, edit, delete all)
- **contributor**: Can create and manage own projects/tasks
- **viewer**: Read-only access

### 3. Verify Database Migration

Make sure the `start_date` column exists in the `tasks` table (required for Timeline feature):

1. In Supabase SQL Editor, run:
   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'tasks';
   ```
2. Check that `start_date` column exists
3. If not, run [`migration_add_task_dates.sql`](migration_add_task_dates.sql)

---

## 🌐 Deploy to Streamlit Cloud

### Step 1: Push to GitHub

**Initialize Git repository:**

```bash
cd "c:\Users\dpasc\OneDrive\Documents\Application Development\dashboard-nikaia"

# Initialize git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - Nikaia Dashboard v1.0 (English)"
```

**Create GitHub repository:**

1. Go to https://github.com/new
2. Create a new repository named `nikaia-dashboard`
3. **Do NOT** initialize with README (we already have files)
4. Copy the repository URL

**Push to GitHub:**

```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/nikaia-dashboard.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Streamlit Cloud

1. **Go to Streamlit Cloud:** https://share.streamlit.io
2. **Sign in** with GitHub
3. Click **New app**
4. **Configure:**
   - Repository: `YOUR_USERNAME/nikaia-dashboard`
   - Branch: `main`
   - Main file path: `main.py`
5. Click **Advanced settings**
6. **Add Secrets** (click "Add secrets"):

```toml
# Copy these values from your .env file
SUPABASE_URL = "https://lwdpqfcnvacnciofqxfa.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3ZHBxZmNudmFjbmNpb2ZxeGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NzA5NjAsImV4cCI6MjA3ODQ0Njk2MH0.UqVnpZh6pa1aZiy0Kw-R6V8271xVCs-muhvVt4tVusM"
```

7. Click **Deploy**
8. Wait 2-5 minutes for deployment

### Step 3: Access Your App

Once deployed, you'll get a URL like:
```
https://your-app-name.streamlit.app
```

Share this URL with your team!

---

## 🔐 Security Recommendations

### 1. Environment Variables

**Never commit sensitive data to Git!**

Your `.gitignore` already excludes:
- `.env` file
- `__pycache__/`
- `*.pyc`

Verify:
```bash
cat .gitignore
```

### 2. Supabase RLS Policies

Your database already has Row Level Security (RLS) enabled. Verify in Supabase:

1. Go to **Authentication** → **Policies**
2. Check that RLS is enabled for all tables
3. Review policies for `users`, `projects`, `tasks`, etc.

### 3. API Keys

**Current setup:**
- ✅ Using `anon` key (safe for client-side)
- ✅ RLS policies protect data
- ✅ Keys stored in secrets (not in code)

**Do NOT share:**
- `service_role` key (has admin access)
- `.env` file

---

## 📊 Post-Deployment Testing

### Test Checklist

1. **Login:**
   - [ ] Can log in with real user email
   - [ ] Correct role badge displayed
   - [ ] Redirect to home page works

2. **Dashboard:**
   - [ ] KPI cards display correctly
   - [ ] Charts load (empty initially)
   - [ ] No errors in console

3. **Projects:**
   - [ ] Can create new project
   - [ ] Can edit project
   - [ ] Can create subproject
   - [ ] Permissions work (contributors can't delete others' projects)

4. **Tasks:**
   - [ ] Can create task with dates
   - [ ] Can edit task
   - [ ] Can add comments
   - [ ] Filters work

5. **Kanban:**
   - [ ] Columns display correctly
   - [ ] Can move tasks between columns
   - [ ] Color coding works

6. **Timeline:**
   - [ ] Gantt chart displays
   - [ ] All view modes work (By Project, By Assignee, By Task)
   - [ ] Filters work

---

## 🔄 Update Deployment

When you make changes:

```bash
# Add changes
git add .

# Commit changes
git commit -m "Description of changes"

# Push to GitHub
git push

# Streamlit Cloud will auto-deploy in ~2 minutes
```

---

## 🐛 Troubleshooting

### App won't start

**Check Streamlit Cloud logs:**
1. Go to https://share.streamlit.io
2. Click on your app
3. View logs for errors

**Common issues:**
- Missing secrets (SUPABASE_URL, SUPABASE_KEY)
- Wrong file path (should be `main.py`)
- Missing dependencies in `requirements.txt`

### Database connection error

**Verify Supabase credentials:**
```python
# Test locally first
streamlit run main.py
```

**Check Supabase:**
1. Project is active
2. API keys are correct
3. RLS policies are enabled

### Tasks don't show in Timeline

**Make sure:**
- Tasks have `start_date` column in database
- Migration script was run
- Tasks have both start and end dates

---

## 📱 Mobile Access

The dashboard is responsive and works on:
- ✅ Desktop (Chrome, Firefox, Safari, Edge)
- ✅ Tablet (iPad, Android tablets)
- ✅ Mobile (iOS, Android)

**Recommendation:** Use desktop/tablet for best experience with charts.

---

## 🎯 Next Steps After Deployment

1. **Create your first project:**
   - Log in as Manager
   - Go to Projects page
   - Create a project for your biotech research

2. **Create subprojects:**
   - Click on project
   - Add subprojects for different phases

3. **Add tasks:**
   - Go to Tasks page
   - Create tasks with start/end dates
   - Assign to team members

4. **Track progress:**
   - Use Dashboard to monitor KPIs
   - Use Kanban to manage workflow
   - Use Timeline to see project schedule

---

## 📧 Team Onboarding

**Share with your team:**

```
Hello Team,

Our new Nikaia Dashboard is now live!

🔗 URL: https://your-app-name.streamlit.app

📧 Login: Use your work email (alice@nikaia.com, bob@nikaia.com, etc.)

📚 Features:
- 📊 Dashboard with real-time KPIs
- 📁 Project & Task management
- 📋 Kanban board
- 📅 Timeline & Gantt chart

All in English! 🌍

Best,
Your Name
```

---

## ✅ Deployment Complete!

Your Nikaia Dashboard is now:
- 🌐 Live on the internet
- 🔒 Secure with Supabase RLS
- 📱 Accessible from anywhere
- 🇬🇧 100% in English
- 🚀 Ready for real projects

**Questions?** Check the logs or contact support.

---

**Last Updated:** 2025-11-14
**Version:** 1.0
**Status:** ✅ Production Ready
