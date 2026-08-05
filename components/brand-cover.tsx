'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useTheme } from 'next-themes'

export function BrandCover() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const light = !mounted || resolvedTheme !== 'dark'

  return (
    <section
      className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden"
      style={{
        background: light
          ? 'linear-gradient(160deg, #fdf8f0 0%, #f5ede0 100%)'
          : 'linear-gradient(160deg, #080600 0%, #110e00 100%)',
      }}
    >
      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: light
            ? 'radial-gradient(circle, rgba(120,80,40,0.15) 1px, transparent 1px)'
            : 'radial-gradient(circle, rgba(251,191,36,0.12) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 0%, transparent 100%)',
        }}
      />

      {/* Glow blob */}
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 500, height: 500,
          background: light
            ? 'radial-gradient(circle, rgba(180,83,9,0.08) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(251,191,36,0.07) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-10 text-center px-6">

        {/* Logo */}
        <div
          style={{
            filter: light
              ? 'none'
              : 'brightness(0) invert(1) drop-shadow(0 0 40px rgba(251,191,36,0.15))',
          }}
        >
          <Image
            src={light ? '/logo-black.png' : '/logo-white.png'}
            alt="DB Gold"
            width={120}
            height={120}
            priority
            draggable={false}
            style={{ width: 'clamp(80px, 14vw, 120px)', height: 'auto' }}
          />
        </div>

        {/* Divider */}
        <div
          className="h-px w-16"
          style={{
            background: light
              ? 'linear-gradient(90deg, transparent, rgba(180,83,9,0.4), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(251,191,36,0.4), transparent)',
          }}
        />

        {/* Text */}
        <div className="flex flex-col items-center gap-3">
          <h2
            className="font-bold tracking-[0.08em]"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              color: light ? '#1a1208' : '#ffffff',
              letterSpacing: '0.06em',
            }}
          >
            DB Gold
          </h2>
          <p
            className="text-sm md:text-base font-light tracking-[0.18em] uppercase"
            style={{ color: light ? '#9a7a58' : 'rgba(255,255,255,0.4)' }}
          >
            Compramos Ouro &amp; Prata
          </p>
          <p
            className="text-xs tracking-[0.22em] uppercase"
            style={{ color: light ? '#b0987c' : 'rgba(251,191,36,0.35)' }}
          >
            Porto, Portugal
          </p>
        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#simulador"
        className="absolute bottom-10 flex flex-col items-center gap-2 group"
        aria-label="Ver cotações"
      >
        <span
          className="text-[9px] uppercase tracking-[0.3em] font-semibold"
          style={{ color: light ? 'rgba(120,80,40,0.4)' : 'rgba(255,255,255,0.2)' }}
        >
          Explorar
        </span>
        <ChevronDown
          className="h-4 w-4 animate-bounce"
          style={{ color: light ? 'rgba(180,83,9,0.4)' : 'rgba(251,191,36,0.35)' }}
        />
      </a>
    </section>
  )
}
