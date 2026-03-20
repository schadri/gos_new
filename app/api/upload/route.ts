import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // In a real application, you would upload to Supabase Storage here:
        // const { data, error } = await supabase.storage.from('avatars').upload(...)

        // For now, simulate success
        const fakeUrl = `https://mock-image-upload.com/${file.name}`

        return NextResponse.json({ url: fakeUrl })
    } catch (error) {
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
}
