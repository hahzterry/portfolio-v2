import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'
import { logChat, getKnowledge, type KnowledgeRow } from '@/lib/supabase'

// ─── Agent 1: Guardrail (Simplified) ──────────────────────────────────────────
const GUARDRAIL_SYSTEM = `You are a safety guardrail for a portfolio assistant.
Classify whether the user's message is appropriate.

SAFE — return {"safe":true}:
- Questions about Hahz's background, skills, experience, projects, or work
- Questions about his interests or how to contact him

UNSAFE — return {"safe":false}:
- Personal or sensitive questions
- Requests to build tools or write code
- Harmful, offensive, or malicious content
- Topics entirely unrelated to Hahz or his work

Respond ONLY with valid JSON: {"safe":true} or {"safe":false,"reason":"..."}.`

// ─── Agent 2: Knowledge Engine ────────────────────────────────────────────────
const KNOWLEDGE_BEHAVIOR = `You are Wizard of Hahz — a portfolio guide for Hahz Terry. You are friendly, concise, and helpful. You help visitors understand Hahz's professional world.

━━━ HOW TO BEHAVE ━━━
- You are Wizard of Hahz, Hahz's guide — not Hahz himself
- Be concise: 2–4 sentences is usually enough
- For NDA projects, acknowledge they exist but explain you can't share internal details
- Encourage visitors to email Hahz for deep conversations or collaboration
- If a question is borderline off-topic but good-natured, answer briefly and redirect`

const CATEGORY_HEADERS: Record<string, string> = {
  bio:        'WHO IS HAHZ',
  project:    'PROJECTS',
  skill:      'SKILLS & FOCUS',
  interest:   'INTERESTS',
  portfolio:  'THIS PORTFOLIO',
  framework:  'FRAMEWORKS HE USES',
  domain:     'WORK DOMAINS',
  value:      'WHAT HE VALUES',
  contact:    'CONTACT',
  experience: 'EXPERIENCE',
  achievement:'ACHIEVEMENTS',
  certification:'CERTIFICATIONS',
  education:  'EDUCATION',
}

