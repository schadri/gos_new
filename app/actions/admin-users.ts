'use server'

import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function deleteUserAction(userId: string) {
    const supabase = await createClient()

    // 1. Verify caller is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data: profile } = await (supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single() as any) as { data: { is_admin: boolean } | null }

    if (!profile?.is_admin) {
        throw new Error('No tienes permisos de administrador')
    }

    // 2. Perform deletion using Admin Client (Service Role)
    const adminClient = getSupabaseAdmin()

    // First, delete from Auth
    const { error: authError } = await adminClient.auth.admin.deleteUser(userId)

    if (authError) {
        console.error('Error deleting auth user:', authError)
    }

    // Second, delete from profiles 
    const { error: profileError } = await adminClient
        .from('profiles')
        .delete()
        .eq('id', userId)

    if (profileError) {
        console.error('Error deleting profile:', profileError)
        return { success: false, error: 'No se pudo eliminar el perfil de la base de datos' }
    }

    revalidatePath('/admin/users')
    return { success: true }
}

export async function toggleUserBanAction(userId: string, currentStatus: boolean) {
    const supabase = await createClient()

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data: callerProfile } = await (supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single() as any) as { data: { is_admin: boolean } | null }

    if (!callerProfile?.is_admin) {
        throw new Error('No tienes permisos de administrador')
    }

    const adminClient = getSupabaseAdmin()
    const { error } = await (adminClient
        .from('profiles') as any)
        .update({ is_active: !currentStatus })
        .eq('id', userId)

    if (error) {
        console.error('Error toggling ban:', error)
        return { success: false, error: 'Error al cambiar estado' }
    }

    revalidatePath('/admin/users')
    return { success: true }
}

export async function resetUserPasswordAction(userId: string) {
    const supabase = await createClient()

    // 1. Verify caller is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data: profile } = await (supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single() as any) as { data: { is_admin: boolean } | null }

    if (!profile?.is_admin) {
        throw new Error('No tienes permisos de administrador')
    }

    // 2. Get user email using Admin Client
    const adminClient = getSupabaseAdmin()
    const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(userId)

    if (userError || !userData.user?.email) {
        console.error('Error fetching user for password reset:', userError)
        return { success: false, error: 'No se pudo encontrar el correo del usuario' }
    }

    // 3. Trigger reset password email
    const { error: resetError } = await adminClient.auth.resetPasswordForEmail(userData.user.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password`,
    })

    if (resetError) {
        console.error('Error triggering password reset:', resetError)
        return { success: false, error: resetError.message }
    }

    return { success: true }
}
