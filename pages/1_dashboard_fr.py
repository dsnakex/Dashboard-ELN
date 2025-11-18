"""
Dashboard Page - KPIs and Statistics
Vue d'ensemble des projets, tâches et statistiques.
"""

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
from utils.auth import is_authenticated, get_current_user, logout_user, get_role_badge
from utils.crud import (
    get_dashboard_stats,
    get_all_projects,
    get_all_tasks,
    get_tasks_by_assignee
)

# Page config
st.set_page_config(
    page_title="Dashboard - Nikaia",
    page_icon="📊",
    layout="wide"
)

# Auth check
if not is_authenticated():
    st.warning("⚠️ Veuillez vous connecter")
    st.stop()


def show_sidebar():
    """Display sidebar navigation."""
    user = get_current_user()

    with st.sidebar:
        st.markdown("### 🧬 Nikaia Dashboard")
        st.markdown("---")

        if user:
            st.markdown(f"**👤 {user['name']}**")
            st.markdown(get_role_badge(user['role']), unsafe_allow_html=True)
            st.markdown(f"📧 {user['email']}")
            st.markdown("---")

            st.markdown("### 📍 Navigation")
            st.page_link("main.py", label="🏠 Accueil", icon="🏠")
            st.page_link("pages/1_dashboard.py", label="📊 Dashboard", icon="📊")
            st.page_link("pages/2_projects.py", label="📁 Projets", icon="📁")
            st.page_link("pages/3_tasks.py", label="✅ Tâches", icon="✅")
            st.page_link("pages/4_kanban.py", label="📋 Kanban", icon="📋")

            st.markdown("---")

            if st.button("🚪 Déconnexion", use_container_width=True):
                logout_user()
                st.rerun()


def show_kpi_cards(stats):
    """Display KPI cards."""

    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.metric(
            label="📁 Projets Actifs",
            value=stats.get('active_projects', 0),
            delta=f"{stats.get('total_projects', 0)} total"
        )

    with col2:
        st.metric(
            label="✅ Tâches Complétées",
            value=stats.get('completed_tasks', 0),
            delta=f"{stats.get('completion_rate', 0):.1f}% complétées"
        )

    with col3:
        st.metric(
            label="🔄 Tâches En Cours",
            value=stats.get('in_progress_tasks', 0),
            delta=f"{stats.get('todo_tasks', 0)} à faire"
        )

    with col4:
        st.metric(
            label="⚠️ Tâches En Retard",
            value=stats.get('overdue_tasks', 0),
            delta=f"{stats.get('urgent_priority_tasks', 0)} urgentes",
            delta_color="inverse"
        )


def show_project_status_chart(projects):
    """Display project status distribution chart."""

    if not projects:
        st.info("Aucun projet à afficher")
        return

    # Count projects by status
    status_counts = {}
    for project in projects:
        status = project.get('status', 'unknown')
        status_counts[status] = status_counts.get(status, 0) + 1

    # Create dataframe
    df = pd.DataFrame(list(status_counts.items()), columns=['Status', 'Count'])

    # Status labels in French
    status_labels = {
        'planning': 'Planification',
        'active': 'Actif',
        'on-hold': 'En attente',
        'completed': 'Terminé',
        'archived': 'Archivé'
    }
    df['Status'] = df['Status'].map(status_labels)

    # Create pie chart
    fig = px.pie(
        df,
        values='Count',
        names='Status',
        title='Répartition des Projets par Statut',
        color_discrete_sequence=px.colors.qualitative.Set3
    )

    fig.update_traces(textposition='inside', textinfo='percent+label')
    fig.update_layout(showlegend=True, height=400)

    st.plotly_chart(fig, use_container_width=True)


def show_task_status_chart(tasks):
    """Display task status distribution chart."""

    if not tasks:
        st.info("Aucune tâche à afficher")
        return

    # Count tasks by status
    status_counts = {}
    for task in tasks:
        status = task.get('status', 'unknown')
        status_counts[status] = status_counts.get(status, 0) + 1

    # Create dataframe
    df = pd.DataFrame(list(status_counts.items()), columns=['Status', 'Count'])

    # Status labels
    status_labels = {
        'todo': 'À faire',
        'in-progress': 'En cours',
        'review': 'Revue',
        'done': 'Terminé'
    }
    df['Status'] = df['Status'].map(status_labels)

    # Colors
    colors = {
        'À faire': '#FF6B6B',
        'En cours': '#4ECDC4',
        'Revue': '#FFE66D',
        'Terminé': '#95E1D3'
    }

    # Create bar chart
    fig = px.bar(
        df,
        x='Status',
        y='Count',
        title='Tâches par Statut',
        color='Status',
        color_discrete_map=colors
    )

    fig.update_layout(showlegend=False, height=400)
    fig.update_traces(texttemplate='%{y}', textposition='outside')

    st.plotly_chart(fig, use_container_width=True)


