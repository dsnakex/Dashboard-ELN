"""
Supabase Client Configuration
Gère la connexion à Supabase et fournit le client pour toute l'application.
"""

import os
from typing import Optional
from dotenv import load_dotenv
from supabase import create_client, Client
import streamlit as st

# Load environment variables
load_dotenv()


class SupabaseClient:
    """
    Singleton class for Supabase client management.

    Attributes:
        _instance: Singleton instance
        _client: Supabase client instance
    """

    _instance: Optional['SupabaseClient'] = None
    _client: Optional[Client] = None

    def __new__(cls) -> 'SupabaseClient':
        """Create singleton instance."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        """Initialize Supabase client if not already initialized."""
        if self._client is None:
            self._initialize_client()

    def _initialize_client(self) -> None:
        """
        Initialize the Supabase client with environment variables.

        Raises:
            ValueError: If required environment variables are missing
        """
        try:
            supabase_url = os.getenv("SUPABASE_URL")
            supabase_key = os.getenv("SUPABASE_KEY")

            if not supabase_url or not supabase_key:
                raise ValueError(
                    "❌ SUPABASE_URL et SUPABASE_KEY doivent être définis dans .env"
                )

            self._client = create_client(supabase_url, supabase_key)

        except Exception as e:
            st.error(f"❌ Erreur de connexion Supabase: {str(e)}")
            raise

    @property
    def client(self) -> Client:
        """
        Get the Supabase client instance.

        Returns:
            Client: Initialized Supabase client

        Raises:
            RuntimeError: If client is not initialized
        """
        if self._client is None:
            raise RuntimeError("Supabase client not initialized")
        return self._client


def get_supabase_client() -> Client:
    """
    Get the Supabase client instance (convenience function).

    Returns:
        Client: Initialized Supabase client

    Example:
        >>> client = get_supabase_client()
        >>> response = client.table('users').select('*').execute()
    """
    return SupabaseClient().client


# Test connection on import (optional, for debugging)
if __name__ == "__main__":
    try:
        client = get_supabase_client()
        print("✅ Supabase client initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize Supabase client: {e}")
