import { SiteHeader } from '@/components/site-header'
import { HeroSection } from '@/components/hero-section'
import { PriceTable } from '@/components/price-table'
import { WhatsappSection } from '@/components/whatsapp-section'
import { SiteFooter } from '@/components/site-footer'
import { Toaster } from '@/components/ui/sonner'
import { getSettings, getPriceHistory } from '@/app/actions'
import { formatEUR, payPricePerGram } from '@/lib/gold'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [settings, history] = await Promise.all([
    getSettings(),
    getPriceHistory(),
  ])

  // Calculate prices for the most common gold purities in Portugal
  const price19k = payPricePerGram(settings.price_per_gram_24k, settings.discount_per_gram, 0.800)
  const price18k = payPricePerGram(settings.price_per_gram_24k, settings.discount_per_gram, 0.750)

  const tickerItems = [
    `✦ OURO PORTUGUÊS 19.2K: ${formatEUR(price19k)}/g`,
    `·`,
    `✦ OURO 18K: ${formatEUR(price18k)}/g`,
    `·`,
    `✦ OURO 24K: ${formatEUR(settings.price_per_gram_24k)}/g`,
    `·`,
    `◈ PRATA 999: ${formatEUR(settings.price_per_gram_silver_999 ?? 1)}/g`,
    `·`,
    `✦ AVALIAÇÃO RIGOROSA E PRESENCIAL`,
    `·`,
    `✦ PAGAMENTO NO PRÓPRIO DIA`,
    `·`,
  ]

  return (
    <div className="site-bg flex min-h-screen flex-col">

      {/* ── Ticker bar — pinned at very top, above everything ── */}
      <div className="ticker-wrap py-2">
        <div className="ticker-inner anim-ticker gap-12 text-[11px] font-mono tracking-wider">
          {[0, 1].map((repeat) => (
            <span key={repeat} className="inline-flex gap-12 mr-12">
              {tickerItems.map((item, i) => (
                <span
                  key={i}
                  className={
                    item.startsWith('✦') ? 'text-amber-600 dark:text-amber-400 font-bold' :
                    item.startsWith('◈') ? 'text-slate-600 dark:text-zinc-300 font-bold' :
                    item === '·' ? 'text-stone-400 dark:text-zinc-700 font-bold' :
                    'text-stone-600 dark:text-zinc-500 font-semibold'
                  }
                >
                  {item}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <SiteHeader />

      <main className="flex-1 flex flex-col">
        <HeroSection settings={settings} />
        <PriceTable settings={settings} priceHistory={history} />
        <WhatsappSection />
      </main>
      <SiteFooter settings={settings} />
      <Toaster richColors position="top-center" />
    </div>
  )
}
