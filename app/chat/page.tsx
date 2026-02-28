import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Send, MapPin, Briefcase } from 'lucide-react'

export default function ChatPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl h-[calc(100vh-6rem)]">
      <div className="bg-card border border-border/60 rounded-[2rem] shadow-sm flex h-full overflow-hidden">
        
        {/* Sidebar */}
        <div className="w-full md:w-[350px] lg:w-[400px] border-r border-border/60 flex flex-col h-full bg-muted/10">
          <div className="p-6 lg:p-8 border-b border-border/60">
            <h2 className="text-3xl font-extrabold mb-6">Mensajes</h2>
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Buscar chat..." className="pl-12 bg-background rounded-2xl h-12 border-border/50 font-medium text-base shadow-sm" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-3">
            {[1, 2, 3, 4].map((chat, i) => (
              <div key={i} className={`p-4 lg:p-5 rounded-2xl flex gap-4 lg:gap-5 cursor-pointer transition-all duration-300 ${i === 0 ? 'bg-background shadow-md border border-primary/20 scale-[1.02]' : 'hover:bg-muted border border-transparent hover:border-border/50'}`}>
                <div className={`w-14 h-14 rounded-full ${i === 0 ? 'bg-primary/10 text-primary' : 'bg-muted-foreground/10 text-muted-foreground'} flex items-center justify-center font-bold text-xl shrink-0`}>
                  {i === 0 ? 'L' : 'M'}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex justify-between items-center mb-1.5">
                    <h3 className={`font-bold truncate pr-2 text-lg ${i === 0 ? 'text-foreground' : 'text-foreground/80'}`}>{i === 0 ? 'La Mar Cevichería' : 'Martín P.'}</h3>
                    <span className={`text-xs font-bold shrink-0 ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`}>12:30</span>
                  </div>
                  <p className={`text-sm font-medium truncate ${i === 0 ? 'text-foreground/90' : 'text-muted-foreground'}`}>{i === 0 ? '¡Hola! Vimos tu perfil y nos...' : '¿Qué horarios manejan?'}</p>
                </div>
                {i === 0 && <div className="w-3.5 h-3.5 bg-primary rounded-full shrink-0 self-center shadow-sm"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="hidden md:flex flex-col flex-1 h-full bg-background relative">
          <div className="p-6 lg:p-8 border-b border-border/60 flex justify-between items-center bg-card/60 backdrop-blur-md sticky top-0 z-10 w-full shrink-0">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-extrabold text-2xl shadow-sm border border-primary/20">
                L
              </div>
              <div>
                <h2 className="font-extrabold text-2xl">La Mar Cevichería</h2>
                <div className="flex items-center mt-1">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2"></div>
                  <p className="text-sm font-bold text-muted-foreground">En línea</p>
                </div>
              </div>
            </div>
            <Button variant="outline" className="rounded-2xl font-bold shadow-sm border-border/50 h-12 px-6">Ver Perfil</Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8 bg-muted/5">
            <div className="flex justify-center mb-10">
              <span className="bg-muted px-5 py-2 rounded-full text-xs font-bold text-muted-foreground border border-border/50 shadow-sm">
                Match creado el 12 de Octubre, 11:45 AM
              </span>
            </div>

            <div className="flex items-start gap-4 max-w-[85%]">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-lg shrink-0 shadow-sm mt-1">L</div>
              <div className="bg-card border border-border/60 p-5 rounded-3xl rounded-tl-sm shadow-sm group relative">
                <p className="font-medium text-[15px] leading-relaxed">¡Hola Juan! Vimos tu perfil y el algoritmo nos indicó que eres un excelente match para nuestra vacante de Jefe de Cocina. ¿Estás disponible para una breve llamada mañana?</p>
                <p className="text-xs font-bold text-muted-foreground mt-3 text-right">12:30 PM</p>
              </div>
            </div>
            
            <div className="flex items-start justify-end gap-3 max-w-[85%] ml-auto mt-6">
              <div className="bg-primary text-primary-foreground p-5 rounded-3xl rounded-tr-sm shadow-md">
                <p className="font-medium text-[15px] leading-relaxed">¡Hola! Muchas gracias por el contacto. Sí, estoy disponible mañana por la tarde. ¿A las 15:00 les queda bien?</p>
                <p className="text-xs font-bold text-primary-foreground/70 mt-3 text-right">12:45 PM <span className="ml-1 text-primary-foreground/90">✓✓</span></p>
              </div>
            </div>
          </div>
          
          <div className="p-6 lg:p-8 border-t border-border/60 bg-card/60 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-4 max-w-4xl mx-auto">
              <Input placeholder="Escribe tu mensaje..." className="flex-1 rounded-2xl h-16 bg-background border-border/50 focus-visible:ring-primary/50 text-base font-medium shadow-sm px-6" />
              <Button size="icon" className="h-16 w-16 rounded-2xl bg-primary hover:bg-primary/90 shadow-md hover:-translate-y-1 transition-transform border-t border-white/20">
                <Send className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
