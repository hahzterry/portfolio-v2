import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  console.log('=== CHAT API START ===')

  try {
    // ==========================================
    // 1. CHECK ANTHROPIC API KEY
    // ==========================================

    const apiKey =
      process.env.ANTHROPIC_API_KEY?.trim()

    if (!apiKey) {
      console.error(
        '❌ ANTHROPIC_API_KEY is missing'
      )

      return Response.json(
        {
          error:
            'ANTHROPIC_API_KEY is not configured in Vercel Production',
        },
        {
          status: 500,
        }
      )
    }

    console.log(
      '✅ ANTHROPIC_API_KEY is configured'
    )

    // ==========================================
    // 2. PARSE REQUEST
    // ==========================================

    let body: any

    try {
      body = await req.json()
    } catch (error) {
      console.error(
        '❌ Failed to parse request body:',
        error
      )

      return Response.json(
        {
          error:
            'Invalid JSON request body',
        },
        {
          status: 400,
        }
      )
    }

    // ==========================================
    // 3. VALIDATE MESSAGES
    // ==========================================

    if (
      !body?.messages ||
      !Array.isArray(body.messages) ||
      body.messages.length === 0
    ) {
      console.error(
        '❌ No messages provided'
      )

      return Response.json(
        {
          error:
            'messages must be a non-empty array',
        },
        {
          status: 400,
        }
      )
    }

    // ==========================================
    // 4. CLEAN MESSAGE HISTORY
    // ==========================================

    const messages = body.messages
      .filter(
        (message: any) =>
          message &&
          (message.role === 'user' ||
            message.role === 'assistant')
      )
      .map((message: any) => {
        let content = ''

        // Normal string content
        if (
          typeof message.content ===
          'string'
        ) {
          content = message.content
        }

        // Array content
        else if (
          Array.isArray(
            message.content
          )
        ) {
          content =
            message.content
              .filter(
                (item: any) =>
                  item?.type === 'text'
              )
              .map(
                (item: any) =>
                  item.text || ''
              )
              .join('\n')
        }

        return {
          role: message.role,
          content,
        }
      })
      .filter(
        (message: any) =>
          message.content.trim()
      )

    if (messages.length === 0) {
      console.error(
        '❌ No valid messages found'
      )

      return Response.json(
        {
          error:
            'No valid messages found',
        },
        {
          status: 400,
        }
      )
    }

    // ==========================================
    // 5. GET LAST USER MESSAGE
    // ==========================================

    const lastUserMessage =
      [...messages]
        .reverse()
        .find(
          (message: any) =>
            message.role === 'user'
        )

    const userContent =
      lastUserMessage?.content || ''

    if (!userContent.trim()) {
      console.error(
        '❌ No user message found'
      )

      return Response.json(
        {
          error:
            'No user message found',
        },
        {
          status: 400,
        }
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
    // 6. CREATE ANTHROPIC CLIENT
    // ==========================================

    const anthropic =
      new Anthropic({
        apiKey,
      })

    console.log(
      '🚀 Starting Claude stream...'
    )

    // ==========================================
    // 7. CREATE ANTHROPIC STREAM
    // ==========================================

    const stream =
      anthropic.messages.stream({
        model:
          'claude-haiku-4-5-20251001',

        max_tokens: 500,

        messages,
      })

    // ==========================================
    // 8. CREATE WEB READABLE STREAM
    // ==========================================

    const readableStream =
      new ReadableStream({
        async start(
          controller
        ) {
          const encoder =
            new TextEncoder()

          let fullResponse = ''

          try {
            console.log(
              '📡 Streaming Claude response...'
            )

            for await (
              const event of stream
            ) {
              // Claude text streaming event
              if (
                event.type ===
                  'content_block_delta' &&
                event.delta.type ===
                  'text_delta'
              ) {
                const text =
                  event.delta.text

                if (text) {
                  fullResponse += text

                  controller.enqueue(
                    encoder.encode(
                      text
                    )
                  )
                }
              }
            }

            console.log(
              '✅ Claude stream complete'
            )

            console.log(
              '📝 Response length:',
              fullResponse.length
            )

            // Make sure the browser
            // receives something
            if (
              !fullResponse.trim()
            ) {
              const fallback =
                'I was unable to generate a response. Please try again.'

              controller.enqueue(
                encoder.encode(
                  fallback
                )
              )
            }

            controller.close()
          } catch (error: any) {
            console.error(
              '❌ STREAM ERROR:',
              error
            )

            console.error(
              'Status:',
              error?.status
            )

            console.error(
              'Message:',
              error?.message
            )

            // IMPORTANT:
            // If streaming has already
            // started, don't attempt to
            // return JSON because the
            // response is already a stream.

            const errorMessage =
              '\n\nSorry, something went wrong while generating the response. Please try again.'

            try {
              controller.enqueue(
                encoder.encode(
                  errorMessage
                )
              )
            } catch {
              // Stream may already
              // be closed
            }

            try {
              controller.close()
            } catch {
              // Stream may already
              // be closed
            }
          }
        },

        cancel() {
          console.log(
            '🛑 Client cancelled stream'
          )

          try {
            stream.abort()
          } catch (error) {
            console.error(
              'Error aborting stream:',
              error
            )
          }
        },
      })

    // ==========================================
    // 9. RETURN STREAM
    // ==========================================

    console.log(
      '📤 Returning streaming response'
    )

    return new Response(
      readableStream,
      {
        status: 200,

        headers: {
          'Content-Type':
            'text/plain; charset=utf-8',

          'Cache-Control':
            'no-cache, no-transform',

          'Connection':
            'keep-alive',

          'X-Content-Type-Options':
            'nosniff',
        },
      }
    )
  } catch (error: any) {
    // ==========================================
    // 10. HANDLE API ERRORS
    // ==========================================

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
          error?.status || 500,
      }
    )
  }
}