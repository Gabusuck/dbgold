'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { TrendingUp, ShieldCheck, Scale, Award } from 'lucide-react'
import { ScrollReveal } from './scroll-reveal'

export function BrandHero() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => setMounted(true), [])

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e
    const { innerWidth, innerHeight } = window
    const x = (clientX / innerWidth - 0.5) * 40
    const y = (clientY / innerHeight - 0.5) * -40
    setMousePos({ x, y })
  }

  const light = !mounted || resolvedTheme !== 'dark'

  return (
    <section 
      className="relative w-full min-h-[calc(100dvh-5rem)] flex items-center justify-center overflow-hidden"
      onMouseMove={handleMouseMove}
      style={{
        paddingTop: '2rem',
        paddingBottom: '0'
      }}
    >

      {/* Main Content Container (Fills the page left-to-right) */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-8 py-8">
        
        {/* Left Side: Massive Typography */}
        <div className="flex-1 w-full flex flex-col items-start justify-center z-20" style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)`, transition: 'transform 0.15s ease-out' }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-gold mb-8 shadow-xl shadow-amber-500/10 anim-fade-up anim-delay-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500"></span>
            </span>
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-amber-600">O Mercado do Ouro</span>
          </div>
          
          <h1 className="text-[13vw] lg:text-[7.5rem] font-black leading-[0.85] tracking-tighter mb-8 anim-fade-up anim-delay-2" style={{ color: light ? '#1a1208' : '#ffffff' }}>
            VALOR<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600">
              ABSOLUTO
            </span><br />
            GARANTIDO
          </h1>
          
          <p className="text-lg md:text-2xl font-light max-w-xl leading-relaxed mb-10 anim-fade-up anim-delay-3" style={{ color: light ? '#6a5438' : '#a1a1aa' }}>
            Transformamos os seus metais preciosos em capital imediato, com a avaliação mais rigorosa e transparente do mercado.
          </p>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-6">
            <a href="#simulador" className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 font-black uppercase tracking-wider text-sm shadow-[0_10px_40px_rgba(245,158,11,0.4)] hover:scale-105 hover:shadow-[0_15px_50px_rgba(245,158,11,0.6)] transition-all duration-300 anim-fade-up anim-delay-4">
              Simular Valor Agora
            </a>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 bg-black/80 flex items-center justify-center text-amber-500 shadow-lg backdrop-blur-md hover:scale-110 transition-transform anim-icon-pop" style={{ animationDelay: '650ms' }}><ShieldCheck className="w-5 h-5" /></div>
              <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 bg-black/80 flex items-center justify-center text-amber-500 shadow-lg backdrop-blur-md hover:scale-110 transition-transform anim-icon-pop" style={{ animationDelay: '900ms' }}><Scale className="w-5 h-5" /></div>
              <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 bg-black/80 flex items-center justify-center text-amber-500 shadow-lg backdrop-blur-md hover:scale-110 transition-transform anim-icon-pop" style={{ animationDelay: '1150ms' }}><Award className="w-5 h-5" /></div>
            </div>
          </div>
        </div>

        {/* Right Side: Massive Logo & Floating Elements — desktop only */}
        <div className="hidden lg:flex flex-1 w-full relative min-h-[80vh] items-center justify-end mt-0 anim-scale-in anim-delay-3">
          
          {/* Floating Cards (Dynamic Fillers) */}
          <div 
            className="absolute top-[5%] lg:top-[15%] left-0 lg:-left-[10%] z-30 glass-gold px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border border-amber-500/30"
            style={{ 
              transform: `translate(${mousePos.x * -0.8}px, ${mousePos.y * -0.8}px) rotate(-3deg)`,
              transition: 'transform 0.15s ease-out'
            }}
          >
            <div className="text-[10px] font-black uppercase tracking-widest text-amber-600/80 mb-1">Cotação Ouro 24K</div>
            <div className="text-2xl md:text-3xl font-mono font-bold text-amber-500 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-emerald-500" /> Oficial
            </div>
          </div>

          <div 
            className="absolute bottom-[10%] right-[0%] lg:right-[5%] z-30 glass px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border"
            style={{ 
              transform: `translate(${mousePos.x * -1.2}px, ${mousePos.y * -1.2}px) rotate(4deg)`, 
              borderColor: light ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
              transition: 'transform 0.15s ease-out'
            }}
          >
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Pagamento</div>
            <div className="text-xl md:text-2xl font-black" style={{ color: light ? '#1a1208' : '#ffffff' }}>IMEDIATO</div>
          </div>

          {/* Core Logo */}
          <div 
            className="relative w-full max-w-[400px] lg:max-w-[700px] aspect-square flex items-center justify-center lg:translate-x-[10%]"
            style={{
              transform: `perspective(1000px) rotateY(${mousePos.x}deg) rotateX(${mousePos.y}deg)`,
              transition: 'transform 0.15s ease-out'
            }}
          >
            {/* Super intense backdrop glow */}
            <div className="absolute inset-0 bg-amber-500/20 blur-[100px] rounded-full" />
            
            <Image
              src={light ? '/logo-black.png' : '/logo-white.png'}
              alt="DB Gold Logo"
              width={800}
              height={800}
              className="relative z-10 w-[110%] lg:w-[125%] max-w-none h-auto select-none pointer-events-none opacity-85 dark:opacity-75 transition-opacity"
              style={{
                 filter: light 
                   ? 'drop-shadow(0 30px 60px rgba(180,83,9,0.3))' 
                   : 'drop-shadow(0 0 80px rgba(251,191,36,0.3)) sepia(0.4) saturate(1.4) brightness(1.1)'
              }}
              draggable={false}
              priority
            />
          </div>
        </div>

      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(40px, -60px) scale(1.1); }
          66% { transform: translate(-30px, 30px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob infinite alternate ease-in-out;
        }
      `}</style>
    </section>
  )
}
