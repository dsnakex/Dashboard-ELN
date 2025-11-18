"""
Projects Management Page
Gestion complète des projets et sous-projets avec CRUD.
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
    page_title="Projets - Nikaia",
    page_icon="📁",
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


def show_create_project_form(users):
    """Display form to create new project."""

    with st.form("create_project_form", clear_on_submit=True):
        st.subheader("➕ Créer un Nouveau Projet")

        col1, col2 = st.columns(2)

        with col1:
            name = st.text_input("Nom du projet *", placeholder="Ex: YK725 Development")
            status = st.selectbox(
                "Statut *",
                options=['planning', 'active', 'on-hold', 'completed', 'archived'],
                format_func=lambda x: {
                    'planning': '📝 Planification',
                    'active': '✅ Actif',
                    'on-hold': '⏸️ En attente',
                    'completed': '✔️ Terminé',
                    'archived': '📦 Archivé'
                }[x]
            )
            start_date = st.date_input("Date de début", value=date.today())

        with col2:
            description = st.text_area("Description", placeholder="Objectifs et contexte du projet...")
            lead_id = st.selectbox(
                "Responsable *",
                options=[user['id'] for user in users],
                format_func=lambda x: next((u['name'] for u in users if u['id'] == x), 'Unknown')
            )
            end_date = st.date_input("Date de fin")

        submitted = st.form_submit_button("🚀 Créer le Projet", use_container_width=True)

        if submitted:
            if not name:
                st.error("❌ Le nom du projet est requis")
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
        st.subheader(f"✏️ Modifier: {project['name']}")

        col1, col2 = st.columns(2)

        with col1:
            name = st.text_input("Nom du projet", value=project['name'])
            status = st.selectbox(
                "Statut",
                options=['planning', 'active', 'on-hold', 'completed', 'archived'],
                index=['planning', 'active', 'on-hold', 'completed', 'archived'].index(project['status']),
                format_func=lambda x: {
                    'planning': '📝 Planification',
                    'active': '✅ Actif',
                    'on-hold': '⏸️ En attente',
                    'completed': '✔️ Terminé',
                    'archived': '📦 Archivé'
                }[x]
            )

            current_start = datetime.fromisoformat(project['start_date'].replace('Z', '+00:00')).date() if project.get('start_date') else date.today()
            start_date = st.date_input("Date de début", value=current_start)

        with col2:
            description = st.text_area("Description", value=project.get('description', ''))

            current_lead = project.get('lead_id')
            lead_index = next((i for i, u in enumerate(users) if u['id'] == current_lead), 0)
            lead_id = st.selectbox(
                "Responsable",
                options=[user['id'] for user in users],
                index=lead_index,
                format_func=lambda x: next((u['name'] for u in users if u['id'] == x), 'Unknown')
            )

            current_end = datetime.fromisoformat(project['end_date'].replace('Z', '+00:00')).date() if project.get('end_date') else None
            end_date = st.date_input("Date de fin", value=current_end)

        col1, col2 = st.columns(2)

        with col1:
            submitted = st.form_submit_button("💾 Sauvegarder", use_container_width=True)

        with col2:
            cancel = st.form_submit_button("❌ Annuler", use_container_width=True)

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
            lead_name = project.get('lead', {}).get('name', 'Non assigné') if project.get('lead') else 'Non assigné'
            st.markdown(f"**Responsable:** {lead_name}")

        with col2:
            st.markdown(f"**Statut:** {status_icons.get(project['status'], '❓')} {project['status']}")
            start = project.get('start_date', 'N/A')
            end = project.get('end_date', 'N/A')
            st.markdown(f"**Période:** {start} → {end}")

        with col3:
            if has_permission('update', project.get('lead_id')):
                if st.button("✏️ Modifier", key=f"edit_{project['id']}", use_container_width=True):
                    st.session_state.editing_project = project['id']
                    st.rerun()

            if has_permission('delete', project.get('lead_id')):
                if st.button("🗑️ Supprimer", key=f"delete_{project['id']}", use_container_width=True):
                    if delete_project(project['id']):
                        st.rerun()

            if st.button("📂 Sous-projets", key=f"view_sub_{project['id']}", use_container_width=True):
                st.session_state.viewing_subprojects = project['id']
                st.rerun()

        # Show subprojects if viewing
        if st.session_state.get('viewing_subprojects') == project['id']:
            show_subprojects_section(project['id'], users)


def show_subprojects_section(project_id, users):
    """Display subprojects for a project."""

    st.markdown("---")
    st.markdown("### 📂 Sous-Projets")

    subprojects = get_subprojects_by_project(project_id)

    # Create subproject button
    if has_permission('create'):
        with st.expander("➕ Créer un Sous-Projet", expanded=False):
            show_create_subproject_form(project_id, users)

    if not subprojects:
        st.info("Aucun sous-projet pour ce projet")
        return

    # Display subprojects
    for subproject in subprojects:
        show_subproject_card(subproject, users)


def show_create_subproject_form(project_id, users):
    """Display form to create new subproject."""

    with st.form(f"create_subproject_{project_id}", clear_on_submit=True):
        col1, col2 = st.columns(2)

        with col1:
            name = st.text_input("Nom du sous-projet *", placeholder="Ex: Synthèse chimique")
            status = st.selectbox(
                "Statut *",
                options=['not-started', 'in-progress', 'blocked', 'completed'],
                format_func=lambda x: {
                    'not-started': '⭕ Non commencé',
                    'in-progress': '🔄 En cours',
                    'blocked': '🚫 Bloqué',
                    'completed': '✅ Terminé'
                }[x]
            )

        with col2:
            description = st.text_area("Description", placeholder="Objectifs...")
            lead_id = st.selectbox(
                "Responsable *",
                options=[user['id'] for user in users],
                format_func=lambda x: next((u['name'] for u in users if u['id'] == x), 'Unknown')
            )

        submitted = st.form_submit_button("🚀 Créer", use_container_width=True)

        if submitted:
            if not name:
                st.error("❌ Le nom est requis")
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
            lead_name = subproject.get('lead', {}).get('name', 'Non assigné') if subproject.get('lead') else 'Non assigné'
            st.markdown(f"**Responsable:** {lead_name}")
            st.markdown(f"**Statut:** {subproject['status']}")

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
    st.title("📁 Gestion des Projets")
    st.markdown("Créez et gérez vos projets de recherche")
    st.markdown("---")

    # Refresh button
    col1, col2 = st.columns([6, 1])
    with col2:
        if st.button("🔄 Actualiser", use_container_width=True):
            st.session_state.pop('editing_project', None)
            st.session_state.pop('viewing_subprojects', None)
            st.rerun()

    # Create project section
    if has_permission('create'):
        with st.expander("➕ Créer un Nouveau Projet", expanded=False):
            show_create_project_form(users)

        st.markdown("---")

    # Get all projects
    projects = get_all_projects()

    if not projects:
        st.info("Aucun projet pour le moment. Créez-en un!")
        return

    # Display projects
    st.markdown(f"### 📊 Tous les Projets ({len(projects)})")

    # Filter by status
    filter_status = st.multiselect(
        "Filtrer par statut",
        options=['planning', 'active', 'on-hold', 'completed', 'archived'],
        default=['planning', 'active'],
        format_func=lambda x: {
            'planning': '📝 Planification',
            'active': '✅ Actif',
            'on-hold': '⏸️ En attente',
            'completed': '✔️ Terminé',
            'archived': '📦 Archivé'
        }[x]
    )

    # Filter projects
    filtered_projects = [p for p in projects if p['status'] in filter_status]

    if not filtered_projects:
        st.warning("Aucun projet ne correspond aux filtres")
        return

    # Display each project
    for project in filtered_projects:
        if st.session_state.get('editing_project') == project['id']:
            show_edit_project_modal(project, users)
        else:
            show_project_card(project, users)


if __name__ == "__main__":
    main()
