import { createClient } from '@supabase/supabase-js'

// Server-only — uses the service role key, never exposed to the browser.
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export interface ChatLog {
  question: string
  answer:   string
  blocked:  boolean
}

/** Fire-and-forget log write. Call without await so it never blocks the response. */
export async function logChat(entry: ChatLog) {
  const { error } = await supabase.from('chat_logs').insert(entry)
  if (error) console.error('[chat_logs] insert error:', error.message)
}

// ─── Knowledge base ──────────────────────────────────────────────────────────
export interface KnowledgeRow {
  category: string
  title:    string
  content:  string
  priority: number
}

/** Read every knowledge row, ordered by category then priority desc. */
export async function getKnowledge(): Promise<KnowledgeRow[]> {
  const { data, error } = await supabase
    .from('knowledge')
    .select('category, title, content, priority')
    .order('category', { ascending: true })
    .order('priority', { ascending: false })

  if (error) {
    console.error('[knowledge] fetch error:', error.message)
    return []
  }
  return (data ?? []) as KnowledgeRow[]
}