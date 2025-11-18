"""
Authentication Module
Manages user authentication, registration and logout.
"""

from typing import Optional, Dict, Any
import streamlit as st
from .supabase_client import get_supabase_client


def login_user(email: str) -> Optional[Dict[str, Any]]:
    """
    Authenticate user by email (simplified auth for MVP).

    Args:
        email: User email address

    Returns:
        User data dict if found, None otherwise

    Example:
        >>> user = login_user("alice@biotech.fr")
        >>> if user:
        >>>     st.session_state.user = user
    """
    try:
        client = get_supabase_client()

        # Check if user exists
        response = client.table('users').select('*').eq('email', email).execute()

        if response.data and len(response.data) > 0:
            user_data = response.data[0]
            return user_data
        else:
            return None

    except Exception as e:
        st.error(f"❌ Login error: {str(e)}")
        return None


def register_user(email: str, name: str, role: str = 'contributor') -> Optional[Dict[str, Any]]:
    """
    Register a new user.

    Args:
        email: User email address
        name: User full name
        role: User role (manager, contributor, viewer)

    Returns:
        Created user data dict if successful, None otherwise

    Example:
        >>> user = register_user("bob@biotech.fr", "Bob Martin", "contributor")
    """
    try:
        client = get_supabase_client()

        # Check if user already exists
        existing = client.table('users').select('*').eq('email', email).execute()

        if existing.data and len(existing.data) > 0:
            st.warning(f"⚠️ User {email} already exists")
            return None

        # Create new user
        new_user = {
            'email': email,
            'name': name,
            'role': role
        }

        response = client.table('users').insert(new_user).execute()

        if response.data and len(response.data) > 0:
            return response.data[0]
        else:
            return None

    except Exception as e:
        st.error(f"❌ Registration error: {str(e)}")
        return None


def logout_user() -> None:
    """
    Logout current user by clearing session state.

    Example:
        >>> logout_user()
    """
    # Clear all session state
    for key in list(st.session_state.keys()):
        del st.session_state[key]


def get_current_user() -> Optional[Dict[str, Any]]:
    """
    Get currently logged-in user from session state.

    Returns:
        User data dict if logged in, None otherwise

    Example:
        >>> user = get_current_user()
        >>> if user:
        >>>     st.write(f"Logged in as {user['name']}")
    """
    return st.session_state.get('user', None)


def is_authenticated() -> bool:
    """
    Check if a user is currently authenticated.

    Returns:
        True if user is logged in, False otherwise

    Example:
        >>> if not is_authenticated():
        >>>     st.warning("Please log in")
        >>>     st.stop()
    """
    return 'user' in st.session_state and st.session_state.user is not None


def has_permission(action: str, resource_owner_id: Optional[str] = None) -> bool:
    """
    Check if current user has permission to perform action.

    Args:
        action: Action to check (view, create, update, delete)
        resource_owner_id: ID of resource owner (for update/delete)

    Returns:
        True if user has permission, False otherwise

    Permission matrix:
        - manager: All permissions
        - contributor: View all, create/update/delete own resources
        - viewer: View only

    Example:
        >>> if has_permission('delete', task['assignee_id']):
        >>>     # Allow deletion
    """
    user = get_current_user()

    if not user:
        return False

    role = user.get('role', 'viewer')
    user_id = user.get('id')

    # Manager can do everything
    if role == 'manager':
        return True

    # Viewer can only view
    if role == 'viewer':
        return action == 'view'

    # Contributor permissions
    if role == 'contributor':
        if action == 'view':
            return True
        elif action == 'create':
            return True
        elif action in ['update', 'delete']:
            # Can only modify own resources
            return resource_owner_id == user_id

    return False


def get_role_badge(role: str) -> str:
    """
    Get colored badge HTML for user role.

    Args:
        role: User role (manager, contributor, viewer)

    Returns:
        HTML badge string

    Example:
        >>> badge = get_role_badge('manager')
        >>> st.markdown(badge, unsafe_allow_html=True)
    """
    badges = {
        'manager': '<span style="background-color: #0066CC; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">👔 Manager</span>',
        'contributor': '<span style="background-color: #28A745; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">✍️ Contributor</span>',
        'viewer': '<span style="background-color: #6C757D; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">👁️ Viewer</span>'
    }
    return badges.get(role, role)
