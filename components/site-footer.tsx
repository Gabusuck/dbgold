'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { Lock, MapPin, Phone, Mail, Clock } from 'lucide-react'
import { AdminDialog } from '@/components/admin-dialog'
import type { GoldSettings } from '@/lib/gold'

const nav = [
  { href: '#simulador', label: 'Simulador' },
  { href: '#precos', label: 'Cotações' },
  { href: '#contacto-directo', label: 'WhatsApp' },
]

export function SiteFooter({ settings }: { settings: GoldSettings }) {
  const [adminOpen, setAdminOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()
  useEffect(() => setMounted(true), [])

  const light = !mounted || resolvedTheme !== 'dark'
  const logoSrc = light ? '/logo-black.png' : '/logo-white.png'

  return (
    <footer id="contactos" className="scroll-mt-24 border-t border-border">
      <div className="container-page">
        <div className="grid gap-12 py-16 md:grid-cols-12">

          {/* Brand column */}
          <div className="flex flex-col gap-5 md:col-span-4">
            <Image
              src={logoSrc}
              alt="DB Gold Logo"
              width={160}
              height={44}
              style={{ width: 'auto' }}
              className="h-9 self-start object-contain"
            />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Compramos ouro e prata com avaliação técnica profissional, cotações oficiais e pagamento imediato.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Avaliação Gratuita', 'Pagamento Imediato', 'Sem Compromisso'].map((b) => (
                <span
                  key={b}
                  className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Nav links */}
          <div className="flex flex-col gap-3 md:col-span-2 md:col-start-6">
            <span className="text-sm font-semibold text-foreground">Navegação</span>
            {nav.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="w-fit text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Contacts */}
          <div className="flex flex-col gap-3 md:col-span-3">
            <span className="text-sm font-semibold text-foreground">Contactos</span>
            <a href="tel:+351914967435" className="flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
              <Phone className="h-4 w-4 shrink-0 text-gold" />
              <span className="num">914 967 435</span>
            </a>
            <a href="tel:+351934178363" className="flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
              <Phone className="h-4 w-4 shrink-0 text-gold" />
              <span className="num">934 178 363</span>
            </a>
            <a href="mailto:dbportugalgeral@gmail.com" className="flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
              <Mail className="h-4 w-4 shrink-0 text-gold" />
              <span className="break-all">dbportugalgeral@gmail.com</span>
            </a>
            <span className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0 text-gold" />
              Viseu, Portugal
            </span>
          </div>

          {/* Hours */}
          <div className="flex flex-col gap-3 md:col-span-2">
            <span className="text-sm font-semibold text-foreground">Horário</span>
            <div className="flex items-start gap-2.5 text-sm">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <div className="flex flex-col gap-2">
                <div>
                  <div className="text-muted-foreground">Seg — Sex</div>
                  <div className="num font-medium text-foreground">09h00 — 19h00</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Sábado</div>
                  <div className="num font-medium text-foreground">09h00 — 13h00</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between gap-4 border-t border-border py-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} DB Gold. Todos os direitos reservados.
          </p>
          <button
            onClick={() => setAdminOpen(true)}
            aria-label="Área reservada"
            title="Área reservada"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:bg-muted hover:text-foreground"
          >
            <Lock className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <AdminDialog open={adminOpen} onOpenChange={setAdminOpen} settings={settings} />
    </footer>
  )
}
