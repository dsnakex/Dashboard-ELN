"""
Experiments Management Page
Dashboard ELN - Phase 1: Module Expériences
"""

import streamlit as st
from datetime import datetime, date
from utils.auth import is_authenticated, get_current_user, has_permission
from utils.crud import get_all_subprojects, get_all_users
from utils.experiments_crud import (
    get_all_experiments,
    get_experiment_by_id,
    create_experiment,
    update_experiment,
    delete_experiment,
    get_experiment_comments,
    add_experiment_comment
)
from utils.permissions import (
    can_create_experiment,
    can_edit_experiment,
    can_delete_experiment,
    can_comment_experiment
)

# Page configuration
st.set_page_config(
    page_title="Experiments - Nikaia ELN",
    page_icon="🧪",
    layout="wide"
)

# Authentication check
if not is_authenticated():
    st.warning("⚠️ Please log in to access this page")
    st.stop()

# Get current user
current_user = get_current_user()

# Status and priority configurations
STATUS_OPTIONS = ['planned', 'in_progress', 'completed', 'cancelled', 'validated']
PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent']

STATUS_COLORS = {
    'planned': '#FFF3E0',
    'in_progress': '#E3F2FD',
    'completed': '#E8F5E9',
    'cancelled': '#FFEBEE',
    'validated': '#F3E5F5'
}

STATUS_LABELS = {
    'planned': '📋 Planned',
    'in_progress': '🔄 In Progress',
    'completed': '✅ Completed',
    'cancelled': '❌ Cancelled',
    'validated': '✔️ Validated'
}

PRIORITY_COLORS = {
    'low': '#E8F5E9',
    'medium': '#FFF9C4',
    'high': '#FFE0B2',
    'urgent': '#FFCDD2'
}

PRIORITY_LABELS = {
    'low': '🟢 Low',
    'medium': '🟡 Medium',
    'high': '🟠 High',
    'urgent': '🔴 Urgent'
}


def show_sidebar():
    """Display sidebar with user info and navigation."""
    with st.sidebar:
        st.markdown(f"### 👤 {current_user['name']}")
        st.markdown(f"**Role:** {current_user['role'].title()}")
        st.markdown("---")

        if st.button("🏠 Home", use_container_width=True):
            st.switch_page("main.py")

        if st.button("📊 Dashboard", use_container_width=True):
            st.switch_page("pages/1_dashboard.py")

        if st.button("📁 Projects", use_container_width=True):
            st.switch_page("pages/2_projects.py")

        if st.button("✅ Tasks", use_container_width=True):
            st.switch_page("pages/3_tasks.py")

        st.markdown("---")

        if st.button("🚪 Logout", use_container_width=True):
            for key in list(st.session_state.keys()):
                del st.session_state[key]
            st.rerun()


