import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  console.log('[test] === START ===')
  console.log('[test] ANTHROPIC_API_KEY exists?', !!process.env.ANTHROPIC_API_KEY)

  // 1. Check API key
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // 2. Parse request
  let messages
  try {
    const body = await req.json()
    messages = body.messages
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid request body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const lastMessage = messages?.[messages.length - 1]?.content || 'Hello'

  // 3. Initialize Anthropic
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  console.log('[test] Calling Anthropic with message:', lastMessage)

  try {
    // 4. Make a simple, non-streaming call first (easier to debug)
    const response = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 100,
      messages: [{ role: 'user', content: lastMessage }],
    })

    const reply = response.content[0].type === 'text' ? response.content[0].text : 'No response'

    console.log('[test] ✅ Anthropic responded:', reply.slice(0, 50))

    // Return as JSON (not streaming) for easier testing
    return new Response(
      JSON.stringify({ reply }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('[test] ❌ Anthropic error:', err)
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}