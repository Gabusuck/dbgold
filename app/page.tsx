import { SiteHeader } from '@/components/site-header'
import { HeroSection } from '@/components/hero-section'
import { PriceTable } from '@/components/price-table'
import { WhatsappSection } from '@/components/whatsapp-section'
import { SiteFooter } from '@/components/site-footer'
import { BrandHero } from '@/components/brand-hero'
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
    <div className="site-bg flex min-h-screen flex-col relative">
      {/* ── Fixed Ambient Gold Lighting Layer (Spans full page smoothly) ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Subtle top-center gold aura */}
        <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full bg-amber-500/8 dark:bg-amber-500/8 blur-[160px]" />
        {/* Subtle middle ambient gold glow */}
        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-[1200px] h-[700px] rounded-full bg-amber-600/5 dark:bg-amber-500/5 blur-[200px]" />
      </div>

      <SiteHeader />

      <main className="flex-1 flex flex-col pt-20">
        <BrandHero />
        <HeroSection settings={settings} priceHistory={history} />
        <PriceTable settings={settings} priceHistory={history} />
        <WhatsappSection />
      </main>
      <SiteFooter settings={settings} />
      <Toaster richColors position="top-center" />
    </div>
  )
}
