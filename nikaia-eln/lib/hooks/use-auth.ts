'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/stores/auth-store'
import toast from 'react-hot-toast'

export function useAuth() {
  const router = useRouter()
  const { user, isLoading, setUser, clearAuth } = useAuthStore()

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setUser])

  const signOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      clearAuth()
      toast.success('Signed out successfully')
      router.push('/login')
      router.refresh()
    } catch (error) {
      toast.error('Error signing out')
    }
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signOut,
  }
}
