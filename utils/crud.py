"""
CRUD Operations Module
Gère toutes les opérations Create, Read, Update, Delete pour les tables.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import streamlit as st
from .supabase_client import get_supabase_client


# =====================================================
# USERS CRUD
# =====================================================

def get_all_users() -> List[Dict[str, Any]]:
    """Get all users from database."""
    try:
        client = get_supabase_client()
        response = client.table('users').select('*').order('name').execute()
        return response.data if response.data else []
    except Exception as e:
        st.error(f"❌ Erreur lecture users: {str(e)}")
        return []


def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Get user by ID."""
    try:
        client = get_supabase_client()
        response = client.table('users').select('*').eq('id', user_id).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        st.error(f"❌ Erreur lecture user: {str(e)}")
        return None


# =====================================================
# PROJECTS CRUD
# =====================================================

def get_all_projects() -> List[Dict[str, Any]]:
    """Get all projects with lead information."""
    try:
        client = get_supabase_client()
        response = client.table('projects').select(
            '*, lead:users!projects_lead_id_fkey(id, name, email)'
        ).order('created_at', desc=True).execute()
        return response.data if response.data else []
    except Exception as e:
        st.error(f"❌ Erreur lecture projects: {str(e)}")
        return []


def get_project_by_id(project_id: str) -> Optional[Dict[str, Any]]:
    """Get project by ID with lead information."""
    try:
        client = get_supabase_client()
        response = client.table('projects').select(
            '*, lead:users!projects_lead_id_fkey(id, name, email)'
        ).eq('id', project_id).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        st.error(f"❌ Erreur lecture project: {str(e)}")
        return None


