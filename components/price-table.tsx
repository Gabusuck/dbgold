'use client'

import { useState } from 'react'
import {
  KARATS,
  SILVER_PURITIES,
  formatEUR,
  officialPricePerGram,
  payPricePerGram,
  type GoldSettings,
} from '@/lib/gold'
import type { PriceHistoryEntry } from '@/app/actions'
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, AlertCircle, Activity, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollReveal } from './scroll-reveal'
import { useLivePrices } from './live-prices'

type Tone = 'gold' | 'silver'

const TONE = {
  gold: { stroke: '#e0a12e', from: 'from-yellow-300', to: 'to-amber-600', text: 'text-amber-600 dark:text-amber-400' },
  silver: { stroke: '#7c8799', from: 'from-slate-200', to: 'to-slate-500', text: 'text-slate-600 dark:text-slate-300' },
}

/* ─── Interactive SVG Chart ─── */
function PriceChart({
  title,
  values,
  dates,
  tone,
  gradientId,
}: {
  title: string
  values: number[]
  dates: string[]
  tone: Tone
  gradientId: string
}) {
  const [hovered, setHovered] = useState<number | null>(null)
  if (values.length < 2) return null

  const color = TONE[tone].stroke
  const min = Math.min(...values)
  const max = Math.max(...values)
  const latest = values[values.length - 1]
  const prev = values[values.length - 2]
  const diff = latest - prev
  const pct = prev === 0 ? 0 : (diff / prev) * 100
  const isSame = Math.abs(diff) < 0.001
  const isUp = diff > 0

  const W = 500, H = 200, PX = 8, PY = 16
  const cW = W - PX * 2, cH = H - PY * 2
  const range = max - min === 0 ? 1 : max - min

  const pts = values.map((v, i) => ({
    x: PX + (i / (values.length - 1)) * cW,
    y: PY + cH - ((v - min) / range) * cH,
    v,
  }))

  // Smooth curve (cardinal-ish via cubic beziers)
  const line = pts
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`
      const p0 = pts[i - 1]
      const cx = (p0.x + p.x) / 2
      return `C ${cx} ${p0.y}, ${cx} ${p.y}, ${p.x} ${p.y}`
    })
    .join(' ')
  const area = `${line} L ${W - PX} ${H - PY} L ${PX} ${H - PY} Z`
  const sliceW = cW / Math.max(values.length - 1, 1)

  const shown = hovered !== null ? pts[hovered].v : latest

  return (
    <div className="flex h-full flex-col rounded-3xl border border-border bg-card p-6 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="num mt-1 text-4xl font-semibold tracking-[-0.04em] text-foreground">
            {formatEUR(shown)}
            <span className="ml-1 text-base font-normal text-muted-foreground">/g</span>
          </div>
          <div className="num mt-1 h-4 text-xs text-muted-foreground">
            {hovered !== null ? dates[hovered] : 'Último registo'}
          </div>
        </div>
        <div
          className={cn(
            'num inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold',
            isSame ? 'bg-muted text-muted-foreground' : isUp ? 'bg-up/10 text-up' : 'bg-down/10 text-down'
          )}
        >
          {isSame ? <Minus className="h-3 w-3" /> : isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {isSame ? '0.00€ (0.0%)' : `${isUp ? '+' : ''}${diff.toFixed(2)}€ (${pct > 0 ? '+' : ''}${pct.toFixed(1)}%)`}
        </div>
      </div>

      <div className="relative mt-6 flex-1">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-full min-h-[180px] w-full overflow-visible">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.28" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {[PY, PY + cH / 2, H - PY].map((y, i) => (
            <line key={i} x1={PX} y1={y} x2={W - PX} y2={y} style={{ stroke: 'var(--border)' }} strokeWidth="1" strokeDasharray="4 6" />
          ))}

          <path d={area} fill={`url(#${gradientId})`} className="fade-in-late" />
          <path
            d={line}
            pathLength={1}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="draw-line"
          />

          {hovered !== null && (
            <line
              x1={pts[hovered].x} y1={PY}
              x2={pts[hovered].x} y2={H - PY}
              style={{ stroke: 'var(--muted-foreground)' }}
              strokeWidth="1"
              opacity="0.4"
            />
          )}

          {pts.map((p, i) =>
            i === pts.length - 1 || i === hovered ? (
              <g key={i} className={i === pts.length - 1 && hovered === null ? 'fade-in-late' : undefined}>
                <circle cx={p.x} cy={p.y} r={10} fill={color} opacity={0.15}>
                  {i === pts.length - 1 && <animate attributeName="r" values="7;13;7" dur="2.4s" repeatCount="indefinite" />}
                </circle>
                <circle cx={p.x} cy={p.y} r={4.5} style={{ fill: 'var(--card)' }} stroke={color} strokeWidth="2.5" />
              </g>
            ) : null
          )}

          {pts.map((p, i) => (
            <rect
              key={`z${i}`}
              x={p.x - sliceW / 2} y={0}
              width={sliceW} height={H}
              fill="transparent"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onTouchStart={() => setHovered(i)}
              style={{ cursor: 'crosshair' }}
            />
          ))}
        </svg>
      </div>

      <div className="num mt-4 flex justify-between text-[11px] text-muted-foreground">
        <span>{dates[0]}</span>
        <span>{values.length} registos</span>
        <span>{dates[dates.length - 1]}</span>
      </div>
    </div>
  )
}

