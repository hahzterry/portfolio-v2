import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'DBS digibank — Personalization Prototype',
  description:
    'An interactive prototype exploring a personalized, theme-able revamp of the DBS digibank app.',
}

export default function DigibankPage() {
  return (
    <iframe
      src="/digibank/index.html"
      title="DBS digibank personalization prototype"
      style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', border: 0 }}
    />
  )
}
