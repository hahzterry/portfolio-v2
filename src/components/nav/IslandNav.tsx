'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const LINKS = [
  { label: 'Intro',   id: 'intro' },
  { label: 'AI',      id: 'ai' },
  { label: 'Work',    id: 'work' },
  { label: 'About',   id: 'about' },
  { label: 'Contact', id: 'contact' },
  { label: 'Archive', id: 'archive' },
] as const

type LinkId = typeof LINKS[number]['id']

// How far from the top of the viewport a section's top edge must be
// before it's considered "active". Matches the nav height + a small buffer.
const ACTIVATION_OFFSET = 80

// Map known case-study slugs to a display label for the nav breadcrumb
const CASE_STUDY_TITLES: Record<string, string> = {
  openclaw: 'OpenClaw',
}

export default function IslandNav() {
  const pathname = usePathname()
  const isCaseStudy = pathname?.startsWith('/work/') ?? false
  const caseStudySlug = isCaseStudy ? pathname.split('/').pop() ?? '' : ''
  const caseStudyTitle = CASE_STUDY_TITLES[caseStudySlug] ?? 'Case study'

  const isDateMenu = pathname === '/date-menu'
  const isDigibank = pathname === '/digibank-personalize-enhancement'

  const [activeId, setActiveId] = useState<LinkId>('intro')
  const linkRefs    = useRef<(HTMLAnchorElement | null)[]>([])
  const indicatorRef = useRef<HTMLSpanElement>(null)
  const rafRef      = useRef<number | null>(null)

  // Move the sliding pill to sit behind the given link element
  const moveIndicator = useCallback((link: HTMLAnchorElement | null) => {
    const indicator = indicatorRef.current
    if (!indicator) return
    if (!link || link.offsetWidth === 0) {
      indicator.style.opacity = '0'
      return
    }
    indicator.style.opacity = '1'
    indicator.style.width = `${link.offsetWidth}px`
    indicator.style.transform = `translateX(${link.offsetLeft}px)`
  }, [])

  // Slide indicator whenever activeId changes (homepage only)
  useEffect(() => {
    if (isCaseStudy) return
    const idx = LINKS.findIndex(l => l.id === activeId)
    moveIndicator(linkRefs.current[idx] ?? null)
  }, [activeId, moveIndicator, isCaseStudy])

  // Scroll-position tracker — runs on every scroll frame, no observer lag
  useEffect(() => {
    if (isCaseStudy) return

    const getSections = () =>
      LINKS.map(l => document.getElementById(l.id)).filter(Boolean) as HTMLElement[]

    const update = () => {
      const sections = getSections()
      if (!sections.length) return

      // Edge case: if the user has scrolled within ~50px of the bottom of the
      // page, the last section's top may never cross the activation line.
      // Force the final link active so Archive lights up at the page end.
      const docHeight  = document.documentElement.scrollHeight
      const scrollBottom = window.scrollY + window.innerHeight
      if (scrollBottom >= docHeight - 50) {
        setActiveId(LINKS[LINKS.length - 1].id)
        return
      }

      // Walk through sections; the last one whose top is at or above the
      // activation line is the one currently "in view".
      let current: LinkId = LINKS[0].id
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= ACTIVATION_OFFSET) {
          current = section.id as LinkId
        }
      }
      setActiveId(current)
    }

    const onScroll = () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    update() // set correct state on mount

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [isCaseStudy])

  // Re-align indicator on resize
  useEffect(() => {
    if (isCaseStudy) return
    const onResize = () => {
      const idx = LINKS.findIndex(l => l.id === activeId)
      moveIndicator(linkRefs.current[idx] ?? null)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [activeId, moveIndicator, isCaseStudy])

  const handleClick = useCallback((id: LinkId) => {
    // Snap the pill instantly on click — don't wait for the scroll event
    setActiveId(id)
  }, [])

  if (isDateMenu || isDigibank) return null

  // ─── Case-study variant ──────────────────────────────────────────────
  if (isCaseStudy) {
    return (
      <nav className="island island-case-study" aria-label="Case study">
        <Link href="/#work" className="case-study-nav-back">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          <span>Back to portfolio</span>
        </Link>

        <span className="case-study-nav-divider" aria-hidden />

        <div className="brand">
          <span className="dot" />
          <span className="name">{caseStudyTitle}</span>
        </div>
      </nav>
    )
  }

  // ─── Default homepage variant ────────────────────────────────────────
  return (
    <nav className="island" aria-label="Primary">
      <span className="nav-indicator" aria-hidden="true" ref={indicatorRef} />

      <div className="brand">
        <span className="dot" />
        <span className="name">Daniel Muljono</span>
      </div>

      {LINKS.map((link, i) => (
        <a
          key={link.id}
          href={`/#${link.id}`}
          className={`link${activeId === link.id ? ' active' : ''}`}
          ref={el => { linkRefs.current[i] = el }}
          onClick={() => handleClick(link.id)}
        >
          {link.label}
        </a>
      ))}
    </nav>
  )
}
