'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { MessageSquare, ArrowRight, ShieldCheck, Zap } from 'lucide-react'

export function WhatsappSection() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const light = mounted && resolvedTheme !== 'dark'

  const bg = light ? '#ede8dc' : '#0d0d0d'
  const borderCol = light ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)'
  const cardBg = light ? 'rgba(255,255,255,0.85)' : 'rgba(20,20,20,0.6)'
  const textPrimary = light ? '#1a1208' : '#ffffff'
  const textSecondary = light ? '#6a5438' : '#a1a1aa'

  return (
    <section
      id="contacto-directo"
      className="py-16 px-5 md:px-8 border-t scroll-mt-24 transition-colors duration-500"
      style={{
        background: bg,
        borderColor: borderCol,
      }}
    >
      <div className="mx-auto max-w-4xl">
        <div
          className="rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-md transition-all duration-300"
          style={{
            background: cardBg,
            border: `1px solid ${borderCol}`,
            boxShadow: light ? '0 10px 30px rgba(0,0,0,0.04)' : '0 20px 50px rgba(0,0,0,0.5)',
          }}
        >
          {/* Text content */}
          <div className="flex-1 flex flex-col gap-4 text-center md:text-left">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider w-fit mx-auto md:mx-0"
              style={{
                background: 'rgba(34,197,94,0.12)',
                color: '#22c55e',
                border: '1px solid rgba(34,197,94,0.2)',
              }}
            >
              <Zap className="h-3 w-3" /> Resposta Rápida
            </span>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: textPrimary }}>
              Fale connosco por WhatsApp
            </h3>
            <p className="text-sm max-w-md leading-relaxed" style={{ color: textSecondary }}>
              Tem dúvidas sobre as cotações ou quer agendar uma avaliação presencial? Envie-nos uma mensagem direta. Respondemos em poucos minutos.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 mt-2 text-xs" style={{ color: textSecondary }}>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" /> Sem compromisso
              </span>
              <span className="hidden md:inline text-zinc-500">•</span>
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-500" /> Atendimento imediato
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto shrink-0">
            <a
              href="https://wa.me/351914967435?text=Ol%C3%A1%21%20Gostaria%20de%20obter%20mais%20informa%C3%A7%C3%B5es%20sobre%20a%20venda%20de%20ouro/prata."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-6 py-3.5 transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-[0_4px_16px_rgba(16,185,129,0.2)]"
            >
              <MessageSquare className="h-4 w-4" />
              <span>WhatsApp: 914 967 435</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>

            <a
              href="https://wa.me/351934178363?text=Ol%C3%A1%21%20Gostaria%20de%20obter%20mais%20informa%C3%A7%C3%B5es%20sobre%20a%20venda%20de%20ouro/prata."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-6 py-3.5 transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-[0_4px_16px_rgba(16,185,129,0.2)]"
            >
              <MessageSquare className="h-4 w-4" />
              <span>WhatsApp: 934 178 363</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