def create_project(data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Create a new project."""
    try:
        client = get_supabase_client()
        response = client.table('projects').insert(data).execute()
        if response.data:
            st.success(f"✅ Projet '{data['name']}' créé avec succès!")
            return response.data[0]
        return None
    except Exception as e:
        st.error(f"❌ Erreur création project: {str(e)}")
        return None


def update_project(project_id: str, data: Dict[str, Any]) -> bool:
    """Update an existing project."""
    try:
        client = get_supabase_client()
        response = client.table('projects').update(data).eq('id', project_id).execute()
        if response.data:
            st.success("✅ Projet mis à jour avec succès!")
            return True
        return False
    except Exception as e:
        st.error(f"❌ Erreur mise à jour project: {str(e)}")
        return False


def delete_project(project_id: str) -> bool:
    """Delete a project (cascades to subprojects and tasks)."""
    try:
        client = get_supabase_client()
        response = client.table('projects').delete().eq('id', project_id).execute()
        if response.data:
            st.success("✅ Projet supprimé avec succès!")
            return True
        return False
    except Exception as e:
        st.error(f"❌ Erreur suppression project: {str(e)}")
        return False


# =====================================================
# SUBPROJECTS CRUD
# =====================================================

def get_subprojects_by_project(project_id: str) -> List[Dict[str, Any]]:
    """Get all subprojects for a project."""
    try:
        client = get_supabase_client()
        response = client.table('subprojects').select(
            '*, lead:users!subprojects_lead_id_fkey(id, name, email)'
        ).eq('project_id', project_id).order('created_at', desc=True).execute()
        return response.data if response.data else []
    except Exception as e:
        st.error(f"❌ Erreur lecture subprojects: {str(e)}")
        return []


def get_all_subprojects() -> List[Dict[str, Any]]:
    """Get all subprojects with project and lead information."""
    try:
        client = get_supabase_client()
        response = client.table('subprojects').select(
            '*, project:projects(id, name), lead:users!subprojects_lead_id_fkey(id, name, email)'
        ).order('created_at', desc=True).execute()
        return response.data if response.data else []
    except Exception as e:
        st.error(f"❌ Erreur lecture subprojects: {str(e)}")
        return []


def create_subproject(data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Create a new subproject."""
    try:
        client = get_supabase_client()
        response = client.table('subprojects').insert(data).execute()
        if response.data:
            st.success(f"✅ Sous-projet '{data['name']}' créé avec succès!")
            return response.data[0]
        return None
    except Exception as e:
        st.error(f"❌ Erreur création subproject: {str(e)}")
        return None


def update_subproject(subproject_id: str, data: Dict[str, Any]) -> bool:
    """Update an existing subproject."""
    try:
        client = get_supabase_client()
        response = client.table('subprojects').update(data).eq('id', subproject_id).execute()
        if response.data:
            st.success("✅ Sous-projet mis à jour avec succès!")
            return True
        return False
    except Exception as e:
        st.error(f"❌ Erreur mise à jour subproject: {str(e)}")
        return False


def delete_subproject(subproject_id: str) -> bool:
    """Delete a subproject (cascades to tasks)."""
    try:
        client = get_supabase_client()
        response = client.table('subprojects').delete().eq('id', subproject_id).execute()
        if response.data:
            st.success("✅ Sous-projet supprimé avec succès!")
            return True
        return False
    except Exception as e:
        st.error(f"❌ Erreur suppression subproject: {str(e)}")
        return False


# =====================================================
# TASKS CRUD
# =====================================================

def get_tasks_by_subproject(subproject_id: str) -> List[Dict[str, Any]]:
    """Get all tasks for a subproject."""
    try:
        client = get_supabase_client()
        response = client.table('tasks').select(
            '*, subproject:subprojects(id, name, project_id), assignee:users!tasks_assignee_id_fkey(id, name, email)'
        ).eq('subproject_id', subproject_id).order('created_at', desc=True).execute()
        return response.data if response.data else []
    except Exception as e:
        st.error(f"❌ Erreur lecture tasks: {str(e)}")
        return []


def get_all_tasks() -> List[Dict[str, Any]]:
    """Get all tasks with subproject and assignee information."""
    try:
        client = get_supabase_client()
        response = client.table('tasks').select(
            '*, subproject:subprojects(id, name, project_id, project:projects(id, name)), assignee:users!tasks_assignee_id_fkey(id, name, email)'
        ).order('created_at', desc=True).execute()
        return response.data if response.data else []
    except Exception as e:
        st.error(f"❌ Erreur lecture tasks: {str(e)}")
        return []


def get_tasks_by_status(status: str) -> List[Dict[str, Any]]:
    """Get all tasks with a specific status."""
    try:
        client = get_supabase_client()
        response = client.table('tasks').select(
            '*, subproject:subprojects(id, name, project_id, project:projects(id, name)), assignee:users!tasks_assignee_id_fkey(id, name, email)'
        ).eq('status', status).order('created_at', desc=True).execute()
        return response.data if response.data else []
    except Exception as e:
        st.error(f"❌ Erreur lecture tasks: {str(e)}")
        return []


def get_tasks_by_assignee(assignee_id: str) -> List[Dict[str, Any]]:
    """Get all tasks assigned to a user."""
    try:
        client = get_supabase_client()
        response = client.table('tasks').select(
            '*, subproject:subprojects(id, name, project_id, project:projects(id, name)), assignee:users!tasks_assignee_id_fkey(id, name, email)'
        ).eq('assignee_id', assignee_id).order('due_date').execute()
        return response.data if response.data else []
    except Exception as e:
        st.error(f"❌ Erreur lecture tasks: {str(e)}")
        return []


def create_task(data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Create a new task."""
    try:
        client = get_supabase_client()
        response = client.table('tasks').insert(data).execute()
        if response.data:
            st.success(f"✅ Tâche '{data['title']}' créée avec succès!")
            return response.data[0]
        return None
    except Exception as e:
        st.error(f"❌ Erreur création task: {str(e)}")
        return None


def update_task(task_id: str, data: Dict[str, Any]) -> bool:
    """Update an existing task."""
    try:
        client = get_supabase_client()
        response = client.table('tasks').update(data).eq('id', task_id).execute()
        if response.data:
            st.success("✅ Tâche mise à jour avec succès!")
            return True
        return False
    except Exception as e:
        st.error(f"❌ Erreur mise à jour task: {str(e)}")
        return False


def delete_task(task_id: str) -> bool:
    """Delete a task."""
    try:
        client = get_supabase_client()
        response = client.table('tasks').delete().eq('id', task_id).execute()
        if response.data:
            st.success("✅ Tâche supprimée avec succès!")
            return True
        return False
    except Exception as e:
        st.error(f"❌ Erreur suppression task: {str(e)}")
        return False


# =====================================================
# COMMENTS CRUD
# =====================================================

def get_comments_by_task(task_id: str) -> List[Dict[str, Any]]:
    """Get all comments for a task."""
    try:
        client = get_supabase_client()
        response = client.table('comments').select(
            '*, user:users(id, name, email)'
        ).eq('task_id', task_id).order('created_at', desc=True).execute()
        return response.data if response.data else []
    except Exception as e:
        st.error(f"❌ Erreur lecture comments: {str(e)}")
        return []


def create_comment(data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Create a new comment."""
    try:
        client = get_supabase_client()
        response = client.table('comments').insert(data).execute()
        if response.data:
            st.success("✅ Commentaire ajouté avec succès!")
            return response.data[0]
        return None
    except Exception as e:
        st.error(f"❌ Erreur création comment: {str(e)}")
        return None


def delete_comment(comment_id: str) -> bool:
    """Delete a comment."""
    try:
        client = get_supabase_client()
        response = client.table('comments').delete().eq('id', comment_id).execute()
        if response.data:
            st.success("✅ Commentaire supprimé avec succès!")
            return True
        return False
    except Exception as e:
        st.error(f"❌ Erreur suppression comment: {str(e)}")
        return False


# =====================================================
# STATISTICS & ANALYTICS
# =====================================================

def get_dashboard_stats() -> Dict[str, Any]:
    """Get aggregated statistics for dashboard."""
    try:
        projects = get_all_projects()
        subprojects = get_all_subprojects()
        tasks = get_all_tasks()

        # Calculate statistics
        total_projects = len(projects)
        active_projects = len([p for p in projects if p['status'] == 'active'])

        total_tasks = len(tasks)
        completed_tasks = len([t for t in tasks if t['status'] == 'done'])
        in_progress_tasks = len([t for t in tasks if t['status'] == 'in-progress'])
        todo_tasks = len([t for t in tasks if t['status'] == 'todo'])

        # Task completion rate
        completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0

        # Tasks by priority
        high_priority = len([t for t in tasks if t['priority'] == 'high'])
        urgent_priority = len([t for t in tasks if t['priority'] == 'urgent'])

        # Overdue tasks
        today = datetime.now().date()
        overdue_tasks = len([
            t for t in tasks
            if t.get('due_date') and datetime.fromisoformat(t['due_date'].replace('Z', '+00:00')).date() < today
               and t['status'] != 'done'
        ])

        return {
            'total_projects': total_projects,
            'active_projects': active_projects,
            'total_subprojects': len(subprojects),
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'in_progress_tasks': in_progress_tasks,
            'todo_tasks': todo_tasks,
            'completion_rate': completion_rate,
            'high_priority_tasks': high_priority,
            'urgent_priority_tasks': urgent_priority,
            'overdue_tasks': overdue_tasks
        }

    except Exception as e:
        st.error(f"❌ Erreur calcul statistiques: {str(e)}")
        return {}
