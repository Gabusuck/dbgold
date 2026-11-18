'use client'

import { useRef, type ReactNode } from 'react'
import { Scale, Banknote, ShieldCheck, LineChart, Calculator, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollReveal } from './scroll-reveal'

function BentoCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const el = ref.current
        if (!el) return
        const r = el.getBoundingClientRect()
        el.style.setProperty('--mx', `${e.clientX - r.left}px`)
        el.style.setProperty('--my', `${e.clientY - r.top}px`)
      }}
      className={cn(
        'lift group/bento relative h-full overflow-hidden rounded-2xl border border-border bg-card p-4 hover:border-amber-500/30 sm:rounded-3xl sm:p-7 md:p-8',
        className
      )}
    >
      <div className="spotlight pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/bento:opacity-100" />
      <div className="relative h-full">{children}</div>
    </div>
  )
}

function IconBadge({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br sm:h-12 sm:w-12 sm:rounded-2xl from-amber-100 to-amber-200/60 text-amber-700 transition-transform duration-500 group-hover/bento:scale-110 group-hover/bento:-rotate-6 dark:from-amber-500/20 dark:to-amber-500/5 dark:text-amber-400">
      {children}
    </span>
  )
}

const steps = [
  { icon: Calculator, title: 'Simule online', text: 'Estimativa imediata por quilate ou pureza.' },
  { icon: Scale, title: 'Avaliação presencial', text: 'Pesamos e verificamos à sua frente.' },
  { icon: Banknote, title: 'Receba no próprio dia', text: 'Aceita a proposta e recebe na hora.' },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="scroll-mt-24 py-14 sm:py-24 md:py-32">
      <div className="container-page">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Porquê a DB Gold</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-foreground sm:mt-3 sm:text-4xl md:text-6xl">
              Simples, rápido e <span className="text-gold-gradient">transparente.</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-14 sm:gap-5 md:grid-cols-3">
          {/* Big card */}
          <ScrollReveal className="col-span-2">
            <BentoCard>
              <div className="flex h-full flex-row items-end justify-between gap-4 sm:gap-10">
                <div className="max-w-sm">
                  <IconBadge><Scale className="h-4 w-4 sm:h-5 sm:w-5" /></IconBadge>
                  <h3 className="mt-3 text-base font-semibold tracking-[-0.03em] text-foreground sm:mt-6 sm:text-2xl">Avaliação rigorosa e presencial</h3>
                  <p className="mt-1.5 text-[13px] leading-snug text-muted-foreground sm:mt-3 sm:text-[15px] sm:leading-relaxed">
                    Pesamos e verificamos a pureza à sua frente, com equipamento profissional e total transparência em cada grama.
                  </p>
                </div>
                {/* Decorative karat stack */}
                <div className="flex shrink-0 items-end gap-1 sm:gap-2" aria-hidden>
                  {[
                    { k: '9K', h: 'h-6 sm:h-12' },
                    { k: '14K', h: 'h-8 sm:h-16' },
                    { k: '18K', h: 'h-11 sm:h-24' },
                    { k: '19.2K', h: 'h-14 sm:h-28' },
                    { k: '22K', h: 'h-16 sm:h-32' },
                    { k: '24K', h: 'h-20 sm:h-40' },
                  ].map((b, i) => (
                    <div key={b.k} className="flex flex-col items-center gap-1 sm:gap-2">
                      <div
                        className={cn(
                          'w-3.5 origin-bottom rounded-t-md bg-gradient-to-t from-amber-600 to-yellow-300 opacity-80 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/bento:scale-y-110 sm:w-8 sm:rounded-t-lg md:w-9',
                          b.h
                        )}
                        style={{ transitionDelay: `${i * 40}ms`, opacity: 0.35 + i * 0.12 }}
                      />
                      <span className="num hidden text-[10px] font-medium text-muted-foreground sm:inline">{b.k}</span>
                    </div>
                  ))}
                </div>
              </div>
            </BentoCard>
          </ScrollReveal>

          <ScrollReveal delay={80}>
            <BentoCard>
              <IconBadge><Banknote className="h-4 w-4 sm:h-5 sm:w-5" /></IconBadge>
              <h3 className="mt-3 text-[15px] font-semibold leading-snug tracking-[-0.02em] text-foreground sm:mt-6 sm:text-xl sm:tracking-[-0.03em]">Pagamento imediato</h3>
              <p className="mt-1.5 text-[13px] leading-snug text-muted-foreground sm:mt-3 sm:text-[15px] sm:leading-relaxed">
                Fecho no próprio dia, com o pagamento feito em mão.
              </p>
            </BentoCard>
          </ScrollReveal>

          <ScrollReveal delay={40}>
            <BentoCard>
              <IconBadge><LineChart className="h-4 w-4 sm:h-5 sm:w-5" /></IconBadge>
              <h3 className="mt-3 text-[15px] font-semibold leading-snug tracking-[-0.02em] text-foreground sm:mt-6 sm:text-xl sm:tracking-[-0.03em]">Cotações oficiais LBMA</h3>
              <p className="mt-1.5 text-[13px] leading-snug text-muted-foreground sm:mt-3 sm:text-[15px] sm:leading-relaxed">
                Valores atualizados com o Fixing de Londres às 10h35, 12h05 e 15h05.
              </p>
            </BentoCard>
          </ScrollReveal>

          <ScrollReveal delay={80} className="col-span-2 md:col-span-1">
            <BentoCard>
              <IconBadge><ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" /></IconBadge>
              <h3 className="mt-3 text-[15px] font-semibold leading-snug tracking-[-0.02em] text-foreground sm:mt-6 sm:text-xl sm:tracking-[-0.03em]">Sem comissões ocultas</h3>
              <p className="mt-1.5 text-[13px] leading-snug text-muted-foreground sm:mt-3 sm:text-[15px] sm:leading-relaxed">
                Vê a cotação oficial e o valor que pagamos, lado a lado.
              </p>
            </BentoCard>
          </ScrollReveal>

          {/* Steps */}
          <ScrollReveal delay={120} className="col-span-2 md:col-span-1">
            <BentoCard className="bg-zinc-950 text-white dark:bg-zinc-900">
              <h3 className="text-base font-semibold tracking-[-0.03em] sm:text-xl">Como funciona</h3>
              <ol className="mt-3 flex flex-col gap-3 sm:mt-6 sm:gap-5">
                {steps.map((s, i) => (
                  <li key={s.title} className="flex items-center gap-3 sm:items-start sm:gap-4">
                    <span className="num flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-amber-300 sm:h-8 sm:w-8 sm:text-sm">
                      {i + 1}
                    </span>
                    <div>
                      <div className="text-sm font-semibold sm:text-[15px]">{s.title}</div>
                      <div className="text-[13px] text-white/55 sm:text-sm">{s.text}</div>
                    </div>
                  </li>
                ))}
              </ol>
              <a
                href="#simulador"
                className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-300 sm:mt-7 transition-colors hover:text-amber-200"
              >
                Começar a simular
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </BentoCard>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
