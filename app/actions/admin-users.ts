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

    // First, delete from Auth (this usually triggers cascade in well-configured DBs, 
    // but in Supabase profiles might be separate)
    const { error: authError } = await adminClient.auth.admin.deleteUser(userId)

    if (authError) {
        console.error('Error deleting auth user:', authError)
        // If auth delete fails, we might still want to try profile delete 
        // especially if auth user was already gone
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
