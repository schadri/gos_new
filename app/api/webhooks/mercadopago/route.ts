import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createClient } from '@supabase/supabase-js'

// Usar el cliente admin para bypass RLS al actualizar la cuenta del usuario desde el webhook
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const bodyText = await request.text()
    
    // 1. Validar la Firma (Security)
    const xSignature = request.headers.get('x-signature')
    const xRequestId = request.headers.get('x-request-id')
    const secret = process.env.MP_WEBHOOK_SECRET

    if (xSignature && xRequestId && secret) {
      const parts = xSignature.split(',')
      const tsPart = parts.find(p => p.startsWith('ts='))
      const v1Part = parts.find(p => p.startsWith('v1='))

      const ts = tsPart ? tsPart.split('=')[1] : ''
      const hash = v1Part ? v1Part.split('=')[1] : ''

      // El payload debe usarse directamente desde la URL o el ID del body
      // En Webhooks V1 se firma el ID o `data.id`
      const bodyParams = new URLSearchParams(request.url.split('?')[1] || '')
      let dataId = bodyParams.get('data.id') 
      
      if (!dataId) {
        // Fallback al body JSON
        try {
          const json = JSON.parse(bodyText)
          if (json.data && json.data.id) dataId = json.data.id
        } catch(e) {}
      }

      if (dataId) {
        const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
        const hmac = crypto.createHmac('sha256', secret)
        const manifestHash = hmac.update(manifest).digest('hex')

        if (manifestHash !== hash) {
          console.error('Mercado Pago Signature mismatch')
          return new NextResponse('Unauthorized', { status: 401 })
        }
      }
    }

    // 2. Procesar el evento
    const json = JSON.parse(bodyText)
    
    if (json.action === 'payment.created' && json.type === 'payment') {
      const paymentId = json.data.id

      // Inicializar el cliente SDK
      const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' })
      const payment = new Payment(client)
      const paymentData = await payment.get({ id: paymentId })

      if (paymentData.status === 'approved') {
        const userId = paymentData.external_reference
        // Cantidad de créditos obtenida de forma dinámica 
        // Si no está en items, podemos deducir según el precio o si pusimos metadatos
        let creditsPurchased = 0
        if (paymentData.additional_info?.items?.[0]?.title?.includes('10')) creditsPurchased = 10
        else if (paymentData.additional_info?.items?.[0]?.title?.includes('5')) creditsPurchased = 5
        else if (paymentData.additional_info?.items?.[0]?.title?.includes('15')) creditsPurchased = 15
        else if (paymentData.additional_info?.items?.[0]?.title?.includes('20')) creditsPurchased = 20
        
        // Si usamos metadatos en la preferencia:
        if ((paymentData.metadata as any)?.credits) {
          creditsPurchased = Number((paymentData.metadata as any)?.credits)
        }

        if (userId && creditsPurchased > 0) {
          // Verificar si la transacción ya existe (idempotencia)
          const { data: existingTx } = await supabaseAdmin
            .from('transactions')
            .select('id')
            .eq('reference_id', paymentId.toString())
            .single()

          if (!existingTx) {
            // Acreditar saldo (hacerlo atómicamente leyendo y escribiendo con RPC, 
            // o simplemente read+update con el service_role)
            const { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('credits')
                .eq('id', userId)
                .single()

            if (profile) {
              const newCredits = (profile.credits || 0) + creditsPurchased
              
              await supabaseAdmin
                .from('profiles')
                .update({ credits: newCredits })
                .eq('id', userId)
              
              await supabaseAdmin
                .from('transactions')
                .insert({
                  user_id: userId,
                  type: 'purchase',
                  amount: creditsPurchased,
                  reference_id: paymentId.toString(),
                  description: `Compra de paquete de ${creditsPurchased} créditos`
                })

              console.log(`[MercadoPago] Créditos acreditados para ${userId}: +${creditsPurchased}`)
            }
          }
        }
      }
    }

    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
