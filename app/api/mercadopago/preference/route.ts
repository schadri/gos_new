import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { createClient } from '@/lib/supabase/server'

// Mapeo de paquetes (puedes ajustar los precios después)
const CREDIT_PACKAGES: Record<string, { title: string, price: number, credits: number, urgent_credits: number }> = {
  'pack-5': { title: 'Paquete Básico: 5 Créditos + 2 Urgentes', price: 5000, credits: 5, urgent_credits: 2 },
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

    const preference = new Preference(client)

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://goscentral.online'

    const response = await preference.create({
      body: {
        items: [
          {
            id: packageId,
            title: selectedPackage.title,
            quantity: 1,
            unit_price: selectedPackage.price,
            currency_id: 'ARS',
          }
        ],
        payer: {
          email: user.email,
        },
        external_reference: user.id, // Guardamos el user.id para saber a quién darle los créditos
        auto_return: 'approved',
        back_urls: {
          success: `${baseUrl}/employer/credits?success=true`,
          failure: `${baseUrl}/employer/credits?success=false`,
          pending: `${baseUrl}/employer/credits?success=pending`,
        },
        metadata: {
          credits: selectedPackage.credits,
          urgent_credits: selectedPackage.urgent_credits
        }
      }
    })

    return NextResponse.json({ 
      id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point 
    })

  } catch (error: any) {
    console.error('Error creating MP preference:', error)
    return NextResponse.json({ error: 'Failed to create preference' }, { status: 500 })
  }
}