function EmptyChart({ title }: { title: string }) {
  return (
    <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border bg-card p-8 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Activity className="h-5 w-5" />
      </span>
      <div className="text-sm font-semibold text-foreground">{title}</div>
      <div className="max-w-[240px] text-sm leading-relaxed text-muted-foreground">
        O gráfico aparecerá após a primeira atualização de preço na área reservada.
      </div>
    </div>
  )
}

/* ─── Metal pricing table ─── */
function MetalTable({
  label,
  tone,
  rows,
}: {
  label: string
  tone: Tone
  rows: { name: string; sub: string; official: string; pays: string }[]
}) {
  return (
    <div className="h-full overflow-hidden rounded-3xl border border-border bg-card">
      <div className="flex items-center gap-2.5 px-6 pt-6 pb-4 md:px-8 md:pt-8">
        <span className={cn('h-3 w-3 rounded-full bg-gradient-to-br', TONE[tone].from, TONE[tone].to)} />
        <span className="text-base font-semibold tracking-tight text-foreground">{label}</span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-muted-foreground">
            <th className="px-6 py-2 text-left font-medium md:px-8">Metal</th>
            <th className="px-3 py-2 text-right font-medium">Oficial /g</th>
            <th className="px-6 py-2 text-right font-medium text-foreground md:px-8">Pagamos /g</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="group border-t border-border transition-colors hover:bg-muted/50"
              style={{ animation: `fade-up 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 50}ms both` }}
            >
              <td className="px-6 py-4 md:px-8">
                <span className="font-medium text-foreground">{row.name}</span>
                <span className="num ml-2 text-xs text-muted-foreground">{row.sub}</span>
              </td>
              <td className="num px-3 py-4 text-right text-muted-foreground">{row.official}</td>
              <td className={cn('num px-6 py-4 text-right text-base font-semibold md:px-8', TONE[tone].text)}>
                {row.pays}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'same' }) {
  if (trend === 'up') return <TrendingUp className="h-3.5 w-3.5 text-up" />
  if (trend === 'down') return <TrendingDown className="h-3.5 w-3.5 text-down" />
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />
}

