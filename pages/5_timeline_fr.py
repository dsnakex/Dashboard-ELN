"""
Timeline / Gantt Chart Page
Vue temporelle des tâches avec diagramme de Gantt interactif.
"""

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, date, timedelta
from utils.auth import is_authenticated, get_current_user, logout_user, get_role_badge
from utils.crud import get_all_tasks, get_all_projects, get_all_subprojects

# Page config
st.set_page_config(
    page_title="Timeline - Nikaia",
    page_icon="📅",
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

            if st.button("🏠 Accueil", key="nav_home", use_container_width=True):
                st.switch_page("main.py")
            if st.button("📊 Dashboard", key="nav_dashboard", use_container_width=True):
                st.switch_page("pages/1_dashboard.py")
            if st.button("📁 Projets", key="nav_projects", use_container_width=True):
                st.switch_page("pages/2_projects.py")
            if st.button("✅ Tâches", key="nav_tasks", use_container_width=True):
                st.switch_page("pages/3_tasks.py")
            if st.button("📋 Kanban", key="nav_kanban", use_container_width=True):
                st.switch_page("pages/4_kanban.py")
            if st.button("📅 Timeline", key="nav_timeline", use_container_width=True):
                st.switch_page("pages/5_timeline.py")

            st.markdown("---")

            if st.button("🚪 Déconnexion", use_container_width=True):
                logout_user()
                st.rerun()


def prepare_gantt_data(tasks):
    """
    Prepare task data for Gantt chart.

    Args:
        tasks: List of task dictionaries

    Returns:
        DataFrame ready for Plotly Gantt chart
    """
    gantt_data = []

    for task in tasks:
        # Extract dates
        start_date = task.get('start_date')
        due_date = task.get('due_date')

        # Skip tasks without dates
        if not start_date or not due_date:
            continue

        # Parse dates
        try:
            start = datetime.fromisoformat(start_date.replace('Z', '+00:00')).date()
            end = datetime.fromisoformat(due_date.replace('Z', '+00:00')).date()
        except:
            continue

        # Extract task info
        task_name = task.get('title', 'Sans titre')
        assignee_name = task.get('assignee', {}).get('name', 'Non assigné') if task.get('assignee') else 'Non assigné'
        priority = task.get('priority', 'medium')
        status = task.get('status', 'todo')

        # Get project and subproject names
        project_name = 'N/A'
        subproject_name = 'N/A'

        if task.get('subproject'):
            subproject_name = task['subproject'].get('name', 'N/A')
            if task['subproject'].get('project'):
                project_name = task['subproject']['project'].get('name', 'N/A')

        # Priority colors
        color_map = {
            'low': '#95E1D3',
            'medium': '#FFE66D',
            'high': '#FFB347',
            'urgent': '#FF6B6B'
        }

        gantt_data.append({
            'Task': task_name,
            'Start': start,
            'Finish': end,
            'Assignee': assignee_name,
            'Priority': priority,
            'Status': status,
            'Project': project_name,
            'Subproject': subproject_name,
            'Color': color_map.get(priority, '#95E1D3'),
            'Duration': (end - start).days
        })

    return pd.DataFrame(gantt_data)


def show_gantt_chart(df, view_mode='project'):
    """
    Display interactive Gantt chart using Plotly.

    Args:
        df: DataFrame with task data
        view_mode: 'project', 'assignee', or 'priority'
    """
    if df.empty:
        st.info("Aucune tâche avec dates à afficher")
        return

    # Sort by start date
    df = df.sort_values('Start')

    # Create Gantt chart based on view mode
    if view_mode == 'project':
        fig = px.timeline(
            df,
            x_start="Start",
            x_end="Finish",
            y="Project",
            color="Priority",
            hover_data=["Task", "Assignee", "Status", "Duration"],
            title="📅 Timeline par Projet",
            color_discrete_map={
                'low': '#95E1D3',
                'medium': '#FFE66D',
                'high': '#FFB347',
                'urgent': '#FF6B6B'
            }
        )

    elif view_mode == 'assignee':
        fig = px.timeline(
            df,
            x_start="Start",
            x_end="Finish",
            y="Assignee",
            color="Priority",
            hover_data=["Task", "Project", "Status", "Duration"],
            title="📅 Timeline par Assigné",
            color_discrete_map={
                'low': '#95E1D3',
                'medium': '#FFE66D',
                'high': '#FFB347',
                'urgent': '#FF6B6B'
            }
        )

    else:  # priority
        fig = px.timeline(
            df,
            x_start="Start",
            x_end="Finish",
            y="Task",
            color="Status",
            hover_data=["Assignee", "Project", "Priority", "Duration"],
            title="📅 Timeline par Tâche",
            color_discrete_map={
                'todo': '#FFEBEE',
                'in-progress': '#E3F2FD',
                'review': '#FFF9C4',
                'done': '#E8F5E9'
            }
        )

    # Update layout
    fig.update_layout(
        xaxis_title="Date",
        yaxis_title="",
        height=max(400, len(df) * 30),
        showlegend=True,
        hovermode='closest'
    )

    # Update x-axis to show dates properly
    fig.update_xaxes(
        tickformat="%d %b\n%Y",
        tickangle=0
    )

    st.plotly_chart(fig, use_container_width=True)


def show_timeline_stats(df):
    """Display statistics about the timeline."""

    if df.empty:
        return

    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.metric("📊 Total Tâches", len(df))

    with col2:
        avg_duration = df['Duration'].mean()
        st.metric("⏱️ Durée Moyenne", f"{avg_duration:.1f} jours")

    with col3:
        overdue = len(df[df['Finish'] < pd.Timestamp.now().date()])
        st.metric("⚠️ En Retard", overdue)

    with col4:
        urgent = len(df[df['Priority'] == 'urgent'])
        st.metric("🔴 Urgentes", urgent)


def show_task_calendar_view(df):
    """Display task calendar/schedule view."""

    if df.empty:
        st.info("Aucune tâche à afficher")
        return

    st.markdown("### 📆 Vue Calendrier")

    # Get date range
    min_date = df['Start'].min()
    max_date = df['Finish'].max()

    # Group tasks by week
    df['Week'] = pd.to_datetime(df['Start']).dt.to_period('W')

    for week, week_tasks in df.groupby('Week'):
        with st.expander(f"📅 Semaine du {week.start_time.strftime('%d/%m/%Y')}", expanded=False):
            for _, task in week_tasks.iterrows():
                priority_icons = {
                    'low': '🟢',
                    'medium': '🟡',
                    'high': '🟠',
                    'urgent': '🔴'
                }

                st.markdown(f"""
                    **{priority_icons.get(task['Priority'], '⚪')} {task['Task']}**
                    👤 {task['Assignee']} | 📁 {task['Project']} | 📅 {task['Start']} → {task['Finish']} ({task['Duration']} jours)
                """)


def main():
    """Main timeline page."""

    show_sidebar()

    user = get_current_user()

    # Header
    st.title("📅 Timeline & Gantt Chart")
    st.markdown("Vue temporelle de toutes vos tâches avec diagramme de Gantt interactif")
    st.markdown("---")

    # Refresh button
    col1, col2 = st.columns([6, 1])
    with col2:
        if st.button("🔄 Actualiser", use_container_width=True):
            st.rerun()

    # Get all tasks
    tasks = get_all_tasks()

    if not tasks:
        st.info("Aucune tâche à afficher. Créez des tâches depuis la page Tâches!")
        return

    # Prepare data
    df = prepare_gantt_data(tasks)

    if df.empty:
        st.warning("⚠️ Aucune tâche avec dates de début et de fin.")
        st.info("💡 Ajoutez des dates à vos tâches pour les voir apparaître dans la timeline.")
        return

    # Timeline statistics
    show_timeline_stats(df)

    st.markdown("---")

    # View mode selector
    col1, col2, col3 = st.columns(3)

    with col1:
        view_mode = st.selectbox(
            "Vue",
            options=['project', 'assignee', 'priority'],
            format_func=lambda x: {
                'project': '📁 Par Projet',
                'assignee': '👤 Par Assigné',
                'priority': '📋 Par Tâche'
            }[x]
        )

    with col2:
        filter_status = st.multiselect(
            "Filtrer par statut",
            options=['todo', 'in-progress', 'review', 'done'],
            default=['todo', 'in-progress', 'review'],
            format_func=lambda x: {
                'todo': '📋 À faire',
                'in-progress': '🔄 En cours',
                'review': '👁️ En revue',
                'done': '✅ Terminé'
            }[x]
        )

    with col3:
        filter_priority = st.multiselect(
            "Filtrer par priorité",
            options=['low', 'medium', 'high', 'urgent'],
            default=['low', 'medium', 'high', 'urgent'],
            format_func=lambda x: {
                'low': '🟢 Basse',
                'medium': '🟡 Moyenne',
                'high': '🟠 Haute',
                'urgent': '🔴 Urgente'
            }[x]
        )

    # Apply filters
    filtered_df = df[
        (df['Status'].isin(filter_status)) &
        (df['Priority'].isin(filter_priority))
    ]

    if filtered_df.empty:
        st.warning("Aucune tâche ne correspond aux filtres")
        return

    # Show Gantt chart
    show_gantt_chart(filtered_df, view_mode)

    st.markdown("---")

    # Show calendar view
    show_task_calendar_view(filtered_df)

    # Instructions
    st.markdown("---")
    with st.expander("ℹ️ Comment utiliser la Timeline"):
        st.markdown("""
        ### 📅 Guide d'utilisation

        **Diagramme de Gantt:**
        - Visualisez toutes vos tâches sur une ligne de temps
        - Chaque barre représente une tâche avec sa durée
        - Les couleurs indiquent la priorité ou le statut
        - Passez la souris sur une barre pour voir les détails

        **Vues disponibles:**
        1. **📁 Par Projet** : Groupé par projet
        2. **👤 Par Assigné** : Groupé par personne
        3. **📋 Par Tâche** : Liste complète des tâches

        **Filtres:**
        - Filtrez par statut (Todo, En cours, etc.)
        - Filtrez par priorité (Basse, Moyenne, Haute, Urgente)

        **Vue Calendrier:**
        - Tâches groupées par semaine
        - Vision chronologique des échéances

        **💡 Astuce:**
        Pour qu'une tâche apparaisse dans la timeline, elle doit avoir:
        - Une date de début
        - Une date de fin

        Ajoutez ces dates lors de la création ou modification d'une tâche!
        """)


if __name__ == "__main__":
    main()
