import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  console.log('=== /api/chat POST START ===')

  try {
    // Check environment variable
    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      console.error('❌ ANTHROPIC_API_KEY is missing')

      return Response.json(
        {
          error: 'Server configuration error',
          details: 'ANTHROPIC_API_KEY is missing',
        },
        { status: 500 }
      )
    }

    console.log('✅ ANTHROPIC_API_KEY exists')

    // Parse body
    const body = await req.json()

    console.log('✅ Request body parsed')

    // Validate messages
    if (
      !body ||
      !Array.isArray(body.messages) ||
      body.messages.length === 0
    ) {
      console.error('❌ Invalid messages')

      return Response.json(
        {
          error: 'Invalid request',
          details: 'messages must be a non-empty array',
        },
        { status: 400 }
      )
    }

    // Get last message
    const lastMessage =
      body.messages[body.messages.length - 1]

    if (!lastMessage) {
      return Response.json(
        {
          error: 'No message found',
        },
        { status: 400 }
      )
    }

    // Handle content
    let userContent = ''

    if (typeof lastMessage.content === 'string') {
      userContent = lastMessage.content
    } else if (Array.isArray(lastMessage.content)) {
      userContent = lastMessage.content
        .filter(
          (item: any) =>
            item.type === 'text' &&
            typeof item.text === 'string'
        )
        .map((item: any) => item.text)
        .join('\n')
    }

    if (!userContent.trim()) {
      return Response.json(
        {
          error: 'Empty message',
        },
        { status: 400 }
      )
    }

    console.log(
      '💬 User message:',
      userContent.substring(0, 100)
    )

    // Create Anthropic client
    const anthropic = new Anthropic({
      apiKey: apiKey.trim(),
    })

    console.log('🚀 Sending request to Anthropic')

    // Call Claude
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: userContent,
        },
      ],
    })

    console.log('✅ Anthropic request successful')

    // Extract response
    const textContent = response.content.find(
      (block) => block.type === 'text'
    )

    const reply =
      textContent && textContent.type === 'text'
        ? textContent.text
        : 'I was unable to generate a response.'

    return Response.json(
      {
        reply,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('❌ /api/chat ERROR')

    console.error(
      'Error status:',
      error?.status
    )

    console.error(
      'Error message:',
      error?.message
    )

    console.error(
      'Error type:',
      error?.error?.type
    )

    // Anthropic authentication failure
    if (error?.status === 401) {
      return Response.json(
        {
          error: 'Anthropic authentication failed',
          details:
            'The ANTHROPIC_API_KEY is invalid or expired.',
        },
        { status: 502 }
      )
    }

    return Response.json(
      {
        error: 'Chat request failed',
        details:
          error?.message ||
          'Unknown server error',
      },
      {
        status:
          typeof error?.status === 'number'
            ? error.status
            : 500,
      }
    )
  }
}