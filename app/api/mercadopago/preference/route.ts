import { NextResponse } from 'next/server'
import { MercadoPagoConfig, PreApproval } from 'mercadopago'
import { createClient } from '@/lib/supabase/server'

// Mapeo de paquetes (puedes ajustar los precios después)
const CREDIT_PACKAGES: Record<string, { title: string, price: number, credits: number, urgent_credits: number }> = {
  'pack-5': { title: 'Paquete Básico: 5 Créditos + 2 Urgentes', price: 500, credits: 5, urgent_credits: 2 },
  'pack-10': { title: 'Paquete Estándar: 10 Créditos + 5 Urgentes', price: 9000, credits: 10, urgent_credits: 5 },
  'pack-15': { title: 'Paquete Avanzado: 15 Créditos + 10 Urgentes', price: 13000, credits: 15, urgent_credits: 10 },
  'pack-20': { title: 'Paquete Pro: 20 Créditos + 15 Urgentes', price: 16000, credits: 20, urgent_credits: 15 },
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { packageId } = body

    if (!packageId || !CREDIT_PACKAGES[packageId]) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 })
    }

    const selectedPackage = CREDIT_PACKAGES[packageId]

    // Inicializa el SDK de Mercado Pago
    // Asegúrate de definir MP_ACCESS_TOKEN en tu archivo .env.local
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' })

    const preapproval = new PreApproval(client)

    // Forzamos explícitamente www para evitar errores 503 del Proxy Inverso en VPS si el apex domain no está mapeado correctamente.
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.goscentral.online'
    if (baseUrl.includes('goscentral.online') && !baseUrl.includes('www.')) {
      baseUrl = baseUrl.replace('https://goscentral.online', 'https://www.goscentral.online')
    }

    const response = await preapproval.create({
      body: {
        reason: selectedPackage.title,
        external_reference: `${user.id}___${packageId}`, // Guardamos userId y packageId
        payer_email: user.email,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: selectedPackage.price,
          currency_id: 'ARS',
        },
        back_url: `${baseUrl}/employer/credits`,
        status: 'pending' // Estado inicial hasta que el usuario la acepte
      }
    })

    return NextResponse.json({
      id: response.id,
      init_point: response.init_point,
    })

  } catch (error: any) {
    console.error('Error creating MP preapproval:', error)
    return NextResponse.json({ error: 'Failed to create preapproval' }, { status: 500 })
  }
}