def show_priority_distribution(tasks):
    """Display task priority distribution."""

    if not tasks:
        st.info("Aucune tâche à afficher")
        return

    # Count tasks by priority
    priority_counts = {}
    for task in tasks:
        priority = task.get('priority', 'medium')
        priority_counts[priority] = priority_counts.get(priority, 0) + 1

    # Create dataframe
    df = pd.DataFrame(list(priority_counts.items()), columns=['Priority', 'Count'])

    # Priority labels
    priority_labels = {
        'low': 'Basse',
        'medium': 'Moyenne',
        'high': 'Haute',
        'urgent': 'Urgente'
    }
    df['Priority'] = df['Priority'].map(priority_labels)

    # Sort by priority level
    priority_order = ['Basse', 'Moyenne', 'Haute', 'Urgente']
    df['Priority'] = pd.Categorical(df['Priority'], categories=priority_order, ordered=True)
    df = df.sort_values('Priority')

    # Colors
    colors = ['#95E1D3', '#4ECDC4', '#FFE66D', '#FF6B6B']

    # Create bar chart
    fig = go.Figure(data=[
        go.Bar(
            x=df['Priority'],
            y=df['Count'],
            marker_color=colors,
            text=df['Count'],
            textposition='outside'
        )
    ])

    fig.update_layout(
        title='Répartition par Priorité',
        showlegend=False,
        height=400,
        xaxis_title='',
        yaxis_title='Nombre de tâches'
    )

    st.plotly_chart(fig, use_container_width=True)


def show_my_tasks_summary(user):
    """Display current user's task summary."""

    my_tasks = get_tasks_by_assignee(user['id'])

    if not my_tasks:
        st.info("Aucune tâche assignée")
        return

    st.markdown("### 📌 Mes Tâches")

    # Filter by status
    todo = [t for t in my_tasks if t['status'] == 'todo']
    in_progress = [t for t in my_tasks if t['status'] == 'in-progress']
    review = [t for t in my_tasks if t['status'] == 'review']

    col1, col2, col3 = st.columns(3)

    with col1:
        st.markdown(f"**À faire:** {len(todo)}")
        for task in todo[:3]:
            st.markdown(f"- {task['title']}")
        if len(todo) > 3:
            st.markdown(f"*... et {len(todo) - 3} autres*")

    with col2:
        st.markdown(f"**En cours:** {len(in_progress)}")
        for task in in_progress[:3]:
            st.markdown(f"- {task['title']}")
        if len(in_progress) > 3:
            st.markdown(f"*... et {len(in_progress) - 3} autres*")

    with col3:
        st.markdown(f"**En revue:** {len(review)}")
        for task in review[:3]:
            st.markdown(f"- {task['title']}")
        if len(review) > 3:
            st.markdown(f"*... et {len(review) - 3} autres*")


def show_upcoming_deadlines(tasks):
    """Display upcoming task deadlines."""

    if not tasks:
        return

    st.markdown("### 📅 Deadlines Prochaines (7 jours)")

    today = datetime.now().date()
    next_week = today + timedelta(days=7)

    # Filter tasks with upcoming deadlines
    upcoming = []
    for task in tasks:
        if task.get('due_date') and task['status'] != 'done':
            due_date = datetime.fromisoformat(task['due_date'].replace('Z', '+00:00')).date()
            if today <= due_date <= next_week:
                upcoming.append({
                    'title': task['title'],
                    'due_date': due_date,
                    'priority': task.get('priority', 'medium'),
                    'assignee': task.get('assignee', {}).get('name', 'Non assigné') if task.get('assignee') else 'Non assigné'
                })

    if not upcoming:
        st.info("Aucune deadline dans les 7 prochains jours")
        return

    # Sort by due date
    upcoming.sort(key=lambda x: x['due_date'])

    # Display as table
    df = pd.DataFrame(upcoming)
    df['due_date'] = df['due_date'].astype(str)

    st.dataframe(
        df,
        column_config={
            'title': 'Tâche',
            'due_date': 'Date limite',
            'priority': 'Priorité',
            'assignee': 'Assigné à'
        },
        hide_index=True,
        use_container_width=True
    )


def main():
    """Main dashboard page."""

    show_sidebar()

    user = get_current_user()

    # Header
    st.title("📊 Dashboard")
    st.markdown(f"**Bienvenue, {user['name']}!** Voici un aperçu de vos projets et tâches.")
    st.markdown("---")

    # Refresh button
    if st.button("🔄 Actualiser", key="refresh_dashboard"):
        st.rerun()

    # Get data
    stats = get_dashboard_stats()
    projects = get_all_projects()
    tasks = get_all_tasks()

    # KPI Cards
    show_kpi_cards(stats)

    st.markdown("---")

    # Charts row 1
    col1, col2 = st.columns(2)

    with col1:
        show_project_status_chart(projects)

    with col2:
        show_task_status_chart(tasks)

    st.markdown("---")

    # Charts row 2
    col1, col2 = st.columns(2)

    with col1:
        show_priority_distribution(tasks)

    with col2:
        st.markdown("### 📊 Statistiques Générales")
        st.markdown(f"**Total projets:** {stats.get('total_projects', 0)}")
        st.markdown(f"**Total sous-projets:** {stats.get('total_subprojects', 0)}")
        st.markdown(f"**Total tâches:** {stats.get('total_tasks', 0)}")
        st.markdown(f"**Taux de complétion:** {stats.get('completion_rate', 0):.1f}%")
        st.markdown(f"**Tâches haute priorité:** {stats.get('high_priority_tasks', 0)}")
        st.markdown(f"**Tâches urgentes:** {stats.get('urgent_priority_tasks', 0)}")

        # Progress bar
        completion = stats.get('completion_rate', 0) / 100
        st.progress(completion, text=f"Progression globale: {stats.get('completion_rate', 0):.1f}%")

    st.markdown("---")

    # My tasks summary
    show_my_tasks_summary(user)

    st.markdown("---")

    # Upcoming deadlines
    show_upcoming_deadlines(tasks)


if __name__ == "__main__":
    main()
