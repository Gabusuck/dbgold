'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { Lock, MapPin, Phone, Mail, Clock, ArrowUpRight } from 'lucide-react'
import { AdminDialog } from '@/components/admin-dialog'
import type { GoldSettings } from '@/lib/gold'

export function SiteFooter({ settings }: { settings: GoldSettings }) {
  const [adminOpen, setAdminOpen] = useState(false)
  const { resolvedTheme } = useTheme()

  const light = resolvedTheme !== 'dark'

  const bg = light ? '#ede8dc' : '#000000'
  const topGlow = light
    ? 'linear-gradient(90deg, transparent 0%, rgba(180,83,9,0.25) 50%, transparent 100%)'
    : 'linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.4) 50%, transparent 100%)'
  const textPrimary = light ? '#1a1208' : '#e4e4e7'
  const textMuted = light ? '#8a7058' : '#52525b'
  const textFaint = light ? '#b0987c' : '#3f3f46'
  const divider = light ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.05)'
  const badgeBg = light ? 'rgba(180,83,9,0.07)' : 'rgba(251,191,36,0.07)'
  const badgeBorder = light ? 'rgba(180,83,9,0.15)' : 'rgba(251,191,36,0.12)'
  const badgeText = light ? '#b45309' : 'rgba(245,158,11,0.7)'
  const linkHover = light ? 'hover:text-stone-900' : 'hover:text-white'
  const lockHover = light ? 'hover:text-stone-600 hover:bg-black/5' : 'hover:text-zinc-500 hover:bg-white/5'
  const logoSrc = light ? '/logo-black.png' : '/logo-white.png'

  return (
    <footer
      id="contactos"
      className="relative overflow-hidden scroll-mt-20"
      style={{ background: bg }}
    >
      {/* Top divider line glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-[70%]"
        style={{ background: topGlow }}
      />

      {/* Ambient glow blobs — dark only */}
      {!light && (
        <>
          <div
            className="pointer-events-none absolute bottom-0 left-0 h-56 w-56 rounded-full opacity-[0.04] blur-[80px]"
            style={{ background: 'radial-gradient(circle, #fbbf24 0%, transparent 70%)' }}
          />
          <div
            className="pointer-events-none absolute top-0 right-0 h-48 w-48 rounded-full opacity-[0.03] blur-[60px]"
            style={{ background: 'radial-gradient(circle, #d97706 0%, transparent 70%)' }}
          />
        </>
      )}

      <div className="relative z-10 mx-auto max-w-6xl px-5 md:px-8">

        {/* Main footer grid */}
        <div className="grid gap-12 py-16 md:grid-cols-12">

          {/* Brand column */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <Image
              src={logoSrc}
              alt="DB Gold Logo"
              width={160}
              height={44}
              style={{ width: 'auto' }}
              className="h-10 object-contain self-start opacity-90 hover:opacity-100 transition-opacity"
            />
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: textMuted }}>
              Compramos ouro e prata com avaliação técnica profissional, cotações oficiais e pagamento imediato.
            </p>
            {/* Social trust badges */}
            <div className="flex flex-wrap gap-2">
              {['Avaliação Gratuita', 'Pagamento Imediato', 'Sem Compromisso'].map((b) => (
                <span
                  key={b}
                  className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                  style={{ background: badgeBg, border: `1px solid ${badgeBorder}`, color: badgeText }}
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Nav links */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: textFaint }}>Navegação</span>
            {[
              { href: '#simulador', label: 'Simulador' },
              { href: '#precos', label: 'Cotações' },
              { href: '#contactos', label: 'Contactos' },
            ].map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={`group flex items-center gap-1 text-sm transition-colors w-fit ${linkHover}`}
                style={{ color: textMuted }}
              >
                {l.label}
                <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
              </a>
            ))}
          </div>

          {/* Contacts */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: textFaint }}>Contactos</span>
            <a
              href="tel:+351914967435"
              className={`group flex items-center gap-2 text-sm transition-colors ${linkHover}`}
              style={{ color: textMuted }}
            >
              <Phone className="h-3.5 w-3.5 flex-shrink-0" style={{ color: light ? '#b45309' : 'rgba(245,158,11,0.6)' }} />
              <span>914 967 435</span>
            </a>
            <a
              href="tel:+351934178363"
              className={`group flex items-center gap-2 text-sm transition-colors ${linkHover}`}
              style={{ color: textMuted }}
            >
              <Phone className="h-3.5 w-3.5 flex-shrink-0" style={{ color: light ? '#b45309' : 'rgba(245,158,11,0.6)' }} />
              <span>934 178 363</span>
            </a>
            <a
              href="mailto:dbportugalgeral@gmail.com"
              className={`group flex items-center gap-2 text-sm transition-colors ${linkHover}`}
              style={{ color: textMuted }}
            >
              <Mail className="h-3.5 w-3.5 flex-shrink-0" style={{ color: light ? '#b45309' : 'rgba(245,158,11,0.6)' }} />
              <span>dbportugalgeral@gmail.com</span>
            </a>
            <span className="flex items-start gap-2 text-sm" style={{ color: textMuted }}>
              <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" style={{ color: light ? '#b45309' : 'rgba(245,158,11,0.6)' }} />
              <span>Rua do Ouro, 100<br />Lisboa, Portugal</span>
            </span>
          </div>

          {/* Hours */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: textFaint }}>Horário</span>
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" style={{ color: light ? '#b45309' : 'rgba(245,158,11,0.6)' }} />
                <div className="text-sm" style={{ color: textMuted }}>
                  <div>Seg — Sex</div>
                  <div className="font-semibold" style={{ color: light ? '#6a5438' : '#a1a1aa' }}>09h00 — 19h00</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" style={{ color: light ? '#b45309' : 'rgba(245,158,11,0.6)' }} />
                <div className="text-sm" style={{ color: textMuted }}>
                  <div>Sábado</div>
                  <div className="font-semibold" style={{ color: light ? '#6a5438' : '#a1a1aa' }}>09h00 — 13h00</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div
          className="flex items-center justify-between py-5 border-t"
          style={{ borderColor: divider }}
        >
          <p className="text-[11px] uppercase tracking-widest" style={{ color: textFaint }}>
            © {new Date().getFullYear()} DB Gold. Todos os direitos reservados.
          </p>
          <button
            onClick={() => setAdminOpen(true)}
            aria-label="Área reservada"
            title="Área reservada"
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all ${lockHover}`}
            style={{ color: light ? '#c4b49c' : '#27272a' }}
          >
            <Lock className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>

      <AdminDialog open={adminOpen} onOpenChange={setAdminOpen} settings={settings} />
    </footer>
  )
}
