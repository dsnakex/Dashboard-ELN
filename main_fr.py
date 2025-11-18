"""
Nikaia Dashboard - Main Application
Application collaborative pour la gestion de projets R&D oncologie.
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
        st.markdown('<div class="sub-header">Plateforme collaborative R&D Oncologie</div>', unsafe_allow_html=True)

        st.markdown('<div class="login-container">', unsafe_allow_html=True)

        tab1, tab2 = st.tabs(["🔐 Connexion", "📝 Inscription"])

        # LOGIN TAB
        with tab1:
            st.subheader("Connexion")

            with st.form("login_form"):
                email = st.text_input("Email", placeholder="alice@biotech.fr")
                submit = st.form_submit_button("Se connecter", use_container_width=True)

                if submit:
                    if not email:
                        st.error("❌ Veuillez entrer votre email")
                    else:
                        user = login_user(email)
                        if user:
                            st.session_state.user = user
                            st.success(f"✅ Connecté en tant que {user['name']}")
                            st.rerun()
                        else:
                            st.error("❌ Utilisateur introuvable. Veuillez vous inscrire.")

            st.divider()
            st.info("💡 **Utilisateurs de test:**\n\n"
                   "- alice@biotech.fr (Manager)\n"
                   "- bob@biotech.fr (Contributor)\n"
                   "- charlie@biotech.fr (Contributor)\n"
                   "- diana@biotech.fr (Viewer)")

        # REGISTER TAB
        with tab2:
            st.subheader("Créer un compte")

            with st.form("register_form"):
                reg_email = st.text_input("Email", placeholder="votre.email@biotech.fr", key="reg_email")
                reg_name = st.text_input("Nom complet", placeholder="Prénom Nom", key="reg_name")
                reg_role = st.selectbox(
                    "Rôle",
                    options=['contributor', 'manager', 'viewer'],
                    format_func=lambda x: {
                        'manager': '👔 Manager (tous droits)',
                        'contributor': '✍️ Contributor (créer/modifier)',
                        'viewer': '👁️ Viewer (lecture seule)'
                    }[x]
                )

                submit_reg = st.form_submit_button("S'inscrire", use_container_width=True)

                if submit_reg:
                    if not reg_email or not reg_name:
                        st.error("❌ Veuillez remplir tous les champs")
                    else:
                        user = register_user(reg_email, reg_name, reg_role)
                        if user:
                            st.session_state.user = user
                            st.success(f"✅ Compte créé avec succès! Connecté en tant que {user['name']}")
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

            # Logout button
            if st.button("🚪 Déconnexion", use_container_width=True):
                logout_user()
                st.rerun()

        # Footer
        st.markdown("---")
        st.markdown("**Nikaia Biotech**")
        st.markdown("R&D Oncologie • France")
        st.markdown("v1.0.0")


def show_home_page():
    """Display home page for authenticated users."""

    user = get_current_user()

    st.markdown(f"# 🏠 Bienvenue, {user['name']}!")
    st.markdown("---")

    # Welcome message based on role
    if user['role'] == 'manager':
        st.info("👔 **Vous êtes Manager** - Vous avez accès complet à toutes les fonctionnalités")
    elif user['role'] == 'contributor':
        st.info("✍️ **Vous êtes Contributor** - Vous pouvez créer et modifier vos tâches")
    else:
        st.info("👁️ **Vous êtes Viewer** - Vous avez accès en lecture seule")

    st.markdown("---")

    # Quick navigation cards
    st.markdown("### 🚀 Accès rapide")

    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.markdown("""
            <div style="padding: 20px; background-color: #E3F2FD; border-radius: 10px; text-align: center;">
                <h2>📊</h2>
                <h4>Dashboard</h4>
                <p>KPIs et statistiques</p>
            </div>
        """, unsafe_allow_html=True)
        if st.button("Voir Dashboard", key="home_goto_dashboard", use_container_width=True):
            st.switch_page("pages/1_dashboard.py")

    with col2:
        st.markdown("""
            <div style="padding: 20px; background-color: #F3E5F5; border-radius: 10px; text-align: center;">
                <h2>📁</h2>
                <h4>Projets</h4>
                <p>Gestion des projets</p>
            </div>
        """, unsafe_allow_html=True)
        if st.button("Voir Projets", key="home_goto_projects", use_container_width=True):
            st.switch_page("pages/2_projects.py")

    with col3:
        st.markdown("""
            <div style="padding: 20px; background-color: #E8F5E9; border-radius: 10px; text-align: center;">
                <h2>✅</h2>
                <h4>Tâches</h4>
                <p>Gestion des tâches</p>
            </div>
        """, unsafe_allow_html=True)
        if st.button("Voir Tâches", key="home_goto_tasks", use_container_width=True):
            st.switch_page("pages/3_tasks.py")

    with col4:
        st.markdown("""
            <div style="padding: 20px; background-color: #FFF3E0; border-radius: 10px; text-align: center;">
                <h2>📋</h2>
                <h4>Kanban</h4>
                <p>Vue tableau</p>
            </div>
        """, unsafe_allow_html=True)
        if st.button("Voir Kanban", key="home_goto_kanban", use_container_width=True):
            st.switch_page("pages/4_kanban.py")

    st.markdown("---")

    # Getting started guide
    with st.expander("📖 Guide de démarrage"):
        st.markdown("""
        ### Comment utiliser Nikaia Dashboard

        **1. Dashboard 📊**
        - Visualisez les KPIs et statistiques globales
        - Suivez l'avancement des projets en temps réel
        - Identifiez les tâches urgentes et en retard

        **2. Projets 📁**
        - Créez et gérez vos projets de recherche
        - Organisez en sous-projets
        - Assignez des responsables

        **3. Tâches ✅**
        - Créez des tâches avec priorités
        - Assignez aux membres de l'équipe
        - Suivez les deadlines
        - Ajoutez des commentaires

        **4. Kanban 📋**
        - Vue tableau par statut (Todo, In Progress, Review, Done)
        - Drag & drop pour changer les statuts
        - Vision claire de l'avancement

        ### 🔐 Permissions

        | Rôle | Voir | Créer | Modifier | Supprimer |
        |------|------|-------|----------|-----------|
        | **Manager** | ✅ Tout | ✅ Tout | ✅ Tout | ✅ Tout |
        | **Contributor** | ✅ Tout | ✅ Tâches | ✅ Ses tâches | ✅ Ses tâches |
        | **Viewer** | ✅ Tout | ❌ | ❌ | ❌ |
        """)

    # Example project info
    with st.expander("🧪 Exemple: Projet YK725"):
        st.markdown("""
        ### YK725 Development - Inhibiteur kinase oncologique

        **Objectif:** Développement d'un nouvel inhibiteur de kinase pour le traitement du cancer

        **Sous-projets:**
        - 🔬 Synthèse chimique
        - 🧬 Tests in vitro
        - 🐁 Tests in vivo
        - 📊 Analyse des résultats
        - 📄 Rédaction publication

        **Équipe:** 5 chercheurs, 2 data analysts

        **Statut:** Active (Phase II)
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
