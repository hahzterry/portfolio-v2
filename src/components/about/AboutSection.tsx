import Reveal from '@/components/ui/Reveal'
import StackRail from './StackRail'

const QUOTES = [
  {
    text: 'If you can get 1 percent better each day for one year, you\'ll end up thirty-seven times better by the time you\'re done.',
    author: 'James Clear, Atomic Habits',
  },
  {
    text: 'Master the best that other people have already figured out.',
    author: 'Charlie Munger',
  },
]

export default function AboutSection() {
  return (
    <section className="section" id="about">

      {/* ── Section header ──────────────────────────────────────── */}
      <div className="section-head">
        <Reveal>
          <span className="label-pill">
            <span className="ldot" style={{ background: 'var(--turq)' }} />
            About
          </span>
          <h2>
            In the messy <span className="serif">middle</span> —{' '}
            <br />
            the old way of doing business and the new way.
          </h2>
        </Reveal>
      </div>

      {/* ── Two-col grid ────────────────────────────────────────── */}
      <div className="about-grid">

        {/* Left — bio + skills */}
        <Reveal delay={1} className="glass about-card">
          <div className="bio-head">
            <div className="label">Bio</div>
            <div className="portrait">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/portrait/hahzterry.png" alt="Hahz Terry" />
            </div>
          </div>

          <p>
            I&apos;m an Atlanta-based Digital Growth Architect working at the intersection of
            educate and modernize business through automation, AI workflows and blockchain
            technologies. I speak at various conferences, universities and podcasts on the
            topics of advanced technology as a creator and educator.
          </p>

          <p>
            My day-to-day is motivating + educating teams, building systems and
            creating solutions. My 20+ years of experience in tech + business brings a vast
            of knowledge to the table, and I enjoy sharing that knowledge with others to help
            them grow and succeed. I keep my finger on the pulse of emerging technologies
            by building and via my Linkedin newsletters.
          </p>

          <div className="quotes">
            {QUOTES.map(q => (
              <blockquote key={q.author} className="quote">
                <p>&ldquo;{q.text}&rdquo;</p>
                <cite>— {q.author}</cite>
              </blockquote>
            ))}
          </div>
        </Reveal>

        {/* Right — animated stack rail */}
        <StackRail />

      </div>
    </section>
  )
}