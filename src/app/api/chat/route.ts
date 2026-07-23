import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'
import { getKnowledge, type KnowledgeRow } from '@/lib/supabase'

export const runtime = 'nodejs'

// ─── SYSTEM PROMPT (Fallback & Behavior) ──────────────────────────────────────
const KNOWLEDGE_BEHAVIOR = `You are Wizard of Hahz — a portfolio guide for Hahz Terry. You are friendly, concise, and helpful. You help visitors understand Hahz's professional world.

━━━ HOW TO BEHAVE ━━━
- You are Wizard of Hahz, Hahz's guide — not Hahz himself
- Be concise: 2–4 sentences is usually enough
- For NDA projects, acknowledge they exist but explain you can't share internal details
- Encourage visitors to email Hahz for deep conversations or collaboration
- You can make reasonable inferences about Hahz based on his work and values
- If a question is borderline off-topic but good-natured, answer briefly and redirect`

// ─── Category Headers ────────────────────────────────────────────────────────
const CATEGORY_HEADERS: Record<string, string> = {
  bio: 'WHO IS HAHZ',
  project: 'PROJECTS',
  skill: 'SKILLS & FOCUS',
  interest: 'INTERESTS',
  portfolio: 'THIS PORTFOLIO',
  framework: 'FRAMEWORKS HE USES',
  domain: 'WORK DOMAINS',
  value: 'WHAT HE VALUES',
  contact: 'CONTACT',
  experience: 'EXPERIENCE',
  achievement: 'ACHIEVEMENTS',
  certification: 'CERTIFICATIONS',
  education: 'EDUCATION',
}

// ─── Build System Prompt from Knowledge ──────────────────────────────────────
function buildKnowledgePrompt(rows: KnowledgeRow[]): string {
  if (!rows.length) {
    console.warn('[knowledge] No rows found — using fallback knowledge')
    return `${KNOWLEDGE_BEHAVIOR}

━━━ FALLBACK KNOWLEDGE ━━━
- Hahz Terry is a Digital Growth Architect based in Atlanta, GA
- He created ATLWarehouse.com, an AI-powered warehouse automation platform
- He has 20+ years of experience in tech and business
- He specializes in AI workflows, marketing analytics, and blockchain technologies`
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

export async function POST(req: NextRequest) {
  console.log('=== CHAT API START ===')

  try {
    // ── 1. CHECK API KEY ──────────────────────────────────────────────────────
    const apiKey = process.env.ANTHROPIC_API_KEY?.trim()
    if (!apiKey) {
      console.error('❌ ANTHROPIC_API_KEY is missing')
      return Response.json(
        { error: 'ANTHROPIC_API_KEY is not configured' },
        { status: 500 }
      )
    }
    console.log('✅ ANTHROPIC_API_KEY is configured')

    // ── 2. PARSE REQUEST ──────────────────────────────────────────────────────
    let body: any
    try {
      body = await req.json()
    } catch (error) {
      console.error('❌ Failed to parse request body:', error)
      return Response.json(
        { error: 'Invalid JSON request body' },
        { status: 400 }
      )
    }

    // ── 3. VALIDATE MESSAGES ──────────────────────────────────────────────────
    if (!body?.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      console.error('❌ No messages provided')
      return Response.json(
        { error: 'messages must be a non-empty array' },
        { status: 400 }
      )
    }

    // ── 4. CLEAN MESSAGES ──────────────────────────────────────────────────────
    const messages = body.messages
      .filter((message: any) => message && (message.role === 'user' || message.role === 'assistant'))
      .map((message: any) => {
        let content = ''
        if (typeof message.content === 'string') {
          content = message.content
        } else if (Array.isArray(message.content)) {
          content = message.content
            .filter((item: any) => item?.type === 'text')
            .map((item: any) => item.text || '')
            .join('\n')
        }
        return { role: message.role, content }
      })
      .filter((message: any) => message.content.trim())

    if (messages.length === 0) {
      console.error('❌ No valid messages found')
      return Response.json(
        { error: 'No valid messages found' },
        { status: 400 }
      )
    }

    // ── 5. GET LAST USER MESSAGE ──────────────────────────────────────────────
    const lastUserMessage = [...messages].reverse().find((message: any) => message.role === 'user')
    const userContent = lastUserMessage?.content || ''
    if (!userContent.trim()) {
      console.error('❌ No user message found')
      return Response.json(
        { error: 'No user message found' },
        { status: 400 }
      )
    }
    console.log('💬 User:', userContent.substring(0, 100))

    // ── 6. FETCH KNOWLEDGE FROM SUPABASE ──────────────────────────────────────
    let knowledgeRows: KnowledgeRow[] = []
    let systemPrompt = ''

    try {
      console.log('📚 Fetching knowledge from Supabase...')
      knowledgeRows = await getKnowledge()
      console.log(`✅ Retrieved ${knowledgeRows.length} knowledge rows`)

      // Build the system prompt with the knowledge
      systemPrompt = buildKnowledgePrompt(knowledgeRows)
    } catch (error) {
      console.error('❌ Failed to fetch knowledge:', error)
      // Fallback: use only the behavior prompt without knowledge
      systemPrompt = `${KNOWLEDGE_BEHAVIOR}

━━━ FALLBACK KNOWLEDGE ━━━
- Hahz Terry is a Digital Growth Architect based in Atlanta, GA
- He created ATLWarehouse.com, an AI-powered warehouse automation platform
- He has 20+ years of experience in tech and business
- He specializes in AI workflows, marketing analytics, and blockchain technologies`
    }

    console.log('📝 System prompt built, length:', systemPrompt.length)

    // ── 7. CREATE ANTHROPIC CLIENT ─────────────────────────────────────────────
    const anthropic = new Anthropic({ apiKey })
    console.log('🚀 Starting Claude stream...')

    // ── 8. CREATE ANTHROPIC STREAM WITH SYSTEM PROMPT ────────────────────────
    const stream = anthropic.messages.stream({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 500,
      system: systemPrompt, // ✅ THIS IS THE KEY FIX!
      messages,
    })

    // ── 9. CREATE WEB READABLE STREAM ─────────────────────────────────────────
    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        let fullResponse = ''

        try {
          console.log('📡 Streaming Claude response...')
          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              const text = event.delta.text
              if (text) {
                fullResponse += text
                controller.enqueue(encoder.encode(text))
              }
            }
          }

          console.log('✅ Claude stream complete')
          console.log('📝 Response length:', fullResponse.length)

          if (!fullResponse.trim()) {
            const fallback = 'I was unable to generate a response. Please try again.'
            controller.enqueue(encoder.encode(fallback))
          }

          controller.close()
        } catch (error: any) {
          console.error('❌ STREAM ERROR:', error)
          const errorMessage = '\n\nSorry, something went wrong. Please try again.'
          try {
            controller.enqueue(encoder.encode(errorMessage))
          } catch {}
          try {
            controller.close()
          } catch {}
        }
      },
      cancel() {
        console.log('🛑 Client cancelled stream')
        try { stream.abort() } catch {}
      },
    })

    console.log('📤 Returning streaming response')
    return new Response(readableStream, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Content-Type-Options': 'nosniff',
      },
    })

  } catch (error: any) {
    console.error('❌ CHAT API ERROR')
    console.error('Status:', error?.status)
    console.error('Message:', error?.message)
    return Response.json(
      {
        error: error?.message || 'Anthropic API request failed',
        type: error?.error?.type || error?.name || 'unknown',
      },
      { status: error?.status || 500 }
    )
  }
}