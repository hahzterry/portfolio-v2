import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  console.log('=== API CHAT START ===')

  // ── 1. Check API Key ──────────────────────────────────────────────────────
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY is missing')
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
  console.log('✅ API key found')

  // ── 2. Parse Request Body Safely ────────────────────────────────────────
  let body
  try {
    body = await req.json()
    console.log('✅ Request parsed:', body)
  } catch (err) {
    console.error('❌ Failed to parse request:', err)
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // ── 3. Validate Messages ─────────────────────────────────────────────────
  const messages = body.messages
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    console.error('❌ No messages array found')
    return new Response(
      JSON.stringify({ error: 'No messages provided' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const lastMessage = messages[messages.length - 1]
  const userContent = lastMessage?.content || 'Hello'
  console.log('💬 User message:', userContent)

  // ── 4. Initialize Anthropic ──────────────────────────────────────────────
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  // ── 5. Call Anthropic ─────────────────────────────────────────────────────
  try {
    console.log('🚀 Calling Anthropic...')

    const response = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 150,
      messages: [{ role: 'user', content: userContent }],
    })

    console.log('✅ Anthropic responded')

    const reply = response.content[0].type === 'text' 
      ? response.content[0].text 
      : 'No response'

    console.log('📝 Reply:', reply.slice(0, 50))

    return new Response(
      JSON.stringify({ reply }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('❌ Anthropic API error:', err)
    return new Response(
      JSON.stringify({ 
        error: 'Anthropic API error', 
        details: (err as Error).message 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}