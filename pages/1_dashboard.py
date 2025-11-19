"""
Dashboard Page - KPIs and Statistics
Overview of projects, tasks and statistics.
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
from utils.experiments_crud import get_experiment_stats, get_all_experiments

# Page config
st.set_page_config(
    page_title="Dashboard - Nikaia",
    page_icon="📊",
    layout="wide"
)

# Auth check
if not is_authenticated():
    st.warning("⚠️ Please log in")
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

            if st.button("🏠 Home", key="nav_home", use_container_width=True):
                st.switch_page("main.py")
            if st.button("📊 Dashboard", key="nav_dashboard", use_container_width=True):
                st.switch_page("pages/1_dashboard.py")
            if st.button("📁 Projects", key="nav_projects", use_container_width=True):
                st.switch_page("pages/2_projects.py")
            if st.button("✅ Tasks", key="nav_tasks", use_container_width=True):
                st.switch_page("pages/3_tasks.py")
            if st.button("📋 Kanban", key="nav_kanban", use_container_width=True):
                st.switch_page("pages/4_kanban.py")
            if st.button("📅 Timeline", key="nav_timeline", use_container_width=True):
                st.switch_page("pages/5_timeline.py")
            if st.button("🧪 Experiments", key="nav_experiments", use_container_width=True):
                st.switch_page("pages/6_experiments.py")

            st.markdown("---")

            if st.button("🚪 Logout", use_container_width=True):
                logout_user()
                st.rerun()


def show_kpi_cards(stats, exp_stats):
    """Display KPI cards."""

    col1, col2, col3, col4, col5 = st.columns(5)

    with col1:
        st.metric(
            label="📁 Active Projects",
            value=stats.get('active_projects', 0),
            delta=f"{stats.get('total_projects', 0)} total"
        )

    with col2:
        st.metric(
            label="✅ Completed Tasks",
            value=stats.get('completed_tasks', 0),
            delta=f"{stats.get('completion_rate', 0):.1f}% completed"
        )

    with col3:
        st.metric(
            label="🔄 Tasks In Progress",
            value=stats.get('in_progress_tasks', 0),
            delta=f"{stats.get('todo_tasks', 0)} to do"
        )

    with col4:
        st.metric(
            label="🧪 Experiments",
            value=exp_stats.get('total', 0),
            delta=f"{exp_stats.get('in_progress', 0)} in progress"
        )

    with col5:
        st.metric(
            label="⚠️ Overdue Tasks",
            value=stats.get('overdue_tasks', 0),
            delta=f"{stats.get('urgent_priority_tasks', 0)} urgent",
            delta_color="inverse"
        )


def show_project_status_chart(projects):
    """Display project status distribution chart."""

    if not projects:
        st.info("No projects to display")
        return

    # Count projects by status
    status_counts = {}
    for project in projects:
        status = project.get('status', 'unknown')
        status_counts[status] = status_counts.get(status, 0) + 1

    # Create dataframe
    df = pd.DataFrame(list(status_counts.items()), columns=['Status', 'Count'])

    # Status labels in English
    status_labels = {
        'planning': 'Planning',
        'active': 'Active',
        'on-hold': 'On Hold',
        'completed': 'Completed',
        'archived': 'Archived'
    }
    df['Status'] = df['Status'].map(status_labels)

    # Create pie chart
    fig = px.pie(
        df,
        values='Count',
        names='Status',
        title='Projects by Status',
        color_discrete_sequence=px.colors.qualitative.Set3
    )

    fig.update_traces(textposition='inside', textinfo='percent+label')
    fig.update_layout(showlegend=True, height=400)

    st.plotly_chart(fig, use_container_width=True)


def show_task_status_chart(tasks):
    """Display task status distribution chart."""

    if not tasks:
        st.info("No tasks to display")
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
        'todo': 'Todo',
        'in-progress': 'In Progress',
        'review': 'Review',
        'done': 'Done'
    }
    df['Status'] = df['Status'].map(status_labels)

    # Colors
    colors = {
        'Todo': '#FF6B6B',
        'In Progress': '#4ECDC4',
        'Review': '#FFE66D',
        'Done': '#95E1D3'
    }

    # Create bar chart
    fig = px.bar(
        df,
        x='Status',
        y='Count',
        title='Tasks by Status',
        color='Status',
        color_discrete_map=colors
    )

    fig.update_layout(showlegend=False, height=400)
    fig.update_traces(texttemplate='%{y}', textposition='outside')

    st.plotly_chart(fig, use_container_width=True)


def show_experiment_status_chart(experiments):
    """Display experiment status distribution chart."""

    if not experiments:
        st.info("No experiments to display")
        return

    # Count experiments by status
    status_counts = {}
    for exp in experiments:
        status = exp.get('status', 'unknown')
        status_counts[status] = status_counts.get(status, 0) + 1

    # Create dataframe
    df = pd.DataFrame(list(status_counts.items()), columns=['Status', 'Count'])

    # Status labels
    status_labels = {
        'planned': 'Planned',
        'in_progress': 'In Progress',
        'completed': 'Completed',
        'cancelled': 'Cancelled',
        'validated': 'Validated'
    }
    df['Status'] = df['Status'].map(status_labels)

    # Colors
    colors = {
        'Planned': '#FFF3E0',
        'In Progress': '#E3F2FD',
        'Completed': '#E8F5E9',
        'Cancelled': '#FFEBEE',
        'Validated': '#F3E5F5'
    }

    # Create bar chart
    fig = px.bar(
        df,
        x='Status',
        y='Count',
        title='Experiments by Status',
        color='Status',
        color_discrete_map=colors
    )

    fig.update_layout(showlegend=False, height=400)
    fig.update_traces(texttemplate='%{y}', textposition='outside')

    st.plotly_chart(fig, use_container_width=True)


def show_priority_distribution(tasks):
    """Display task priority distribution."""

    if not tasks:
        st.info("No tasks to display")
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
        'low': 'Low',
        'medium': 'Medium',
        'high': 'High',
        'urgent': 'Urgent'
    }
    df['Priority'] = df['Priority'].map(priority_labels)

    # Sort by priority level
    priority_order = ['Low', 'Medium', 'High', 'Urgent']
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
        title='Tasks by Priority',
        showlegend=False,
        height=400,
        xaxis_title='',
        yaxis_title='Number of tasks'
    )

    st.plotly_chart(fig, use_container_width=True)


def show_my_tasks_summary(user):
    """Display current user's task summary."""

    my_tasks = get_tasks_by_assignee(user['id'])

    if not my_tasks:
        st.info("No tasks assigned")
        return

    st.markdown("### 📌 My Tasks")

    # Filter by status
    todo = [t for t in my_tasks if t['status'] == 'todo']
    in_progress = [t for t in my_tasks if t['status'] == 'in-progress']
    review = [t for t in my_tasks if t['status'] == 'review']

    col1, col2, col3 = st.columns(3)

    with col1:
        st.markdown(f"**Todo:** {len(todo)}")
        for task in todo[:3]:
            st.markdown(f"- {task['title']}")
        if len(todo) > 3:
            st.markdown(f"*... and {len(todo) - 3} more*")

    with col2:
        st.markdown(f"**In Progress:** {len(in_progress)}")
        for task in in_progress[:3]:
            st.markdown(f"- {task['title']}")
        if len(in_progress) > 3:
            st.markdown(f"*... and {len(in_progress) - 3} more*")

    with col3:
        st.markdown(f"**In Review:** {len(review)}")
        for task in review[:3]:
            st.markdown(f"- {task['title']}")
        if len(review) > 3:
            st.markdown(f"*... and {len(review) - 3} more*")