def show_create_form():
    """Display form to create a new experiment."""
    with st.form("create_experiment_form", clear_on_submit=True):
        st.markdown("### 📝 General Information")

        title = st.text_input("Title *", max_chars=255, placeholder="Experiment title")
        objective = st.text_area("Scientific Objective *", height=100, placeholder="What is the goal of this experiment?")
        description = st.text_area("Description", height=100, placeholder="Detailed description")

        st.markdown("### 🔬 Protocol")
        protocol = st.text_area("Experimental Protocol", height=150, placeholder="Step-by-step protocol")
        conditions = st.text_area("Experimental Conditions", height=100, placeholder="Conditions and parameters")

        st.markdown("### 📋 Organization")

        col1, col2 = st.columns(2)

        with col1:
            # Get subprojects
            subprojects = get_all_subprojects()
            if not subprojects:
                st.warning("⚠️ No subprojects available. Please create a subproject first.")
                subproject_id = None
            else:
                subproject_options = {sp['id']: f"{sp['name']} ({sp.get('project', {}).get('name', 'N/A')})" for sp in subprojects}
                subproject_id = st.selectbox(
                    "Subproject *",
                    options=list(subproject_options.keys()),
                    format_func=lambda x: subproject_options[x]
                )

            # Get users
            users = get_all_users()
            if users:
                user_options = {u['id']: u['name'] for u in users}
                responsible_user_id = st.selectbox(
                    "Responsible *",
                    options=list(user_options.keys()),
                    format_func=lambda x: user_options[x],
                    index=list(user_options.keys()).index(current_user['id']) if current_user['id'] in user_options else 0
                )
            else:
                responsible_user_id = current_user['id']

        with col2:
            status = st.selectbox(
                "Status",
                options=STATUS_OPTIONS,
                format_func=lambda x: STATUS_LABELS.get(x, x)
            )
            priority = st.selectbox(
                "Priority",
                options=PRIORITY_OPTIONS,
                format_func=lambda x: PRIORITY_LABELS.get(x, x),
                index=1  # Default to medium
            )

        st.markdown("### 📅 Planning")

        col1, col2, col3 = st.columns(3)
        with col1:
            planned_date = st.date_input("Planned Date", value=None)
        with col2:
            start_date = st.date_input("Start Date", value=None)
        with col3:
            deadline = st.date_input("Deadline", value=None)

        estimated_duration = st.number_input(
            "Estimated Duration (hours)",
            min_value=0.0,
            step=0.5,
            value=0.0
        )

        # Submit button
        submitted = st.form_submit_button("🚀 Create Experiment", use_container_width=True)

        if submitted:
            # Validation
            if not title:
                st.error("❌ Title is required")
            elif not objective:
                st.error("❌ Objective is required")
            elif not subproject_id:
                st.error("❌ Subproject is required")
            else:
                experiment_data = {
                    'title': title,
                    'objective': objective,
                    'description': description if description else None,
                    'protocol': protocol if protocol else None,
                    'conditions': conditions if conditions else None,
                    'subproject_id': subproject_id,
                    'responsible_user_id': responsible_user_id,
                    'status': status,
                    'priority': priority,
                    'planned_date': str(planned_date) if planned_date else None,
                    'start_date': str(start_date) if start_date else None,
                    'deadline': str(deadline) if deadline else None,
                    'estimated_duration_hours': estimated_duration if estimated_duration > 0 else None
                }

                result = create_experiment(experiment_data, current_user)
                if result:
                    st.balloons()
                    st.rerun()


