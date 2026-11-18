'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import {
  KARATS,
  SILVER_PURITIES,
  formatEUR,
  officialPricePerGram,
  payPricePerGram,
  type GoldSettings,
} from '@/lib/gold'
import {
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  Clock,
  ArrowDown,
  Check,
} from 'lucide-react'
import type { PriceHistoryEntry } from '@/app/actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useLivePrices } from './live-prices'
import { AnimatedNumber } from './animated-number'

type HistoryItem = {
  id: string
  metal: 'ouro' | 'prata'
  purityLabel: string
  grams: number
  payPerGram: number
  total: number
  timestamp: string
}

type Trend = 'up' | 'down' | 'same'

const WEIGHT_PRESETS = [1, 5, 10, 20, 50, 100]
const SLIDER_MAX = 200

export function TrendLabel({ trend, className }: { trend: Trend; className?: string }) {
  if (trend === 'up')
    return (
      <span className={cn('inline-flex items-center gap-1 text-xs font-medium text-up', className)}>
        <TrendingUp className="h-3.5 w-3.5" /> subiu
      </span>
    )
  if (trend === 'down')
    return (
      <span className={cn('inline-flex items-center gap-1 text-xs font-medium text-down', className)}>
        <TrendingDown className="h-3.5 w-3.5" /> desceu
      </span>
    )
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium text-muted-foreground', className)}>
      <Minus className="h-3.5 w-3.5" /> inalterado
    </span>
  )
}

function StepLabel({
  children,
  aside,
  htmlFor,
}: {
  children: React.ReactNode
  aside?: React.ReactNode
  htmlFor?: string
}) {
  const Tag = htmlFor ? 'label' : 'div'
  return (
    <div className="mb-2 flex items-center justify-between gap-3 sm:mb-3">
      <Tag {...(htmlFor ? { htmlFor } : {})} className="text-sm font-semibold text-foreground">
        {children}
      </Tag>
      {aside}
    </div>
  )
}

