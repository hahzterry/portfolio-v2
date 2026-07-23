'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import MobiusOrb from './MobiusOrb'

type Layer = 'haiku' | 'opus' | 'kb' | null

// ─── Icons ────────────────────────────────────────────────────────────────────

// Claude Opus — the Anthropic-style 8-petal sparkle, with orbiting accent dots for life
function ClaudeMark({ color, glyphId }: { color: string; glyphId: string }) {
  const longPetal  = 'M 50,8  C 56,24 56,40 50,48 C 44,40 44,24 50,8  Z'
  const shortPetal = 'M 50,22 C 53,30 53,38 50,46 C 47,38 47,30 50,22 Z'

  return (
    <svg viewBox="0 0 100 100" width="140" height="140" style={{ color }}>
      <defs>
        <radialGradient id={`${glyphId}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="55%" stopColor="currentColor" stopOpacity="0.08" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="50" cy="50" r="50" fill={`url(#${glyphId}-glow)`} />

      {/* Outer counter-rotating accent dots */}
      <g
        fill="currentColor"
        style={{
          transformOrigin: '50% 50%',
          animation: 'claude-orbit 9s linear infinite reverse',
        }}
      >
        <circle cx="50" cy="6"  r="1.6" opacity="0.85" />
        <circle cx="94" cy="50" r="1.6" opacity="0.6" />
        <circle cx="50" cy="94" r="1.6" opacity="0.85" />
        <circle cx="6"  cy="50" r="1.6" opacity="0.6" />
      </g>

      {/* 8-petal sparkle — slow spin + breathing */}
      <g
        fill="currentColor"
        style={{
          transformOrigin: '50% 50%',
          animation: 'claude-spin 12s linear infinite, claude-pulse 3.4s ease-in-out infinite',
        }}
      >
        <path d={longPetal}  transform="rotate(0 50 50)" />
        <path d={shortPetal} transform="rotate(45 50 50)" />
        <path d={longPetal}  transform="rotate(90 50 50)" />
        <path d={shortPetal} transform="rotate(135 50 50)" />
        <path d={longPetal}  transform="rotate(180 50 50)" />
        <path d={shortPetal} transform="rotate(225 50 50)" />
        <path d={longPetal}  transform="rotate(270 50 50)" />
        <path d={shortPetal} transform="rotate(315 50 50)" />
      </g>

      <circle cx="50" cy="50" r="2.8" fill="currentColor" />
    </svg>
  )
}

// Claude Haiku — shield with a scanning line and rippling rings (guardrail + speed)
function HaikuMark({ color, glyphId }: { color: string; glyphId: string }) {
  return (
    <svg viewBox="0 0 100 100" width="140" height="140" style={{ color }}>
      <defs>
        <radialGradient id={`${glyphId}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="currentColor" stopOpacity="0.32" />
          <stop offset="55%" stopColor="currentColor" stopOpacity="0.08" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${glyphId}-shield-clip`}>
          <path d="M 50,18 L 76,28 V 52 C 76,68 50,82 50,82 C 50,82 24,68 24,52 V 28 Z" />
        </clipPath>
      </defs>

      <circle cx="50" cy="50" r="50" fill={`url(#${glyphId}-glow)`} />

      {/* Outward rippling rings — three offset rings give a layered radar feel */}
      <g fill="none" stroke="currentColor" strokeWidth="0.7">
        <circle cx="50" cy="50" r="18" style={{ animation: 'haiku-ripple 2.6s ease-out infinite' }} />
        <circle cx="50" cy="50" r="18" style={{ animation: 'haiku-ripple 2.6s ease-out infinite -0.87s' }} />
        <circle cx="50" cy="50" r="18" style={{ animation: 'haiku-ripple 2.6s ease-out infinite -1.73s' }} />
      </g>

      {/* Shield body */}
      <path
        d="M 50,18 L 76,28 V 52 C 76,68 50,82 50,82 C 50,82 24,68 24,52 V 28 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Scan line — sweeps inside the shield */}
      <g clipPath={`url(#${glyphId}-shield-clip)`}>
        <g style={{ animation: 'haiku-scan 2.6s ease-in-out infinite' }}>
          <line x1="22" y1="50" x2="78" y2="50" stroke="currentColor" strokeWidth="1.6" opacity="0.85" />
          <line x1="22" y1="50" x2="78" y2="50" stroke="currentColor" strokeWidth="4" opacity="0.18" />
        </g>
      </g>

      {/* Center pulse dot */}
      <circle cx="50" cy="52" r="2.4" fill="currentColor"
        style={{ transformOrigin: '50px 52px', animation: 'haiku-core 1.6s ease-in-out infinite' }}
      />
    </svg>
  )
}

function StorageMark({ color }: { color: string }) {
  // Layered database stack — softer strokes, a glow background, animated "data flow" dots
  return (
    <svg viewBox="0 0 100 100" width="140" height="140" style={{ color }}>
      <defs>
        <radialGradient id="storage-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="currentColor" stopOpacity="0.30" />
          <stop offset="60%" stopColor="currentColor" stopOpacity="0.06" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="50" cy="50" r="50" fill="url(#storage-glow)" />

      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* Three stacked drum tiers */}
        <ellipse cx="50" cy="26" rx="26" ry="8" />
        <path d="M24 26v15c0 4.4 11.6 8 26 8s26-3.6 26-8V26" />
        <path d="M24 41v15c0 4.4 11.6 8 26 8s26-3.6 26-8V41" />
        <path d="M24 56v15c0 4.4 11.6 8 26 8s26-3.6 26-8V56" />

        {/* Top ring highlight */}
        <ellipse cx="50" cy="26" rx="26" ry="8" opacity="0.45" strokeWidth="1" />
      </g>

      {/* Soft pulsing inner highlight */}
      <g
        fill="currentColor"
        style={{
          transformOrigin: '50% 50%',
          animation: 'storage-pulse 2.6s ease-in-out infinite',
        }}
      >
        <circle cx="50" cy="50" r="1.8" />
      </g>
    </svg>
  )
}

// ─── Per-layer content ────────────────────────────────────────────────────────
const LAYERS = {
  haiku: {
    title: 'Outer layer · Claude Haiku',
    sub: "A fast guardrail model. It reads every incoming message and decides if it's a legitimate question about Hahz Terry's work — anything off-topic or unsafe gets blocked before the inner layer ever sees it.",
    color: 'var(--turq)',
    icon: (c: string) => <HaikuMark color={c} glyphId="haiku" />,
  },
  opus: {
    title: 'Inner layer · Claude Opus',
    sub: 'The reasoning brain. Once the guardrail passes, Opus streams back the answer using everything it knows about Hahz Terry — projects, stack, background, and tone.',
    color: 'var(--purple)',
    icon: (c: string) => <ClaudeMark color={c} glyphId="opus" />,
  },
  kb: {
    title: 'Storage layer · Supabase',
    sub: "A Supabase table that holds Hahz Terry's facts — projects, skills, stack, contact info. Opus pulls the rows on every request and weaves them into its prompt, so updating Hahz's knowledge means editing rows, not code.",
    color: 'var(--bill-warm)',
    icon: (c: string) => <StorageMark color={c} />,
  },
} as const

// ─── Card ─────────────────────────────────────────────────────────────────────
export default function AgentCard() {
  const [layer, setLayer] = useState<Layer>(null)
  const active = layer ? LAYERS[layer] : null

  // Animation knobs for the text fade — kept here so all three elements stay in sync
  const TEXT_FADE = {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    exit:    { opacity: 0, y: -4 },
    transition: { duration: 0.28, ease: [0.32, 0.72, 0, 1] as const },
  }

  // Default copy when no chip is hovered
  const defaultSub =
    'Powered by Claude. Walks visitors through my projects, background and stack — without pretending to be me. Two agents under the hood: a guardrail and a knowledge engine.'

  return (
    <>
      <div className="ai-status">
        <span className="listening" />
        <AnimatePresence mode="wait">
          <motion.span key={active ? 'inspecting' : 'default'} {...TEXT_FADE}>
            {active ? 'Inspecting layer…' : 'AI Agent'}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Visual — orb in default state, layer icon when hovering */}
      <div className="agent-visual">
        <div className={`agent-orb ${active ? 'fade-out' : 'fade-in'}`}>
          <MobiusOrb />
        </div>

        <div className="agent-icon-stack">
          <AnimatePresence>
            {active && (
              <motion.div
                key={layer}
                className="icon-anim"
                initial={{ opacity: 0, scale: 0.65 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.5, ease: [0.34, 1.7, 0.45, 1] }}
              >
                {active.icon(active.color)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.h3 key={layer ?? 'default'} {...TEXT_FADE}>
          {active ? active.title : 'Meet Wizard of Hahz'}
        </motion.h3>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.p
          key={layer ?? 'default'}
          className="agent-sub"
          {...TEXT_FADE}
        >
          {active ? active.sub : defaultSub}
        </motion.p>
      </AnimatePresence>

      <div className="connectors">
        <span
          className="chip chip-stacked"
          onMouseEnter={() => setLayer('haiku')}
          onMouseLeave={() => setLayer(null)}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ color: 'var(--turq)', flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="4" />
          </svg>
          <span className="chip-text">
            <span className="chip-primary">Outer layer</span>
            <span className="chip-secondary">Claude Haiku</span>
          </span>
        </span>
        <span
          className="chip chip-stacked"
          onMouseEnter={() => setLayer('opus')}
          onMouseLeave={() => setLayer(null)}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ color: 'var(--purple)', flexShrink: 0 }}>
            <circle cx="12" cy="12" r="5" />
            <path d="M12 2v5M12 17v5M2 12h5M17 12h5" />
          </svg>
          <span className="chip-text">
            <span className="chip-primary">Inner layer</span>
            <span className="chip-secondary">Claude Opus</span>
          </span>
        </span>
        <span
          className="chip chip-stacked"
          onMouseEnter={() => setLayer('kb')}
          onMouseLeave={() => setLayer(null)}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ color: 'var(--bill-warm)', flexShrink: 0 }}>
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
            <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
          </svg>
          <span className="chip-text">
            <span className="chip-primary">Storage layer</span>
            <span className="chip-secondary">Supabase</span>
          </span>
        </span>
      </div>
    </>
  )
}
