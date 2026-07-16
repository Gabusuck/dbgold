'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import {
  KARATS,
  SILVER_PURITIES,
  formatEUR,
  officialPricePerGram,
  payPricePerGram,
  type GoldSettings,
} from '@/lib/gold'
import type { PriceHistoryEntry } from '@/app/actions'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

/* ─── Interactive SVG Chart ─── */
function PriceChart({
  title,
  values,
  dates,
  strokeColor,
  gradientId,
  accentColor,
  light,
}: {
  title: string
  values: number[]
  dates: string[]
  strokeColor: string
  gradientId: string
  accentColor: string
  light: boolean
}) {
  const [hovered, setHovered] = useState<number | null>(null)
  if (values.length < 2) return null

  const min = Math.min(...values)
  const max = Math.max(...values)
  const latest = values[values.length - 1]
  const prev = values[values.length - 2]
  const diff = latest - prev
  const pct = prev === 0 ? 0 : (diff / prev) * 100
  const isUp = diff >= 0

  const W = 500, H = 160, PX = 8, PY = 12
  const cW = W - PX * 2, cH = H - PY * 2
  const range = max - min === 0 ? 1 : max - min

  const pts = values.map((v, i) => ({
    x: PX + (i / (values.length - 1)) * cW,
    y: PY + cH - ((v - min) / range) * cH,
    v,
  }))

  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const area = `${line} L ${W - PX} ${H - PY} L ${PX} ${H - PY} Z`
  const sliceW = cW / Math.max(values.length - 1, 1)

  const cardBg = light
    ? `linear-gradient(135deg, ${accentColor}12 0%, rgba(255, 255, 255, 0.85) 100%)`
    : `linear-gradient(135deg, ${accentColor}06 0%, rgba(10,10,10,0.9) 100%)`
  const cardBorder = light ? `${accentColor}28` : `${accentColor}18`
  const gridLine = light ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.04)'
  const dotFill = light ? '#f0ece4' : '#0d0d0d'
  const textPrimary = light ? '#1a1208' : '#ffffff'
  const textMuted = light ? '#9a8268' : '#52525b'
  const axisColor = light ? '#b0987c' : '#3f3f46'
  const axisDateBorder = light ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)'

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4 relative overflow-visible group transition-all duration-500 hover:scale-[1.015] cursor-default"
      style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        boxShadow: `0 0 40px ${accentColor}08`,
      }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${accentColor}12 0%, transparent 70%)` }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.25em] mb-2" style={{ color: accentColor + 'aa' }}>
            {title}
          </div>
          <div className="text-3xl font-bold font-mono" style={{ color: textPrimary }}>
            {formatEUR(latest)}
            <span className="text-sm font-normal ml-1" style={{ color: textMuted }}>/g</span>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold ${
          isUp ? 'bg-emerald-500/12 text-emerald-600 border border-emerald-500/25'
               : 'bg-rose-500/12 text-rose-600 border border-rose-500/25'
        }`}>
          {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {isUp ? '+' : ''}{diff.toFixed(2)}€&nbsp;({pct > 0 ? '+' : ''}{pct.toFixed(1)}%)
        </div>
      </div>

      {/* Chart */}
      <div className="relative z-10 h-[160px] overflow-visible">
        {hovered !== null && (
          <div
            className="absolute z-30 pointer-events-none transition-all duration-75"
            style={{
              left: `${(pts[hovered].x / W) * 100}%`,
              top: `${Math.max(2, (pts[hovered].y / H) * 100 - 24)}%`,
              transform:
                hovered === values.length - 1
                  ? 'translateX(-90%)'
                  : hovered === 0
                    ? 'translateX(-10%)'
                    : 'translateX(-50%)',
            }}
          >
            <div
              className="glass-dark rounded-xl px-3 py-2 text-center whitespace-nowrap shadow-2xl"
              style={{ border: `1px solid ${accentColor}30` }}
            >
              <div className="text-sm font-bold font-mono" style={{ color: textPrimary }}>{formatEUR(pts[hovered].v)}</div>
              <div className="text-[9px] mt-0.5" style={{ color: textMuted }}>{dates[hovered]}</div>
            </div>
          </div>
        )}

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
            </linearGradient>
          </defs>

          {[PY, PY + cH / 2, H - PY].map((y, i) => (
            <line key={i} x1={PX} y1={y} x2={W - PX} y2={y}
              stroke={gridLine} strokeWidth="1" />
          ))}

          {hovered !== null && (
            <line
              x1={pts[hovered].x} y1={PY}
              x2={pts[hovered].x} y2={H - PY}
              stroke={strokeColor} strokeWidth="1.5"
              strokeDasharray="4 3" opacity="0.5"
            />
          )}

          <path d={area} fill={`url(#${gradientId})`} />
          <path d={line} fill="none" stroke={strokeColor} strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" />

          {pts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y}
              r={i === pts.length - 1 || i === hovered ? 5.5 : 2.5}
              fill={i === hovered ? strokeColor : dotFill}
              stroke={strokeColor} strokeWidth="2.5">
              {i === pts.length - 1 && (
                <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite" />
              )}
            </circle>
          ))}

          {pts.map((p, i) => (
            <rect key={`z${i}`}
              x={p.x - sliceW / 2} y={PY}
              width={sliceW} height={cH}
              fill="transparent"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'crosshair' }}
            />
          ))}
        </svg>
      </div>

      {/* X-axis dates */}
      <div className="relative z-10 flex justify-between text-[9px] font-mono border-t pt-2"
        style={{ borderColor: axisDateBorder, color: axisColor }}>
        <span>{dates[0]}</span>
        <span style={{ color: textMuted }}>{values.length} registos</span>
        <span>{dates[dates.length - 1]}</span>
      </div>
    </div>
  )
}

