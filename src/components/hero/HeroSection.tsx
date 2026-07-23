'use client'

import dynamic from 'next/dynamic'

// Canvas must never run on the server — dynamic import with ssr:false
const HeroScene3D = dynamic(() => import('./HeroScene3D'), {
  ssr: false,
  loading: () => <div className="scene-canvas" />,
})

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  )
}

function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  )
}

export default function HeroSection() {
  return (
    <section className="hero" id="intro">

      {/* ── Left: copy ──────────────────────────────────────── */}
      <div className="hero-copy">
        <span className="eyebrow">
          <span className="av">DM</span>
          <strong>Seattle</strong> · <strong>San Diego</strong> · <strong>Jakarta</strong>
        </span>

        <h1 className="hero-title">
          Navigating the<br />
          edge between <span className="serif">finance</span>,<br />
          <span className="serif">technology</span> &amp; <span className="serif">risk efficiency</span>.
        </h1>

        <p className="hero-sub">
          I&apos;m Daniel — a Jakarta-based Digital Growth Architect working across banking systems,
          risk governance, automation and AI-assisted workflows. Currently building tools
          that make complex work easier to understand, manage and move forward.
        </p>

        <div className="hero-cta">
          <a className="btn btn-primary" href="#work">
            View work
            <ArrowRight className="ar" />
          </a>
          <a className="btn btn-ghost" href="#ai">
            Ask Dani
            <ArrowUpRight className="ar" />
          </a>
        </div>
      </div>

      {/* ── Right: 3D scene ─────────────────────────────── */}
      <div className="hero-3d">
        <div className="scene-canvas">
          <HeroScene3D />
        </div>
        <div className="scene-caption">
          <span>Learning node by node</span>
          <span>in a world of knowledge</span>
        </div>
      </div>

      {/* ── Bottom: meta strip ──────────────────────────────── */}
      <div className="hero-meta">
        <div className="cell">
          <div className="l">Currently</div>
          <div className="v">Banking Digital Growth Architect</div>
        </div>
        <div className="cell">
          <div className="l">Based in</div>
          <div className="v">Jakarta · UTC<span className="mono">+7</span></div>
        </div>
        <div className="cell">
          <div className="l">Focus</div>
          <div className="v">IT Governance × AI</div>
        </div>
        <div className="cell">
          <div className="l">Latest</div>
          <div className="v">Portfolio v2 · 2026</div>
        </div>
      </div>

    </section>
  )
}