def show_upcoming_deadlines(tasks):
    """Display upcoming task deadlines."""

    if not tasks:
        return

    st.markdown("### 📅 Upcoming Deadlines (7 days)")

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
                    'assignee': task.get('assignee', {}).get('name', 'Unassigned') if task.get('assignee') else 'Unassigned'
                })

    if not upcoming:
        st.info("No deadlines in the next 7 days")
        return

    # Sort by due date
    upcoming.sort(key=lambda x: x['due_date'])

    # Display as table
    df = pd.DataFrame(upcoming)
    df['due_date'] = df['due_date'].astype(str)

    st.dataframe(
        df,
        column_config={
            'title': 'Task',
            'due_date': 'Due Date',
            'priority': 'Priority',
            'assignee': 'Assigned To'
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
    st.markdown(f"**Welcome, {user['name']}!** Here's an overview of your projects and tasks.")
    st.markdown("---")

    # Refresh button
    if st.button("🔄 Refresh", key="refresh_dashboard"):
        st.rerun()

    # Get data
    stats = get_dashboard_stats()
    projects = get_all_projects()
    tasks = get_all_tasks()
    exp_stats = get_experiment_stats()
    experiments = get_all_experiments()

    # KPI Cards
    show_kpi_cards(stats, exp_stats)

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
        show_experiment_status_chart(experiments)

    st.markdown("---")

    # Statistics summary
    col1, col2 = st.columns(2)

    with col1:
        st.markdown("### 📊 General Statistics")
        st.markdown(f"**Total projects:** {stats.get('total_projects', 0)}")
        st.markdown(f"**Total subprojects:** {stats.get('total_subprojects', 0)}")
        st.markdown(f"**Total tasks:** {stats.get('total_tasks', 0)}")
        st.markdown(f"**Completion rate:** {stats.get('completion_rate', 0):.1f}%")
        st.markdown(f"**High priority tasks:** {stats.get('high_priority_tasks', 0)}")
        st.markdown(f"**Urgent tasks:** {stats.get('urgent_priority_tasks', 0)}")

        # Progress bar
        completion = stats.get('completion_rate', 0) / 100
        st.progress(completion, text=f"Overall progress: {stats.get('completion_rate', 0):.1f}%")

    with col2:
        st.markdown("### 🧪 Experiment Statistics")
        st.markdown(f"**Total experiments:** {exp_stats.get('total', 0)}")
        st.markdown(f"**Planned:** {exp_stats.get('planned', 0)}")
        st.markdown(f"**In progress:** {exp_stats.get('in_progress', 0)}")
        st.markdown(f"**Completed:** {exp_stats.get('completed', 0)}")
        st.markdown(f"**Validated:** {exp_stats.get('validated', 0)}")
        st.markdown(f"**Cancelled:** {exp_stats.get('cancelled', 0)}")

    st.markdown("---")

    # My tasks summary
    show_my_tasks_summary(user)

    st.markdown("---")

    # Upcoming deadlines
    show_upcoming_deadlines(tasks)


if __name__ == "__main__":
    main()
