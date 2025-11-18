"""
Kanban Board Page
Vue tableau Kanban avec colonnes par statut.
"""

import streamlit as st
from utils.auth import (
    is_authenticated,
    get_current_user,
    logout_user,
    get_role_badge,
    has_permission
)
from utils.crud import (
    get_all_tasks,
    get_tasks_by_status,
    update_task
)

# Page config
st.set_page_config(
    page_title="Kanban - Nikaia",
    page_icon="📋",
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


def show_task_card_kanban(task, column_status):
    """Display task card in Kanban view."""

    priority_icons = {
        'low': '🟢',
        'medium': '🟡',
        'high': '🟠',
        'urgent': '🔴'
    }

    priority_colors = {
        'low': '#E8F5E9',
        'medium': '#FFF9C4',
        'high': '#FFE0B2',
        'urgent': '#FFCDD2'
    }

    assignee_name = task.get('assignee', {}).get('name', 'Non assigné') if task.get('assignee') else 'Non assigné'
    due_date = task.get('due_date', 'N/A')

    # Card container
    with st.container():
        st.markdown(f"""
            <div style="
                padding: 12px;
                border-radius: 8px;
                background-color: {priority_colors.get(task['priority'], '#FFFFFF')};
                border-left: 4px solid #0066CC;
                margin-bottom: 12px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            ">
                <div style="font-weight: bold; margin-bottom: 8px;">
                    {priority_icons.get(task['priority'], '⚪')} {task['title']}
                </div>
                <div style="font-size: 12px; color: #666;">
                    👤 {assignee_name}<br/>
                    📅 {due_date}
                </div>
            </div>
        """, unsafe_allow_html=True)

        # Action buttons
        if has_permission('update', task.get('assignee_id')):
            col1, col2, col3, col4 = st.columns(4)

            # Move buttons based on current status
            if column_status != 'todo':
                with col1:
                    if st.button("⬅️", key=f"left_{task['id']}", help="Déplacer à gauche"):
                        new_status = {
                            'in-progress': 'todo',
                            'review': 'in-progress',
                            'done': 'review'
                        }.get(column_status)
                        if new_status:
                            update_task(task['id'], {'status': new_status})
                            st.rerun()

            if column_status != 'done':
                with col4:
                    if st.button("➡️", key=f"right_{task['id']}", help="Déplacer à droite"):
                        new_status = {
                            'todo': 'in-progress',
                            'in-progress': 'review',
                            'review': 'done'
                        }.get(column_status)
                        if new_status:
                            update_task(task['id'], {'status': new_status})
                            st.rerun()

            with col2:
                if st.button("👁️", key=f"view_{task['id']}", help="Voir détails"):
                    st.session_state.viewing_task_detail = task['id']
                    st.switch_page("pages/3_tasks.py")

        st.markdown("---")


def show_kanban_column(title, status, tasks, icon, color):
    """Display a Kanban column."""

    filtered_tasks = [t for t in tasks if t['status'] == status]

    st.markdown(f"""
        <div style="
            background-color: {color};
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 10px;
        ">
            <h3 style="margin: 0; color: #333;">
                {icon} {title} ({len(filtered_tasks)})
            </h3>
        </div>
    """, unsafe_allow_html=True)

    if not filtered_tasks:
        st.info("Aucune tâche")
    else:
        for task in filtered_tasks:
            show_task_card_kanban(task, status)


def show_task_detail_modal(task):
    """Show task details in a modal-like view."""

    st.markdown("### 📋 Détails de la Tâche")

    col1, col2 = st.columns(2)

    with col1:
        st.markdown(f"**Titre:** {task['title']}")
        st.markdown(f"**Description:** {task.get('description', 'N/A')}")

        if task.get('subproject'):
            project_name = task['subproject'].get('project', {}).get('name', 'N/A')
            subproject_name = task['subproject'].get('name', 'N/A')
            st.markdown(f"**Projet:** {project_name} > {subproject_name}")

    with col2:
        assignee_name = task.get('assignee', {}).get('name', 'Non assigné') if task.get('assignee') else 'Non assigné'
        st.markdown(f"**Assigné à:** {assignee_name}")
        st.markdown(f"**Statut:** {task['status']}")
        st.markdown(f"**Priorité:** {task['priority']}")
        st.markdown(f"**Date limite:** {task.get('due_date', 'N/A')}")

    if st.button("❌ Fermer", use_container_width=True):
        st.session_state.pop('viewing_task_kanban', None)
        st.rerun()


def main():
    """Main Kanban board page."""

    show_sidebar()

    user = get_current_user()

    # Header
    st.title("📋 Tableau Kanban")
    st.markdown("Vue d'ensemble de toutes vos tâches par statut")
    st.markdown("---")

    # Refresh button
    col1, col2 = st.columns([6, 1])
    with col2:
        if st.button("🔄 Actualiser", use_container_width=True):
            st.session_state.pop('viewing_task_kanban', None)
            st.rerun()

    # Get all tasks
    tasks = get_all_tasks()

    if not tasks:
        st.info("Aucune tâche à afficher. Créez des tâches depuis la page Tâches!")
        return

    # Filters
    col1, col2 = st.columns(2)

    with col1:
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

    with col2:
        filter_assignee = st.multiselect(
            "Filtrer par assigné",
            options=list(set([
                t.get('assignee', {}).get('name', 'Non assigné') if t.get('assignee') else 'Non assigné'
                for t in tasks
            ])),
            default=[]
        )

    # Apply filters
    filtered_tasks = [
        t for t in tasks
        if t['priority'] in filter_priority
        and (not filter_assignee or (
            t.get('assignee', {}).get('name', 'Non assigné') if t.get('assignee') else 'Non assigné'
        ) in filter_assignee)
    ]

    if not filtered_tasks:
        st.warning("Aucune tâche ne correspond aux filtres")
        return

    st.markdown("---")

    # Statistics
    col1, col2, col3, col4 = st.columns(4)

    with col1:
        todo_count = len([t for t in filtered_tasks if t['status'] == 'todo'])
        st.metric("📋 À faire", todo_count)

    with col2:
        in_progress_count = len([t for t in filtered_tasks if t['status'] == 'in-progress'])
        st.metric("🔄 En cours", in_progress_count)

    with col3:
        review_count = len([t for t in filtered_tasks if t['status'] == 'review'])
        st.metric("👁️ En revue", review_count)

    with col4:
        done_count = len([t for t in filtered_tasks if t['status'] == 'done'])
        st.metric("✅ Terminé", done_count)

    st.markdown("---")

    # Kanban Board - 4 columns
    col1, col2, col3, col4 = st.columns(4)

    with col1:
        show_kanban_column("À faire", "todo", filtered_tasks, "📋", "#FFEBEE")

    with col2:
        show_kanban_column("En cours", "in-progress", filtered_tasks, "🔄", "#E3F2FD")

    with col3:
        show_kanban_column("En revue", "review", filtered_tasks, "👁️", "#FFF9C4")

    with col4:
        show_kanban_column("Terminé", "done", filtered_tasks, "✅", "#E8F5E9")

    # Instructions
    st.markdown("---")
    with st.expander("ℹ️ Comment utiliser le Kanban"):
        st.markdown("""
        ### 📋 Guide d'utilisation

        **Déplacer les tâches:**
        - Utilisez les boutons ⬅️ et ➡️ pour déplacer les tâches entre les colonnes
        - ⬅️ : Déplace la tâche vers la colonne précédente
        - ➡️ : Déplace la tâche vers la colonne suivante

        **Actions disponibles:**
        - 👁️ : Voir les détails complets de la tâche
        - Les changements de statut sont enregistrés automatiquement

        **Colonnes:**
        1. **📋 À faire** : Tâches non commencées
        2. **🔄 En cours** : Tâches en cours de réalisation
        3. **👁️ En revue** : Tâches en attente de validation
        4. **✅ Terminé** : Tâches complétées

        **Permissions:**
        - **Managers** peuvent déplacer toutes les tâches
        - **Contributors** peuvent déplacer uniquement leurs tâches
        - **Viewers** peuvent uniquement consulter le tableau
        """)


if __name__ == "__main__":
    main()