/* ─── Main export ─── */
export function PriceTable({
  settings: initialSettings,
  priceHistory: initialHistory,
}: {
  settings: GoldSettings
  priceHistory: PriceHistoryEntry[]
}) {
  const { settings, history: priceHistory } = useLivePrices(initialSettings, initialHistory)
  const [tab, setTab] = useState<Tone>('gold')
  const [historyOpen, setHistoryOpen] = useState(false)

  const chronological = [...priceHistory].reverse()
  const goldVals = chronological.map((e) => e.price_gold)
  const silverVals = chronological.map((e) => e.price_silver)
  const dates = chronological.map((e) => e.timestamp)

  const goldRows = KARATS.map((k) => ({
    name: k.karat === 19.2 ? `Ouro 19.2K (Português)` : `Ouro ${k.karat}K`,
    sub: `${Math.min(999, Math.round(k.purity * 1000))}‰`,
    official: formatEUR(officialPricePerGram(settings.price_per_gram_24k, k.purity)),
    pays: formatEUR(payPricePerGram(settings.price_per_gram_24k, settings.discount_per_gram, k.purity)),
  }))

  const silverRows = SILVER_PURITIES.map((s) => ({
    name: `Prata ${s.value}‰`,
    sub: s.value === '999' ? 'Pura' : 'Lei',
    official: formatEUR(officialPricePerGram(settings.price_per_gram_silver_999 ?? 1, s.purity)),
    pays: formatEUR(payPricePerGram(settings.price_per_gram_silver_999 ?? 1, settings.discount_per_gram_silver ?? 0.15, s.purity)),
  }))

  const isGold = tab === 'gold'
  const hasPrices = settings.price_per_gram_24k > 0
  const hasChart = priceHistory.length >= 2

  return (
    <section id="precos" className="relative scroll-mt-24 py-24 md:py-32">
      <div className="container-page">

        {/* Heading */}
        <ScrollReveal>
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Tabela de cotações</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-foreground md:text-6xl">
                Valores de referência
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
                Cotações oficiais baseadas no <strong className="font-semibold text-foreground">Fixing de Londres (LBMA)</strong>.
                Atualizadas nos dias úteis às <strong className="font-semibold text-foreground">10h35</strong> e{' '}
                <strong className="font-semibold text-foreground">15h05</strong> (Ouro) e às{' '}
                <strong className="font-semibold text-foreground">12h05</strong> (Prata).
              </p>
              <a
                href="https://www.lbma.org.uk/prices-and-data/precious-metal-prices"
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
              >
                Fonte oficial: LBMA (London Bullion Market Association)
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>

            {/* Tabs */}
            <div className="relative grid w-full grid-cols-2 rounded-full bg-muted p-1.5 sm:w-72" role="tablist" aria-label="Metal">
              <span
                className="absolute inset-y-1.5 left-1.5 w-[calc(50%-0.375rem)] rounded-full bg-card shadow-[0_4px_14px_-4px_rgba(0,0,0,0.2)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ transform: isGold ? 'translateX(0)' : 'translateX(100%)' }}
                aria-hidden
              />
              {(['gold', 'silver'] as const).map((t) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  className={cn(
                    'relative z-10 flex h-10 items-center justify-center gap-2 text-sm font-semibold transition-colors',
                    tab === t ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <span className={cn('h-2.5 w-2.5 rounded-full bg-gradient-to-br', TONE[t].from, TONE[t].to)} />
                  {t === 'gold' ? 'Ouro' : 'Prata'}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Table + chart */}
        <ScrollReveal delay={80}>
          <div key={tab} className="mt-12 grid gap-5 lg:grid-cols-[1fr_1.1fr]">
            {hasPrices ? (
              isGold ? (
                <MetalTable label="Ouro — cotações por quilate" tone="gold" rows={goldRows} />
              ) : (
                <MetalTable label="Prata — cotações por pureza" tone="silver" rows={silverRows} />
              )
            ) : (
              <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border bg-card px-8 py-12 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <AlertCircle className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Cotações indisponíveis</h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                    As tabelas de referência e cotações por quilate estarão visíveis assim que definir os preços de referência na área reservada (cadeado no rodapé).
                  </p>
                </div>
              </div>
            )}

            {hasChart ? (
              isGold ? (
                <PriceChart title="Ouro 24K · últimos 10 dias" values={goldVals} dates={dates} tone="gold" gradientId="gold-grad" />
              ) : (
                <PriceChart title="Prata 999 · últimos 10 dias" values={silverVals} dates={dates} tone="silver" gradientId="silver-grad" />
              )
            ) : (
              <EmptyChart title={isGold ? 'Ouro 24K' : 'Prata 999'} />
            )}
          </div>
        </ScrollReveal>

        {/* History log (collapsible) */}
        <ScrollReveal delay={120}>
          <div className="mt-5 overflow-hidden rounded-3xl border border-border bg-card">
            <button
              onClick={() => setHistoryOpen((v) => !v)}
              aria-expanded={historyOpen}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-muted/40 md:px-8"
            >
              <span className="flex items-center gap-3">
                <span className="text-base font-semibold tracking-tight text-foreground">Histórico de atualizações de preço</span>
                {priceHistory.length > 0 && (
                  <span className="num rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                    {priceHistory.length}
                  </span>
                )}
              </span>
              <ChevronDown className={cn('h-5 w-5 text-muted-foreground transition-transform duration-300', historyOpen && 'rotate-180')} />
            </button>

            <div
              className={cn(
                'grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
                historyOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              )}
            >
              <div className="overflow-hidden">
                {priceHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 border-t border-border px-8 py-12 text-center">
                    <p className="text-sm font-medium text-foreground">Nenhum registo ainda.</p>
                    <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                      O histórico será preenchido automaticamente cada vez que atualizar os preços na área reservada (cadeado no rodapé).
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-t border-border text-xs text-muted-foreground">
                          <th className="px-6 py-3 text-left font-medium md:px-8">Data</th>
                          <th className="px-3 py-3 text-right font-medium">Ouro 24K /g</th>
                          <th className="px-6 py-3 text-right font-medium md:px-8">Prata 999 /g</th>
                        </tr>
                      </thead>
                      <tbody>
                        {priceHistory.map((entry, idx) => (
                          <tr key={idx} className="border-t border-border transition-colors hover:bg-muted/40">
                            <td className="num whitespace-nowrap px-6 py-3.5 text-muted-foreground md:px-8">{entry.timestamp}</td>
                            <td className="px-3 py-3.5 text-right">
                              <span className="num inline-flex items-center justify-end gap-1.5 font-semibold text-foreground">
                                {formatEUR(entry.price_gold)}
                                <TrendIcon trend={entry.trend_gold} />
                              </span>
                            </td>
                            <td className="px-6 py-3.5 text-right md:px-8">
                              <span className="num inline-flex items-center justify-end gap-1.5 font-semibold text-foreground">
                                {formatEUR(entry.price_silver)}
                                <TrendIcon trend={entry.trend_silver} />
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </section>
  )
}
