'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export function SplashScreen() {
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), 1600)
    const t2 = setTimeout(() => setVisible(false), 2200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black"
      style={{
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.6s ease-in-out',
        pointerEvents: fading ? 'none' : 'auto',
      }}
    >
      <div
        style={{
          opacity: fading ? 0 : 1,
          transform: fading ? 'scale(0.97)' : 'scale(1)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
        }}
      >
        <Image
          src="/logo-white.png"
          alt="DB Gold"
          width={90}
          height={90}
          priority
          draggable={false}
          style={{ width: 90, height: 'auto', opacity: 0.92 }}
        />
        <p
          style={{
            color: 'rgba(255,255,255,0.45)',
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
          }}
        >
          DB Gold
        </p>
      </div>
    </div>
  )
}
