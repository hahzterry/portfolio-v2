import Reveal from '@/components/ui/Reveal'
import ChatInterface from './ChatInterface'
import AgentCard from './AgentCard'

export default function AiSection() {
  return (
    <section className="section" id="ai">

      {/* ── Section header ──────────────────────────────────────── */}
      <div className="section-head">
        <Reveal>
          <span className="label-pill">
            <span className="ldot" style={{ background: 'var(--turq)' }} />
            AI
          </span>
          <h2>
            Ask <span className="serif">Wizard of Hahz</span> — your guide<br />
            through my work and background.
          </h2>
        </Reveal>
      </div>

      {/* ── Two-col grid ────────────────────────────────────────── */}
      <div className="ai-grid">

        {/* Left — orb + agent info (interactive on chip hover) */}
        <Reveal delay={2} className="glass ai-agent">
          <AgentCard />
        </Reveal>

        {/* Right — live chat */}
        <Reveal delay={3} className="glass chat-card">
          <ChatInterface />
        </Reveal>

      </div>
    </section>
  )
}
