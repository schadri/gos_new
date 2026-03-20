import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createClient()

        const { error } = await supabase.rpc('increment_job_views', { job_uuid: id })

        if (error) {
            console.error('Error incrementing views:', error)
            return NextResponse.json({ error: 'Failed to increment views' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
