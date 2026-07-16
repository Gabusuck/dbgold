'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { Menu, X, Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '#simulador', label: 'Simulador' },
  { href: '#precos', label: 'Preços' },
  { href: '#contactos', label: 'Contactos' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
    // Force scroll to top on load/refresh so the ticker is always visible
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    window.scrollTo(0, 0)

    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // resolvedTheme default is light, which matches SSR defaultTheme="light"
  const isLight = resolvedTheme !== 'dark'

  return (
    <header
      className={cn(
        'sticky top-3 mt-0 z-50 mx-auto w-[calc(100%-2rem)] max-w-6xl rounded-2xl transition-all duration-500 md:top-4 md:mt-1 md:w-[calc(100%-4rem)]',
        scrolled
          ? isLight
            ? 'shadow-[0_2px_12px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.05)]'
            : 'shadow-[0_8px_40px_rgba(0,0,0,0.8),0_0_0_1px_rgba(251,191,36,0.12)]'
          : isLight
            ? 'shadow-[0_0_0_1px_rgba(0,0,0,0.04)]'
            : 'shadow-[0_0_0_1px_rgba(255,255,255,0.06)]'
      )}
      style={{
        background: isLight ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-center justify-between px-5 py-3 md:px-7 md:py-3.5">
        {/* Logo */}
        <a href="#top" className="flex items-center gap-2 transition-all duration-300 hover:opacity-80 hover:scale-[0.98]">
          <Image
            src={isLight ? '/logo-black.png' : '/logo-white.png'}
            alt="DB Gold Logo"
            width={160}
            height={44}
            priority
            style={{ width: 'auto' }}
            className="h-9 md:h-11 object-contain"
          />
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                'relative text-sm font-semibold transition-colors group',
                isLight ? 'text-stone-700 hover:text-stone-950' : 'text-zinc-400 hover:text-white'
              )}
            >
              {link.label}
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-amber-600 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Right side: theme toggle + CTA */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(isLight ? 'dark' : 'light')}
            aria-label={isLight ? 'Mudar para tema escuro' : 'Mudar para tema claro'}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300',
              isLight ? 'text-stone-600 hover:text-stone-900 hover:bg-black/5' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
            )}
          >
            {mounted ? (
              isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />
            ) : (
              <div className="h-4 w-4" />
            )}
          </button>

          {/* CTA */}
          <a
            href="#contacto-directo"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-amber-950 transition-all duration-300 hover:bg-amber-400 hover:shadow-[0_0_24px_rgba(251,191,36,0.4)] active:scale-95"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-900/60 animate-pulse" />
            Contactar
          </a>
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setTheme(isLight ? 'dark' : 'light')}
            aria-label={isLight ? 'Mudar para tema escuro' : 'Mudar para tema claro'}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl transition-colors',
              isLight ? 'text-stone-600 hover:bg-black/5' : 'text-zinc-500 hover:bg-white/5'
            )}
            style={{ background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.06)' }}
          >
            {mounted ? (
              isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />
            ) : (
              <div className="h-4 w-4" />
            )}
          </button>
          <button
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl transition-colors md:hidden',
              isLight ? 'text-stone-700 hover:bg-black/5' : 'text-zinc-400 hover:text-white'
            )}
            style={{ background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.06)' }}
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-black/5 px-5 py-5 md:hidden" style={{ borderColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }}>
          <div className="flex flex-col gap-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn('text-sm font-semibold transition-colors', isLight ? 'text-stone-700 hover:text-stone-950' : 'text-zinc-400 hover:text-white')}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contacto-directo"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-sm font-bold text-amber-950 hover:bg-amber-400 transition-all"
            >
              Contactar
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