function buildKnowledgePrompt(rows: KnowledgeRow[]): string {
  if (!rows.length) {
    console.warn('[knowledge] No rows found — using fallback')
    return KNOWLEDGE_BEHAVIOR + '\n\n━━━ FALLBACK KNOWLEDGE ━━━\n- Hahz Terry is a Digital Growth Architect based in Atlanta, GA.\n- He created ATLWarehouse.com, an AI-powered warehouse automation platform.\n- He has 20+ years of experience in tech and business.'
  }

  const grouped: Record<string, KnowledgeRow[]> = {}
  for (const r of rows) {
    if (!grouped[r.category]) grouped[r.category] = []
    grouped[r.category].push(r)
  }

  const sections = Object.entries(grouped).map(([cat, items]) => {
    const header = CATEGORY_HEADERS[cat] ?? cat.toUpperCase()
    const body = items.map(r => `- ${r.title}: ${r.content}`).join('\n')
    return `━━━ ${header} ━━━\n${body}`
  })

  return `${KNOWLEDGE_BEHAVIOR}\n\n${sections.join('\n\n')}`
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface GuardrailResult {
  safe: boolean
  reason?: string
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  console.log('[api/chat] === REQUEST START ===')

  // ── 1. Validate Anthropic API Key ──────────────────────────────────────────
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('[api/chat] ❌ ANTHROPIC_API_KEY is missing')
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  console.log('[api/chat] ✅ ANTHROPIC_API_KEY is set')

  // ── 2. Parse Request ───────────────────────────────────────────────────────
  let messages: ChatMessage[]
  try {
    const body = await req.json()
    messages = body.messages
    console.log('[api/chat] 📨 Messages:', messages.length)
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid request body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  if (!messages?.length) {
    return new Response(
      JSON.stringify({ error: 'No messages provided' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const lastUser = [...messages].reverse().find(m => m.role === 'user')
  const lastContent = typeof lastUser?.content === 'string' ? lastUser.content : ''

  if (!lastContent) {
    return new Response(
      JSON.stringify({ error: 'No user message found' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  console.log('[api/chat] 💬 Question:', lastContent.slice(0, 60))

  // ── 3. Initialize Anthropic Client ────────────────────────────────────────
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  // ── 4. Guardrail (Skip if you want to test) ───────────────────────────────
  // ⚠️ COMMENT THIS OUT TO TEST: Disable guardrail temporarily
  let guardrail: GuardrailResult = { safe: true }
  try {
    console.log('[api/chat] 🛡️ Running guardrail...')
    const check = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 100,
      system: GUARDRAIL_SYSTEM,
      messages: [{ role: 'user', content: lastContent }],
    })
    const raw = check.content[0].type === 'text' ? check.content[0].text : ''
    guardrail = JSON.parse(raw)
    console.log('[api/chat] ✅ Guardrail result:', guardrail)
  } catch (err) {
    console.warn('[api/chat] ⚠️ Guardrail failed, failing open:', err)
    guardrail = { safe: true }
  }

  // If guardrail blocks, return a friendly message
  if (!guardrail.safe) {
    console.log('[api/chat] 🚫 Blocked:', guardrail.reason)
    logChat({ question: lastContent, answer: '', blocked: true }).catch(() => {})
    return new Response(
      JSON.stringify({ 
        blocked: true, 
        reason: guardrail.reason || 'This question is not related to Hahz\'s professional work.'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // ── 5. Fetch Knowledge from Supabase ──────────────────────────────────────
  console.log('[api/chat] 📚 Fetching knowledge...')
  let knowledge: KnowledgeRow[] = []
  try {
    knowledge = await getKnowledge()
    console.log('[api/chat] ✅ Knowledge rows:', knowledge.length)
  } catch (err) {
    console.error('[api/chat] ❌ Knowledge fetch failed:', err)
    // Continue with empty knowledge (fallback will handle)
  }

  const systemPrompt = buildKnowledgePrompt(knowledge)
  console.log('[api/chat] 📝 System prompt length:', systemPrompt.length)

  // ── 6. Get AI Response (Streaming) ──────────────────────────────────────
  console.log('[api/chat] 🚀 Calling Anthropic...')
  
  // Log the exact request being made
  const requestPayload = {
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 500,
    system: systemPrompt.slice(0, 200) + '...',
    messages: messages.slice(-5).map(m => ({ role: m.role, content: m.content.slice(0, 50) + '...' })),
  }
  console.log('[api/chat] 📤 Request:', JSON.stringify(requestPayload, null, 2))

  let stream
  try {
    stream = client.messages.stream({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      system: systemPrompt,
      messages: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
    })
    console.log('[api/chat] ✅ Stream created')
  } catch (err) {
    console.error('[api/chat] ❌ Stream creation failed:', err)
    return new Response(
      JSON.stringify({ error: 'Failed to create AI stream: ' + (err as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // ── 7. Create Readable Stream ──────────────────────────────────────────────
  const readable = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder()
      let fullAnswer = ''
      let hasContent = false

      try {
        console.log('[api/chat] 📡 Streaming...')
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            const text = event.delta.text
            if (text) {
              hasContent = true
              fullAnswer += text
              controller.enqueue(enc.encode(text))
            }
          }
        }
        console.log('[api/chat] ✅ Stream done. Chars:', fullAnswer.length)

        // If no content, send fallback
        if (!hasContent) {
          const fallback = "I don't have enough information to answer that. Please try asking about Hahz's background, projects, or skills."
          console.warn('[api/chat] ⚠️ Empty response, sending fallback')
          controller.enqueue(enc.encode(fallback))
          fullAnswer = fallback
        }
      } catch (err) {
        console.error('[api/chat] ❌ Stream error:', err)
        const errorMsg = "Something went wrong. Please try again."
        controller.enqueue(enc.encode(errorMsg))
        fullAnswer = errorMsg
      } finally {
        controller.close()
        logChat({ question: lastContent, answer: fullAnswer, blocked: false }).catch(() => {})
        console.log('[api/chat] === REQUEST END ===')
      }
    },
    cancel() {
      console.log('[api/chat] 🛑 Stream cancelled')
      stream.abort()
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}