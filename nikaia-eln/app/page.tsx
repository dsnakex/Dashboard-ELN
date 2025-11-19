import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Redirect authenticated users to dashboard
    redirect('/projects')
  } else {
    // Redirect unauthenticated users to login
    redirect('/login')
  }
}
