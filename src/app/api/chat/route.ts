try {
  stream = client.messages.stream({ ... })
} catch (err) {
  return new Response(
    JSON.stringify({ error: 'Failed to create AI response stream' }),
    { status: 500 }
  )
}