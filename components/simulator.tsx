'use client'

import { useMemo, useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { 
  KARATS, 
  SILVER_PURITIES, 
  formatEUR, 
  officialPricePerGram, 
  payPricePerGram, 
  type GoldSettings 
} from '@/lib/gold'
import { Trash2, History, Scale, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import {
  clearSimulations,
  deleteSimulation,
  loadSavedSimulations,
  saveSimulation,
  type SimulationEntry,
} from '@/app/actions'

type HistoryItem = SimulationEntry

export function Simulator({ settings }: { settings: GoldSettings }) {
  const [metalType, setMetalType] = useState<'ouro' | 'prata'>('ouro')
  const [karatValue, setKaratValue] = useState('18')
  const [silverValue, setSilverValue] = useState('925')
  const [grams, setGrams] = useState('10')
  const [history, setHistory] = useState<HistoryItem[]>([])

  // Load history from Supabase first, then local fallback
  useEffect(() => {
    void (async () => {
      try {
        const saved = await loadSavedSimulations()
        if (saved.length > 0) {
          setHistory(saved)
          localStorage.setItem('dbgold_simulations', JSON.stringify(saved))
          return
        }

        const stored = localStorage.getItem('dbgold_simulations')
        if (stored) {
          setHistory(JSON.parse(stored))
        }
      } catch (e) {
        console.error('Failed to load simulations history:', e)
      }
    })()
  }, [])

  // Find active purity options
  const selectedGold = useMemo(() => {
    return KARATS.find((k) => String(k.karat) === karatValue) ?? KARATS[2]
  }, [karatValue])

  const selectedSilver = useMemo(() => {
    return SILVER_PURITIES.find((s) => s.value === silverValue) ?? SILVER_PURITIES[1]
  }, [silverValue])

  const gramsNum = useMemo(() => {
    const n = Number.parseFloat(grams.replace(',', '.'))
    return Number.isFinite(n) && n > 0 ? n : 0
  }, [grams])

  // Calculation parameters based on active metal
  const activeParams = useMemo(() => {
    if (metalType === 'ouro') {
      const purity = selectedGold.purity
      const refPrice = settings.price_per_gram_24k
      const discount = settings.discount_per_gram
      const officialG = officialPricePerGram(refPrice, purity)
      const payG = payPricePerGram(refPrice, discount, purity)
      return {
        purityLabel: `${selectedGold.karat}k`,
        officialPerGram: officialG,
        payPerGram: payG,
        discountPerGram: discount,
        total: payG * gramsNum,
      }
    } else {
      const purity = selectedSilver.purity
      const refPrice = settings.price_per_gram_silver_999 ?? 1.00
      const discount = settings.discount_per_gram_silver ?? 0.15
      const officialG = officialPricePerGram(refPrice, purity)
      const payG = payPricePerGram(refPrice, discount, purity)
      return {
        purityLabel: `${selectedSilver.value}‰`,
        officialPerGram: officialG,
        payPerGram: payG,
        discountPerGram: discount,
        total: payG * gramsNum,
      }
    }
  }, [metalType, selectedGold, selectedSilver, gramsNum, settings])

  // Save current simulation to history
  const handleSaveSimulation = async () => {
    if (gramsNum <= 0) {
      toast.error('Insira um peso válido para simular e guardar.')
      return
    }

    const newItem: HistoryItem = {
      id: Math.random().toString(36).substring(2, 11),
      metal: metalType,
      purityLabel: activeParams.purityLabel,
      grams: gramsNum,
      payPerGram: activeParams.payPerGram,
      total: activeParams.total,
      timestamp: new Date().toLocaleTimeString('pt-PT', {
        hour: '2-digit',
        minute: '2-digit',
      }) + ' - ' + new Date().toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
      }),
    }

    const updated = await saveSimulation(newItem)
    setHistory(updated)
    localStorage.setItem('dbgold_simulations', JSON.stringify(updated))
    toast.success('Simulação guardada no histórico!')
  }

  // Delete history entry
  const handleDeleteHistory = async (id: string) => {
    const updated = await deleteSimulation(id)
    setHistory(updated)
    localStorage.setItem('dbgold_simulations', JSON.stringify(updated))
    toast.success('Simulação removida do histórico.')
  }

  // Clear all history
  const handleClearHistory = async () => {
    const updated = await clearSimulations()
    setHistory(updated)
    localStorage.removeItem('dbgold_simulations')
    toast.success('Todo o histórico de simulações foi limpo.')
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Minimal Simulator Container */}
      <div className="grid gap-6 md:grid-cols-12 bg-zinc-950/40 border border-zinc-900/60 p-6 md:p-8 rounded-2xl">
        
        {/* Inputs Section */}
        <div className="md:col-span-7 flex flex-col gap-6">
          
          {/* Step 1: Metal Selector */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">1. Metal Precioso</span>
            <div className="flex gap-4 border-b border-zinc-900 pb-2">
              <button
                type="button"
                onClick={() => setMetalType('ouro')}
                className={`text-sm font-semibold uppercase tracking-wider pb-1.5 border-b-2 transition-all ${
                  metalType === 'ouro'
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Ouro
              </button>
              <button
                type="button"
                onClick={() => setMetalType('prata')}
                className={`text-sm font-semibold uppercase tracking-wider pb-1.5 border-b-2 transition-all ${
                  metalType === 'prata'
                    ? 'border-zinc-400 text-zinc-300'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Prata
              </button>
            </div>
          </div>

          {/* Step 2: Quality Selector */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="karat-select" className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              2. Qualidade
            </Label>
            {metalType === 'ouro' ? (
              <Select value={karatValue} onValueChange={setKaratValue}>
                <SelectTrigger id="karat-select" className="w-full h-10 rounded-xl border-zinc-900 bg-zinc-900/30 text-xs text-zinc-300 focus:ring-0">
                  <SelectValue placeholder="Selecione o quilate" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-900 text-zinc-300">
                  {KARATS.map((k) => (
                    <SelectItem key={k.karat} value={String(k.karat)} className="text-xs focus:bg-zinc-900 focus:text-white">
                      Ouro {k.karat}K ({Math.round(k.purity * 1000)}‰)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Select value={silverValue} onValueChange={setSilverValue}>
                <SelectTrigger id="karat-select" className="w-full h-10 rounded-xl border-zinc-900 bg-zinc-900/30 text-xs text-zinc-300 focus:ring-0">
                  <SelectValue placeholder="Selecione a pureza" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-900 text-zinc-300">
                  {SILVER_PURITIES.map((s) => (
                    <SelectItem key={s.value} value={s.value} className="text-xs focus:bg-zinc-900 focus:text-white">
                      Prata {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Step 3: Weight Input */}
          <div className="flex flex-col gap-3">
            <Label htmlFor="grams-input" className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              3. Peso Estimado
            </Label>
            <div className="flex gap-4 items-center">
              <div className="relative">
                <Input
                  id="grams-input"
                  type="number"
                  inputMode="decimal"
                  min="0.1"
                  max="1000"
                  step="0.1"
                  value={grams}
                  onChange={(e) => setGrams(e.target.value)}
                  className="w-24 h-10 text-center font-mono font-bold text-sm rounded-xl border-zinc-900 bg-zinc-900/30 text-white pr-4"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-500 pointer-events-none">g</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="150"
                step="0.5"
                value={gramsNum || 0}
                onChange={(e) => setGrams(e.target.value)}
                className="flex-1 h-1 appearance-none cursor-pointer bg-zinc-900 accent-amber-500 rounded-lg"
              />
            </div>
          </div>

          {/* Register/Save Button */}
          <Button
            onClick={handleSaveSimulation}
            disabled={gramsNum <= 0}
            variant="outline"
            className="mt-2 rounded-xl h-10 border-zinc-900 hover:border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/50 hover:text-white text-[11px] font-semibold uppercase tracking-wider text-zinc-400 transition-all gap-1.5"
          >
            Registar Simulação
          </Button>
        </div>

        {/* Pricing Result Column */}
        <div className="md:col-span-5 flex flex-col justify-between gap-6 md:border-l md:border-zinc-900 md:pl-8">
          
          {/* Main Price Output */}
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Valor estimado pago
            </span>
            <span className={`font-sans text-4xl font-bold tracking-tight transition-colors duration-300 md:text-5xl mt-1.5 ${
              metalType === 'ouro' ? 'text-amber-400' : 'text-zinc-300'
            }`}>
              {formatEUR(activeParams.total)}
            </span>
          </div>

          {/* Micro Details List */}
          <div className="flex flex-col gap-2.5 text-xs text-zinc-400 py-4 border-t border-zinc-900">
            <div className="flex justify-between">
              <span>Cotação líquido por grama:</span>
              <span className="font-semibold text-white">{formatEUR(activeParams.payPerGram)}/g</span>
            </div>
            <div className="flex justify-between">
              <span>Peso indicado:</span>
              <span className="font-semibold text-white">{gramsNum.toLocaleString('pt-PT')} g</span>
            </div>
            <div className="flex justify-between">
              <span>Qualidade:</span>
              <span className="font-semibold text-white">{activeParams.purityLabel}</span>
            </div>
            <div className="flex justify-between border-t border-zinc-900 pt-2 font-bold text-white">
              <span>Fórmula:</span>
              <span className="font-mono text-[11px]">{gramsNum.toLocaleString('pt-PT')}g × {formatEUR(activeParams.payPerGram)}/g</span>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="text-[10px] text-zinc-500 leading-relaxed">
            Cálculo estimativo com base nas taxas atuais. Avaliação física realizada presencialmente nas nossas instalações.
          </div>

        </div>
      </div>

      {/* --- Minimalist History List --- */}
      <div className="w-full bg-zinc-950/20 border border-zinc-900/60 p-4 rounded-xl" id="historico">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-3">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Histórico das últimas simulações
          </h3>
          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-[9px] font-bold uppercase tracking-wider text-rose-400/80 hover:text-rose-400 transition-colors"
            >
              Limpar
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <p className="text-[11px] text-zinc-600 text-center py-2">
            Não existem simulações guardadas.
          </p>
        ) : (
          <div className="flex flex-col">
            {history.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-zinc-900/60 text-[11px] text-zinc-400 hover:text-white transition-colors">
                <div className="flex items-center gap-2">
                  <span className={`text-[8px] font-bold uppercase tracking-wider px-1 py-0.2 rounded ${
                    item.metal === 'ouro' ? 'bg-amber-500/10 text-amber-400' : 'bg-zinc-800 text-zinc-300'
                  }`}>
                    {item.metal}
                  </span>
                  <span>
                    Ouro {item.purityLabel} • <span className="font-mono">{item.grams} g</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white font-mono">{formatEUR(item.total)}</span>
                  <button
                    onClick={() => handleDeleteHistory(item.id)}
                    className="text-zinc-600 hover:text-rose-400 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