/* ─── Metal pricing table card ─── */
function MetalTable({
  label,
  accentColor,
  rows,
  light,
}: {
  label: string
  accentColor: string
  rows: { name: string; sub: string; official: string; pays: string }[]
  light: boolean
}) {
  const cardBg = light ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.02)'
  const cardBorder = light ? `${accentColor}25` : `${accentColor}15`
  const headerBg = light
    ? `linear-gradient(90deg, ${accentColor}10 0%, transparent 100%)`
    : `linear-gradient(90deg, ${accentColor}08 0%, transparent 100%)`
  const headerBorder = light ? `${accentColor}18` : `${accentColor}10`
  const rowBorder = light ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.03)'
  const rowHover = light ? 'rgba(0,0,0,0.025)' : 'rgba(255,255,255,0.02)'
  const headText = light ? '#9a8268' : '#52525b'
  const nameText = light ? '#2a1e10' : '#d4d4d8'
  const nameHover = light ? '#1a1208' : '#ffffff'
  const subText = light ? '#b0987c' : '#3f3f46'
  const officialText = light ? '#9a8268' : '#52525b'

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-xl"
      style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-4 py-4 md:px-6 border-b"
        style={{
          borderColor: headerBorder,
          background: headerBg,
        }}
      >
        <div className="h-2 w-2 rounded-full anim-pulse-ring" style={{ background: accentColor }} />
        <span className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: accentColor + 'cc' }}>
          {label}
        </span>
      </div>

      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: `1px solid ${rowBorder}` }}>
            <th className="px-4 md:px-6 py-3 text-left text-[9px] font-black uppercase tracking-wider" style={{ color: headText }}>Metal</th>
            <th className="px-4 md:px-6 py-3 text-right text-[9px] font-black uppercase tracking-wider" style={{ color: headText }}>Oficial /g</th>
            <th className="px-4 md:px-6 py-3 text-right text-[9px] font-black uppercase tracking-wider" style={{ color: accentColor + '99' }}>Pagamos /g</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="transition-colors duration-200 group"
              style={{ borderBottom: `1px solid ${rowBorder}` }}
              onMouseEnter={(e) => (e.currentTarget.style.background = rowHover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <td className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold transition-colors" style={{ color: nameText }}>
                {row.name}
                <span className="ml-1.5 text-[9px] md:text-[10px] font-normal" style={{ color: subText }}>{row.sub}</span>
              </td>
              <td className="px-4 md:px-6 py-4 text-right text-xs md:text-sm font-mono" style={{ color: officialText }}>{row.official}</td>
              <td className="px-4 md:px-6 py-4 text-right text-xs md:text-sm font-mono font-bold transition-all"
                style={{ color: accentColor }}>
                {row.pays}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ─── Main export ─── */
export function PriceTable({
  settings,
  priceHistory,
}: {
  settings: GoldSettings
  priceHistory: PriceHistoryEntry[]
}) {
  const { resolvedTheme } = useTheme()
  const light = resolvedTheme !== 'dark'

  const chronological = [...priceHistory].reverse()
  const goldVals = chronological.map((e) => e.price_gold)
  const silverVals = chronological.map((e) => e.price_silver)
  const dates = chronological.map((e) => e.timestamp)

  const goldRows = KARATS.map((k) => ({
    name: `Ouro ${k.karat}K`,
    sub: `${Math.round(k.purity * 1000)}‰`,
    official: formatEUR(officialPricePerGram(settings.price_per_gram_24k, k.purity)),
    pays: formatEUR(payPricePerGram(settings.price_per_gram_24k, settings.discount_per_gram, k.purity)),
  }))

  const silverRows = SILVER_PURITIES.map((s) => ({
    name: `Prata ${s.value}‰`,
    sub: s.purity === 0.999 ? 'Pura' : 'Lei',
    official: formatEUR(officialPricePerGram(settings.price_per_gram_silver_999 ?? 1, s.purity)),
    pays: formatEUR(payPricePerGram(settings.price_per_gram_silver_999 ?? 1, settings.discount_per_gram_silver ?? 0.15, s.purity)),
  }))

  const bg = light ? '#f5f0e8' : '#111111'
  const textPrimary = light ? '#1a1208' : '#ffffff'
  const textMuted = light ? '#8a7058' : '#71717a'
  const badgeBg = light ? 'rgba(180,83,9,0.07)' : 'rgba(251,191,36,0.07)'
  const badgeBorder = light ? 'rgba(180,83,9,0.18)' : 'rgba(251,191,36,0.15)'
  const badgeText = light ? '#b45309' : 'rgba(251,191,36,0.85)'
  const emptyCardBg = light ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.015)'
  const emptyCardBorder = light ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.04)'
  const historyBg = light ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.02)'
  const historyBorder = light ? 'rgba(0,0,0,0.13)' : 'rgba(255,255,255,0.05)'
  const historyHeaderBg = light ? 'rgba(180,83,9,0.08)' : 'rgba(251,191,36,0.04)'
  const historyHeaderBorder = light ? 'rgba(180,83,9,0.18)' : 'rgba(251,191,36,0.08)'
  const historyHeaderText = light ? '#1a1208' : 'rgba(251,191,36,0.85)'
  const rowBorder = light ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.03)'
  const rowHover = light ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)'
  const headText = light ? '#9a8268' : '#52525b'
  const silverText = light ? '#475569' : '#d4d4d8'

  return (
    <section
      id="precos"
      className="scroll-mt-20 relative overflow-hidden py-24"
      style={{ background: bg }}
    >
      {/* Separator glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-[60%] pointer-events-none"
        style={{ background: light
          ? 'linear-gradient(90deg, transparent 0%, rgba(180,83,9,0.3) 50%, transparent 100%)'
          : 'linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.35) 50%, transparent 100%)'
        }}
      />
      {/* Ambient dot grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: light ? 0.85 : 0.2,
          backgroundImage: light
            ? 'radial-gradient(circle, rgba(120,80,40,0.22) 1.2px, transparent 1.2px)'
            : 'radial-gradient(circle, rgba(251,191,36,0.15) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 0%, transparent 100%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-5 md:px-8 flex flex-col gap-16">

        {/* Section heading */}
        <div className="text-center anim-fade-up">
          <span
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6"
            style={{ background: badgeBg, border: `1px solid ${badgeBorder}`, color: badgeText }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            Tabela de Cotações
          </span>
          <h2 className="text-4xl font-bold md:text-5xl tracking-tight" style={{ color: textPrimary }}>
            Valores de <span className="text-shimmer">Referência</span>
          </h2>
          <p className="mt-4 text-sm max-w-md mx-auto leading-relaxed" style={{ color: textMuted }}>
            Cotações por grama líquidas, actualizadas a{' '}
            {new Date(settings.updated_at).toLocaleDateString('pt-PT', {
              day: '2-digit', month: 'long', year: 'numeric'
            })}.
          </p>
          <a
            href="https://www.kitco.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-opacity hover:opacity-80"
            style={{
              background: light ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)',
              border: light ? '1px solid rgba(0,0,0,0.10)' : '1px solid rgba(255,255,255,0.08)',
              color: light ? '#6a5438' : '#a1a1aa',
            }}
          >
            <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            Preços baseados em Kitco.com
            <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>

        {/* Tables */}
        {settings.price_per_gram_24k > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            <MetalTable
              label="Ouro — cotações por quilate"
              accentColor="#d97706"
              rows={goldRows}
              light={light}
            />
            <MetalTable
              label="Prata — cotações por pureza"
              accentColor="#64748b"
              rows={silverRows}
              light={light}
            />
          </div>
        ) : (
          <div
            className="rounded-2xl py-16 px-6 text-center max-w-lg mx-auto flex flex-col items-center gap-4"
            style={{ background: emptyCardBg, border: `1px solid ${emptyCardBorder}` }}
          >
            <div
              className="h-12 w-12 rounded-2xl flex items-center justify-center"
              style={{ background: badgeBg, border: `1px solid ${badgeBorder}` }}
            >
              <svg className="h-6 w-6 text-amber-600/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold" style={{ color: textPrimary }}>Cotações Indisponíveis</h3>
              <p className="mt-2 text-xs leading-relaxed" style={{ color: textMuted }}>
                As tabelas de referência e cotações por quilate estarão visíveis assim que definir os preços de referência na área reservada (cadeado no rodapé).
              </p>
            </div>
          </div>
        )}

        {/* Charts */}
        {priceHistory.length >= 2 ? (
          <div className="flex flex-col gap-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold" style={{ color: textPrimary }}>Evolução dos Últimos 10 Dias</h3>
              <p className="mt-2 text-sm" style={{ color: textMuted }}>
                Passe o rato sobre o gráfico para explorar cada registo
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <PriceChart
                title="Ouro 24K"
                values={goldVals}
                dates={dates}
                strokeColor="#d97706"
                gradientId="gold-grad"
                accentColor="#d97706"
                light={light}
              />
              <PriceChart
                title="Prata 999"
                values={silverVals}
                dates={dates}
                strokeColor="#64748b"
                gradientId="silver-grad"
                accentColor="#64748b"
                light={light}
              />
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {(['Ouro 24K', 'Prata 999'] as const).map((title) => (
              <div
                key={title}
                className="rounded-2xl flex flex-col items-center justify-center gap-3 py-16 text-center"
                style={{ background: emptyCardBg, border: `1px solid ${emptyCardBorder}` }}
              >
                <div
                  className="h-12 w-12 rounded-2xl flex items-center justify-center mb-1"
                  style={{ background: badgeBg, border: `1px solid ${badgeBorder}` }}
                >
                  <svg className="h-6 w-6 text-amber-600/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <div className="text-sm font-semibold" style={{ color: textMuted }}>{title}</div>
                <div className="text-xs max-w-[180px] leading-relaxed" style={{ color: textMuted }}>
                  O gráfico aparecerá após a primeira atualização de preço na área reservada.
                </div>
              </div>
            ))}
          </div>
        )}

        {/* History log */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: historyBg, border: `1px solid ${historyBorder}` }}
        >
          <div
            className="flex items-center gap-2.5 px-6 py-4 border-b"
            style={{ borderColor: historyHeaderBorder, background: historyHeaderBg }}
          >
            <div className="h-2 w-2 rounded-full bg-amber-500 anim-pulse-ring" />
            <span className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: historyHeaderText }}>
              Histórico de Atualizações de Preço
            </span>
          </div>
          {priceHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-14 text-center px-8">
              <div
                className="h-11 w-11 rounded-xl flex items-center justify-center"
                style={{ background: emptyCardBg, border: `1px solid ${emptyCardBorder}` }}
              >
                <svg className="h-5 w-5" style={{ color: textMuted }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <p className="text-sm" style={{ color: textMuted }}>Nenhum registo ainda.</p>
              <p className="text-xs max-w-xs leading-relaxed" style={{ color: textMuted, opacity: 0.7 }}>
                O histórico será preenchido automaticamente cada vez que atualizar os preços na área reservada (cadeado no rodapé).
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `1px solid ${rowBorder}` }}>
                  <th className="px-4 md:px-6 py-3 text-left text-[9px] font-black uppercase tracking-wider" style={{ color: headText }}>Data</th>
                  <th className="px-4 md:px-6 py-3 text-right text-[9px] font-black uppercase tracking-wider" style={{ color: headText }}>Ouro 24K /g</th>
                  <th className="px-4 md:px-6 py-3 text-right text-[9px] font-black uppercase tracking-wider" style={{ color: headText }}>Prata 999 /g</th>
                </tr>
              </thead>
              <tbody>
                {priceHistory.map((entry, idx) => (
                  <tr
                    key={idx}
                    className="transition-colors"
                    style={{ borderBottom: `1px solid ${rowBorder}` }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = rowHover)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold transition-colors" style={{ color: textMuted }}>
                      {entry.timestamp}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-right text-xs md:text-sm font-mono">
                      <span className="inline-flex items-center justify-end gap-1.5 text-amber-600 font-bold">
                        {formatEUR(entry.price_gold)}
                        {entry.trend_gold === 'up' && <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />}
                        {entry.trend_gold === 'down' && <TrendingDown className="h-3.5 w-3.5 text-rose-500" />}
                        {entry.trend_gold === 'same' && <Minus className="h-3.5 w-3.5" style={{ color: textMuted }} />}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-right text-xs md:text-sm font-mono">
                      <span className="inline-flex items-center justify-end gap-1.5 font-bold" style={{ color: silverText }}>
                        {formatEUR(entry.price_silver)}
                        {entry.trend_silver === 'up' && <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />}
                        {entry.trend_silver === 'down' && <TrendingDown className="h-3.5 w-3.5 text-rose-500" />}
                        {entry.trend_silver === 'same' && <Minus className="h-3.5 w-3.5" style={{ color: textMuted }} />}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </section>
  )
}
