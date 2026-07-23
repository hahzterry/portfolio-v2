import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

// ─── SYSTEM PROMPT (Hardcoded for now) ──────────────────────────────────────
const SYSTEM_PROMPT = `You are Wizard of Hahz — a portfolio guide for Hahz Terry. You are friendly, concise, and helpful. You help visitors understand Hahz's professional world.

━━━ ABOUT HAHZ TERRY ━━━
Hahz Terry is a Digital Growth Architect based in Atlanta, GA.

━ BACKGROUND ━
- 20+ years of experience in tech and business
- Scaled a commercial organization from $20M to $100M
- Steward of $50M+ in Fortune 500 media spend (Delta, Walmart, Mastercard, Netflix, Atlanta Braves, Marriott)
- Created atlwarehouse.com, an AI and AR warehouse WMS automation platform

━ SKILLS ━
- Brand Strategy & Architecture
- Digital Ecosystem Engineering
- CRM & Automation (Salesforce, Pardot, HubSpot)
- AI/ML Personalization Engines
- Paid Media Leadership
- B2B Sales & Pipeline Management
- Emerging Tech Integration (Blockchain, AI, AR, Web3)

━ PROJECTS ━
- ATLWarehouse.com: AI/AR warehouse WMS automation platform
- Logis (Logistics Sentry): Supply chain risk monitoring
- RWATOK.LAND: Global addressing system using 3-word addresses
- RNTBNB: Blockchain rental property platform

━ EXPERIENCE ━
- Executive Marketing Director: Masterpiece Advertising (2024-2025) – Scaled revenue from $204K to $1.8M
- Web3 Project Manager Lead: A5 Labs (2020-2022) – Led team to create first poker metaverse
- Marketing Director: PPC Marketing (2010-2020) – Directed $50M+ in Fortune 500 campaigns

━ ACHIEVEMENTS ━
- 2x NFT.NYC Speaker
- Top 1% TikTok AR Effect Creator
- 2x Hackernoon 2025 Award Winner

━━━ HOW TO BEHAVE ━━━
- You are Wizard of Hahz, Hahz's guide — not Hahz himself
- Be concise: 2–4 sentences is usually enough
- For NDA projects, acknowledge they exist but explain you can't share internal details
- Encourage visitors to email hahz5d@pm.me for deep conversations or collaboration
- If a question is borderline off-topic but good-natured, answer briefly and redirect
- NEVER say you're an AI assistant or mention Anthropic, Claude, or that you were trained on data

━━━ EXAMPLE RESPONSE ━━━
User: "What is your background?"
Response: "I'm Wizard of Hahz — Hahz Terry is a Digital Growth Architect based in Atlanta with 20+ years of experience. He's scaled companies from $20M to $100M, built ATLWarehouse.com (an AI warehouse platform), and directed $50M+ in Fortune 500 campaigns. Anything specific you'd like to know about his work?"`

export async function POST(req: NextRequest) {
  console.log('=== CHAT API START ===')

  try {
    // ── 1. Check API Key ──────────────────────────────────────────────────────
    const apiKey = process.env.ANTHROPIC_API_KEY?.trim()
    if (!apiKey) {
      console.error('❌ ANTHROPIC_API_KEY is missing')
      return Response.json(
        { error: 'ANTHROPIC_API_KEY is not configured' },
        { status: 500 }
      )
    }
    console.log('✅ ANTHROPIC_API_KEY is configured')

    // ── 2. Parse Request ──────────────────────────────────────────────────────
    let body: any
    try {
      body = await req.json()
    } catch {
      console.error('❌ Failed to parse request body')
      return Response.json(
        { error: 'Invalid JSON request body' },
        { status: 400 }
      )
    }

    // ── 3. Validate Messages ──────────────────────────────────────────────────
    if (!body?.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      console.error('❌ No messages provided')
      return Response.json(
        { error: 'messages must be a non-empty array' },
        { status: 400 }
      )
    }

    // ── 4. Clean Messages ──────────────────────────────────────────────────────
    const messages = body.messages
      .filter((m: any) => m && (m.role === 'user' || m.role === 'assistant'))
      .map((m: any) => {
        let content = ''
        if (typeof m.content === 'string') {
          content = m.content
        } else if (Array.isArray(m.content)) {
          content = m.content
            .filter((item: any) => item?.type === 'text')
            .map((item: any) => item.text || '')
            .join('\n')
        }
        return { role: m.role, content }
      })
      .filter((m: any) => m.content.trim())

    if (messages.length === 0) {
      console.error('❌ No valid messages found')
      return Response.json(
        { error: 'No valid messages found' },
        { status: 400 }
      )
    }

    console.log('💬 Messages:', messages.length)

    // ── 5. Create Anthropic Client ────────────────────────────────────────────
    const anthropic = new Anthropic({ apiKey })
    console.log('🚀 Creating Claude stream...')

    // ── 6. Create Stream WITH System Prompt ──────────────────────────────────
    const stream = anthropic.messages.stream({
      model: 'claude-3-5-haiku-20241022', // ✅ Valid model name
      max_tokens: 500,
      system: SYSTEM_PROMPT, // ✅ THIS IS THE CRITICAL FIX!
      messages,
    })

    // ── 7. Create Readable Stream ─────────────────────────────────────────────
    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        let fullResponse = ''

        try {
          console.log('📡 Streaming...')
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

          console.log('✅ Stream complete. Length:', fullResponse.length)

          if (!fullResponse.trim()) {
            const fallback = "I'm Wizard of Hahz. Hahz Terry is a Digital Growth Architect based in Atlanta with 20+ years of experience. He built ATLWarehouse.com and has directed $50M+ in Fortune 500 campaigns. What would you like to know about his work?"
            controller.enqueue(encoder.encode(fallback))
          }

          controller.close()
        } catch (error: any) {
          console.error('❌ Stream error:', error)
          const errorMsg = "\n\nSorry, something went wrong. Please try again."
          try {
            controller.enqueue(encoder.encode(errorMsg))
          } catch {}
          try {
            controller.close()
          } catch {}
        }
      },
      cancel() {
        console.log('🛑 Stream cancelled')
        try { stream.abort() } catch {}
      },
    })

    console.log('📤 Returning stream')
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
    console.error('❌ API Error:', error.message)
    return Response.json(
      { error: error?.message || 'API request failed' },
      { status: error?.status || 500 }
    )
  }
}