import { SiteHeader } from '@/components/site-header'
import { HeroSection } from '@/components/hero-section'
import { PriceTicker } from '@/components/price-ticker'
import { HowItWorks } from '@/components/how-it-works'
import { PriceTable } from '@/components/price-table'
import { LivePricesProvider } from '@/components/live-prices'
import { WhatsappSection } from '@/components/whatsapp-section'
import { SiteFooter } from '@/components/site-footer'
import { Toaster } from '@/components/ui/sonner'
import { getSettings, getPriceHistory } from '@/app/actions'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [settings, history] = await Promise.all([
    getSettings(),
    getPriceHistory(),
  ])

  return (
    <div id="top" className="relative flex min-h-screen flex-col overflow-x-hidden bg-background">
      <SiteHeader />

      <main className="flex flex-1 flex-col">
        <LivePricesProvider initialSettings={settings} initialHistory={history}>
          <HeroSection settings={settings} priceHistory={history} />
          <PriceTicker settings={settings} priceHistory={history} />
          <HowItWorks />
          <PriceTable settings={settings} priceHistory={history} />
        </LivePricesProvider>
        <WhatsappSection />
      </main>
      <SiteFooter settings={settings} />
      <Toaster richColors position="top-center" />
    </div>
  )
}
