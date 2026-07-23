import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  console.log('=== API CHAT START ===')

  // 1. Check API key
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    console.error('❌ ANTHROPIC_API_KEY is missing')

    return Response.json(
      {
        error: 'ANTHROPIC_API_KEY is not configured',
      },
      { status: 500 }
    )
  }

  console.log('✅ Anthropic API key found')

  // Never log the actual API key
  console.log(
    '🔑 Key prefix:',
    apiKey.substring(0, 10) + '...'
  )

  // 2. Parse request
  let body: {
    messages?: Array<{
      role?: string
      content?: string
    }>
  }

  try {
    body = await req.json()

    console.log(
      '✅ Request received:',
      JSON.stringify(body)
    )
  } catch (error) {
    console.error('❌ Invalid JSON:', error)

    return Response.json(
      {
        error: 'Invalid JSON body',
      },
      { status: 400 }
    )
  }

  // 3. Validate messages
  if (
    !body.messages ||
    !Array.isArray(body.messages) ||
    body.messages.length === 0
  ) {
    console.error('❌ No messages array found')

    return Response.json(
      {
        error: 'No messages provided',
      },
      { status: 400 }
    )
  }

  // 4. Get latest user message
  const lastMessage =
    body.messages[body.messages.length - 1]

  const userContent =
    typeof lastMessage?.content === 'string'
      ? lastMessage.content.trim()
      : ''

  if (!userContent) {
    return Response.json(
      {
        error: 'Message content is empty',
      },
      { status: 400 }
    )
  }

  console.log('💬 User message:', userContent)

  // 5. Initialize Anthropic
  const client = new Anthropic({
    apiKey,
  })

  // 6. Call Anthropic
  try {
    console.log('🚀 Calling Anthropic API...')

    const response = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 150,
      messages: [
        {
          role: 'user',
          content: userContent,
        },
      ],
    })

    console.log('✅ Anthropic responded')

    const textBlock = response.content.find(
      (block) => block.type === 'text'
    )

    const reply =
      textBlock?.type === 'text'
        ? textBlock.text
        : 'No response generated.'

    console.log(
      '📝 Reply:',
      reply.substring(0, 100)
    )

    return Response.json(
      {
        reply,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('❌ Anthropic API error')
    console.error('Status:', error?.status)
    console.error('Message:', error?.message)

    return Response.json(
      {
        error: 'Anthropic API request failed',
        details:
          error?.message || 'Unknown Anthropic error',
      },
      {
        status:
          error?.status >= 400 && error?.status < 600
            ? error.status
            : 500,
      }
    )
  }
}