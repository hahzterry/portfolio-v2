import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  console.log('🔥 CHAT ROUTE WAS REACHED')

  return Response.json({
    success: true,
    message: 'Chat API route is working',
  })
}