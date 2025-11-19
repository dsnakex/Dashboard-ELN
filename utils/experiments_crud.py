"""
CRUD operations for experiments module
Dashboard ELN - Phase 1
"""

import streamlit as st
import logging
from typing import Dict, Any, List, Optional
from utils.supabase_client import get_supabase_client
from utils.permissions import (
    can_create_experiment,
    can_edit_experiment,
    can_delete_experiment
)

logger = logging.getLogger(__name__)


def get_all_experiments(filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """
    Get all experiments with optional filters.

    Args:
        filters: Optional dictionary with filter criteria
            - status: Filter by status
            - subproject_id: Filter by subproject
            - responsible_user_id: Filter by responsible user
            - search: Text search in title/description
            - priority: Filter by priority

    Returns:
        List of experiment dictionaries with related data
    """
    try:
        client = get_supabase_client()
        query = client.table('experiments').select(
            '*, '
            'subproject:subprojects!experiments_subproject_id_fkey(id, name, project_id, project:projects!subprojects_project_id_fkey(id, name)), '
            'responsible:users!experiments_responsible_user_id_fkey(id, name, email), '
            'creator:users!experiments_created_by_fkey(id, name, email)'
        ).order('created_at', desc=True)

        if filters:
            if filters.get('status'):
                query = query.eq('status', filters['status'])
            if filters.get('subproject_id'):
                query = query.eq('subproject_id', filters['subproject_id'])
            if filters.get('responsible_user_id'):
                query = query.eq('responsible_user_id', filters['responsible_user_id'])
            if filters.get('priority'):
                query = query.eq('priority', filters['priority'])
            if filters.get('search'):
                search_term = filters['search']
                query = query.or_(f'title.ilike.%{search_term}%,description.ilike.%{search_term}%,objective.ilike.%{search_term}%')

        response = query.execute()
        return response.data if response.data else []

    except Exception as e:
        logger.error(f"Error fetching experiments: {str(e)}")
        st.error(f"Erreur lors du chargement des expériences: {str(e)}")
        return []


def get_experiment_by_id(experiment_id: str) -> Optional[Dict[str, Any]]:
    """
    Get a single experiment by ID with all related data.

    Args:
        experiment_id: UUID of the experiment

    Returns:
        Experiment dictionary or None if not found
    """
    try:
        client = get_supabase_client()
        response = client.table('experiments').select(
            '*, '
            'subproject:subprojects!experiments_subproject_id_fkey(id, name, project_id, project:projects!subprojects_project_id_fkey(id, name)), '
            'responsible:users!experiments_responsible_user_id_fkey(id, name, email), '
            'creator:users!experiments_created_by_fkey(id, name, email)'
        ).eq('id', experiment_id).execute()

        return response.data[0] if response.data else None

    except Exception as e:
        logger.error(f"Error fetching experiment {experiment_id}: {str(e)}")
        st.error(f"Erreur lors du chargement de l'expérience: {str(e)}")
        return None


def create_experiment(experiment_data: Dict[str, Any], user: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Create a new experiment.

    Args:
        experiment_data: Dictionary with experiment fields
        user: Current user dictionary

    Returns:
        Created experiment dictionary or None on failure

    Raises:
        PermissionError: If user doesn't have permission to create
    """
    if not can_create_experiment(user):
        st.error("Vous n'avez pas la permission de créer une expérience")
        raise PermissionError("User cannot create experiments")

    # Add creator information
    experiment_data['created_by'] = user['id']

    try:
        client = get_supabase_client()
        response = client.table('experiments').insert(experiment_data).execute()

        if response.data:
            logger.info(f"Experiment created by user {user['id']}: {response.data[0]['id']}")
            st.success(f"Expérience '{experiment_data['title']}' créée avec succès!")
            return response.data[0]

        return None

    except Exception as e:
        logger.error(f"Error creating experiment: {str(e)}")
        st.error(f"Erreur lors de la création de l'expérience: {str(e)}")
        return None


def update_experiment(experiment_id: str, updates: Dict[str, Any], user: Dict[str, Any]) -> bool:
    """
    Update an existing experiment.

    Args:
        experiment_id: UUID of the experiment to update
        updates: Dictionary with fields to update
        user: Current user dictionary

    Returns:
        True if update successful, False otherwise

    Raises:
        PermissionError: If user doesn't have permission to edit
    """
    # Get the experiment to check permissions
    experiment = get_experiment_by_id(experiment_id)
    if not experiment:
        st.error("Expérience introuvable")
        return False

    if not can_edit_experiment(user, experiment):
        st.error("Vous n'avez pas la permission de modifier cette expérience")
        raise PermissionError("User cannot edit this experiment")

    try:
        client = get_supabase_client()
        response = client.table('experiments').update(updates).eq('id', experiment_id).execute()

        if response.data:
            logger.info(f"Experiment {experiment_id} updated by user {user['id']}")
            st.success("Expérience mise à jour avec succès!")
            return True

        return False

    except Exception as e:
        logger.error(f"Error updating experiment {experiment_id}: {str(e)}")
        st.error(f"Erreur lors de la mise à jour de l'expérience: {str(e)}")
        return False


def delete_experiment(experiment_id: str, user: Dict[str, Any]) -> bool:
    """
    Delete an experiment.

    Args:
        experiment_id: UUID of the experiment to delete
        user: Current user dictionary

    Returns:
        True if deletion successful, False otherwise

    Raises:
        PermissionError: If user doesn't have permission to delete
    """
    # Get the experiment to check permissions
    experiment = get_experiment_by_id(experiment_id)
    if not experiment:
        st.error("Expérience introuvable")
        return False

    if not can_delete_experiment(user, experiment):
        st.error("Vous n'avez pas la permission de supprimer cette expérience")
        raise PermissionError("User cannot delete this experiment")

    try:
        client = get_supabase_client()
        response = client.table('experiments').delete().eq('id', experiment_id).execute()

        if response.data:
            logger.info(f"Experiment {experiment_id} deleted by user {user['id']}")
            st.success("Expérience supprimée avec succès!")
            return True

        return False

    except Exception as e:
        logger.error(f"Error deleting experiment {experiment_id}: {str(e)}")
        st.error(f"Erreur lors de la suppression de l'expérience: {str(e)}")
        return False


def get_experiments_by_subproject(subproject_id: str) -> List[Dict[str, Any]]:
    """
    Get all experiments for a specific subproject.

    Args:
        subproject_id: UUID of the subproject

    Returns:
        List of experiment dictionaries
    """
    return get_all_experiments({'subproject_id': subproject_id})


def get_experiments_by_user(user_id: str) -> List[Dict[str, Any]]:
    """
    Get all experiments assigned to a specific user.

    Args:
        user_id: UUID of the user

    Returns:
        List of experiment dictionaries
    """
    return get_all_experiments({'responsible_user_id': user_id})


def get_experiments_by_status(status: str) -> List[Dict[str, Any]]:
    """
    Get all experiments with a specific status.

    Args:
        status: Status to filter by

    Returns:
        List of experiment dictionaries
    """
    return get_all_experiments({'status': status})


def get_experiment_stats() -> Dict[str, Any]:
    """
    Get statistics about experiments for dashboard KPIs.

    Returns:
        Dictionary with experiment statistics
    """
    try:
        experiments = get_all_experiments()

        total = len(experiments)
        by_status = {}
        by_priority = {}

        for exp in experiments:
            status = exp.get('status', 'unknown')
            priority = exp.get('priority', 'unknown')

            by_status[status] = by_status.get(status, 0) + 1
            by_priority[priority] = by_priority.get(priority, 0) + 1

        return {
            'total': total,
            'planned': by_status.get('planned', 0),
            'in_progress': by_status.get('in_progress', 0),
            'completed': by_status.get('completed', 0),
            'validated': by_status.get('validated', 0),
            'cancelled': by_status.get('cancelled', 0),
            'by_status': by_status,
            'by_priority': by_priority
        }

    except Exception as e:
        logger.error(f"Error getting experiment stats: {str(e)}")
        return {
            'total': 0,
            'planned': 0,
            'in_progress': 0,
            'completed': 0,
            'validated': 0,
            'cancelled': 0,
            'by_status': {},
            'by_priority': {}
        }


def get_experiment_comments(experiment_id: str) -> List[Dict[str, Any]]:
    """
    Get all comments for a specific experiment.

    Args:
        experiment_id: UUID of the experiment

    Returns:
        List of comment dictionaries
    """
    try:
        client = get_supabase_client()
        response = client.table('comments').select(
            '*, user:users!comments_user_id_fkey(id, name, email)'
        ).eq('experiment_id', experiment_id).order('created_at', desc=True).execute()

        return response.data if response.data else []

    except Exception as e:
        logger.error(f"Error fetching comments for experiment {experiment_id}: {str(e)}")
        return []


def add_experiment_comment(experiment_id: str, content: str, user: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Add a comment to an experiment.

    Args:
        experiment_id: UUID of the experiment
        content: Comment text
        user: Current user dictionary

    Returns:
        Created comment dictionary or None on failure
    """
    try:
        client = get_supabase_client()
        comment_data = {
            'experiment_id': experiment_id,
            'user_id': user['id'],
            'content': content
        }

        response = client.table('comments').insert(comment_data).execute()

        if response.data:
            logger.info(f"Comment added to experiment {experiment_id} by user {user['id']}")
            st.success("Commentaire ajouté!")
            return response.data[0]

        return None

    except Exception as e:
        logger.error(f"Error adding comment to experiment {experiment_id}: {str(e)}")
        st.error(f"Erreur lors de l'ajout du commentaire: {str(e)}")
        return None
