'use client'

import { ShieldCheck, Clock, BadgeCheck } from 'lucide-react'
import type { GoldSettings } from '@/lib/gold'

export function Hero({ settings }: { settings: GoldSettings }) {
  void settings

  return (
    <section id="top" className="relative min-h-[calc(100vh-80px)] flex flex-col justify-center items-center py-12 bg-[#09090b]">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 text-center md:px-6">
        
        {/* Minimal label tag */}
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
          Avaliação e Compra
        </span>

        {/* Modern Centered Title */}
        <h1 className="text-balance font-sans text-4xl font-normal leading-[1.15] tracking-tight text-white md:text-6xl max-w-3xl">
          Valorização profissional do seu <span className="font-semibold text-amber-400">ouro</span> e <span className="font-semibold text-zinc-300">prata</span>.
        </h1>

        {/* Clean Subtitle */}
        <p className="max-w-xl text-pretty text-sm leading-relaxed text-zinc-400 md:text-base">
          Cotações diárias transparentes e pagamento imediato. Calcule abaixo o valor estimado das suas peças em tempo real.
        </p>

        {/* Clean Minimalist Badges */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-amber-500/80" />
            <span>Avaliação Justa</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-amber-500/80" />
            <span>Pagamento Direto</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BadgeCheck className="h-4 w-4 text-amber-500/80" />
            <span>Transparência Total</span>
          </div>
        </div>

      </div>
    </section>
  )
}
