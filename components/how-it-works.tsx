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
        'lift group/bento relative h-full overflow-hidden rounded-3xl border border-border bg-card p-7 hover:border-amber-500/30 md:p-8',
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
    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200/60 text-amber-700 transition-transform duration-500 group-hover/bento:scale-110 group-hover/bento:-rotate-6 dark:from-amber-500/20 dark:to-amber-500/5 dark:text-amber-400">
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
    <section id="como-funciona" className="scroll-mt-24 py-24 md:py-32">
      <div className="container-page">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Porquê a DB Gold</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-foreground md:text-6xl">
              Simples, rápido e <span className="text-gold-gradient">transparente.</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {/* Big card */}
          <ScrollReveal className="md:col-span-2">
            <BentoCard>
              <div className="flex h-full flex-col justify-between gap-10 md:flex-row md:items-end">
                <div className="max-w-sm">
                  <IconBadge><Scale className="h-5 w-5" /></IconBadge>
                  <h3 className="mt-6 text-2xl font-semibold tracking-[-0.03em] text-foreground">Avaliação rigorosa e presencial</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                    Pesamos e verificamos a pureza à sua frente, com equipamento profissional e total transparência em cada grama.
                  </p>
                </div>
                {/* Decorative karat stack */}
                <div className="flex shrink-0 items-end gap-2" aria-hidden>
                  {[
                    { k: '9K', h: 'h-12' },
                    { k: '14K', h: 'h-16' },
                    { k: '18K', h: 'h-24' },
                    { k: '19.2K', h: 'h-28' },
                    { k: '22K', h: 'h-32' },
                    { k: '24K', h: 'h-40' },
                  ].map((b, i) => (
                    <div key={b.k} className="flex flex-col items-center gap-2">
                      <div
                        className={cn(
                          'w-8 origin-bottom rounded-t-lg bg-gradient-to-t from-amber-600 to-yellow-300 opacity-80 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/bento:scale-y-110 md:w-9',
                          b.h
                        )}
                        style={{ transitionDelay: `${i * 40}ms`, opacity: 0.35 + i * 0.12 }}
                      />
                      <span className="num text-[10px] font-medium text-muted-foreground">{b.k}</span>
                    </div>
                  ))}
                </div>
              </div>
            </BentoCard>
          </ScrollReveal>

          <ScrollReveal delay={80}>
            <BentoCard>
              <IconBadge><Banknote className="h-5 w-5" /></IconBadge>
              <h3 className="mt-6 text-xl font-semibold tracking-[-0.03em] text-foreground">Pagamento imediato</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                Fecho no próprio dia, com o pagamento feito em mão.
              </p>
            </BentoCard>
          </ScrollReveal>

          <ScrollReveal delay={40}>
            <BentoCard>
              <IconBadge><LineChart className="h-5 w-5" /></IconBadge>
              <h3 className="mt-6 text-xl font-semibold tracking-[-0.03em] text-foreground">Cotações oficiais LBMA</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                Valores atualizados com o Fixing de Londres às 10h35, 12h05 e 15h05.
              </p>
            </BentoCard>
          </ScrollReveal>

          <ScrollReveal delay={80}>
            <BentoCard>
              <IconBadge><ShieldCheck className="h-5 w-5" /></IconBadge>
              <h3 className="mt-6 text-xl font-semibold tracking-[-0.03em] text-foreground">Sem comissões ocultas</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                Vê a cotação oficial e o valor que pagamos, lado a lado.
              </p>
            </BentoCard>
          </ScrollReveal>

          {/* Steps */}
          <ScrollReveal delay={120}>
            <BentoCard className="bg-zinc-950 text-white dark:bg-zinc-900">
              <h3 className="text-xl font-semibold tracking-[-0.03em]">Como funciona</h3>
              <ol className="mt-6 flex flex-col gap-5">
                {steps.map((s, i) => (
                  <li key={s.title} className="flex items-start gap-4">
                    <span className="num flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-amber-300">
                      {i + 1}
                    </span>
                    <div>
                      <div className="text-[15px] font-semibold">{s.title}</div>
                      <div className="text-sm text-white/55">{s.text}</div>
                    </div>
                  </li>
                ))}
              </ol>
              <a
                href="#simulador"
                className="group mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-300 transition-colors hover:text-amber-200"
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
