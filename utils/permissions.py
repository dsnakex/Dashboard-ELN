"""
Permissions module for Dashboard ELN
Centralized permission checking for all modules
"""

from typing import Dict, Any, Optional


def can_create_experiment(user: Dict[str, Any]) -> bool:
    """
    Check if user can create experiments.
    Manager and Contributor can create experiments.

    Args:
        user: User dictionary with 'role' key

    Returns:
        bool: True if user can create experiments
    """
    return user.get('role') in ['manager', 'contributor']


def can_edit_experiment(user: Dict[str, Any], experiment: Dict[str, Any]) -> bool:
    """
    Check if user can edit an experiment.
    Manager can edit any experiment.
    Contributor can edit experiments they are responsible for or created.

    Args:
        user: User dictionary with 'id' and 'role' keys
        experiment: Experiment dictionary with 'responsible_user_id' and 'created_by' keys

    Returns:
        bool: True if user can edit the experiment
    """
    if user.get('role') == 'manager':
        return True

    if user.get('role') == 'contributor':
        user_id = user.get('id')
        return (
            experiment.get('responsible_user_id') == user_id or
            experiment.get('created_by') == user_id
        )

    return False


def can_delete_experiment(user: Dict[str, Any], experiment: Dict[str, Any]) -> bool:
    """
    Check if user can delete an experiment.
    Manager can delete any experiment.
    Contributor can only delete experiments they created.

    Args:
        user: User dictionary with 'id' and 'role' keys
        experiment: Experiment dictionary with 'created_by' key

    Returns:
        bool: True if user can delete the experiment
    """
    if user.get('role') == 'manager':
        return True

    if user.get('role') == 'contributor':
        return experiment.get('created_by') == user.get('id')

    return False


def can_view_experiment(user: Dict[str, Any], experiment: Optional[Dict[str, Any]] = None) -> bool:
    """
    Check if user can view experiments.
    All authenticated users can view experiments.

    Args:
        user: User dictionary
        experiment: Optional experiment dictionary (not used, kept for API consistency)

    Returns:
        bool: True if user can view experiments
    """
    return user is not None


def can_validate_experiment(user: Dict[str, Any], experiment: Dict[str, Any]) -> bool:
    """
    Check if user can validate an experiment (change status to 'validated').
    Only Manager can validate experiments.

    Args:
        user: User dictionary with 'role' key
        experiment: Experiment dictionary

    Returns:
        bool: True if user can validate the experiment
    """
    return user.get('role') == 'manager'


def can_comment_experiment(user: Dict[str, Any]) -> bool:
    """
    Check if user can comment on experiments.
    Manager and Contributor can comment.

    Args:
        user: User dictionary with 'role' key

    Returns:
        bool: True if user can comment on experiments
    """
    return user.get('role') in ['manager', 'contributor']


# =============================================================================
# Future modules - placeholder functions
# =============================================================================

def can_create_analysis(user: Dict[str, Any]) -> bool:
    """Check if user can create analyses."""
    return user.get('role') in ['manager', 'contributor']


def can_edit_analysis(user: Dict[str, Any], analysis: Dict[str, Any]) -> bool:
    """Check if user can edit an analysis."""
    if user.get('role') == 'manager':
        return True
    if user.get('role') == 'contributor':
        user_id = user.get('id')
        return (
            analysis.get('analyst_user_id') == user_id or
            analysis.get('created_by') == user_id
        )
    return False


def can_delete_analysis(user: Dict[str, Any], analysis: Dict[str, Any]) -> bool:
    """Check if user can delete an analysis."""
    if user.get('role') == 'manager':
        return True
    if user.get('role') == 'contributor':
        return analysis.get('created_by') == user.get('id')
    return False


def can_create_hypothesis(user: Dict[str, Any]) -> bool:
    """Check if user can create hypotheses."""
    return user.get('role') in ['manager', 'contributor']


def can_edit_hypothesis(user: Dict[str, Any], hypothesis: Dict[str, Any]) -> bool:
    """Check if user can edit a hypothesis."""
    if user.get('role') == 'manager':
        return True
    if user.get('role') == 'contributor':
        user_id = user.get('id')
        return (
            hypothesis.get('responsible_user_id') == user_id or
            hypothesis.get('created_by') == user_id
        )
    return False


def can_delete_hypothesis(user: Dict[str, Any], hypothesis: Dict[str, Any]) -> bool:
    """Check if user can delete a hypothesis."""
    if user.get('role') == 'manager':
        return True
    if user.get('role') == 'contributor':
        return hypothesis.get('created_by') == user.get('id')
    return False
