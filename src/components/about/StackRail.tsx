'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

// ─── Icons ────────────────────────────────────────────────────────────────────
function IconBriefcase() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M3 13h18" />
    </svg>
  )
}

function IconChart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12 7 8l5 5 9-9" />
      <path d="M14 4h7v7" />
    </svg>
  )
}

function IconFlag() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3v18" />
      <path d="M6 4l11 3.5L6 11Z" />
    </svg>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────
interface Cell {
  iconClass: 'b1' | 'b2' | 'b3'
  icon: React.ReactNode
  label: string
  primary: string
  secondary: string
}

const CELLS: Cell[] = [
  {
    iconClass: 'b1',
    icon: <IconBriefcase />,
    label: 'Current Role',
    primary: 'Warehouse & Supply Chain Operations Supervisor',
    secondary: 'Change Management · Audit · Incidents · Ex-Management Trainee',
  },
  {
    iconClass: 'b2',
    icon: <IconChart />,
    label: 'Interests',
    primary: 'Technology & Finance',
    secondary: 'Stockmarket · Options · Prediction Markets · AI · Blockchain',
  },
  {
    iconClass: 'b3',
    icon: <IconFlag />,
    label: 'Hobbies',
    primary: 'Gym · Tennis · Pickleball · Basketball',
    secondary: 'Balancing my chakras, mind, body and soul through movement and meditation',
  },
]

// ─── Cell ─────────────────────────────────────────────────────────────────────
function StackCell({ cell, index }: { cell: Cell; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.35 })
  const base = index * 0.12

  // All transform/opacity — no width animation, so the GPU handles it
  // smoothly without per-frame layout reflows.
  const ease = [0.22, 0.61, 0.36, 1] as const   // smooth standard ease
  const bouncy = [0.34, 1.5, 0.45, 1] as const  // gentle back-ease for the icon

  return (
    <motion.div
      ref={ref}
      className="glass mini"
      initial={{ opacity: 0, y: 14 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
      transition={{ duration: 0.5, delay: base, ease }}
    >
      <motion.div
        className={`it ${cell.iconClass}`}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
        transition={{ duration: 0.5, delay: base + 0.15, ease: bouncy }}
      >
        {cell.icon}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
        transition={{ duration: 0.45, delay: base + 0.3, ease }}
      >
        <div className="ml">{cell.label}</div>
        <div className="mv">{cell.primary}</div>
        <div className="ms">{cell.secondary}</div>
      </motion.div>
    </motion.div>
  )
}

// ─── Rail ─────────────────────────────────────────────────────────────────────
export default function StackRail() {
  return (
    <div className="stack-rail">
      {CELLS.map((cell, i) => (
        <StackCell key={cell.label} cell={cell} index={i} />
      ))}
    </div>
  )
}
