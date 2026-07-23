import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  console.log('=== CHAT API v3 START ===')

  // Check API key
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    console.error('CHAT API ERROR: Missing ANTHROPIC_API_KEY')

    return Response.json(
      {
        error: 'Missing ANTHROPIC_API_KEY',
      },
      {
        status: 500,
      }
    )
  }

  console.log('CHAT API: API key exists')

  // Parse request
  let body: any

  try {
    body = await req.json()
  } catch {
    console.error('CHAT API ERROR: Invalid JSON')

    return Response.json(
      {
        error: 'Invalid JSON body',
      },
      {
        status: 400,
      }
    )
  }

  // Validate messages
  if (
    !body?.messages ||
    !Array.isArray(body.messages) ||
    body.messages.length === 0
  ) {
    console.error('CHAT API ERROR: No messages')

    return Response.json(
      {
        error: 'No messages provided',
      },
      {
        status: 400,
      }
    )
  }

  // Get latest message
  const lastMessage =
    body.messages[body.messages.length - 1]

  let userContent = ''

  if (typeof lastMessage.content === 'string') {
    userContent = lastMessage.content
  } else if (Array.isArray(lastMessage.content)) {
    userContent = lastMessage.content
      .filter(
        (item: any) =>
          item?.type === 'text'
      )
      .map(
        (item: any) =>
          item.text
      )
      .join('\n')
  }

  if (!userContent.trim()) {
    return Response.json(
      {
        error: 'Empty message',
      },
      {
        status: 400,
      }
    )
  }

  console.log(
    'CHAT API: Message:',
    userContent.substring(0, 100)
  )

  // Create Anthropic client
  const anthropic = new Anthropic({
    apiKey: apiKey.trim(),
  })

  console.log(
    'CHAT API: Calling Anthropic'
  )

  // Call Anthropic
  try {
    const response =
      await anthropic.messages.create({
        model:
          'claude-3-5-haiku-20241022',

        max_tokens: 500,

        messages: [
          {
            role: 'user',
            content: userContent,
          },
        ],
      })

    console.log(
      'CHAT API: Anthropic success'
    )

    const textBlock =
      response.content.find(
        (block) =>
          block.type === 'text'
      )

    const reply =
      textBlock?.type === 'text'
        ? textBlock.text
        : ''

    return Response.json({
      reply,
    })
  } catch (error: any) {
    console.error(
      'CHAT API: Anthropic failed'
    )

    console.error(
      'STATUS:',
      error?.status
    )

    console.error(
      'MESSAGE:',
      error?.message
    )

    console.error(
      'ERROR:',
      JSON.stringify(
        error?.error || {}
      )
    )

    // IMPORTANT:
    // Return the real Anthropic status.
    // Do NOT convert 401 to 502.

    return Response.json(
      {
        error:
          error?.message ||
          'Anthropic API error',

        anthropic_status:
          error?.status ||
          null,

        anthropic_type:
          error?.error?.type ||
          null,
      },
      {
        status:
          error?.status || 500,
      }
    )
  }
}