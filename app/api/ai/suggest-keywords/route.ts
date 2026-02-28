import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { category, title, description } = await request.json()

        // In a real app, this would call OpenAI or Gemini API
        // const response = await openai.chat.completions.create(...)

        // Mock response based on input
        const keywords = [
            'Liderazgo',
            'Trabajo en equipo',
            'Resolución de problemas',
            'Comunicación eficiente',
            'Atención al detalle',
            category === 'cocina' ? 'Costos y Mermas' : 'Ventas sugestivas',
            category === 'cocina' ? 'Manejo de stock' : 'Atención al cliente',
            'Orientación a resultados'
        ]

        return NextResponse.json({ keywords })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to generate keywords' }, { status: 500 })
    }
}
