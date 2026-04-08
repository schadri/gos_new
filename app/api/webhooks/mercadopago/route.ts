import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createClient } from '@supabase/supabase-js'

const CREDIT_PACKAGES: Record<string, { title: string, price: number, credits: number, urgent_credits: number }> = {
  'pack-5': { title: 'Paquete Básico: 5 Créditos + 2 Urgentes', price: 500, credits: 5, urgent_credits: 2 },
  'pack-10': { title: 'Paquete Estándar: 10 Créditos + 5 Urgentes', price: 9000, credits: 10, urgent_credits: 5 },
  'pack-15': { title: 'Paquete Avanzado: 15 Créditos + 10 Urgentes', price: 13000, credits: 15, urgent_credits: 10 },
  'pack-20': { title: 'Paquete Pro: 20 Créditos + 15 Urgentes', price: 16000, credits: 20, urgent_credits: 15 },
}

export async function POST(request: Request) {
  console.log('[Webhook] 🔵 Nueva petición recibida')

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('[Webhook] 🔴 ERROR CRÍTICO: Faltan las variables de entorno de Supabase en Vercel (SUPABASE_SERVICE_ROLE_KEY)')
      return new NextResponse('Faltan Env Vars', { status: 500 })
    }

    // Inicializar cliente admin seguro
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

    const bodyText = await request.text()
    console.log('[Webhook] 📦 Payload:', bodyText.substring(0, 300) + '...')

    // Validar Firma
    const xSignature = request.headers.get('x-signature')
    const xRequestId = request.headers.get('x-request-id')
    const secret = process.env.MP_WEBHOOK_SECRET
    const bodyParams = new URLSearchParams(request.url.split('?')[1] || '')

    if (!secret) {
      console.log('[Webhook] ⚠️ Advertencia: MP_WEBHOOK_SECRET no está configurada, salteando validación de firma segura.')
    } else if (xSignature && xRequestId) {
      // Logic for signature validation...
      const parts = xSignature.split(',')
      const tsPart = parts.find(p => p.startsWith('ts='))
      const v1Part = parts.find(p => p.startsWith('v1='))
      const ts = tsPart ? tsPart.split('=')[1] : ''
      const hash = v1Part ? v1Part.split('=')[1] : ''

      let dataId = bodyParams.get('data.id')
      if (!dataId) {
        try {
          const json = JSON.parse(bodyText)
          if (json.data && json.data.id) dataId = json.data.id
        } catch (e) { }
      }

      if (dataId) {
        const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
        const hmac = crypto.createHmac('sha256', secret)
        const manifestHash = hmac.update(manifest).digest('hex')
        if (manifestHash !== hash) {
          console.error('[Webhook] 🔴 ERROR: Firma inválida. Posible ataque o secreto incorrecto')
          // return new NextResponse('Unauthorized', { status: 401 }) -- quitado temporalmente para debugging
        } else {
          console.log('[Webhook] 🟢 Firma validada exitosamente')
        }
      }
    }

    // Procesar Evento
    const json = JSON.parse(bodyText)

    // MP envía action: "payment.created" o "payment.updated" o topic: "payment"
    if ((json.action === 'payment.created' || json.action === 'payment.updated' || json.topic === 'payment') && json.type === 'payment') {
      const paymentId = json.data?.id || bodyParams?.get('id')
      console.log(`[Webhook] 🔍 Buscando datos del pago ID: ${paymentId}`)

      if (!paymentId) return new NextResponse('No ID found', { status: 400 })

      const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' })
      const payment = new Payment(client)
      const paymentData = await payment.get({ id: paymentId })

      console.log(`[Webhook] 🔍 Estado del pago HTTP devuelto por MP: ${paymentData.status}`)

      if (paymentData.status === 'approved') {
        const extRef = paymentData.external_reference || ''
        const [userId, packageId] = extRef.split('___')
        
        console.log(`[Webhook] 👤 Usuario que pagó: ${userId}, Paquete: ${packageId}`)

        let creditsPurchased = 0
        let urgentCreditsPurchased = 0

        // Si es suscripción pasamos packId en external_reference
        if (packageId && CREDIT_PACKAGES[packageId]) {
          creditsPurchased = CREDIT_PACKAGES[packageId].credits
          urgentCreditsPurchased = CREDIT_PACKAGES[packageId].urgent_credits
        } else {
          // Retrocompatibilidad con checkout pro (si queda algún pago viejo)
          if ((paymentData.metadata as any)?.credits) {
            creditsPurchased = Number((paymentData.metadata as any)?.credits)
          }
          if ((paymentData.metadata as any)?.urgent_credits) {
            urgentCreditsPurchased = Number((paymentData.metadata as any)?.urgent_credits)
          }
        }

        console.log(`[Webhook] 💰 Créditos: ${creditsPurchased}, Urgentes: ${urgentCreditsPurchased}`)

        if (userId && creditsPurchased > 0) {
          const { data: existingTx } = await supabaseAdmin.from('transactions').select('id').eq('reference_id', paymentId.toString()).single()

          if (!existingTx) {
            const { data: profile } = await supabaseAdmin.from('profiles').select('credits, urgent_credits').eq('id', userId).single()
            if (profile) {
              const newCredits = (profile.credits || 0) + creditsPurchased
              const newUrgentCredits = (profile.urgent_credits || 0) + urgentCreditsPurchased

              const resUpdate = await supabaseAdmin.from('profiles').update({ 
                  credits: newCredits,
                  urgent_credits: newUrgentCredits
              }).eq('id', userId)
              if (resUpdate.error) console.error('[Webhook] Error Supabase Profile:', resUpdate.error)

              const resTx = await supabaseAdmin.from('transactions').insert({
                user_id: userId,
                type: 'purchase',
                amount: creditsPurchased,
                reference_id: paymentId.toString(),
                description: `Compra paquete MP (${creditsPurchased})`
              })
              if (resTx.error) console.error('[Webhook] Error Supabase Transaction:', resTx.error)

              console.log(`[Webhook] ✅ ¡ÉXITO! Créditos sumados a ${userId}. Total ahora: ${newCredits}`)
            } else {
              console.log(`[Webhook] 🔴 ERROR: Perfil no encontrado para el usuario ${userId}`)
            }
          } else {
            console.log(`[Webhook] ℹ️ Ignorando. La transacción ya estaba repetida / procesada.`)
          }
        } else {
          console.log(`[Webhook] 🔴 ERROR lógido: Falta userId (${userId}) o creditsPurchased es cero (${creditsPurchased}). Detalles del item:`, paymentData.additional_info?.items)
        }
      }
    } else {
      console.log(`[Webhook] ℹ️ Ignorando tipo de evento que no es pago: ${json.action} - ${json.type}`)
    }

    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    console.error('[Webhook] 🔴 ERROR SEVERO en el webhook:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
