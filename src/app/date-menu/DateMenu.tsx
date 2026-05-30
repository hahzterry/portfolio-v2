'use client'

import { Fragment, useEffect, useState } from 'react'

const COURSES = [
  {
    name: 'Entre',
    italian: 'Antipasto',
    dish: 'Burrata Bruschetta',
    desc: 'Creamy burrata over toasted sourdough with blistered cherry tomatoes, fresh basil & cold-pressed olive oil',
  },
  {
    name: 'Main',
    italian: 'Piatto Principale',
    dish: 'Spicy Vodka Rigatoni with Butter-Basted Steak',
    desc: 'Rigatoni folded into a silky spiced vodka sauce, served alongside a thyme & garlic butter-basted steak',
  },
  {
    name: 'Dessert',
    italian: 'Dolce',
    dish: 'Crème Brûléo',
    desc: 'Vanilla bean custard beneath a crisp, torched caramel crust',
  },
]

// Change this to the real dinner date if it isn't the 30th.
const DINNER_DATE = '30 Maggio'

const INK = '#2e241a'
const GOLD = '#b08d4f'
const GOLD_SOFT = '#9a7b44'

const BG =
  'radial-gradient(ellipse 80% 55% at 50% -8%, rgba(214,182,120,0.42), transparent 60%),' +
  'radial-gradient(ellipse 90% 70% at 50% 120%, rgba(120,88,46,0.16), transparent 62%),' +
  'linear-gradient(180deg, #faf4e7 0%, #f3e9d6 55%, #efe3cd 100%)'