export function HeroSection({ settings, priceHistory }: { settings: GoldSettings; priceHistory?: PriceHistoryEntry[] }) {
  const [metalType, setMetalType] = useState<'ouro' | 'prata'>('ouro')
  const [karatValue, setKaratValue] = useState('18')
  const [silverValue, setSilverValue] = useState('925')
  const [grams, setGrams] = useState('10')
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('dbgold_simulations')
      if (stored) setHistory(JSON.parse(stored) as HistoryItem[])
    } catch { /* ignore */ }
  }, [])

  // Live settings: shared with the price table so every section shows the same value
  const { settings: liveSettings, history: livePriceHistory } = useLivePrices(settings, priceHistory)

  // Determine short-term trend for gold and silver from recent price history
  const latest = livePriceHistory.length > 0 ? livePriceHistory[0] : null
  const prev = livePriceHistory.length > 1 ? livePriceHistory[1] : null
  const goldTrend: Trend =
    latest && prev
      ? (latest.price_gold > prev.price_gold ? 'up' : latest.price_gold < prev.price_gold ? 'down' : 'same')
      : (latest?.trend_gold ?? 'same')
  const silverTrend: Trend =
    latest && prev
      ? (latest.price_silver > prev.price_silver ? 'up' : latest.price_silver < prev.price_silver ? 'down' : 'same')
      : (latest?.trend_silver ?? 'same')

  const selectedGold = useMemo(
    () => KARATS.find((k) => String(k.karat) === karatValue) ?? KARATS[2],
    [karatValue]
  )
  const selectedSilver = useMemo(
    () => SILVER_PURITIES.find((s) => s.value === silverValue) ?? SILVER_PURITIES[1],
    [silverValue]
  )
  const gramsNum = useMemo(() => {
    const n = Number.parseFloat(grams.replace(',', '.'))
    return Number.isFinite(n) && n > 0 ? n : 0
  }, [grams])

  const activeParams = useMemo(() => {
    if (metalType === 'ouro') {
      const purity = selectedGold.purity
      const refPrice = liveSettings.price_per_gram_24k
      const discount = liveSettings.discount_per_gram
      const official = officialPricePerGram(refPrice, purity)
      const pays = payPricePerGram(refPrice, discount, purity)
      return {
        purityLabel: `Ouro ${selectedGold.karat}K`,
        officialPerGram: official,
        payPerGram: pays,
        total: pays * gramsNum,
        officialTotal: official * gramsNum,
      }
    } else {
      const purity = selectedSilver.purity
      const refPrice = liveSettings.price_per_gram_silver_999 ?? 1.00
      const discount = liveSettings.discount_per_gram_silver ?? 0.15
      const official = officialPricePerGram(refPrice, purity)
      const pays = payPricePerGram(refPrice, discount, purity)
      return {
        purityLabel: `Prata ${selectedSilver.value}‰`,
        officialPerGram: official,
        payPerGram: pays,
        total: pays * gramsNum,
        officialTotal: official * gramsNum,
      }
    }
  }, [metalType, selectedGold, selectedSilver, gramsNum, liveSettings])

  const handleSave = () => {
    if (gramsNum <= 0) { toast.error('Insira um peso válido.'); return }
    const item: HistoryItem = {
      id: Math.random().toString(36).slice(2),
      metal: metalType,
      purityLabel: activeParams.purityLabel,
      grams: gramsNum,
      payPerGram: activeParams.payPerGram,
      total: activeParams.total,
      timestamp: new Date().toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
    }
    const updated = [item, ...history].slice(0, 10)
    setHistory(updated)
    localStorage.setItem('dbgold_simulations', JSON.stringify(updated))
    toast.success('Simulação guardada!')
  }

  const handleDelete = (id: string) => {
    const updated = history.filter((i) => i.id !== id)
    setHistory(updated)
    localStorage.setItem('dbgold_simulations', JSON.stringify(updated))
  }

  const isGold = metalType === 'ouro'
  const goldPrice = liveSettings.price_per_gram_24k
  const silverPrice = liveSettings.price_per_gram_silver_999

  const onCardMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  const sliderPct = Math.min(100, (gramsNum / SLIDER_MAX) * 100)

  const chip = (active: boolean) =>
    cn(
      'num relative h-10 rounded-xl text-sm font-semibold transition-all duration-300 sm:h-11',
      active
        ? 'bg-foreground text-background shadow-[0_8px_20px_-8px_rgba(0,0,0,0.45)] scale-[1.03]'
        : 'bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground'
    )

  return (
    <>
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative overflow-hidden pt-28 pb-10 sm:pt-36 sm:pb-20 md:pt-44 md:pb-28">
        {/* Animated aurora */}
        <div className="pointer-events-none absolute inset-0 -z-0" aria-hidden>
          <div className="aurora aurora-1 left-[8%] top-[6%] h-[380px] w-[380px] bg-amber-300/40 dark:bg-amber-500/15" />
          <div className="aurora aurora-2 right-[6%] top-[14%] h-[420px] w-[420px] bg-yellow-200/50 dark:bg-yellow-500/10" />
          <div className="aurora aurora-3 left-[38%] top-[38%] h-[300px] w-[300px] bg-orange-200/40 dark:bg-orange-500/10" />
          <div className="bg-dots absolute inset-0" />
        </div>

        <div className="container-page relative flex flex-col items-center text-center">
          {/* Live price pill */}
          <a
            href="#precos"
            className="anim-fade-up group inline-flex items-center gap-3 rounded-full border border-border bg-card/70 py-1.5 pl-2 pr-4 text-sm shadow-sm backdrop-blur-md transition-all hover:border-amber-500/40 hover:shadow-md"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-2.5 py-0.5 text-xs font-semibold text-background">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Live
            </span>
            <span className="num font-medium text-foreground">
              Ouro 24K {goldPrice > 0 ? <>{formatEUR(goldPrice)}<span className="text-muted-foreground">/g</span></> : 'Sob Consulta'}
            </span>
          </a>

          <h1 className="anim-fade-up anim-delay-1 mt-6 max-w-5xl text-balance text-[2.6rem] sm:mt-8 font-semibold leading-[0.98] tracking-[-0.05em] text-foreground sm:text-7xl md:text-[5.5rem]">
            Compramos ouro &amp; prata
            <br />
            <span className="text-gold-gradient">ao melhor preço.</span>
          </h1>

          <p className="anim-fade-up anim-delay-2 mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:mt-7 sm:text-lg md:text-xl">
            Transformamos os seus metais preciosos em capital imediato, com avaliação técnica profissional e cotações oficiais diárias.
          </p>

          <div className="anim-fade-up anim-delay-3 mt-7 flex flex-row items-center gap-2 sm:mt-10 sm:gap-3">
            <a
              href="#simulador"
              className="group inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm sm:h-12 sm:px-7 font-semibold text-background shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5)]"
            >
              Simular valor agora
              <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
            </a>
            <a
              href="#precos"
              className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted sm:h-12 sm:px-6"
            >
              Ver cotações
            </a>
          </div>

          <ul className="anim-fade-up anim-delay-4 mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] text-muted-foreground sm:mt-12 sm:gap-x-7 sm:gap-y-3 sm:text-sm">
            {['Sem comissões ocultas', 'Avaliação presencial', 'Fecho no próprio dia'].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ═══════════════ SIMULATOR ═══════════════ */}
      <section id="simulador" className="relative scroll-mt-20 pb-16 md:pb-32">
        <div className="container-page">
          <div
            ref={cardRef}
            onMouseMove={onCardMove}
            className="group/card relative mx-auto max-w-5xl overflow-hidden rounded-[1.6rem] sm:rounded-[2rem] border border-border bg-card shadow-[0_40px_80px_-40px_rgba(0,0,0,0.25)] dark:shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)]"
          >
            <div className="spotlight pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100" />

            <div className="relative grid lg:grid-cols-[1.15fr_1fr]">
              {/* ── Controls ── */}
              <div className="flex flex-col p-5 sm:p-8 md:p-10">
                <div>
                  <h2 className="text-xl font-semibold tracking-[-0.03em] text-foreground sm:text-2xl">Simulador de venda</h2>
                  <p className="mt-0.5 text-[13px] text-muted-foreground sm:mt-1 sm:text-sm">Estimativa instantânea com a cotação de hoje.</p>
                </div>

                {/* ① Metal toggle with sliding indicator */}
                <div className="mt-4 sm:mt-8">
                <StepLabel>Metal</StepLabel>
                <div className="relative grid grid-cols-2 rounded-xl bg-muted p-1 sm:rounded-2xl sm:p-1.5" role="tablist" aria-label="Metal">
                  <span
                    className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-card sm:inset-y-1.5 sm:left-1.5 sm:w-[calc(50%-0.375rem)] sm:rounded-xl shadow-[0_4px_14px_-4px_rgba(0,0,0,0.2)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{ transform: isGold ? 'translateX(0)' : 'translateX(100%)' }}
                    aria-hidden
                  />
                  {(['ouro', 'prata'] as const).map((m) => (
                    <button
                      key={m}
                      role="tab"
                      aria-selected={metalType === m}
                      onClick={() => setMetalType(m)}
                      className={cn(
                        'relative z-10 flex h-8 items-center justify-center gap-2 text-sm font-semibold transition-colors duration-300 sm:h-11',
                        metalType === m ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <span
                        className={cn(
                          'h-3 w-3 rounded-full',
                          m === 'ouro'
                            ? 'bg-gradient-to-br from-yellow-300 to-amber-600'
                            : 'bg-gradient-to-br from-slate-200 to-slate-500'
                        )}
                      />
                      {m === 'ouro' ? 'Ouro' : 'Prata'}
                    </button>
                  ))}
                </div>
                </div>

                {/* ② Quality */}
                <div className="mt-4 border-t border-border pt-4 sm:mt-7 sm:border-0 sm:pt-0">
                  <StepLabel
                    aside={
                      <span key={isGold ? karatValue : silverValue} className="pop text-xs text-muted-foreground">
                        {isGold ? selectedGold.label : selectedSilver.label}
                      </span>
                    }
                  >
                    Qualidade
                  </StepLabel>
                  <div key={metalType} className={cn('pop grid gap-1.5 sm:gap-2', isGold ? 'grid-cols-6' : 'grid-cols-4')}>
                    {isGold
                      ? KARATS.map((k) => {
                          const active = karatValue === String(k.karat)
                          const isPT = k.karat === 19.2
                          return (
                            <button
                              key={k.karat}
                              onClick={() => setKaratValue(String(k.karat))}
                              aria-pressed={active}
                              aria-label={isPT ? 'Ouro português 19.2 quilates' : `${k.karat} quilates`}
                              className={cn(
                                chip(active),
                                'flex h-11 flex-col items-center justify-center gap-0.5 px-0 text-[13px] sm:h-14 sm:text-sm',
                                isPT && !active && 'ring-1 ring-inset ring-amber-500/50 bg-amber-500/10 text-foreground'
                              )}
                            >
                              <span>{k.karat}K</span>
                              <span
                                className={cn(
                                  'text-[8px] font-medium leading-none tracking-tight sm:text-[10px] sm:tracking-normal',
                                  isPT
                                    ? active ? 'text-amber-300' : 'text-amber-700 dark:text-amber-400'
                                    : active ? 'text-background/60' : 'text-muted-foreground/70'
                                )}
                              >
                                {isPT ? 'Português' : `${Math.min(999, Math.round(k.purity * 1000))}‰`}
                              </span>
                            </button>
                          )
                        })
                      : SILVER_PURITIES.map((s) => (
                          <button
                            key={s.value}
                            onClick={() => setSilverValue(s.value)}
                            aria-pressed={silverValue === s.value}
                            className={chip(silverValue === s.value)}
                          >
                            {s.value}‰
                          </button>
                        ))}
                  </div>
                </div>

                {/* ③ Weight */}
                <div className="mt-4 border-t border-border pt-4 sm:mt-7 sm:border-0 sm:pt-0">
                  <StepLabel htmlFor="sim-weight">Peso</StepLabel>
                  <div className="relative">
                    <input
                      id="sim-weight"
                      type="number"
                      inputMode="decimal"
                      min="0.1"
                      max="9999"
                      step="0.1"
                      value={grams}
                      onChange={(e) => setGrams(e.target.value)}
                      className="no-spinner num h-11 w-full rounded-xl border border-border bg-background pl-4 pr-16 text-base sm:h-12 sm:text-lg font-semibold text-foreground outline-none transition-[border-color,box-shadow] focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15"
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 select-none text-sm text-muted-foreground">gramas</span>
                  </div>

                  {/* Range slider */}
                  <div className="relative hidden py-3 sm:block">
                    <div className="h-1.5 w-full rounded-full bg-muted" />
                    <div
                      className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-[width] duration-150"
                      style={{ width: `${sliderPct}%` }}
                    />
                    <div
                      className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-500 bg-card shadow-md transition-[left] duration-150"
                      style={{ left: `${sliderPct}%` }}
                    />
                    <input
                      type="range"
                      min={0}
                      max={SLIDER_MAX}
                      step={0.5}
                      value={Math.min(gramsNum, SLIDER_MAX)}
                      onChange={(e) => setGrams(e.target.value)}
                      aria-label="Peso em gramas"
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    />
                  </div>

                  <div className="mt-2 grid grid-cols-6 gap-1.5 sm:mt-2 sm:flex sm:flex-wrap sm:gap-2">
                    {WEIGHT_PRESETS.map((w) => (
                      <button
                        key={w}
                        onClick={() => setGrams(String(w))}
                        aria-pressed={gramsNum === w}
                        className={cn(
                          'num h-8 rounded-full border px-0 text-xs font-semibold transition-all duration-200 sm:px-3.5',
                          gramsNum === w
                            ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400'
                            : 'border-border text-muted-foreground hover:border-foreground/25 hover:text-foreground'
                        )}
                      >
                        {w}g
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Result panel ── */}
              <div className="shine relative m-2 mt-0 flex flex-col justify-between gap-4 overflow-hidden rounded-[1.4rem] bg-zinc-950 p-5 text-white sm:gap-8 lg:mt-2 sm:rounded-[1.6rem] sm:p-8 md:p-10 lg:ml-0 dark:bg-zinc-900">
                <div
                  className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full blur-[80px] transition-colors duration-700"
                  style={{ background: isGold ? 'rgba(245,158,11,0.35)' : 'rgba(148,163,184,0.3)' }}
                  aria-hidden
                />

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-white/60 sm:text-sm">Recebe aproximadamente</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/80">
                      <span className="live-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Live
                    </span>
                  </div>

                  <div aria-live="polite" className="mt-2 sm:mt-3">
                    <AnimatedNumber
                      value={activeParams.total}
                      format={formatEUR}
                      className={cn(
                        'num block text-4xl font-semibold tracking-[-0.045em] sm:text-6xl',
                        isGold ? 'text-gold-gradient' : 'text-slate-100'
                      )}
                    />
                  </div>
                  <div className="mt-1 text-[13px] text-white/50 sm:mt-2 sm:text-sm">
                    {activeParams.purityLabel}
                    {isGold && selectedGold.karat === 19.2 && <span className="text-amber-300/90"> (Português)</span>}
                    {' '}· <span className="num">{gramsNum}g</span>
                  </div>

                  <dl className="mt-3 flex flex-col divide-y divide-white/10 border-y border-white/10 text-xs sm:mt-8 sm:text-sm">
                    <div className="flex items-center justify-between gap-4 py-2 sm:py-3">
                      <dt className="text-white/60">Cotação oficial</dt>
                      <dd className="num text-right text-white/70">
                        {formatEUR(activeParams.officialPerGram)}/g → {formatEUR(activeParams.officialTotal)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-2 sm:py-3">
                      <dt className="text-white/60">Pagamos</dt>
                      <dd className="num text-right font-semibold text-white">
                        {formatEUR(activeParams.payPerGram)}/g × {gramsNum}g
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="relative flex flex-col gap-3">
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={gramsNum <= 0}
                      className="h-11 flex-1 rounded-full bg-gradient-to-r from-amber-400 sm:h-12 to-amber-500 text-sm font-semibold text-amber-950 shadow-[0_10px_30px_-10px_rgba(245,158,11,0.8)] transition-all hover:-translate-y-0.5 hover:from-amber-300 hover:to-amber-400 active:translate-y-0 disabled:opacity-40"
                    >
                      Guardar simulação
                    </button>
                    {history.length > 0 && (
                      <button
                        onClick={() => setShowHistory((v) => !v)}
                        aria-expanded={showHistory}
                        aria-label="Mostrar simulações guardadas"
                        className="inline-flex h-11 items-center gap-1.5 rounded-full bg-white/10 sm:h-12 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/15"
                      >
                        <span className="num">{history.length}</span>
                        <ChevronDown className={cn('h-4 w-4 transition-transform duration-300', showHistory && 'rotate-180')} />
                      </button>
                    )}
                  </div>

                  {/* ⑥ History */}
                  <div
                    className={cn(
                      'grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
                      showHistory && history.length > 0 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="mt-2 rounded-2xl bg-white/[0.06] p-3">
                        <div className="mb-1 flex items-center justify-between px-1">
                          <span className="text-xs text-white/50">Simulações guardadas</span>
                          <button
                            onClick={() => {
                              setHistory([])
                              localStorage.removeItem('dbgold_simulations')
                              setShowHistory(false)
                            }}
                            className="text-xs font-medium text-white/50 transition-colors hover:text-rose-400"
                          >
                            Limpar
                          </button>
                        </div>
                        <ul className="max-h-44 overflow-y-auto">
                          {history.map((item) => (
                            <li key={item.id} className="flex items-center justify-between gap-3 rounded-lg px-1 py-2 hover:bg-white/5">
                              <div className="flex min-w-0 items-center gap-2">
                                <span className={cn('h-2 w-2 shrink-0 rounded-full', item.metal === 'ouro' ? 'bg-amber-400' : 'bg-slate-300')} />
                                <span className="truncate text-sm text-white/85">
                                  {item.purityLabel} · <span className="num">{item.grams}g</span>
                                </span>
                                <span className="num hidden shrink-0 text-[11px] text-white/40 sm:inline">{item.timestamp}</span>
                              </div>
                              <div className="flex shrink-0 items-center gap-1">
                                <span className="num text-sm font-semibold text-white">{formatEUR(item.total)}</span>
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  aria-label="Apagar simulação"
                                  className="rounded p-1 text-white/40 transition-colors hover:text-rose-400"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Live price strip below the simulator */}
          <div className="mx-auto mt-6 flex max-w-5xl flex-col items-center justify-between gap-4 px-2 text-sm text-muted-foreground md:flex-row">
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-yellow-300 to-amber-600" />
                Ouro 24K
                <span className="num font-semibold text-foreground">{goldPrice > 0 ? `${formatEUR(goldPrice)}/g` : 'Sob Consulta'}</span>
                <TrendLabel trend={goldTrend} />
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-slate-200 to-slate-500" />
                Prata 999
                <span className="num font-semibold text-foreground">
                  {silverPrice && silverPrice > 0 ? `${formatEUR(silverPrice)}/g` : 'Sob Consulta'}
                </span>
                <TrendLabel trend={silverTrend} />
              </span>
            </div>
            <span className="flex items-center gap-2 text-center text-xs">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              Fixing de Londres: <strong className="font-semibold text-foreground">10h35</strong> e{' '}
              <strong className="font-semibold text-foreground">15h05</strong> (Ouro) · <strong className="font-semibold text-foreground">12h05</strong> (Prata)
            </span>
          </div>
        </div>
      </section>
    </>
  )
}
