'use client'

import { useEffect, useRef, useState } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const GREETING: Message = {
  role: 'assistant',
  content: "Hey! I'm Wizard of Hahz 👋 Got any questions about Hahz? I'm an AI built to help answer for him — ask about his work, projects, background, or anything in between.",
}

const STORAGE_KEY = 'dani-chat-history'

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([GREETING])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const bodyRef  = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load saved history on mount — always keep greeting as first message
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed: Message[] = JSON.parse(saved)
        if (parsed.length > 0) {
          setMessages([GREETING, ...parsed])
        }
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  // Save history (everything after the greeting) whenever messages change
  useEffect(() => {
    try {
      const history = messages.slice(1) // exclude the greeting
      if (history.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
      }
    } catch {
      // ignore storage errors
    }
  }, [messages])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    const next: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })

      // Guardrail blocked the message
      if (res.headers.get('Content-Type')?.includes('application/json')) {
        const data = await res.json()
        if (data.blocked) {
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: "I can only help with questions about Daniel's work, projects and background. Try asking about one of his projects or skills!" },
          ])
          return
        }
      }

      // Stream the knowledge engine response
      const reader  = res.body!.getReader()
      const decoder = new TextDecoder()

      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: updated[updated.length - 1].content + chunk,
          }
          return updated
        })
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "Something went wrong on my end. Try again in a moment." },
      ])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <>
      <div className="chat-head">
        <div className="av-mini">
          <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true">
            <defs>
              <linearGradient id="dani-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"  stopColor="#5fe5d3" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ff7a8a" />
              </linearGradient>
            </defs>
            {/* Stylized infinity loop — mirrors the Möbius orb in miniature */}
            <path
              d="M 10,16 C 10,11 14,11 16,16 C 18,21 22,21 22,16 C 22,11 18,11 16,16 C 14,21 10,21 10,16 Z"
              fill="none"
              stroke="url(#dani-grad)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* A tiny accent dot — Hahz's "spark" */}
            <circle cx="16" cy="16" r="1.1" fill="#fff" opacity="0.9" />
          </svg>
        </div>
        <div>
          <div className="ch-name">Wizard of Hahz — Portfolio AI</div>
          <div className="ch-status">{loading ? 'typing…' : 'online'}</div>
        </div>
        <div className="menu">⋯</div>
      </div>

      <div className="chat-body" ref={bodyRef}>
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role === 'user' ? 'out' : 'in'}`}>
            {m.content}
          </div>
        ))}
        {loading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="bubble in typing">
            <span /><span /><span />
          </div>
        )}
      </div>

      <div className="chat-input">
        <input
          ref={inputRef}
          className="placeholder"
          style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--t1)', fontSize: 14 }}
          placeholder="Ask Wizard of Hahz something…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          disabled={loading}
        />
        <button
          className="send"
          onClick={send}
          disabled={loading || !input.trim()}
          style={{ cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', opacity: loading || !input.trim() ? 0.5 : 1 }}
          aria-label="Send message"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </>
  )
}
