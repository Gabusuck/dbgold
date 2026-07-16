'use client'

import { useMemo, useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import {
  KARATS,
  SILVER_PURITIES,
  formatEUR,
  officialPricePerGram,
  payPricePerGram,
  type GoldSettings,
} from '@/lib/gold'
import { Trash2, TrendingUp, TrendingDown, Minus, Scale, ChevronDown, ChevronUp } from 'lucide-react'
import type { PriceHistoryEntry } from '@/app/actions'
import { toast } from 'sonner'

type HistoryItem = {
  id: string
  metal: 'ouro' | 'prata'
  purityLabel: string
  grams: number
  payPerGram: number
  total: number
  timestamp: string
}

const WEIGHT_PRESETS = [1, 5, 10, 20, 50, 100]

export function HeroSection({ settings, priceHistory }: { settings: GoldSettings; priceHistory?: PriceHistoryEntry[] }) {
  const [metalType, setMetalType] = useState<'ouro' | 'prata'>('ouro')
  const [karatValue, setKaratValue] = useState('18')
  const [silverValue, setSilverValue] = useState('925')
  const [grams, setGrams] = useState('10')
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    try {
      const stored = localStorage.getItem('dbgold_simulations')
      if (stored) setHistory(JSON.parse(stored) as HistoryItem[])
    } catch { /* ignore */ }
  }, [])

  const light = resolvedTheme !== 'dark'

  // Live settings state: initialize from server-rendered props, then poll API for updates
  const [liveSettings, setLiveSettings] = useState<GoldSettings>(settings)

  useEffect(() => {
    let mounted = true
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings')
        if (!res.ok) return
        const json = await res.json()
        if (json?.ok && json.settings && mounted) {
          setLiveSettings(json.settings)
        }
      } catch (e) { /* ignore */ }
    }

    // initial fetch and interval
    fetchSettings()
    const id = setInterval(fetchSettings, 10000) // every 10s
    return () => { mounted = false; clearInterval(id) }
  }, [])

  // Determine short-term trend for gold and silver from recent price history
  const latest = priceHistory && priceHistory.length > 0 ? priceHistory[0] : null
  const prev = priceHistory && priceHistory.length > 1 ? priceHistory[1] : null
  const goldIsUp = latest && prev ? (latest.price_gold - prev.price_gold) > 0 : null
  const silverIsUp = latest && prev ? (latest.price_silver - prev.price_silver) > 0 : null

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
  }, [metalType, selectedGold, selectedSilver, gramsNum, settings])

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
  const accent = isGold ? '#f59e0b' : '#64748b'
  const [showDebug, setShowDebug] = useState(false)

  // ── Light-mode palette tokens ──
  const bg = light ? '#fdf8f0' : '#111111'
  const cardBg = light ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.03)'
  const cardBorder = light ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)'
  const panelBg = light ? 'rgba(255,255,255,0.7)' : 'rgba(20,20,20,0.95)'
  const panelBorder = light ? 'rgba(0,0,0,0.09)' : 'rgba(255,255,255,0.07)'
  const inputBg = light ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.07)'
  const inputBorder = light ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.10)'
  const toggleBg = light ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)'
  const pillBg = light ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)'
  const historyBg = light ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)'
  const historyBorder = light ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'
  const dividerColor = light ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.04)'
  const rowHover = light ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)'
  const breakdownBg = light ? `linear-gradient(135deg,${accent}10 0%,rgba(0,0,0,0.03) 100%)` : `linear-gradient(135deg,${accent}08 0%,rgba(0,0,0,0.2) 100%)`
  const breakdownRowBg = light ? 'rgba(0,0,0,0.02)' : 'rgba(0,0,0,0.15)'

  const textPrimary = light ? '#1a1208' : '#ffffff'
  const textSecondary = light ? '#6a5438' : '#a1a1aa'
  const textMuted = light ? '#9a8268' : '#52525b'
  const textFaint = light ? '#b0987c' : '#3f3f46'
  const badgeInactive = light ? 'text-stone-600 hover:text-stone-900' : 'text-zinc-600 hover:text-zinc-300'

  return (
    <section
      id="simulador"
      className="relative min-h-[100dvh] flex flex-col scroll-mt-0 overflow-hidden"
      style={{ background: bg }}
    >
      {/* Background decoration */}
      {!light && (
        <>
          <div
            className="absolute inset-x-0 opacity-[0.45]"
            style={{
              top: '35%', bottom: '20%',
              backgroundImage: 'radial-gradient(circle, rgba(251,191,36,0.22) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <div className="anim-float-slow absolute top-[40%] left-[5%] h-80 w-80 rounded-full opacity-[0.06] blur-[100px] pointer-events-none"
            style={{ background: 'radial-gradient(circle, #fbbf24 0%, transparent 70%)' }} />
          <div className="anim-float-med absolute bottom-24 right-[8%] h-60 w-60 rounded-full opacity-[0.05] blur-[80px] pointer-events-none"
            style={{ background: 'radial-gradient(circle, #d97706 0%, transparent 70%)' }} />
        </>
      )}
      {light && (
        <div
          className="absolute inset-x-0 opacity-[0.85] pointer-events-none"
          style={{
            top: '30%', bottom: '15%',
            backgroundImage: 'radial-gradient(circle, rgba(120,80,40,0.22) 1.2px, transparent 1.2px)',
            backgroundSize: '40px 40px',
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="mx-auto max-w-7xl w-full px-5 md:px-8 py-6 md:py-0">
          <div className="grid gap-12 lg:grid-cols-2 items-center">

            {/* ── Left: Hero copy ── */}
            <div className="flex flex-col gap-6 md:gap-8">
              <div className="anim-fade-up">
                <span className="inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-600 glass-gold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                  </span>
                  Cotações Actualizadas
                </span>
              </div>

              <div className="anim-fade-up-1">
                <h1
                  className="font-bold leading-[1.08] tracking-tight text-4xl md:text-6xl lg:text-[5rem]"
                  style={{ color: textPrimary }}
                >
                  Compramos<br />
                  <span className="text-shimmer">Ouro &amp; Prata</span><br />
                  <span className="font-light text-3xl md:text-5xl lg:text-6xl italic" style={{ color: textSecondary }}>ao melhor preço.</span>
                </h1>
              </div>

              <p className="anim-fade-up-2 text-[15px] max-w-md leading-[1.75]" style={{ color: textSecondary }}>
                Avaliação técnica profissional com cotações oficiais diárias e pagamento imediato em mão.
              </p>

              {/* Live price cards */}
              <div className="anim-fade-up-3 grid grid-cols-2 gap-3 max-w-sm">
                <div
                  className="glass rounded-2xl p-3 md:p-4 anim-glow-pulse"
                  style={{
                    borderColor: light ? 'rgba(180,83,9,0.2)' : 'rgba(251,191,36,0.18)'
                  }}
                >
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-600/80 mb-2">Ouro 24K</div>
                  <div className="text-xl xs:text-2xl font-bold text-amber-500 font-mono">
                    {liveSettings.price_per_gram_24k > 0 ? formatEUR(liveSettings.price_per_gram_24k) : 'Sob Consulta'}
                  </div>
                  <div className="text-[10px] mt-1 flex items-center gap-1" style={{ color: textMuted }}>
                    {goldIsUp === null ? (
                      <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-emerald-500" /> por grama</span>
                    ) : goldIsUp ? (
                      <span className="flex items-center gap-1 text-emerald-500"><TrendingUp className="h-3 w-3" /> subiu</span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-500"><TrendingDown className="h-3 w-3" /> desceu</span>
                    )}
                  </div>
                </div>
                <div className="glass rounded-2xl p-3 md:p-4 anim-silver-glow-pulse">
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: textMuted }}>Prata 999</div>
                  <div className="text-xl xs:text-2xl font-bold font-mono" style={{ color: light ? '#475569' : '#e2e8f0' }}>
                    {liveSettings.price_per_gram_silver_999 && liveSettings.price_per_gram_silver_999 > 0
                      ? formatEUR(liveSettings.price_per_gram_silver_999)
                      : 'Sob Consulta'}
                  </div>
                  <div className="text-[10px] mt-1 flex items-center gap-1" style={{ color: textMuted }}>
                    {silverIsUp === null ? (
                      <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-emerald-500" /> por grama</span>
                    ) : silverIsUp ? (
                      <span className="flex items-center gap-1 text-emerald-500"><TrendingUp className="h-3 w-3" /> subiu</span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-500"><TrendingDown className="h-3 w-3" /> desceu</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="anim-fade-up-4 flex flex-wrap gap-x-6 gap-y-2 text-xs border-t pt-5" style={{ borderColor: dividerColor, color: textFaint }}>
                {['✓ Sem comissões ocultas', '✓ Avaliação presencial', '✓ Fecho no próprio dia'].map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>

            {/* ── Right: Simulator ── */}
            <div className="anim-slide-right w-full">
              <div
                className="rounded-3xl p-[1px] anim-border-shim"
                style={{
                  background: `linear-gradient(135deg, ${accent}55, ${light ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)'}, ${accent}25)`,
                  boxShadow: `0 0 80px ${accent}15, 0 32px 64px ${light ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.5)'}`,
                }}
              >
                <div className="rounded-[23px] p-4 md:p-7" style={{ background: panelBg, border: `1px solid ${panelBorder}` }}>

                  {/* Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl glass-gold">
                        <Scale className="h-4 w-4 text-amber-500" />
                      </div>
                      <div>
                        <div className="text-sm font-bold" style={{ color: textPrimary }}>Simulador de Venda</div>
                        <div className="text-[10px]" style={{ color: textMuted }}>estimativa instantânea</div>
                      </div>
                    </div>
                    <span className="text-[9px] text-amber-600/70 font-bold uppercase tracking-widest border border-amber-500/20 rounded-lg px-2.5 py-1">Live</span>
                  </div>

                  {/* ① Metal toggle */}
                  <div className="mb-5 rounded-xl p-1" style={{ background: toggleBg }}>
                    <div className="grid grid-cols-2 gap-1">
                      {(['ouro', 'prata'] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => setMetalType(m)}
                          className={`py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                            metalType === m
                              ? m === 'ouro'
                                ? 'bg-amber-500 text-amber-950 shadow-[0_4px_20px_rgba(245,158,11,0.35)]'
                                : light
                                  ? 'bg-slate-500 text-white shadow-lg'
                                  : 'bg-zinc-200 text-zinc-900 shadow-lg'
                              : badgeInactive
                          }`}
                        >
                          {m === 'ouro' ? '✦ Ouro' : '◈ Prata'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ② Quality */}
                  <div className="mb-5">
                    <div className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: textMuted }}>Qualidade</div>
                    <div className="flex flex-wrap gap-2">
                      {isGold
                        ? KARATS.map((k) => (
                            <button
                              key={k.karat}
                              onClick={() => setKaratValue(String(k.karat))}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                                karatValue === String(k.karat)
                                  ? 'bg-amber-500 text-amber-950'
                                  : badgeInactive
                              }`}
                              style={karatValue !== String(k.karat) ? { background: pillBg } : {}}
                            >
                              {k.karat}K
                            </button>
                          ))
                        : SILVER_PURITIES.map((s) => (
                            <button
                              key={s.value}
                              onClick={() => setSilverValue(s.value)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                                silverValue === s.value
                                  ? light ? 'bg-slate-500 text-white' : 'bg-zinc-200 text-zinc-900'
                                  : badgeInactive
                              }`}
                              style={silverValue !== s.value ? { background: pillBg } : {}}
                            >
                              {s.value}‰
                            </button>
                          ))
                      }
                    </div>
                  </div>

                  {/* ③ Weight */}
                  <div className="mb-5">
                    <div className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: textMuted }}>Peso</div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative">
                        <input
                          type="number"
                          inputMode="decimal"
                          min="0.1"
                          max="9999"
                          step="0.1"
                          value={grams}
                          onChange={(e) => setGrams(e.target.value)}
                          className="w-24 h-10 text-center font-mono font-bold text-sm rounded-xl outline-none focus:ring-1 focus:ring-amber-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none select-none" style={{ color: textMuted }}>g</span>
                      </div>
                      {WEIGHT_PRESETS.map((w) => (
                        <button
                          key={w}
                          onClick={() => setGrams(String(w))}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200 ${
                            gramsNum === w
                              ? isGold
                                ? 'bg-amber-500/20 text-amber-600 border border-amber-500/40'
                                : light
                                  ? 'bg-slate-400/20 text-slate-600 border border-slate-400/40'
                                  : 'bg-zinc-600/40 text-zinc-300 border border-zinc-600/60'
                              : ''
                          }`}
                          style={gramsNum !== w ? { background: pillBg, border: `1px solid ${dividerColor}`, color: textMuted } : {}}
                        >
                          {w}g
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ④ Result breakdown */}
                  <div
                    className="mb-5 rounded-2xl overflow-hidden"
                    style={{ border: `1px solid ${accent}20` }}
                  >
                    <div className="p-4 text-center" style={{ background: breakdownBg }}>
                      <div className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: textMuted }}>Recebe</div>
                      <div className="text-4xl font-bold font-mono tracking-tight" style={{ color: isGold ? '#d97706' : (light ? '#475569' : '#e2e8f0') }}>
                        {formatEUR(activeParams.total)}
                      </div>
                    </div>
                    <div className="divide-y" style={{ borderColor: `${accent}10`, background: breakdownRowBg }}>
                      <div className="flex justify-between items-center px-4 py-2.5 text-xs">
                        <span style={{ color: textSecondary }}>Cotação oficial</span>
                        <span className="font-mono" style={{ color: textMuted }}>{formatEUR(activeParams.officialPerGram)}/g → {formatEUR(activeParams.officialTotal)}</span>
                      </div>
                      <div className="flex justify-between items-center px-4 py-2.5 text-xs">
                        <span style={{ color: textSecondary }}>Pagamos</span>
                        <span className="font-mono font-bold" style={{ color: accent }}>{formatEUR(activeParams.payPerGram)}/g × {gramsNum}g</span>
                      </div>
                    </div>
                  </div>

                  {/* ⑤ Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={gramsNum <= 0}
                      className={`flex-1 h-11 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 disabled:opacity-40 ${
                        isGold
                          ? 'bg-amber-500 hover:bg-amber-400 text-amber-950 shadow-[0_4px_24px_rgba(245,158,11,0.3)] hover:shadow-[0_4px_32px_rgba(245,158,11,0.5)]'
                          : light
                            ? 'bg-slate-600 hover:bg-slate-500 text-white'
                            : 'bg-zinc-200 hover:bg-white text-zinc-900'
                      }`}
                    >
                      Guardar Simulação
                    </button>
                    {history.length > 0 && (
                      <button
                        onClick={() => setShowHistory((v) => !v)}
                        className="flex items-center gap-1.5 px-3 h-11 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors"
                        style={{ background: pillBg, border: `1px solid ${dividerColor}`, color: textSecondary }}
                      >
                        {history.length}
                        {showHistory ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                    )}
                  </div>

                  {/* ⑥ History */}
                  {showHistory && history.length > 0 && (
                    <div className="mt-4 rounded-xl overflow-hidden" style={{ border: `1px solid ${historyBorder}` }}>
                      <div className="flex items-center justify-between px-4 py-2 border-b" style={{ background: historyBg, borderColor: historyBorder }}>
                        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: textMuted }}>Histórico</span>
                        <button
                          onClick={() => {
                            setHistory([])
                            localStorage.removeItem('dbgold_simulations')
                            setShowHistory(false)
                          }}
                          className="text-[9px] text-rose-500/70 hover:text-rose-500 font-bold uppercase transition-colors"
                        >Limpar</button>
                      </div>
                      <div className="max-h-44 overflow-y-auto">
                        {history.map((item) => (
                          <div key={item.id} className="flex items-center justify-between px-4 py-2.5 border-b last:border-0 hover:bg-black/[0.02]" style={{ borderColor: dividerColor }}>
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 ${item.metal === 'ouro' ? 'bg-amber-500/15 text-amber-600' : light ? 'bg-slate-200 text-slate-600' : 'bg-white/10 text-zinc-300'}`}>
                                {item.metal}
                              </span>
                              <span className="text-[11px] truncate" style={{ color: textSecondary }}>{item.purityLabel} · {item.grams}g</span>
                              <span className="text-[10px] shrink-0" style={{ color: textFaint }}>{item.timestamp}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs font-bold font-mono" style={{ color: textPrimary }}>{formatEUR(item.total)}</span>
                              <button onClick={() => handleDelete(item.id)} className="transition-colors" style={{ color: textFaint }}>
                                <Trash2 className="h-3 w-3 hover:text-rose-500" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Debug toggle (non-destructive) */}
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => setShowDebug((v) => !v)}
                      className="text-[11px] px-3 py-1 rounded-lg bg-black/5 hover:bg-black/10 transition"
                    >
                      {showDebug ? 'Fechar debug' : 'Mostrar debug'}
                    </button>
                  </div>

                  {showDebug && (
                    <div className="mt-3 p-3 rounded-lg text-xs bg-black/5 overflow-auto max-h-48" style={{ color: textPrimary }}>
                      <div className="font-bold mb-1">liveSettings</div>
                      <pre className="text-[11px] leading-snug mb-2">{JSON.stringify(liveSettings, null, 2)}</pre>
                      <div className="font-bold mb-1">activeParams (current)</div>
                      <pre className="text-[11px] leading-snug">{JSON.stringify(activeParams, null, 2)}</pre>
                    </div>
                  )}

                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
