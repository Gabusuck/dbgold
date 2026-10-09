'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { GoldSettings } from '@/lib/gold'
import type { PriceHistoryEntry } from '@/app/actions'

type LivePrices = { settings: GoldSettings; history: PriceHistoryEntry[] }

const LivePricesContext = createContext<LivePrices | null>(null)

/**
 * Fonte unica de precos para toda a pagina: comeca com os valores do servidor e
 * atualiza de 15 em 15 segundos via /api/settings, para que o topo, a tabela e o
 * historico mostrem sempre o mesmo valor.
 */
export function LivePricesProvider({
  initialSettings,
  initialHistory,
  children,
}: {
  initialSettings: GoldSettings
  initialHistory: PriceHistoryEntry[]
  children: ReactNode
}) {
  const [state, setState] = useState<LivePrices>({ settings: initialSettings, history: initialHistory })

  useEffect(() => {
    let mounted = true
    async function refresh() {
      try {
        const res = await fetch('/api/settings', { cache: 'no-store' })
        if (!res.ok) return
        const json = await res.json()
        if (mounted && json?.ok && json.settings) {
          setState((prev) => ({
            settings: json.settings,
            history: Array.isArray(json.history) && json.history.length > 0 ? json.history : prev.history,
          }))
        }
      } catch { /* ignore */ }
    }
    refresh()
    const id = setInterval(refresh, 15000)
    return () => { mounted = false; clearInterval(id) }
  }, [])

  return <LivePricesContext.Provider value={state}>{children}</LivePricesContext.Provider>
}

/** Devolve os precos em tempo real; se nao houver provider, usa os valores recebidos por props. */
export function useLivePrices(fallbackSettings: GoldSettings, fallbackHistory: PriceHistoryEntry[] = []): LivePrices {
  return useContext(LivePricesContext) ?? { settings: fallbackSettings, history: fallbackHistory }
}
