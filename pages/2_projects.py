"""
Projects Management Page
Complete management of projects and subprojects with CRUD.
"""

import streamlit as st
import pandas as pd
from datetime import datetime, date
from utils.auth import (
    is_authenticated,
    get_current_user,
    logout_user,
    get_role_badge,
    has_permission
)
from utils.crud import (
    get_all_projects,
    get_project_by_id,
    create_project,
    update_project,
    delete_project,
    get_subprojects_by_project,
    create_subproject,
    update_subproject,
    delete_subproject,
    get_all_users
)

# Page config
st.set_page_config(
    page_title="Projects - Nikaia",
    page_icon="📁",
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


def show_create_project_form(users):
    """Display form to create new project."""

    with st.form("create_project_form", clear_on_submit=True):
        st.subheader("➕ Create New Project")

        col1, col2 = st.columns(2)

        with col1:
            name = st.text_input("Project name *", placeholder="Ex: YK725 Development")
            status = st.selectbox(
                "Status *",
                options=['planning', 'active', 'on-hold', 'completed', 'archived'],
                format_func=lambda x: {
                    'planning': '📝 Planning',
                    'active': '✅ Active',
                    'on-hold': '⏸️ On Hold',
                    'completed': '✔️ Completed',
                    'archived': '📦 Archived'
                }[x]
            )
            start_date = st.date_input("Start date", value=date.today())

        with col2:
            description = st.text_area("Description", placeholder="Project objectives and context...")
            lead_id = st.selectbox(
                "Project Lead *",
                options=[user['id'] for user in users],
                format_func=lambda x: next((u['name'] for u in users if u['id'] == x), 'Unknown')
            )
            end_date = st.date_input("End date")

        submitted = st.form_submit_button("🚀 Create Project", use_container_width=True)

        if submitted:
            if not name:
                st.error("❌ Project name is required")
            else:
                project_data = {
                    'name': name,
                    'description': description,
                    'status': status,
                    'lead_id': lead_id,
                    'start_date': str(start_date) if start_date else None,
                    'end_date': str(end_date) if end_date else None
                }

                result = create_project(project_data)
                if result:
                    st.rerun()


def show_edit_project_modal(project, users):
    """Display modal to edit project."""

    with st.form(f"edit_project_{project['id']}"):
        st.subheader(f"✏️ Edit: {project['name']}")

        col1, col2 = st.columns(2)

        with col1:
            name = st.text_input("Project name", value=project['name'])
            status = st.selectbox(
                "Status",
                options=['planning', 'active', 'on-hold', 'completed', 'archived'],
                index=['planning', 'active', 'on-hold', 'completed', 'archived'].index(project['status']),
                format_func=lambda x: {
                    'planning': '📝 Planning',
                    'active': '✅ Active',
                    'on-hold': '⏸️ On Hold',
                    'completed': '✔️ Completed',
                    'archived': '📦 Archived'
                }[x]
            )

            current_start = datetime.fromisoformat(project['start_date'].replace('Z', '+00:00')).date() if project.get('start_date') else date.today()
            start_date = st.date_input("Start date", value=current_start)

        with col2:
            description = st.text_area("Description", value=project.get('description', ''))

            current_lead = project.get('lead_id')
            lead_index = next((i for i, u in enumerate(users) if u['id'] == current_lead), 0)
            lead_id = st.selectbox(
                "Project Lead",
                options=[user['id'] for user in users],
                index=lead_index,
                format_func=lambda x: next((u['name'] for u in users if u['id'] == x), 'Unknown')
            )

            current_end = datetime.fromisoformat(project['end_date'].replace('Z', '+00:00')).date() if project.get('end_date') else None
            end_date = st.date_input("End date", value=current_end)

        col1, col2 = st.columns(2)

        with col1:
            submitted = st.form_submit_button("💾 Save", use_container_width=True)

        with col2:
            cancel = st.form_submit_button("❌ Cancel", use_container_width=True)

        if submitted:
            update_data = {
                'name': name,
                'description': description,
                'status': status,
                'lead_id': lead_id,
                'start_date': str(start_date) if start_date else None,
                'end_date': str(end_date) if end_date else None
            }

            if update_project(project['id'], update_data):
                st.session_state.pop('editing_project', None)
                st.rerun()

        if cancel:
            st.session_state.pop('editing_project', None)
            st.rerun()


def show_project_card(project, users):
    """Display project card with details and actions."""

    status_icons = {
        'planning': '📝',
        'active': '✅',
        'on-hold': '⏸️',
        'completed': '✔️',
        'archived': '📦'
    }

    status_colors = {
        'planning': '#FFF3E0',
        'active': '#E8F5E9',
        'on-hold': '#FFF9C4',
        'completed': '#E3F2FD',
        'archived': '#F5F5F5'
    }

    with st.container():
        st.markdown(f"""
            <div style="
                padding: 20px;
                border-radius: 10px;
                background-color: {status_colors.get(project['status'], '#FFFFFF')};
                border-left: 5px solid #0066CC;
                margin-bottom: 20px;
            ">
                <h3>{status_icons.get(project['status'], '📁')} {project['name']}</h3>
            </div>
        """, unsafe_allow_html=True)

        col1, col2, col3 = st.columns([2, 2, 1])

        with col1:
            st.markdown(f"**Description:** {project.get('description', 'N/A')}")
            lead_name = project.get('lead', {}).get('name', 'Unassigned') if project.get('lead') else 'Unassigned'
            st.markdown(f"**Project Lead:** {lead_name}")

        with col2:
            st.markdown(f"**Status:** {status_icons.get(project['status'], '❓')} {project['status']}")
            start = project.get('start_date', 'N/A')
            end = project.get('end_date', 'N/A')
            st.markdown(f"**Period:** {start} → {end}")

        with col3:
            if has_permission('update', project.get('lead_id')):
                if st.button("✏️ Edit", key=f"edit_{project['id']}", use_container_width=True):
                    st.session_state.editing_project = project['id']
                    st.rerun()

            if has_permission('delete', project.get('lead_id')):
                if st.button("🗑️ Delete", key=f"delete_{project['id']}", use_container_width=True):
                    if delete_project(project['id']):
                        st.rerun()

            if st.button("📂 Subprojects", key=f"view_sub_{project['id']}", use_container_width=True):
                st.session_state.viewing_subprojects = project['id']
                st.rerun()

        # Show subprojects if viewing
        if st.session_state.get('viewing_subprojects') == project['id']:
            show_subprojects_section(project['id'], users)


def show_subprojects_section(project_id, users):
    """Display subprojects for a project."""

    st.markdown("---")
    st.markdown("### 📂 Subprojects")

    subprojects = get_subprojects_by_project(project_id)

    # Create subproject button
    if has_permission('create'):
        with st.expander("➕ Create a Subproject", expanded=False):
            show_create_subproject_form(project_id, users)

    if not subprojects:
        st.info("No subprojects for this project")
        return

    # Display subprojects
    for subproject in subprojects:
        show_subproject_card(subproject, users)


def show_create_subproject_form(project_id, users):
    """Display form to create new subproject."""

    with st.form(f"create_subproject_{project_id}", clear_on_submit=True):
        col1, col2 = st.columns(2)

        with col1:
            name = st.text_input("Subproject name *", placeholder="Ex: Chemical Synthesis")
            status = st.selectbox(
                "Status *",
                options=['not-started', 'in-progress', 'blocked', 'completed'],
                format_func=lambda x: {
                    'not-started': '⭕ Not Started',
                    'in-progress': '🔄 In Progress',
                    'blocked': '🚫 Blocked',
                    'completed': '✅ Completed'
                }[x]
            )

        with col2:
            description = st.text_area("Description", placeholder="Objectives...")
            lead_id = st.selectbox(
                "Lead *",
                options=[user['id'] for user in users],
                format_func=lambda x: next((u['name'] for u in users if u['id'] == x), 'Unknown')
            )

        submitted = st.form_submit_button("🚀 Create", use_container_width=True)

        if submitted:
            if not name:
                st.error("❌ Name is required")
            else:
                subproject_data = {
                    'project_id': project_id,
                    'name': name,
                    'description': description,
                    'status': status,
                    'lead_id': lead_id
                }

                if create_subproject(subproject_data):
                    st.rerun()


def show_subproject_card(subproject, users):
    """Display subproject card."""

    status_icons = {
        'not-started': '⭕',
        'in-progress': '🔄',
        'blocked': '🚫',
        'completed': '✅'
    }

    with st.container():
        col1, col2, col3 = st.columns([3, 2, 1])

        with col1:
            st.markdown(f"**{status_icons.get(subproject['status'], '📋')} {subproject['name']}**")
            st.markdown(f"*{subproject.get('description', 'N/A')}*")

        with col2:
            lead_name = subproject.get('lead', {}).get('name', 'Unassigned') if subproject.get('lead') else 'Unassigned'
            st.markdown(f"**Lead:** {lead_name}")
            st.markdown(f"**Status:** {subproject['status']}")

        with col3:
            if has_permission('delete', subproject.get('lead_id')):
                if st.button("🗑️", key=f"delete_sub_{subproject['id']}"):
                    if delete_subproject(subproject['id']):
                        st.rerun()

        st.markdown("---")


def main():
    """Main projects page."""

    show_sidebar()

    user = get_current_user()
    users = get_all_users()

    # Header
    st.title("📁 Project Management")
    st.markdown("Create and manage your research projects")
    st.markdown("---")

    # Refresh button
    col1, col2 = st.columns([6, 1])
    with col2:
        if st.button("🔄 Refresh", use_container_width=True):
            st.session_state.pop('editing_project', None)
            st.session_state.pop('viewing_subprojects', None)
            st.rerun()

    # Create project section
    if has_permission('create'):
        with st.expander("➕ Create New Project", expanded=False):
            show_create_project_form(users)

        st.markdown("---")

    # Get all projects
    projects = get_all_projects()

    if not projects:
        st.info("No projects yet. Create one!")
        return

    # Display projects
    st.markdown(f"### 📊 All Projects ({len(projects)})")

    # Filter by status
    filter_status = st.multiselect(
        "Filter by status",
        options=['planning', 'active', 'on-hold', 'completed', 'archived'],
        default=['planning', 'active'],
        format_func=lambda x: {
            'planning': '📝 Planning',
            'active': '✅ Active',
            'on-hold': '⏸️ On Hold',
            'completed': '✔️ Completed',
            'archived': '📦 Archived'
        }[x]
    )

    # Filter projects
    filtered_projects = [p for p in projects if p['status'] in filter_status]

    if not filtered_projects:
        st.warning("No projects match the filters")
        return

    # Display each project
    for project in filtered_projects:
        if st.session_state.get('editing_project') == project['id']:
            show_edit_project_modal(project, users)
        else:
            show_project_card(project, users)


if __name__ == "__main__":
    main()
