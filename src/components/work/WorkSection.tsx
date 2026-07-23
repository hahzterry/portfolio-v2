import Reveal from '@/components/ui/Reveal'

function ArrowUpRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  )
}

interface CaseStudy {
  id: string
  cv: string
  blobColor: string
  tag: string
  tagColor: string
  title: string
  description: string
  href: string
  image?: string   // optional foreground imagery for the canvas
}

const CASES: CaseStudy[] = [
  {
    id: 'open-claw',
    cv: 'cv-1',
    blobColor: 'var(--turq)',
    tag: 'Logistics · Automation · 2026',
    tagColor: 'var(--turq)',
    title: 'Logis',
    description:
      'Supply chain teams use Logistics Sentry to monitor operational risks across multiple ports and carriers simultaneously. ',
    href: 'https://logis.atlwarehouse.com',
    image: '/logis-atl.png',
  },
  {
    id: 'glean-ai-workflow',
    cv: 'cv-2',
    blobColor: 'var(--bill-warm)',
    tag: 'Logistics · Maps · 2025',
    tagColor: 'var(--bill-warm)',
    title: '3 Word Address Map',
    description:
      'RWATOK.LAND is a global addressing system that divides the world into 16.4 sq ft x 16.4 sq ft squares and assigns each square a unique combination of three words ///keep.it.simple example. This map visualizes the locations of warehouses, ports, and other logistics hubs using this system.',
    href: 'https://rwatok.land',
    image: '/3wa.png',
  },
    {
    id: 'rntbnb',
    cv: 'cv-3',
    blobColor: 'var(--turq)',
    tag: 'Blockchain · Toursism · 2025',
    tagColor: 'var(--turq)',
    title: 'RNTBNB',
    description:
      'QIE blockchain network for rental property management and tourism. RNTBNB is a decentralized platform that allows property owners to list their commercial real estate properties for rent, and travelers to book accommodations using cryptocurrency.',
    href: 'https://rntbnb.com',
    image: '/rntbnb.png',
  },
    {
    id: 'crime-booth',
    cv: 'cv-4',
    blobColor: 'var(--bill-warm)',
    tag: 'Game · Claude Fable 5 · AI',
    tagColor: 'var(--bill-warm)',
    title: 'Crime Booth',
    description:
      'A digital crime investigation board developed in three.js using Fable 5',
    href: 'https://cb.lumeebooth.com',
    image: '/crime-booth.png',
  },
    {
    id: 'marketing',
    cv: 'cv-5',
    blobColor: 'var(--turq)',
    tag: 'Marketing · Analytics · Social Media · 2026',
    tagColor: 'var(--turq)',
    title: 'Viral Marketing Analytics Portfolio',
    description:
      'View my portfolion of platform marketing analytics dashboards and TikTok, Instagram, Facebooksocial media analytics.',
    href: 'https://pitch.com/v/hahz-i75n75',
    image: '/viral-marketing.png',
  },
      {
    id: 'github',
    cv: 'cv-6',
    blobColor: 'var(--bill-warm)',
    tag: 'DBS · NDA Sanitized · 2025',
    tagColor: 'var(--bill-warm)',
    title: 'Github Portfolio AI Sketchbook',
    description:
      'A single-page portfolio generated automatically from a GitHub profile and drawn entirely in black marker on paper. Made with Anthropic Claude Fable 5',
    href: 'https://github.hahz.live',
    image: '/github.png',
  },
]

export default function WorkSection() {
  return (
    <section className="section" id="work">

      {/* ── Section header ──────────────────────────────────────── */}
      <div className="section-head">
        <Reveal>
          <span className="label-pill">
            <span className="ldot" style={{ background: 'var(--bill-warm)' }} />
            Work
          </span>
          <h2>
            A few things I&apos;ve built —{' '}
            <br />
            <span className="serif">using advanced tech.</span>
          </h2>
        </Reveal>

      </div>

      {/* ── Case study grid ─────────────────────────────────────── */}
      <div className="work-grid">
        {CASES.map((c, i) => (
          <Reveal key={c.id} delay={((i % 4) + 1) as 1 | 2 | 3 | 4}>
            <a className={`case ${c.cv}`} href={c.href}>
              <div className="canvas">
                <div className="cv-blob" />
                {c.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="cv-image" src={c.image} alt="" aria-hidden />
                )}
              </div>

              <div className="arrow-tile">
                <ArrowUpRight />
              </div>

              <div className="meta">
                <span className="ctag">
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.tagColor, flexShrink: 0 }} />
                  {c.tag}
                </span>
                <h3>{c.title}</h3>
                <p>{c.description}</p>
              </div>
            </a>
          </Reveal>
        ))}
      </div>

    </section>
  )
}
