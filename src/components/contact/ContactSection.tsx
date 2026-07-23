import Reveal from '@/components/ui/Reveal'

function ArrowRight() {
  return (
    <svg className="ar" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  )
}

function ArrowUpRight() {
  return (
    <svg className="ar" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  )
}

export default function ContactSection() {
  return (
    <section className="section" id="contact">

      {/* ── Section header ──────────────────────────────────────── */}
      <div className="section-head">
        <Reveal>
          <span className="label-pill">
            <span className="ldot" style={{ background: 'var(--green)' }} />
            Contact
          </span>
        </Reveal>
      </div>

      {/* ── Contact card ────────────────────────────────────────── */}
      <Reveal className="contact">
        <h2>
          Say <span className="serif">Hi.</span>
        </h2>
        <p>Email is the simplest way to reach me. I read every message that comes in.</p>
        <div className="ctas">
          <a className="btn btn-primary" href="mailto:hahz5d@pm.me">
            hahz5d@pm.me
            <ArrowRight />
          </a>
          <a className="btn btn-ghost" href="https://www.linkedin.com/in/hahzterry/" target="_blank" rel="noopener noreferrer">
            View on LinkedIn
            <ArrowUpRight />
          </a>
        </div>
      </Reveal>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer>
        <div className="fl">
          <span className="fdot" />
          Live from Atlanta, GA · EST
        </div>
        <nav className="fr" aria-label="Footer">
          <a href="https://www.linkedin.com/in/hahzterry" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="https://github.com/hahzterry"                                   target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="mailto:hahz5s@pm.me">Email</a>
        </nav>
      </footer>

    </section>
  )
}
