# 🧬 Nikaia Dashboard - Production Ready

## 📊 Full-Featured Collaborative Dashboard for Biotech Research

**Built with:** Streamlit + Supabase + PostgreSQL
**Language:** 100% English
**Status:** ✅ Production Ready

---

## ✨ Features

### 📊 Dashboard
- Real-time KPI cards (Active Projects, Completed Tasks, etc.)
- Interactive Plotly charts
- Project and task distribution visualization
- Upcoming deadlines tracking

### 📁 Project Management
- Create and manage projects with status tracking
- Subproject organization
- Project lead assignment
- Color-coded status indicators
- Filter by status

### ✅ Task Management
- Complete CRUD operations
- Task assignment and tracking
- Priority levels (Low, Medium, High, Urgent)
- Status workflow (Todo → In Progress → Review → Done)
- Comments system
- Start and due dates
- Estimated hours tracking
- Multiple view modes (All Tasks, My Tasks, Table View)
- Search and filter functionality

### 📋 Kanban Board
- Visual workflow management
- 4 columns: Todo, In Progress, In Review, Done
- Drag-and-drop task movement (via arrow buttons)
- Priority-based color coding
- Real-time statistics
- Filter by priority and assignee

### 📅 Timeline & Gantt Chart
- Interactive Gantt chart (Plotly)
- 3 view modes: By Project, By Assignee, By Task
- Timeline statistics (Total Tasks, Average Duration, Overdue, Urgent)
- Calendar view with weekly grouping
- Filter by status and priority
- Visual project timeline

---

## 🔐 Role-Based Access Control (RBAC)

### Manager
- Full access to all features
- Can create, edit, and delete all projects/tasks
- Can assign tasks to anyone

### Contributor
- Can create and manage own projects/tasks
- Can edit assigned tasks
- Can add comments

### Viewer
- Read-only access
- Can view all projects, tasks, and charts
- Cannot create or modify anything

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Supabase account
- Git & GitHub account

### Local Development

1. **Clone the repository:**
```bash
git clone https://github.com/YOUR_USERNAME/nikaia-dashboard.git
cd nikaia-dashboard
```

2. **Create virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Configure environment:**
- Copy `.env.template` to `.env`
- Add your Supabase credentials

5. **Run the app:**
```bash
streamlit run main.py
```

---

## 🌐 Deploy to Production

**Full deployment guide:** See [QUICK_DEPLOY.md](QUICK_DEPLOY.md)

### Quick Steps:

1. **Clean database** (remove test data)
2. **Create real users** in Supabase
3. **Push to GitHub**
4. **Deploy on Streamlit Cloud**
5. **Add secrets** (SUPABASE_URL, SUPABASE_KEY)

**Time:** ~5 minutes

---

## 📦 Project Structure

```
dashboard-nikaia/
├── main.py                  # Main app (login/register/home)
├── pages/
│   ├── 1_dashboard.py      # Dashboard with KPIs
│   ├── 2_projects.py       # Project management
│   ├── 3_tasks.py          # Task management
│   ├── 4_kanban.py         # Kanban board
│   └── 5_timeline.py       # Timeline & Gantt
├── utils/
│   ├── supabase_client.py  # Database connection
│   ├── auth.py             # Authentication logic
│   └── crud.py             # Database operations
├── scripts/
│   ├── reset_database.sql  # Clean test data
│   └── create_real_users.sql # Create production users
├── schema.sql              # Database schema
├── requirements.txt        # Python dependencies
└── .env                    # Environment variables (not in Git)
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file with:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
APP_NAME=Nikaia Dashboard
DEBUG_MODE=False
```

### Streamlit Cloud Secrets

Add in Streamlit Cloud settings:

```toml
SUPABASE_URL = "your_supabase_url"
SUPABASE_KEY = "your_supabase_anon_key"
```

---

## 🗄️ Database Schema

5 main tables with Row Level Security (RLS):

1. **users** - User accounts with roles
2. **projects** - Research projects
3. **subprojects** - Project phases/components
4. **tasks** - Work items with assignments
5. **comments** - Task discussions

**All tables** have RLS policies for security.

---

## 🔒 Security

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Environment variables for sensitive data
- ✅ `.gitignore` excludes `.env` files
- ✅ Supabase `anon` key (safe for client-side)
- ✅ Role-based permissions enforced
- ✅ XSS protection enabled

---

## 📱 Compatibility

- ✅ Desktop (Chrome, Firefox, Safari, Edge)
- ✅ Tablet (iPad, Android)
- ✅ Mobile (iOS, Android)

**Recommended:** Desktop or tablet for optimal chart viewing.

---

## 🐛 Troubleshooting

### Common Issues

**App won't start:**
- Check Streamlit Cloud logs
- Verify secrets are set correctly
- Ensure `main.py` is the entry point

**Database connection error:**
- Verify Supabase credentials
- Check RLS policies are enabled
- Test locally first

**Tasks don't appear in Timeline:**
- Run migration script for `start_date` column
- Ensure tasks have both start and end dates

**Full troubleshooting guide:** [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

## 🔄 Updating the App

```bash
# Make changes
git add .
git commit -m "Description of changes"
git push

# Streamlit Cloud auto-deploys in ~2 minutes
```

---

## 📚 Documentation

- [QUICK_DEPLOY.md](QUICK_DEPLOY.md) - 5-minute deployment guide
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Detailed deployment instructions
- [FULL_ENGLISH_TRANSLATION_COMPLETE.md](FULL_ENGLISH_TRANSLATION_COMPLETE.md) - Translation reference
- [schema.sql](schema.sql) - Database schema
- [scripts/](scripts/) - SQL scripts for setup

---

## 🎯 Tech Stack

- **Frontend:** Streamlit 1.28.1
- **Backend:** Supabase (PostgreSQL)
- **Charts:** Plotly 5.17.0
- **Data:** Pandas 2.0.0
- **Auth:** Supabase Auth
- **Deployment:** Streamlit Cloud

---

## 📈 Performance

- Fast page loads with Streamlit caching
- Efficient database queries with Supabase
- Real-time updates
- Responsive charts

---

## 🤝 Contributing

This is a production dashboard. For feature requests or bug reports:
1. Create an issue
2. Describe the problem/feature
3. Include screenshots if applicable

---

## 📧 Support

For questions or issues:
- Check [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- Review Streamlit Cloud logs
- Contact your team lead

---

## 📝 License

Internal use only - Nikaia Biotech

---

## ✅ Production Checklist

Before going live:

- [ ] Database cleaned (test data removed)
- [ ] Real users created in Supabase
- [ ] Environment variables set in Streamlit Cloud
- [ ] App tested locally
- [ ] All features working (Dashboard, Projects, Tasks, Kanban, Timeline)
- [ ] Permissions tested (Manager, Contributor, Viewer)
- [ ] Team onboarded with access credentials

---

**Version:** 1.0
**Last Updated:** 2025-11-14
**Status:** ✅ Production Ready
**Language:** 100% English

---

🧬 **Nikaia Dashboard** - Streamline your biotech research workflow
