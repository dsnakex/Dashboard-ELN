"""
Navigation Helper Module
Fonction réutilisable pour la sidebar navigation (compatible Streamlit 1.28.1)
"""

import streamlit as st
from .auth import get_current_user, logout_user, get_role_badge


def show_sidebar():
    """
    Display sidebar with user info and navigation.
    Compatible with Streamlit 1.28.1 (uses st.button + st.switch_page)
    """
    user = get_current_user()

    with st.sidebar:
        st.markdown("### 🧬 Nikaia Dashboard")
        st.markdown("---")

        # User info
        if user:
            st.markdown(f"**👤 {user['name']}**")
            st.markdown(get_role_badge(user['role']), unsafe_allow_html=True)
            st.markdown(f"📧 {user['email']}")
            st.markdown("---")

            # Navigation
            st.markdown("### 📍 Navigation")

            # Get current page from session state
            current_page = st.session_state.get('current_page', 'home')

            # Navigation buttons
            col1, col2 = st.columns([1, 20])
            with col2:
                if st.button("🏠 Accueil", key="nav_home", use_container_width=True,
                           type="primary" if current_page == 'home' else "secondary"):
                    st.switch_page("main.py")

                if st.button("📊 Dashboard", key="nav_dashboard", use_container_width=True,
                           type="primary" if current_page == 'dashboard' else "secondary"):
                    st.switch_page("pages/1_dashboard.py")

                if st.button("📁 Projets", key="nav_projects", use_container_width=True,
                           type="primary" if current_page == 'projects' else "secondary"):
                    st.switch_page("pages/2_projects.py")

                if st.button("✅ Tâches", key="nav_tasks", use_container_width=True,
                           type="primary" if current_page == 'tasks' else "secondary"):
                    st.switch_page("pages/3_tasks.py")

                if st.button("📋 Kanban", key="nav_kanban", use_container_width=True,
                           type="primary" if current_page == 'kanban' else "secondary"):
                    st.switch_page("pages/4_kanban.py")

                if st.button("📅 Timeline", key="nav_timeline", use_container_width=True,
                           type="primary" if current_page == 'timeline' else "secondary"):
                    st.switch_page("pages/5_timeline.py")

            st.markdown("---")

            # Logout button
            if st.button("🚪 Déconnexion", use_container_width=True):
                logout_user()
                st.rerun()

        # Footer
        st.markdown("---")
        st.markdown("**Nikaia Biotech**")
        st.markdown("R&D Oncologie • France")
        st.markdown("v1.1.0")
