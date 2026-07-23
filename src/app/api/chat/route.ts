import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

// ─── SYSTEM PROMPT ──────────────────────────────────────────────────────────
// This tells Claude WHO it is and WHAT to say
const SYSTEM_PROMPT = `You are Wizard of Hahz — a portfolio guide for Hahz Terry.

You answer questions about Hahz Terry, his work, projects, and background.

Hahz Terry is a Digital Growth Architect based in Atlanta, GA.
- 20+ years of experience in tech and business
- Created ATLWarehouse.com, an AI warehouse automation platform
- Directed $50M+ in Fortune 500 campaigns (Delta, Walmart, Netflix)
- Scaled companies from $20M to $100M
- Built RNTBNB (blockchain rental platform) and RWATOK.LAND (3-word address system)

You are NOT Claude or an AI assistant. You are ONLY Wizard of Hahz.
Be concise, helpful, and always stay on topic about Hahz's work.
If asked something unrelated, politely redirect to Hahz's work.

Never mention that you are an AI, trained on data, or made by Anthropic.`

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
    console.log('✅ API key found')

    // ── 2. Parse Request ──────────────────────────────────────────────────────
    let body
    try {
      body = await req.json()
    } catch {
      return Response.json(
        { error: 'Invalid JSON request body' },
        { status: 400 }
      )
    }

    if (!body?.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return Response.json(
        { error: 'messages must be a non-empty array' },
        { status: 400 }
      )
    }

    // ── 3. Clean Messages ──────────────────────────────────────────────────────
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
      return Response.json(
        { error: 'No valid messages found' },
        { status: 400 }
      )
    }

    console.log('💬 User:', messages[messages.length - 1]?.content?.substring(0, 50))

    // ── 4. Create Anthropic Client ────────────────────────────────────────────
    const anthropic = new Anthropic({ apiKey })
    console.log('🚀 Creating stream...')

    // ── 5. Create Stream (USING THE SAME MODEL THAT WORKED) ──────────────────
    const stream = await anthropic.messages.stream({
      model: 'claude-haiku-4-5-20251001', // ✅ The model that worked in your code
      max_tokens: 500,
      system: SYSTEM_PROMPT, // ✅ CRITICAL FIX: This tells Claude who it is
      messages: messages,
    })

    // ── 6. Create Readable Stream ─────────────────────────────────────────────
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
            const fallback = "I'm Wizard of Hahz. Hahz Terry is a Digital Growth Architect based in Atlanta with 20+ years of experience. He built ATLWarehouse.com and directed $50M+ in Fortune 500 campaigns. What would you like to know?"
            controller.enqueue(encoder.encode(fallback))
          }

          controller.close()
        } catch (error: any) {
          console.error('❌ Stream error:', error)
          const errorMsg = '\n\nSorry, something went wrong. Please try again.'
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
        try {
          stream.abort()
        } catch {}
      },
    })

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