def show_edit_form(experiment):
    """Display form to edit an existing experiment."""
    with st.form(f"edit_experiment_{experiment['id']}", clear_on_submit=False):
        st.markdown("### ✏️ Edit Experiment")

        title = st.text_input("Title *", value=experiment['title'], max_chars=255)
        objective = st.text_area("Scientific Objective *", value=experiment['objective'] or '', height=100)
        description = st.text_area("Description", value=experiment['description'] or '', height=100)

        st.markdown("### 🔬 Protocol")
        protocol = st.text_area("Experimental Protocol", value=experiment['protocol'] or '', height=150)
        conditions = st.text_area("Experimental Conditions", value=experiment['conditions'] or '', height=100)

        st.markdown("### 📊 Results")
        observations = st.text_area("Observations", value=experiment['observations'] or '', height=100)
        results_summary = st.text_area("Results Summary", value=experiment['results_summary'] or '', height=100)

        st.markdown("### 📋 Organization")

        col1, col2 = st.columns(2)

        with col1:
            # Get subprojects
            subprojects = get_all_subprojects()
            subproject_options = {sp['id']: sp['name'] for sp in subprojects}
            current_subproject_idx = list(subproject_options.keys()).index(experiment['subproject_id']) if experiment['subproject_id'] in subproject_options else 0
            subproject_id = st.selectbox(
                "Subproject *",
                options=list(subproject_options.keys()),
                format_func=lambda x: subproject_options[x],
                index=current_subproject_idx,
                key=f"edit_subproject_{experiment['id']}"
            )

            # Get users
            users = get_all_users()
            user_options = {u['id']: u['name'] for u in users}
            current_user_idx = list(user_options.keys()).index(experiment['responsible_user_id']) if experiment['responsible_user_id'] in user_options else 0
            responsible_user_id = st.selectbox(
                "Responsible *",
                options=list(user_options.keys()),
                format_func=lambda x: user_options[x],
                index=current_user_idx,
                key=f"edit_responsible_{experiment['id']}"
            )

        with col2:
            current_status_idx = STATUS_OPTIONS.index(experiment['status']) if experiment['status'] in STATUS_OPTIONS else 0
            status = st.selectbox(
                "Status",
                options=STATUS_OPTIONS,
                format_func=lambda x: STATUS_LABELS.get(x, x),
                index=current_status_idx,
                key=f"edit_status_{experiment['id']}"
            )

            current_priority_idx = PRIORITY_OPTIONS.index(experiment['priority']) if experiment['priority'] in PRIORITY_OPTIONS else 1
            priority = st.selectbox(
                "Priority",
                options=PRIORITY_OPTIONS,
                format_func=lambda x: PRIORITY_LABELS.get(x, x),
                index=current_priority_idx,
                key=f"edit_priority_{experiment['id']}"
            )

        st.markdown("### 📅 Planning")

        col1, col2, col3, col4 = st.columns(4)
        with col1:
            planned_date = st.date_input(
                "Planned Date",
                value=datetime.strptime(experiment['planned_date'], '%Y-%m-%d').date() if experiment.get('planned_date') else None,
                key=f"edit_planned_{experiment['id']}"
            )
        with col2:
            start_date = st.date_input(
                "Start Date",
                value=datetime.strptime(experiment['start_date'], '%Y-%m-%d').date() if experiment.get('start_date') else None,
                key=f"edit_start_{experiment['id']}"
            )
        with col3:
            completion_date = st.date_input(
                "Completion Date",
                value=datetime.strptime(experiment['completion_date'], '%Y-%m-%d').date() if experiment.get('completion_date') else None,
                key=f"edit_completion_{experiment['id']}"
            )
        with col4:
            deadline = st.date_input(
                "Deadline",
                value=datetime.strptime(experiment['deadline'], '%Y-%m-%d').date() if experiment.get('deadline') else None,
                key=f"edit_deadline_{experiment['id']}"
            )

        col1, col2 = st.columns(2)
        with col1:
            estimated_duration = st.number_input(
                "Estimated Duration (hours)",
                min_value=0.0,
                step=0.5,
                value=float(experiment.get('estimated_duration_hours') or 0),
                key=f"edit_estimated_{experiment['id']}"
            )
        with col2:
            actual_duration = st.number_input(
                "Actual Duration (hours)",
                min_value=0.0,
                step=0.5,
                value=float(experiment.get('actual_duration_hours') or 0),
                key=f"edit_actual_{experiment['id']}"
            )

        col1, col2 = st.columns(2)
        with col1:
            submitted = st.form_submit_button("💾 Save Changes", use_container_width=True)
        with col2:
            cancelled = st.form_submit_button("❌ Cancel", use_container_width=True)

        if cancelled:
            st.session_state.pop('editing_experiment', None)
            st.rerun()

        if submitted:
            if not title:
                st.error("❌ Title is required")
            elif not objective:
                st.error("❌ Objective is required")
            else:
                updates = {
                    'title': title,
                    'objective': objective,
                    'description': description if description else None,
                    'protocol': protocol if protocol else None,
                    'conditions': conditions if conditions else None,
                    'observations': observations if observations else None,
                    'results_summary': results_summary if results_summary else None,
                    'subproject_id': subproject_id,
                    'responsible_user_id': responsible_user_id,
                    'status': status,
                    'priority': priority,
                    'planned_date': str(planned_date) if planned_date else None,
                    'start_date': str(start_date) if start_date else None,
                    'completion_date': str(completion_date) if completion_date else None,
                    'deadline': str(deadline) if deadline else None,
                    'estimated_duration_hours': estimated_duration if estimated_duration > 0 else None,
                    'actual_duration_hours': actual_duration if actual_duration > 0 else None
                }

                if update_experiment(experiment['id'], updates, current_user):
                    st.session_state.pop('editing_experiment', None)
                    st.rerun()


