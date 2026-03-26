'use client'

import * as React from 'react'
import { createClient } from '@/lib/supabase/client'
import { getAvatarUrl } from '@/lib/utils'
import { User } from '@supabase/supabase-js'

interface AuthProfile {
  name?: string
  avatar?: string
  preferred_theme?: string
  credits?: number
  free_until?: string | null
}

interface AuthContextType {
  user: User | null
  profile: AuthProfile | null
  role: 'talent' | 'employer' | null
  isAdmin: boolean
  unreadCount: number
  isLoading: boolean
  refreshUnreadCount: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  profile: null,
  role: null,
  isAdmin: false,
  unreadCount: 0,
  isLoading: true,
  refreshUnreadCount: async () => {},
})

export const useAuth = () => React.useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [profile, setProfile] = React.useState<AuthProfile | null>(null)
  const [role, setRole] = React.useState<'talent' | 'employer' | null>(null)
  const [isAdmin, setIsAdmin] = React.useState(false)
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(true)

  const fetchUnreadCount = React.useCallback(async (userId: string) => {
    const supabase = createClient()
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)
    
    if (count !== null) {
      setUnreadCount(count)
    }
  }, [])

  React.useEffect(() => {
    const supabase = createClient()
    let isMounted = true

    const fetchUserAndRole = async () => {
      try {
        setIsLoading(true)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !session?.user) {
          if (isMounted) {
            setUser(null)
            setRole(null)
            setProfile(null)
            setIsAdmin(false)
            setUnreadCount(0)
            document.body.classList.remove('talent-theme')
            setIsLoading(false)
          }
          return
        }

        const authUser = session.user
        
        if (isMounted) {
          setUser(authUser)
          fetchUnreadCount(authUser.id)
        }
        
        // Check metadata first
        let currentRole: 'talent' | 'employer' | null = authUser.user_metadata?.role || null
        
        // Verify with DB
        const { data: profileData, error: profileError } = await (supabase
          .from('profiles') as any)
          .select('user_type, full_name, profile_photo, company_logo, preferred_theme, is_admin, credits, free_until')
          .eq('id', authUser.id)
          .maybeSingle()
          
        if (profileData && !profileError) {
          const prof = profileData as any
          if (prof.user_type === 'BUSINESS') currentRole = 'employer'
          else if (prof.user_type === 'TALENT') currentRole = 'talent'
          
          if (isMounted) {
            setRole(currentRole)
            setIsAdmin(!!prof.is_admin)
            setProfile({
              name: prof.full_name,
              avatar: getAvatarUrl(
                prof.user_type === 'BUSINESS' ? prof.company_logo : prof.profile_photo
              ) || undefined,
              preferred_theme: prof.preferred_theme,
              credits: prof.credits,
              free_until: prof.free_until
            })
          }
        } else {
          if (isMounted) setRole(currentRole)
        }
        
        // Sync theme immediately based on fetched role
        if (isMounted) {
          if (currentRole === 'talent') document.body.classList.add('talent-theme')
          else document.body.classList.remove('talent-theme')
          setIsLoading(false)
        }
      } catch (err) {
        console.error('AuthProvider: Error fetching user/role:', err)
        if (isMounted) setIsLoading(false)
      }
    }

    fetchUserAndRole()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'SIGNED_OUT') {
        fetchUserAndRole()
      }
    })

    const channel = supabase.channel('global-notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
         if (user?.id) fetchUnreadCount(user.id) // This relies on user.id, which might be stale in the closure. 
         // But for a simple reload trigger, it's fine, although an effect depending on user.id might be better.
      })
      .subscribe()

    return () => {
      isMounted = false
      subscription.unsubscribe()
      supabase.removeChannel(channel)
    }
  }, [fetchUnreadCount, user?.id]) 


  const refreshUnread = React.useCallback(async () => {
    if (user?.id) await fetchUnreadCount(user.id)
  }, [user?.id, fetchUnreadCount])

  React.useEffect(() => {
    if (!user?.id) return
    const supabase = createClient()
    const channel = supabase.channel(`notifications-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => {
         fetchUnreadCount(user.id)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, fetchUnreadCount])


  const value = React.useMemo(() => ({
    user,
    profile,
    role,
    isAdmin,
    unreadCount,
    isLoading,
    refreshUnreadCount: refreshUnread
  }), [user, profile, role, isAdmin, unreadCount, isLoading, refreshUnread])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
