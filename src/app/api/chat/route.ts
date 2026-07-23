import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  console.log('=== CHAT API START ===')

  try {
    // ==========================================
    // 1. CHECK ANTHROPIC API KEY
    // ==========================================

    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      console.error(
        '❌ ANTHROPIC_API_KEY is missing'
      )

      return Response.json(
        {
          error:
            'ANTHROPIC_API_KEY is not configured in Vercel',
        },
        { status: 500 }
      )
    }

    console.log(
      '✅ ANTHROPIC_API_KEY is configured'
    )

    // ==========================================
    // 2. PARSE REQUEST
    // ==========================================

    const body = await req.json()

    // ==========================================
    // 3. VALIDATE MESSAGES
    // ==========================================

    if (
      !body?.messages ||
      !Array.isArray(body.messages) ||
      body.messages.length === 0
    ) {
      return Response.json(
        {
          error:
            'messages must be a non-empty array',
        },
        { status: 400 }
      )
    }

    // ==========================================
    // 4. GET LAST USER MESSAGE
    // ==========================================

    const lastMessage =
      body.messages[
        body.messages.length - 1
      ]

    let userContent = ''

    if (
      typeof lastMessage?.content === 'string'
    ) {
      userContent =
        lastMessage.content
    } else if (
      Array.isArray(
        lastMessage?.content
      )
    ) {
      userContent =
        lastMessage.content
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
          error:
            'Message content is empty',
        },
        { status: 400 }
      )
    }

    console.log(
      '💬 User:',
      userContent.substring(
        0,
        100
      )
    )

    // ==========================================
    // 5. CREATE ANTHROPIC CLIENT
    // ==========================================

    const anthropic =
      new Anthropic({
        apiKey:
          apiKey.trim(),
      })

    console.log(
      '🚀 Calling Anthropic...'
    )

    // ==========================================
    // 6. CALL CLAUDE
    // ==========================================

    const response =
      await anthropic.messages.create({
        model:
          'claude-haiku-4-5-20251001',

        max_tokens: 500,

        messages: [
          {
            role: 'user',
            content:
              userContent,
          },
        ],
      })

    console.log(
      '✅ Anthropic responded'
    )

    // ==========================================
    // 7. EXTRACT RESPONSE
    // ==========================================

    const textBlock =
      response.content.find(
        (block) =>
          block.type === 'text'
      )

    const reply =
      textBlock?.type === 'text'
        ? textBlock.text
        : 'No response generated.'

    console.log(
      '📝 Claude:',
      reply.substring(
        0,
        100
      )
    )

    // ==========================================
    // 8. RETURN RESPONSE
    // ==========================================

    return Response.json({
      reply,
    })
  } catch (error: any) {
    console.error(
      '❌ CHAT API ERROR'
    )

    console.error(
      'Status:',
      error?.status
    )

    console.error(
      'Message:',
      error?.message
    )

    console.error(
      'Type:',
      error?.error?.type
    )

    return Response.json(
      {
        error:
          error?.message ||
          'Anthropic API request failed',

        type:
          error?.error?.type ||
          error?.name ||
          'unknown',
      },
      {
        status:
          error?.status ||
          500,
      }
    )
  }
}