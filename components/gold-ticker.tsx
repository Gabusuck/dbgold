'use client'

import { useTheme } from 'next-themes'
import { formatEUR, type GoldSettings } from '@/lib/gold'

export function GoldTicker({ settings }: { settings: GoldSettings }) {
  const { resolvedTheme } = useTheme()
  const light = resolvedTheme !== 'dark'

  return (
    <div className="flex justify-center px-4 pt-10 md:pt-12">
      <div
        className="inline-flex items-center gap-4 rounded-full px-5 py-2 text-xs md:text-sm backdrop-blur-md transition-all"
        style={{
          border: light ? '1px solid rgba(180,83,9,0.18)' : '1px solid rgba(245,158,11,0.2)',
          background: light ? 'rgba(237,232,220,0.85)' : 'rgba(20,20,20,0.6)',
          boxShadow: light ? '0 1px 6px rgba(0,0,0,0.06)' : '0 2px 12px rgba(0,0,0,0.4)',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span style={{ color: light ? '#8a7058' : '#71717a' }}>Ouro 24k</span>
          <span className="font-serif font-bold" style={{ color: light ? '#b45309' : '#fbbf24' }}>
            {formatEUR(settings.price_per_gram_24k)}/g
          </span>
        </div>

        <div className="h-4 w-px" style={{ background: light ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.12)' }} />

        <div className="flex items-center gap-2">
          <span style={{ color: light ? '#8a7058' : '#71717a' }}>Prata 999</span>
          <span className="font-serif font-bold" style={{ color: light ? '#475569' : '#cbd5e1' }}>
            {formatEUR(settings.price_per_gram_silver_999 ?? 1.00)}/g
          </span>
        </div>
      </div>
    </div>
  )
}
