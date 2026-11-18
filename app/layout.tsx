import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Instrument_Serif, Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import './globals.css'

const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-serif-display',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'DB Gold — Compra e Simulação de Venda de Ouro',
  description:
    'DB Gold compra o seu ouro ao melhor preço. Simule agora quanto vale o seu ouro por quilate (24k, 22k, 18k, 14k, 9k) com valores atualizados diariamente.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#fafaf7',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt" className={`${serif.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        {/* Ptengine Tag */}
        <script src="https://js.ptengine.com/4378uf5z.js" defer />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </ThemeProvider>
      </body>
    </html>
  )
}
