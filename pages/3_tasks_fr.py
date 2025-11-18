"""
Tasks Management Page
Gestion complète des tâches avec CRUD et commentaires.
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
    get_all_tasks,
    get_tasks_by_assignee,
    create_task,
    update_task,
    delete_task,
    get_all_subprojects,
    get_all_users,
    get_comments_by_task,
    create_comment,
    delete_comment
)

# Page config
st.set_page_config(
    page_title="Tâches - Nikaia",
    page_icon="✅",
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


def show_create_task_form(subprojects, users):
    """Display form to create new task."""

    with st.form("create_task_form", clear_on_submit=True):
        st.subheader("➕ Créer une Nouvelle Tâche")

        col1, col2 = st.columns(2)

        with col1:
            title = st.text_input("Titre de la tâche *", placeholder="Ex: Analyser résultats tests in vitro")

            subproject_id = st.selectbox(
                "Sous-projet *",
                options=[sp['id'] for sp in subprojects],
                format_func=lambda x: next(
                    (f"{sp.get('project', {}).get('name', 'Unknown')} > {sp['name']}"
                     for sp in subprojects if sp['id'] == x),
                    'Unknown'
                )
            )

            assignee_id = st.selectbox(
                "Assigné à *",
                options=[user['id'] for user in users],
                format_func=lambda x: next((u['name'] for u in users if u['id'] == x), 'Unknown')
            )

            status = st.selectbox(
                "Statut *",
                options=['todo', 'in-progress', 'review', 'done'],
                format_func=lambda x: {
                    'todo': '📋 À faire',
                    'in-progress': '🔄 En cours',
                    'review': '👁️ En revue',
                    'done': '✅ Terminé'
                }[x]
            )

        with col2:
            description = st.text_area("Description", placeholder="Détails de la tâche...")

            priority = st.selectbox(
                "Priorité *",
                options=['low', 'medium', 'high', 'urgent'],
                index=1,
                format_func=lambda x: {
                    'low': '🟢 Basse',
                    'medium': '🟡 Moyenne',
                    'high': '🟠 Haute',
                    'urgent': '🔴 Urgente'
                }[x]
            )

            start_date = st.date_input("Date de début", value=date.today())
            due_date = st.date_input("Date de fin")

            estimated_hours = st.number_input("Heures estimées", min_value=0.0, step=0.5, value=0.0)

        submitted = st.form_submit_button("🚀 Créer la Tâche", use_container_width=True)

        if submitted:
            if not title:
                st.error("❌ Le titre est requis")
            else:
                task_data = {
                    'title': title,
                    'description': description,
                    'subproject_id': subproject_id,
                    'assignee_id': assignee_id,
                    'status': status,
                    'priority': priority,
                    'start_date': str(start_date) if start_date else None,
                    'due_date': str(due_date) if due_date else None,
                    'estimated_hours': estimated_hours if estimated_hours > 0 else None
                }

                if create_task(task_data):
                    st.rerun()


def show_edit_task_modal(task, subprojects, users):
    """Display modal to edit task."""

    with st.form(f"edit_task_{task['id']}"):
        st.subheader(f"✏️ Modifier: {task['title']}")

        col1, col2 = st.columns(2)

        with col1:
            title = st.text_input("Titre", value=task['title'])

            current_subproject = task.get('subproject_id')
            subproject_index = next((i for i, sp in enumerate(subprojects) if sp['id'] == current_subproject), 0)
            subproject_id = st.selectbox(
                "Sous-projet",
                options=[sp['id'] for sp in subprojects],
                index=subproject_index,
                format_func=lambda x: next(
                    (f"{sp.get('project', {}).get('name', 'Unknown')} > {sp['name']}"
                     for sp in subprojects if sp['id'] == x),
                    'Unknown'
                )
            )

            current_assignee = task.get('assignee_id')
            assignee_index = next((i for i, u in enumerate(users) if u['id'] == current_assignee), 0)
            assignee_id = st.selectbox(
                "Assigné à",
                options=[user['id'] for user in users],
                index=assignee_index,
                format_func=lambda x: next((u['name'] for u in users if u['id'] == x), 'Unknown')
            )

            status = st.selectbox(
                "Statut",
                options=['todo', 'in-progress', 'review', 'done'],
                index=['todo', 'in-progress', 'review', 'done'].index(task['status']),
                format_func=lambda x: {
                    'todo': '📋 À faire',
                    'in-progress': '🔄 En cours',
                    'review': '👁️ En revue',
                    'done': '✅ Terminé'
                }[x]
            )

        with col2:
            description = st.text_area("Description", value=task.get('description', ''))

            priority = st.selectbox(
                "Priorité",
                options=['low', 'medium', 'high', 'urgent'],
                index=['low', 'medium', 'high', 'urgent'].index(task['priority']),
                format_func=lambda x: {
                    'low': '🟢 Basse',
                    'medium': '🟡 Moyenne',
                    'high': '🟠 Haute',
                    'urgent': '🔴 Urgente'
                }[x]
            )

            current_due = datetime.fromisoformat(task['due_date'].replace('Z', '+00:00')).date() if task.get('due_date') else None
            due_date = st.date_input("Date limite", value=current_due)

            estimated_hours = st.number_input(
                "Heures estimées",
                min_value=0.0,
                step=0.5,
                value=float(task.get('estimated_hours', 0))
            )

        col1, col2 = st.columns(2)

        with col1:
            submitted = st.form_submit_button("💾 Sauvegarder", use_container_width=True)

        with col2:
            cancel = st.form_submit_button("❌ Annuler", use_container_width=True)

        if submitted:
            update_data = {
                'title': title,
                'description': description,
                'subproject_id': subproject_id,
                'assignee_id': assignee_id,
                'status': status,
                'priority': priority,
                'due_date': str(due_date) if due_date else None,
                'estimated_hours': estimated_hours if estimated_hours > 0 else None
            }

            if update_task(task['id'], update_data):
                st.session_state.pop('editing_task', None)
                st.rerun()

        if cancel:
            st.session_state.pop('editing_task', None)
            st.rerun()


def show_task_card(task, users):
    """Display task card with details and actions."""

    priority_colors = {
        'low': '#E8F5E9',
        'medium': '#FFF9C4',
        'high': '#FFE0B2',
        'urgent': '#FFCDD2'
    }

    priority_icons = {
        'low': '🟢',
        'medium': '🟡',
        'high': '🟠',
        'urgent': '🔴'
    }

    status_icons = {
        'todo': '📋',
        'in-progress': '🔄',
        'review': '👁️',
        'done': '✅'
    }

    with st.container():
        st.markdown(f"""
            <div style="
                padding: 15px;
                border-radius: 8px;
                background-color: {priority_colors.get(task['priority'], '#FFFFFF')};
                border-left: 4px solid #0066CC;
                margin-bottom: 15px;
            ">
                <h4>{status_icons.get(task['status'], '📌')} {task['title']}</h4>
            </div>
        """, unsafe_allow_html=True)

        col1, col2, col3 = st.columns([3, 2, 1])

        with col1:
            st.markdown(f"**Description:** {task.get('description', 'N/A')}")

            # Project and subproject info
            if task.get('subproject'):
                subproject_name = task['subproject'].get('name', 'N/A')
                project_name = task['subproject'].get('project', {}).get('name', 'N/A')
                st.markdown(f"**Projet:** {project_name} > {subproject_name}")

        with col2:
            assignee_name = task.get('assignee', {}).get('name', 'Non assigné') if task.get('assignee') else 'Non assigné'
            st.markdown(f"**Assigné à:** {assignee_name}")
            st.markdown(f"**Priorité:** {priority_icons.get(task['priority'], '⚪')} {task['priority']}")
            due = task.get('due_date', 'N/A')
            st.markdown(f"**Date limite:** {due}")

        with col3:
            if has_permission('update', task.get('assignee_id')):
                if st.button("✏️", key=f"edit_{task['id']}", use_container_width=True):
                    st.session_state.editing_task = task['id']
                    st.rerun()

            if has_permission('delete', task.get('assignee_id')):
                if st.button("🗑️", key=f"delete_{task['id']}", use_container_width=True):
                    if delete_task(task['id']):
                        st.rerun()

            if st.button("💬", key=f"comments_{task['id']}", use_container_width=True):
                st.session_state.viewing_comments = task['id']
                st.rerun()

        # Show comments if viewing
        if st.session_state.get('viewing_comments') == task['id']:
            show_comments_section(task['id'])

        st.markdown("---")


def show_comments_section(task_id):
    """Display comments section for a task."""

    st.markdown("#### 💬 Commentaires")

    comments = get_comments_by_task(task_id)

    # Add comment form
    if has_permission('create'):
        with st.form(f"add_comment_{task_id}", clear_on_submit=True):
            content = st.text_area("Ajouter un commentaire", placeholder="Votre commentaire...")
            submitted = st.form_submit_button("📤 Envoyer")

            if submitted and content:
                user = get_current_user()
                comment_data = {
                    'task_id': task_id,
                    'user_id': user['id'],
                    'content': content
                }
                if create_comment(comment_data):
                    st.rerun()

    # Display comments
    if not comments:
        st.info("Aucun commentaire pour cette tâche")
        return

    for comment in comments:
        with st.container():
            col1, col2 = st.columns([5, 1])

            with col1:
                user_name = comment.get('user', {}).get('name', 'Unknown') if comment.get('user') else 'Unknown'
                created_at = comment.get('created_at', 'N/A')
                st.markdown(f"**{user_name}** - *{created_at}*")
                st.markdown(f"{comment['content']}")

            with col2:
                if has_permission('delete', comment.get('user_id')):
                    if st.button("🗑️", key=f"delete_comment_{comment['id']}"):
                        if delete_comment(comment['id']):
                            st.rerun()

            st.markdown("---")


def show_tasks_table(tasks):
    """Display tasks in a filterable table."""

    if not tasks:
        st.info("Aucune tâche à afficher")
        return

    # Prepare data for table
    table_data = []
    for task in tasks:
        assignee_name = task.get('assignee', {}).get('name', 'Non assigné') if task.get('assignee') else 'Non assigné'
        project_name = task.get('subproject', {}).get('project', {}).get('name', 'N/A') if task.get('subproject') else 'N/A'
        subproject_name = task.get('subproject', {}).get('name', 'N/A') if task.get('subproject') else 'N/A'

        table_data.append({
            'Tâche': task['title'],
            'Projet': project_name,
            'Sous-projet': subproject_name,
            'Assigné à': assignee_name,
            'Statut': task['status'],
            'Priorité': task['priority'],
            'Date limite': task.get('due_date', 'N/A'),
            'ID': task['id']
        })

    df = pd.DataFrame(table_data)

    st.dataframe(
        df.drop('ID', axis=1),
        use_container_width=True,
        hide_index=True
    )


def main():
    """Main tasks page."""

    show_sidebar()

    user = get_current_user()
    users = get_all_users()
    subprojects = get_all_subprojects()

    # Header
    st.title("✅ Gestion des Tâches")
    st.markdown("Créez et gérez vos tâches quotidiennes")
    st.markdown("---")

    # Refresh button
    col1, col2 = st.columns([6, 1])
    with col2:
        if st.button("🔄 Actualiser", use_container_width=True):
            st.session_state.pop('editing_task', None)
            st.session_state.pop('viewing_comments', None)
            st.rerun()

    # Create task section
    if has_permission('create') and subprojects:
        with st.expander("➕ Créer une Nouvelle Tâche", expanded=False):
            show_create_task_form(subprojects, users)

        st.markdown("---")

    if not subprojects:
        st.warning("⚠️ Aucun sous-projet disponible. Créez d'abord un projet et un sous-projet.")
        return

    # View selector
    view_mode = st.radio(
        "Vue",
        options=['all', 'my_tasks', 'table'],
        format_func=lambda x: {
            'all': '📋 Toutes les tâches',
            'my_tasks': '👤 Mes tâches',
            'table': '📊 Vue tableau'
        }[x],
        horizontal=True
    )

    # Get tasks based on view
    if view_mode == 'my_tasks':
        tasks = get_tasks_by_assignee(user['id'])
        st.markdown(f"### 👤 Mes Tâches ({len(tasks)})")
    else:
        tasks = get_all_tasks()
        st.markdown(f"### 📋 Toutes les Tâches ({len(tasks)})")

    if not tasks:
        st.info("Aucune tâche pour le moment. Créez-en une!")
        return

    # Filters
    col1, col2, col3 = st.columns(3)

    with col1:
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

    with col2:
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

    with col3:
        search = st.text_input("🔍 Rechercher", placeholder="Titre de tâche...")

    # Apply filters
    filtered_tasks = [
        t for t in tasks
        if t['status'] in filter_status
        and t['priority'] in filter_priority
        and (not search or search.lower() in t['title'].lower())
    ]

    if not filtered_tasks:
        st.warning("Aucune tâche ne correspond aux filtres")
        return

    # Display tasks
    if view_mode == 'table':
        show_tasks_table(filtered_tasks)
    else:
        for task in filtered_tasks:
            if st.session_state.get('editing_task') == task['id']:
                show_edit_task_modal(task, subprojects, users)
            else:
                show_task_card(task, users)


if __name__ == "__main__":
    main()