def show_experiment_card(experiment):
    """Display an experiment as a card."""
    status_color = STATUS_COLORS.get(experiment['status'], '#FFFFFF')
    priority_color = PRIORITY_COLORS.get(experiment['priority'], '#FFFFFF')

    with st.container():
        st.markdown(f"""
        <div style="background-color: {status_color}; padding: 15px; border-radius: 10px; margin-bottom: 10px; border-left: 4px solid {priority_color};">
            <h4 style="margin: 0;">🧪 {experiment['title']}</h4>
        </div>
        """, unsafe_allow_html=True)

        col1, col2, col3 = st.columns([3, 2, 1])

        with col1:
            st.markdown(f"**Objective:** {experiment['objective'][:200]}..." if len(experiment['objective']) > 200 else f"**Objective:** {experiment['objective']}")

            if experiment.get('subproject'):
                project_name = experiment['subproject'].get('project', {}).get('name', 'N/A')
                st.markdown(f"**Project:** {project_name} / {experiment['subproject']['name']}")

            if experiment.get('responsible'):
                st.markdown(f"**Responsible:** {experiment['responsible']['name']}")

        with col2:
            st.markdown(f"**Status:** {STATUS_LABELS.get(experiment['status'], experiment['status'])}")
            st.markdown(f"**Priority:** {PRIORITY_LABELS.get(experiment['priority'], experiment['priority'])}")

            if experiment.get('planned_date'):
                st.markdown(f"**Planned:** {experiment['planned_date']}")
            if experiment.get('deadline'):
                st.markdown(f"**Deadline:** {experiment['deadline']}")

        with col3:
            # Action buttons based on permissions
            if can_edit_experiment(current_user, experiment):
                if st.button("✏️ Edit", key=f"edit_btn_{experiment['id']}", use_container_width=True):
                    st.session_state['editing_experiment'] = experiment['id']
                    st.rerun()

            if can_delete_experiment(current_user, experiment):
                if st.button("🗑️ Delete", key=f"delete_btn_{experiment['id']}", use_container_width=True):
                    if st.session_state.get(f'confirm_delete_{experiment["id"]}'):
                        if delete_experiment(experiment['id'], current_user):
                            st.session_state.pop(f'confirm_delete_{experiment["id"]}', None)
                            st.rerun()
                    else:
                        st.session_state[f'confirm_delete_{experiment["id"]}'] = True
                        st.warning("Click again to confirm deletion")

            if st.button("👁️ Details", key=f"view_btn_{experiment['id']}", use_container_width=True):
                st.session_state['viewing_experiment'] = experiment['id']
                st.rerun()


def show_experiment_detail(experiment):
    """Display detailed view of an experiment."""
    st.markdown("---")
    st.markdown(f"## 🧪 {experiment['title']}")

    # Back button
    if st.button("⬅️ Back to List"):
        st.session_state.pop('viewing_experiment', None)
        st.rerun()

    # Status and priority badges
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.markdown(f"**Status:** {STATUS_LABELS.get(experiment['status'], experiment['status'])}")
    with col2:
        st.markdown(f"**Priority:** {PRIORITY_LABELS.get(experiment['priority'], experiment['priority'])}")
    with col3:
        if experiment.get('responsible'):
            st.markdown(f"**Responsible:** {experiment['responsible']['name']}")
    with col4:
        if experiment.get('creator'):
            st.markdown(f"**Created by:** {experiment['creator']['name']}")

    st.markdown("---")

    # Main content in tabs
    tab1, tab2, tab3, tab4 = st.tabs(["📋 General", "🔬 Protocol", "📊 Results", "💬 Comments"])

    with tab1:
        st.markdown("### Objective")
        st.write(experiment['objective'])

        if experiment.get('description'):
            st.markdown("### Description")
            st.write(experiment['description'])

        st.markdown("### Organization")
        col1, col2 = st.columns(2)
        with col1:
            if experiment.get('subproject'):
                project_name = experiment['subproject'].get('project', {}).get('name', 'N/A')
                st.markdown(f"**Project:** {project_name}")
                st.markdown(f"**Subproject:** {experiment['subproject']['name']}")
        with col2:
            st.markdown(f"**Created:** {experiment['created_at'][:10]}")
            st.markdown(f"**Last Updated:** {experiment['updated_at'][:10]}")

        st.markdown("### Planning")
        col1, col2, col3, col4 = st.columns(4)
        with col1:
            st.markdown(f"**Planned:** {experiment.get('planned_date', 'N/A')}")
        with col2:
            st.markdown(f"**Started:** {experiment.get('start_date', 'N/A')}")
        with col3:
            st.markdown(f"**Completed:** {experiment.get('completion_date', 'N/A')}")
        with col4:
            st.markdown(f"**Deadline:** {experiment.get('deadline', 'N/A')}")

        if experiment.get('estimated_duration_hours') or experiment.get('actual_duration_hours'):
            col1, col2 = st.columns(2)
            with col1:
                st.markdown(f"**Estimated Duration:** {experiment.get('estimated_duration_hours', 'N/A')} hours")
            with col2:
                st.markdown(f"**Actual Duration:** {experiment.get('actual_duration_hours', 'N/A')} hours")

    with tab2:
        if experiment.get('protocol'):
            st.markdown("### Protocol")
            st.write(experiment['protocol'])
        else:
            st.info("No protocol defined yet")

        if experiment.get('conditions'):
            st.markdown("### Conditions")
            st.write(experiment['conditions'])

    with tab3:
        if experiment.get('observations'):
            st.markdown("### Observations")
            st.write(experiment['observations'])
        else:
            st.info("No observations recorded yet")

        if experiment.get('results_summary'):
            st.markdown("### Results Summary")
            st.write(experiment['results_summary'])
        else:
            st.info("No results summary yet")

    with tab4:
        # Comments section
        comments = get_experiment_comments(experiment['id'])

        if comments:
            for comment in comments:
                with st.container():
                    st.markdown(f"""
                    <div style="background-color: #f0f2f6; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                        <strong>{comment['user']['name']}</strong> - {comment['created_at'][:10]}
                        <br>{comment['content']}
                    </div>
                    """, unsafe_allow_html=True)
        else:
            st.info("No comments yet")

        # Add comment form
        if can_comment_experiment(current_user):
            st.markdown("### Add Comment")
            with st.form(f"comment_form_{experiment['id']}", clear_on_submit=True):
                comment_content = st.text_area("Your comment", height=100)
                if st.form_submit_button("💬 Add Comment"):
                    if comment_content:
                        if add_experiment_comment(experiment['id'], comment_content, current_user):
                            st.rerun()
                    else:
                        st.error("Please enter a comment")


