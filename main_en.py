"""
Nikaia Dashboard - Main Application
Collaborative application for oncology R&D project management.
"""

import streamlit as st
from utils.auth import (
    login_user,
    register_user,
    logout_user,
    get_current_user,
    is_authenticated,
    get_role_badge
)

# Page configuration
st.set_page_config(
    page_title="Nikaia Dashboard",
    page_icon="🧬",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
    <style>
    .main-header {
        font-size: 2.5rem;
        font-weight: bold;
        color: #0066CC;
        margin-bottom: 1rem;
    }
    .sub-header {
        font-size: 1.2rem;
        color: #666;
        margin-bottom: 2rem;
    }
    .login-container {
        max-width: 500px;
        margin: 0 auto;
        padding: 2rem;
        border-radius: 10px;
        background-color: #f8f9fa;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stButton>button {
        width: 100%;
        background-color: #0066CC;
        color: white;
        font-weight: bold;
    }
    .stButton>button:hover {
        background-color: #0052A3;
    }
    </style>
""", unsafe_allow_html=True)


def show_login_page():
    """Display login/register page for unauthenticated users."""

    col1, col2, col3 = st.columns([1, 2, 1])

    with col2:
        st.markdown('<div class="main-header">🧬 Nikaia Dashboard</div>', unsafe_allow_html=True)
        st.markdown('<div class="sub-header">Collaborative Platform for Oncology R&D</div>', unsafe_allow_html=True)

        st.markdown('<div class="login-container">', unsafe_allow_html=True)

        tab1, tab2 = st.tabs(["🔐 Login", "📝 Register"])

        # LOGIN TAB
        with tab1:
            st.subheader("Login")

            with st.form("login_form"):
                email = st.text_input("Email", placeholder="alice@biotech.fr")
                submit = st.form_submit_button("Sign In", use_container_width=True)

                if submit:
                    if not email:
                        st.error("❌ Please enter your email")
                    else:
                        user = login_user(email)
                        if user:
                            st.session_state.user = user
                            st.success(f"✅ Logged in as {user['name']}")
                            st.rerun()
                        else:
                            st.error("❌ User not found. Please register.")

            st.divider()
            st.info("💡 **Test Users:**\n\n"
                   "- alice@biotech.fr (Manager)\n"
                   "- bob@biotech.fr (Contributor)\n"
                   "- charlie@biotech.fr (Contributor)\n"
                   "- diana@biotech.fr (Viewer)")

        # REGISTER TAB
        with tab2:
            st.subheader("Create Account")

            with st.form("register_form"):
                reg_email = st.text_input("Email", placeholder="your.email@biotech.fr", key="reg_email")
                reg_name = st.text_input("Full Name", placeholder="First Last", key="reg_name")
                reg_role = st.selectbox(
                    "Role",
                    options=['contributor', 'manager', 'viewer'],
                    format_func=lambda x: {
                        'manager': '👔 Manager (all rights)',
                        'contributor': '✍️ Contributor (create/edit)',
                        'viewer': '👁️ Viewer (read-only)'
                    }[x]
                )

                submit_reg = st.form_submit_button("Sign Up", use_container_width=True)

                if submit_reg:
                    if not reg_email or not reg_name:
                        st.error("❌ Please fill in all fields")
                    else:
                        user = register_user(reg_email, reg_name, reg_role)
                        if user:
                            st.session_state.user = user
                            st.success(f"✅ Account created successfully! Logged in as {user['name']}")
                            st.rerun()

        st.markdown('</div>', unsafe_allow_html=True)


def show_sidebar():
    """Display sidebar with user info and navigation."""

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

            # Navigation buttons (compatible with Streamlit 1.28.1)
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

            # Logout button
            if st.button("🚪 Logout", use_container_width=True):
                logout_user()
                st.rerun()

        # Footer
        st.markdown("---")
        st.markdown("**Nikaia Biotech**")
        st.markdown("Oncology R&D • France")
        st.markdown("v1.1.0")


def show_home_page():
    """Display home page for authenticated users."""

    user = get_current_user()

    st.markdown(f"# 🏠 Welcome, {user['name']}!")
    st.markdown("---")

    # Welcome message based on role
    if user['role'] == 'manager':
        st.info("👔 **You are a Manager** - You have full access to all features")
    elif user['role'] == 'contributor':
        st.info("✍️ **You are a Contributor** - You can create and edit your tasks")
    else:
        st.info("👁️ **You are a Viewer** - You have read-only access")

    st.markdown("---")

    # Quick navigation cards
    st.markdown("### 🚀 Quick Access")

    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.markdown("""
            <div style="padding: 20px; background-color: #E3F2FD; border-radius: 10px; text-align: center;">
                <h2>📊</h2>
                <h4>Dashboard</h4>
                <p>KPIs and statistics</p>
            </div>
        """, unsafe_allow_html=True)
        if st.button("View Dashboard", key="home_goto_dashboard", use_container_width=True):
            st.switch_page("pages/1_dashboard.py")

    with col2:
        st.markdown("""
            <div style="padding: 20px; background-color: #F3E5F5; border-radius: 10px; text-align: center;">
                <h2>📁</h2>
                <h4>Projects</h4>
                <p>Project management</p>
            </div>
        """, unsafe_allow_html=True)
        if st.button("View Projects", key="home_goto_projects", use_container_width=True):
            st.switch_page("pages/2_projects.py")

    with col3:
        st.markdown("""
            <div style="padding: 20px; background-color: #E8F5E9; border-radius: 10px; text-align: center;">
                <h2>✅</h2>
                <h4>Tasks</h4>
                <p>Task management</p>
            </div>
        """, unsafe_allow_html=True)
        if st.button("View Tasks", key="home_goto_tasks", use_container_width=True):
            st.switch_page("pages/3_tasks.py")

    with col4:
        st.markdown("""
            <div style="padding: 20px; background-color: #FFF3E0; border-radius: 10px; text-align: center;">
                <h2>📋</h2>
                <h4>Kanban</h4>
                <p>Board view</p>
            </div>
        """, unsafe_allow_html=True)
        if st.button("View Kanban", key="home_goto_kanban", use_container_width=True):
            st.switch_page("pages/4_kanban.py")

    st.markdown("---")

    # Getting started guide
    with st.expander("📖 Getting Started Guide"):
        st.markdown("""
        ### How to Use Nikaia Dashboard

        **1. Dashboard 📊**
        - View KPIs and global statistics
        - Track project progress in real-time
        - Identify urgent and overdue tasks

        **2. Projects 📁**
        - Create and manage your research projects
        - Organize into subprojects
        - Assign project leads

        **3. Tasks ✅**
        - Create tasks with priorities
        - Assign to team members
        - Track deadlines
        - Add comments

        **4. Kanban 📋**
        - Board view by status (Todo, In Progress, Review, Done)
        - Drag & drop to change status
        - Clear view of progress

        ### 🔐 Permissions

        | Role | View | Create | Edit | Delete |
        |------|------|--------|------|--------|
        | **Manager** | ✅ All | ✅ All | ✅ All | ✅ All |
        | **Contributor** | ✅ All | ✅ Tasks | ✅ Own tasks | ✅ Own tasks |
        | **Viewer** | ✅ All | ❌ | ❌ | ❌ |
        """)

    # Example project info
    with st.expander("🧪 Example: YK725 Project"):
        st.markdown("""
        ### YK725 Development - Kinase inhibitor for oncology

        **Objective:** Development of a novel kinase inhibitor for cancer treatment

        **Subprojects:**
        - 🔬 Chemical synthesis
        - 🧬 In vitro testing
        - 🐁 In vivo testing
        - 📊 Data analysis
        - 📄 Publication writing

        **Team:** 5 researchers, 2 data analysts

        **Status:** Active (Phase II)
        """)


def main():
    """Main application entry point."""

    # Check authentication
    if not is_authenticated():
        show_login_page()
    else:
        show_sidebar()
        show_home_page()


if __name__ == "__main__":
    main()
