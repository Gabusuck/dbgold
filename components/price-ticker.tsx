'use client'

import { KARATS, SILVER_PURITIES, formatEUR, payPricePerGram, type GoldSettings } from '@/lib/gold'
import type { PriceHistoryEntry } from '@/app/actions'
import { useLivePrices } from './live-prices'

/** Faixa infinita com o valor pago por grama em cada quilate / pureza. */
export function PriceTicker({ settings, priceHistory }: { settings: GoldSettings; priceHistory: PriceHistoryEntry[] }) {
  const { settings: s } = useLivePrices(settings, priceHistory)

  const hasPrices = s.price_per_gram_24k > 0

  const items: { label: string; value: string; metal: 'gold' | 'silver' | 'info' }[] = hasPrices
    ? [
        ...KARATS.map((k) => ({
          label: k.karat === 19.2 ? 'Ouro 19.2K (Português)' : `Ouro ${k.karat}K`,
          value: `${formatEUR(payPricePerGram(s.price_per_gram_24k, s.discount_per_gram, k.purity))}/g`,
          metal: 'gold' as const,
        })),
        ...SILVER_PURITIES.map((p) => ({
          label: `Prata ${p.value}‰`,
          value: `${formatEUR(payPricePerGram(s.price_per_gram_silver_999 ?? 1, s.discount_per_gram_silver ?? 0.15, p.purity))}/g`,
          metal: 'silver' as const,
        })),
        { label: 'Pagamento no próprio dia', value: '', metal: 'info' as const },
        { label: 'Avaliação rigorosa e presencial', value: '', metal: 'info' as const },
      ]
    : [
        { label: 'Cotações oficiais LBMA', value: '', metal: 'info' },
        { label: 'Atualização diária (Fixing de Londres: 10h35, 12h05 e 15h05)', value: '', metal: 'info' },
        { label: 'Avaliação rigorosa e presencial', value: '', metal: 'info' },
        { label: 'Pagamento no próprio dia', value: '', metal: 'info' },
      ]

  const row = (dup: boolean) =>
    items.map((it, i) => (
      <span key={`${dup ? 'b' : 'a'}${i}`} aria-hidden={dup} className="flex shrink-0 items-center gap-3 px-7">
        <span
          className={
            it.metal === 'gold'
              ? 'h-2 w-2 rounded-full bg-gradient-to-br from-yellow-300 to-amber-600'
              : it.metal === 'silver'
                ? 'h-2 w-2 rounded-full bg-gradient-to-br from-slate-200 to-slate-500'
                : 'h-1.5 w-1.5 rotate-45 bg-amber-500'
          }
        />
        <span className="text-muted-foreground">{it.label}</span>
        {it.value && <span className="num font-semibold text-foreground">{it.value}</span>}
      </span>
    ))

  return (
    <div className="marquee overflow-hidden border-y border-border bg-surface py-4 text-sm">
      <div className="marquee-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  )
}
