'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getOrCreateChat(jobId: string, applicantId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No user found')

    // Check if chat already exists
    const { data: existingChat, error: findError } = await supabase
        .from('chats')
        .select('id')
        .eq('job_id', jobId)
        .eq('applicant_id', applicantId)
        .maybeSingle()

    if (findError) {
        console.error('Error finding chat:', findError)
        throw new Error(`Failed to check existing chat: ${JSON.stringify(findError)}`)
    }

    if (existingChat) {
        return existingChat.id
    }

    // Find the employer for this job
    const { data: jobInfo, error: jobError } = await supabase
        .from('jobs')
        .select('created_by')
        .eq('id', jobId)
        .single()

    if (jobError || !jobInfo) {
        console.error('Error finding job owner:', jobError)
        throw new Error(`Failed to find job owner: ${JSON.stringify(jobError || 'No job info')}`)
    }

    // Create new chat
    const { data: newChat, error: insertError } = await supabase
        .from('chats')
        .insert({
            job_id: jobId,
            employer_id: jobInfo.created_by,
            applicant_id: applicantId
        })
        .select('id')
        .single()

    if (insertError) {
        console.error('Error creating chat:', insertError)
        throw new Error(`Failed to create chat: ${JSON.stringify(insertError)}`)
    }

    return newChat.id
}

export async function sendMessage(chatId: string, content: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No user found')

    const { error } = await supabase
        .from('messages')
        .insert({
            chat_id: chatId,
            sender_id: user.id,
            content,
            is_read: false
        })

    if (error) {
        console.error('Error sending message:', error)
        throw new Error('Failed to send message')
    }

    // Update chat's updated_at timestamp
    await supabase
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId)

    revalidatePath(`/chat/${chatId}`)
    revalidatePath('/chat')

    return { success: true }
}
