import { MessageCircle, ArrowUpRight, ShieldCheck, Zap } from 'lucide-react'

import { ScrollReveal } from './scroll-reveal'

const WHATSAPP_TEXT =
  'Ol%C3%A1%21%20Gostaria%20de%20obter%20mais%20informa%C3%A7%C3%B5es%20sobre%20a%20venda%20de%20ouro/prata.'

const numbers = [
  { display: '914 967 435', intl: '351914967435' },
  { display: '934 178 363', intl: '351934178363' },
]

export function WhatsappSection() {
  return (
    <section id="contacto-directo" className="scroll-mt-24 pb-24 md:pb-32">
      <div className="container-page">
        <ScrollReveal variant="zoom-in">
          <div className="shine relative overflow-hidden rounded-[2rem] bg-zinc-950 px-6 py-14 text-white sm:px-10 md:px-16 md:py-20 dark:bg-zinc-900">
            {/* Moving glow */}
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              <div className="aurora aurora-1 -left-24 -top-24 h-80 w-80 bg-amber-500/30" />
              <div className="aurora aurora-2 -bottom-32 right-0 h-96 w-96 bg-yellow-400/15" />
            </div>

            <div className="relative grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                  <Zap className="h-3.5 w-3.5 text-amber-300" /> Resposta rápida
                </span>
                <h2 className="mt-6 text-4xl font-semibold leading-[1.02] tracking-[-0.045em] md:text-6xl">
                  Fale connosco por <span className="text-gold-gradient">WhatsApp</span>
                </h2>
                <p className="mt-5 max-w-md text-base leading-relaxed text-white/60 md:text-lg">
                  Tem dúvidas sobre as cotações ou quer agendar uma avaliação presencial? Envie-nos uma mensagem direta. Respondemos em poucos minutos.
                </p>
                <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" /> Sem compromisso
                  </span>
                  <span className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-300" /> Atendimento imediato
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {numbers.map((n) => (
                  <a
                    key={n.intl}
                    href={`https://wa.me/${n.intl}?text=${WHATSAPP_TEXT}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400/40 hover:bg-white/[0.1]"
                  >
                    <span className="flex items-center gap-4">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_8px_24px_-6px_rgba(16,185,129,0.7)] transition-transform duration-300 group-hover:scale-110">
                        <MessageCircle className="h-5 w-5" />
                      </span>
                      <span className="flex flex-col">
                        <span className="text-xs text-white/50">WhatsApp</span>
                        <span className="num text-lg font-semibold tracking-tight">{n.display}</span>
                      </span>
                    </span>
                    <ArrowUpRight className="h-5 w-5 text-white/40 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