export default function DateMenu() {
  const [opened, setOpened] = useState(false)
  const [coverGone, setCoverGone] = useState(false)

  const open = () => {
    if (opened) return
    setOpened(true)
    // Remove the cover after its fade. This is driven by a timer, not by the
    // CSS transition finishing, so the cover can never get visually "stuck".
    window.setTimeout(() => setCoverGone(true), 1150)
  }

  // Reveal each block as it scrolls into view. When the menu first opens,
  // the items already on screen reveal together with a gentle stagger.
  useEffect(() => {
    if (!opened) return
    const els = Array.from(document.querySelectorAll<HTMLElement>('.dm-rise'))
    const reveal = (el: HTMLElement, i = 0) =>
      window.setTimeout(() => el.classList.add('is-visible'), i * 120)

    const io = new IntersectionObserver(
      (entries) => {
        entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
          .forEach((entry, i) => {
            io.unobserve(entry.target)
            reveal(entry.target as HTMLElement, i)
          })
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    )
    els.forEach((el) => io.observe(el))

    // Safety net: guarantee anything already on-screen reveals shortly after
    // opening, even if the IntersectionObserver is throttled by the browser.
    const fallback = window.setTimeout(() => {
      els
        .filter((el) => !el.classList.contains('is-visible'))
        .filter((el) => el.getBoundingClientRect().top < window.innerHeight * 0.9)
        .forEach((el, i) => reveal(el, i))
    }, 500)

    return () => {
      io.disconnect()
      window.clearTimeout(fallback)
    }
  }, [opened])

  return (
    <div style={S.root}>
      <style>{CSS}</style>

      {/* ─── Ambient candlelit backdrop ─────────────────────────── */}
      <div style={S.bgBase} aria-hidden />
      <div className="dm-candle-glow" style={S.bgGlow} aria-hidden />
      <div style={S.bgVignette} aria-hidden />
      <div style={S.bgGrain} aria-hidden />

      {/* ─── Cover: a moment of anticipation before the menu ─────── */}
      {!coverGone && (
        <button
          type="button"
          className={`dm-cover${opened ? ' is-open' : ''}`}
          style={S.cover}
          onClick={open}
          aria-label="Open the menu"
        >
          <div style={S.coverInner}>
            <p style={S.eyebrow}>· Una Cena Privata ·</p>
            <h1 style={S.title}>The Kitchen</h1>
            <Fleuron />
            <span className="dm-cover-prompt" style={S.coverPrompt}>
              tap to open
            </span>
          </div>
        </button>
      )}

      {/* ─── Menu content ───────────────────────────────────────── */}
      <main style={S.content}>
        <p className="dm-rise" style={S.eyebrow}>
          · La Cena Privata di Daniel ·
        </p>

        <h1 className="dm-rise" style={S.title}>
          The Kitchen
        </h1>

        <p className="dm-rise" style={S.welcome}>
          Jeanie — an evening cooked by hand, just for you.
        </p>

        <p className="dm-rise" style={S.meta}>
          {DINNER_DATE} · La mia cucina
        </p>

        <div className="dm-rise" style={S.fleuronWrap}>
          <Fleuron />
        </div>

        {COURSES.map(({ name, italian, dish, desc }, i) => (
          <Fragment key={name}>
            {i > 0 && (
              <div className="dm-rise" style={S.fleuronWrap}>
                <Fleuron />
              </div>
            )}
            <section className="dm-rise" style={S.course}>
              <p style={S.courseItalian}>{italian}</p>
              <div style={S.dividerRow}>
                <span style={{ ...S.rule, ...S.ruleLeft }} />
                <span style={S.diamond} />
                <h2 className="dm-shimmer" style={S.courseName}>{name}</h2>
                <span style={S.diamond} />
                <span style={{ ...S.rule, ...S.ruleRight }} />
              </div>
              <p style={S.dish}>{dish}</p>
              <p style={S.desc}>{desc}</p>
            </section>
          </Fragment>
        ))}

        <div className="dm-rise" style={S.timeGap} aria-hidden>
          <span style={S.timeLine} />
        </div>

        <div className="dm-rise" style={S.tease}>
          <p style={S.teaseLabel}>For Later</p>
          <p className="dm-breathe" style={S.teaseLine}>
            Something I&rsquo;ve been wanting to ask you&hellip;
          </p>
        </div>
      </main>
    </div>
  )
}

function Fleuron() {
  return (
    <div style={S.fleuron} aria-hidden>
      <span style={{ ...S.fleuronRule, ...S.ruleLeft }} />
      <svg width="34" height="14" viewBox="0 0 34 14" fill="none">
        <path
          d="M17 1c2.2 2.6 5 4 8 4-3 0-5.8 1.4-8 4-2.2-2.6-5-4-8-4 3 0 5.8-1.4 8-4Z"
          fill={GOLD}
          opacity="0.9"
        />
        <circle cx="17" cy="9.5" r="1.3" fill={GOLD} />
      </svg>
      <span style={{ ...S.fleuronRule, ...S.ruleRight }} />
    </div>
  )
}

const CSS = `
  .dm-rise {
    opacity: 0;
    transform: translateY(28px);
  }
  .dm-rise.is-visible {
    opacity: 1;
    transform: none;
    transition: opacity 1.05s cubic-bezier(0.16, 1, 0.3, 1),
                transform 1.05s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .dm-cover {
    -webkit-tap-highlight-color: transparent;
    animation: dm-cover-in 1.2s cubic-bezier(0.16, 1, 0.3, 1) both;
    transition: opacity 1s ease, transform 1.1s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .dm-cover.is-open {
    /* Cancel the entrance animation — its fill-mode would otherwise keep
       holding opacity:1 and override this fade-out. */
    animation: none;
    opacity: 0;
    transform: translateY(-18px);
    pointer-events: none;
  }
  @keyframes dm-cover-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  .dm-cover-prompt {
    animation: dm-pulse 2.4s ease-in-out infinite;
  }
  @keyframes dm-pulse {
    0%, 100% { opacity: 0.4; }
    50%      { opacity: 0.85; }
  }
  @keyframes dm-flicker {
    0%, 100% { opacity: 0.55; }
    50%      { opacity: 0.85; }
  }
  .dm-candle-glow {
    animation: dm-flicker 9s ease-in-out infinite;
  }
  .dm-shimmer {
    background: linear-gradient(
      95deg,
      #2e241a 0%,
      #2e241a 32%,
      #b79c6d 45%,
      #f4ecda 50%,
      #b79c6d 55%,
      #2e241a 68%,
      #2e241a 100%
    );
    background-size: 250% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: #2e241a; /* fallback if background-clip:text unsupported */
    animation: dm-shimmer-move 6.5s ease-in-out infinite;
  }
  @keyframes dm-shimmer-move {
    0%   { background-position: 130% 0; }
    100% { background-position: -30% 0; }
  }
  /* A slow, anticipatory glow — like a held breath before a question. */
  .dm-breathe {
    animation: dm-breathe 4.8s ease-in-out infinite;
  }
  @keyframes dm-breathe {
    0%, 100% {
      opacity: 0.5;
      text-shadow: 0 0 0 rgba(176, 141, 79, 0);
    }
    50% {
      opacity: 1;
      text-shadow: 0 0 22px rgba(176, 141, 79, 0.35);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .dm-rise { opacity: 1; transform: none; transition: none; }
    .dm-rise.is-visible { transition: none; }
    .dm-cover { animation: none; }
    .dm-cover.is-open { transition: none; }
    .dm-cover-prompt { animation: none; opacity: 0.7; }
    .dm-candle-glow { animation: none; opacity: 0.7; }
    .dm-shimmer {
      animation: none;
      background: none;
      -webkit-text-fill-color: #2e241a;
    }
    .dm-breathe { animation: none; opacity: 1; }
  }
`

const S: Record<string, React.CSSProperties> = {
  root: {
    position: 'relative',
    minHeight: '100vh',
    width: '100%',
    overflow: 'hidden',
    color: INK,
  },
  bgBase: {
    position: 'fixed',
    inset: 0,
    zIndex: 2,
    background: BG,
  },
  bgGlow: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '60vh',
    zIndex: 3,
    pointerEvents: 'none',
    background:
      'radial-gradient(ellipse 55% 60% at 50% 0%, rgba(240,210,150,0.55), transparent 70%)',
  },
  bgVignette: {
    position: 'fixed',
    inset: 0,
    zIndex: 3,
    pointerEvents: 'none',
    background:
      'radial-gradient(ellipse 75% 80% at 50% 45%, transparent 52%, rgba(74,52,22,0.16) 100%)',
  },
  bgGrain: {
    position: 'fixed',
    inset: 0,
    zIndex: 3,
    pointerEvents: 'none',
    opacity: 0.05,
    mixBlendMode: 'multiply',
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
    backgroundSize: '180px 180px',
  },
  cover: {
    position: 'fixed',
    inset: 0,
    zIndex: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    border: 'none',
    cursor: 'pointer',
    color: INK,
    background: BG,
  },
  coverInner: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '22px',
    padding: '0 30px',
    textAlign: 'center',
  },
  coverPrompt: {
    fontFamily: 'var(--font-cormorant)',
    fontSize: '12px',
    letterSpacing: '0.34em',
    textTransform: 'uppercase',
    color: GOLD_SOFT,
    marginTop: '26px',
    paddingLeft: '0.34em',
  },
  content: {
    position: 'relative',
    zIndex: 4,
    minHeight: '100vh',
    maxWidth: '500px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '52px',
    padding: '88px 30px 116px',
  },
  eyebrow: {
    fontFamily: 'var(--font-cormorant)',
    fontWeight: 500,
    fontSize: '13px',
    letterSpacing: '0.42em',
    textTransform: 'uppercase',
    color: GOLD_SOFT,
    paddingLeft: '0.42em',
  },
  title: {
    fontFamily: 'var(--font-great-vibes)',
    fontSize: 'clamp(64px, 17vw, 96px)',
    fontWeight: 400,
    lineHeight: 1.05,
    letterSpacing: '0.02em',
    textAlign: 'center',
    color: INK,
    textShadow: '0 1px 0 rgba(255,255,255,0.5)',
  },
  welcome: {
    fontFamily: 'var(--font-cormorant)',
    fontStyle: 'italic',
    fontSize: 'clamp(17px, 4.4vw, 20px)',
    fontWeight: 400,
    lineHeight: 1.5,
    textAlign: 'center',
    color: '#5d4d36',
    maxWidth: '320px',
  },
  meta: {
    fontFamily: 'var(--font-cormorant)',
    fontWeight: 600,
    fontSize: '11.5px',
    letterSpacing: '0.32em',
    textTransform: 'uppercase',
    color: GOLD_SOFT,
    paddingLeft: '0.32em',
    marginTop: '-32px',
  },
  fleuronWrap: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  course: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  courseItalian: {
    fontFamily: 'var(--font-cormorant)',
    fontWeight: 600,
    fontSize: '12px',
    letterSpacing: '0.34em',
    textTransform: 'uppercase',
    color: GOLD_SOFT,
    marginBottom: '18px',
    paddingLeft: '0.34em',
  },
  dividerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '13px',
    width: '100%',
    marginBottom: '16px',
  },
  rule: {
    flex: 1,
    height: '1px',
  },
  ruleLeft: {
    background: `linear-gradient(90deg, transparent, ${GOLD})`,
  },
  ruleRight: {
    background: `linear-gradient(90deg, ${GOLD}, transparent)`,
  },
  diamond: {
    width: '5px',
    height: '5px',
    background: GOLD,
    transform: 'rotate(45deg)',
    flexShrink: 0,
  },
  courseName: {
    fontFamily: 'var(--font-great-vibes)',
    fontSize: 'clamp(42px, 11vw, 58px)',
    fontWeight: 400,
    lineHeight: 1.35,
    letterSpacing: '0.02em',
    color: INK,
    flexShrink: 0,
    // Room so the script flourishes/descenders aren't clipped by
    // background-clip:text.
    padding: '0.08em 0.16em 0.18em',
  },
  dish: {
    fontFamily: 'var(--font-cormorant)',
    fontStyle: 'italic',
    fontWeight: 500,
    fontSize: 'clamp(21px, 5.4vw, 26px)',
    lineHeight: 1.3,
    textAlign: 'center',
    color: INK,
    marginBottom: '8px',
  },
  desc: {
    fontFamily: 'var(--font-cormorant)',
    fontWeight: 400,
    fontSize: 'clamp(14px, 3.6vw, 15.5px)',
    lineHeight: 1.55,
    textAlign: 'center',
    color: '#6b5a40',
    maxWidth: '340px',
    letterSpacing: '0.01em',
  },
  fleuron: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '14px',
    width: '100%',
    maxWidth: '300px',
    margin: '0 auto',
  },
  fleuronRule: {
    flex: 1,
    height: '1px',
  },
  timeGap: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  timeLine: {
    width: '1px',
    height: '84px',
    background: `linear-gradient(180deg, transparent, ${GOLD} 50%, transparent)`,
  },
  tease: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '22px',
  },
  teaseLabel: {
    fontFamily: 'var(--font-cormorant)',
    fontWeight: 600,
    fontSize: '11px',
    letterSpacing: '0.42em',
    textTransform: 'uppercase',
    color: GOLD_SOFT,
    marginBottom: '14px',
    paddingLeft: '0.42em',
  },
  teaseLine: {
    fontFamily: 'var(--font-cormorant)',
    fontStyle: 'italic',
    fontWeight: 500,
    fontSize: 'clamp(19px, 5.2vw, 25px)',
    lineHeight: 1.4,
    textAlign: 'center',
    color: INK,
    maxWidth: '300px',
  },
}
