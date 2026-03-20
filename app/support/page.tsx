import { Mail, Globe, MessageCircle, HelpCircle, ChevronDown } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Soporte | GOS',
  description: 'Centro de ayuda y contacto de GOS - Gastronomic Organization Service',
}

const faqs = [
  {
    question: '¿Cómo me registro como postulante?',
    answer: 'Hacé clic en "Ingresar" y luego en "Registrarse como Talento". Completá tu perfil con tu experiencia, habilidades y cargá tu CV para que los empleadores puedan encontrarte.'
  },
  {
    question: '¿Cómo publico una oferta de trabajo?',
    answer: 'Registrate como Emprendedor, accedé al Portal Emprendedor y hacé clic en "Publicar Oferta". Completá los datos de la posición y publicala al instante.'
  },
  {
    question: '¿Qué es un "Match"?',
    answer: 'Un Match ocurre cuando un empleador decide avanzar con un postulante a la fase de entrevista. Ambas partes reciben una notificación y se habilita un chat privado para coordinar.'
  },
  {
    question: '¿Mis datos están seguros?',
    answer: 'Sí. GOS utiliza Supabase con cifrado de datos y autenticación segura. Tu información personal solo es visible para empleadores cuando aplicás a una oferta.'
  },
  {
    question: '¿Cómo elimino mi cuenta?',
    answer: 'Por el momento, para eliminar tu cuenta escribinos a info@goscentral.com con el asunto "Eliminar cuenta" desde el correo con el que te registraste.'
  },
]

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-b from-primary/10 to-background border-b border-primary/10 py-16 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Centro de Soporte
          </h1>
          <p className="text-xl text-muted-foreground font-medium">
            ¿Tenés alguna consulta? Estamos para ayudarte.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-16 space-y-16">

        {/* Contacto */}
        <section>
          <h2 className="text-2xl font-extrabold mb-8 text-foreground">Contacto directo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <a
              href="mailto:info@goscentral.com"
              className="group flex items-start gap-5 p-6 rounded-2xl border border-border/60 bg-card hover:border-primary/40 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground text-lg">Correo electrónico</p>
                <p className="text-primary font-semibold mt-1 group-hover:underline">info@goscentral.com</p>
                <p className="text-sm text-muted-foreground mt-1">Respondemos en menos de 48 hs.</p>
              </div>
            </a>

            <a
              href="https://www.goscentral.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-5 p-6 rounded-2xl border border-border/60 bg-card hover:border-primary/40 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground text-lg">Sitio web</p>
                <p className="text-primary font-semibold mt-1 group-hover:underline">www.goscentral.com</p>
                <p className="text-sm text-muted-foreground mt-1">Más información sobre GOS.</p>
              </div>
            </a>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-extrabold mb-8 text-foreground">Preguntas frecuentes</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group rounded-2xl border border-border/60 bg-card overflow-hidden"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none font-bold text-foreground hover:text-primary transition-colors gap-4">
                  <span>{faq.question}</span>
                  <ChevronDown className="h-5 w-5 text-muted-foreground group-open:rotate-180 transition-transform shrink-0" />
                </summary>
                <div className="px-6 pb-6 text-muted-foreground font-medium leading-relaxed border-t border-border/40 pt-4">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl bg-primary/5 border border-primary/20 p-8 text-center">
          <MessageCircle className="h-10 w-10 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-extrabold text-foreground mb-2">¿No encontraste lo que buscabas?</h3>
          <p className="text-muted-foreground mb-6 font-medium">
            Escribinos directamente y te ayudamos a resolver tu consulta.
          </p>
          <a
            href="mailto:info@goscentral.com"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-8 py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg"
          >
            <Mail className="h-4 w-4" />
            Escribir a soporte
          </a>
        </section>
      </div>
    </div>
  )
}