def main():
    """Main function for the experiments page."""
    show_sidebar()

    st.title("🧪 Experiments Management")
    st.markdown("---")

    # Check if viewing a specific experiment
    if st.session_state.get('viewing_experiment'):
        experiment = get_experiment_by_id(st.session_state['viewing_experiment'])
        if experiment:
            show_experiment_detail(experiment)
        else:
            st.error("Experiment not found")
            st.session_state.pop('viewing_experiment', None)
        return

    # Tabs for list and create
    if can_create_experiment(current_user):
        tab1, tab2 = st.tabs(["📋 Experiments List", "➕ New Experiment"])
    else:
        tab1 = st.tabs(["📋 Experiments List"])[0]
        tab2 = None

    # TAB 1: Experiments List
    with tab1:
        # Filters
        st.markdown("### 🔍 Filters")
        col1, col2, col3, col4 = st.columns(4)

        with col1:
            filter_status = st.selectbox(
                "Status",
                options=["All"] + STATUS_OPTIONS,
                format_func=lambda x: "All Statuses" if x == "All" else STATUS_LABELS.get(x, x)
            )

        with col2:
            filter_priority = st.selectbox(
                "Priority",
                options=["All"] + PRIORITY_OPTIONS,
                format_func=lambda x: "All Priorities" if x == "All" else PRIORITY_LABELS.get(x, x)
            )

        with col3:
            subprojects = get_all_subprojects()
            subproject_options = {"All": "All Subprojects"}
            subproject_options.update({sp['id']: sp['name'] for sp in subprojects})
            filter_subproject = st.selectbox(
                "Subproject",
                options=list(subproject_options.keys()),
                format_func=lambda x: subproject_options[x]
            )

        with col4:
            search_query = st.text_input("🔍 Search", placeholder="Search experiments...")

        # Refresh button
        col1, col2, col3, col4 = st.columns([1, 1, 1, 1])
        with col1:
            if st.button("🔄 Refresh", use_container_width=True):
                st.rerun()

        # Build filters
        filters = {}
        if filter_status != "All":
            filters['status'] = filter_status
        if filter_priority != "All":
            filters['priority'] = filter_priority
        if filter_subproject != "All":
            filters['subproject_id'] = filter_subproject
        if search_query:
            filters['search'] = search_query

        # Load experiments
        experiments = get_all_experiments(filters)

        st.markdown("---")

        if not experiments:
            st.info("📭 No experiments found. Create one in the 'New Experiment' tab!")
        else:
            st.markdown(f"### 📊 {len(experiments)} Experiment(s)")

            for exp in experiments:
                # Check if editing this experiment
                if st.session_state.get('editing_experiment') == exp['id']:
                    show_edit_form(exp)
                else:
                    show_experiment_card(exp)

    # TAB 2: Create Experiment
    if tab2 is not None:
        with tab2:
            show_create_form()


if __name__ == "__main__":
    main()
