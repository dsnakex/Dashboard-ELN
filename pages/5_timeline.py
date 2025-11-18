"""
Timeline / Gantt Chart Page
Timeline view of tasks with interactive Gantt chart.
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

            st.markdown("---")

            if st.button("🚪 Logout", use_container_width=True):
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
        task_name = task.get('title', 'Untitled')
        assignee_name = task.get('assignee', {}).get('name', 'Unassigned') if task.get('assignee') else 'Unassigned'
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
        st.info("No tasks with dates to display")
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
            title="📅 Timeline by Project",
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
            title="📅 Timeline by Assignee",
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
            title="📅 Timeline by Task",
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
        st.metric("📊 Total Tasks", len(df))

    with col2:
        avg_duration = df['Duration'].mean()
        st.metric("⏱️ Average Duration", f"{avg_duration:.1f} days")

    with col3:
        overdue = len(df[df['Finish'] < pd.Timestamp.now().date()])
        st.metric("⚠️ Overdue", overdue)

    with col4:
        urgent = len(df[df['Priority'] == 'urgent'])
        st.metric("🔴 Urgent", urgent)


def show_task_calendar_view(df):
    """Display task calendar/schedule view."""

    if df.empty:
        st.info("No tasks to display")
        return

    st.markdown("### 📆 Calendar View")

    # Get date range
    min_date = df['Start'].min()
    max_date = df['Finish'].max()

    # Group tasks by week
    df['Week'] = pd.to_datetime(df['Start']).dt.to_period('W')

    for week, week_tasks in df.groupby('Week'):
        with st.expander(f"📅 Week of {week.start_time.strftime('%d/%m/%Y')}", expanded=False):
            for _, task in week_tasks.iterrows():
                priority_icons = {
                    'low': '🟢',
                    'medium': '🟡',
                    'high': '🟠',
                    'urgent': '🔴'
                }

                st.markdown(f"""
                    **{priority_icons.get(task['Priority'], '⚪')} {task['Task']}**
                    👤 {task['Assignee']} | 📁 {task['Project']} | 📅 {task['Start']} → {task['Finish']} ({task['Duration']} days)
                """)


def main():
    """Main timeline page."""

    show_sidebar()

    user = get_current_user()

    # Header
    st.title("📅 Timeline & Gantt Chart")
    st.markdown("Timeline view of all your tasks with interactive Gantt chart")
    st.markdown("---")

    # Refresh button
    col1, col2 = st.columns([6, 1])
    with col2:
        if st.button("🔄 Refresh", use_container_width=True):
            st.rerun()

    # Get all tasks
    tasks = get_all_tasks()

    if not tasks:
        st.info("No tasks to display. Create tasks from the Tasks page!")
        return

    # Prepare data
    df = prepare_gantt_data(tasks)

    if df.empty:
        st.warning("⚠️ No tasks with start and end dates.")
        st.info("💡 Add dates to your tasks to see them appear in the timeline.")
        return

    # Timeline statistics
    show_timeline_stats(df)

    st.markdown("---")

    # View mode selector
    col1, col2, col3 = st.columns(3)

    with col1:
        view_mode = st.selectbox(
            "View",
            options=['project', 'assignee', 'priority'],
            format_func=lambda x: {
                'project': '📁 By Project',
                'assignee': '👤 By Assignee',
                'priority': '📋 By Task'
            }[x]
        )

    with col2:
        filter_status = st.multiselect(
            "Filter by status",
            options=['todo', 'in-progress', 'review', 'done'],
            default=['todo', 'in-progress', 'review'],
            format_func=lambda x: {
                'todo': '📋 Todo',
                'in-progress': '🔄 In Progress',
                'review': '👁️ In Review',
                'done': '✅ Done'
            }[x]
        )

    with col3:
        filter_priority = st.multiselect(
            "Filter by priority",
            options=['low', 'medium', 'high', 'urgent'],
            default=['low', 'medium', 'high', 'urgent'],
            format_func=lambda x: {
                'low': '🟢 Low',
                'medium': '🟡 Medium',
                'high': '🟠 High',
                'urgent': '🔴 Urgent'
            }[x]
        )

    # Apply filters
    filtered_df = df[
        (df['Status'].isin(filter_status)) &
        (df['Priority'].isin(filter_priority))
    ]

    if filtered_df.empty:
        st.warning("No tasks match the filters")
        return

    # Show Gantt chart
    show_gantt_chart(filtered_df, view_mode)

    st.markdown("---")

    # Show calendar view
    show_task_calendar_view(filtered_df)

    # Instructions
    st.markdown("---")
    with st.expander("ℹ️ How to use the Timeline"):
        st.markdown("""
        ### 📅 User Guide

        **Gantt Chart:**
        - Visualize all your tasks on a timeline
        - Each bar represents a task with its duration
        - Colors indicate priority or status
        - Hover over a bar to see details

        **Available views:**
        1. **📁 By Project** : Grouped by project
        2. **👤 By Assignee** : Grouped by person
        3. **📋 By Task** : Complete list of tasks

        **Filters:**
        - Filter by status (Todo, In Progress, etc.)
        - Filter by priority (Low, Medium, High, Urgent)

        **Calendar View:**
        - Tasks grouped by week
        - Chronological view of deadlines

        **💡 Tip:**
        For a task to appear in the timeline, it must have:
        - A start date
        - An end date

        Add these dates when creating or editing a task!
        """)


if __name__ == "__main__":
    main()
