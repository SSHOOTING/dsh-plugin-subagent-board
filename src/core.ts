/**
 * Pure, dependency-free core for dsh-plugin-subagent-board (Subagent Task Board).
 * Reads only metadata from session events; never prompts, tool bodies or file contents.
 */

const SECRET_RE = /((?:token|key|secret|password|authorization|bearer)[^\s:=]{0,24}[:=]\s*)[^\s&]+/gi
const QUERY_RE = /([?&](?:token|key|secret|password|auth)=)[^&#\s]+/gi
/** Strip credential-looking substrings before anything is printed. */
export function redact(value: unknown): string {
  const text = value instanceof Error ? value.stack || value.message : String(value)
  return text.replace(SECRET_RE, '$1[redacted]').replace(QUERY_RE, '$1[redacted]')
}
export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function analyze(events: readonly unknown[]): any {
  const list = Array.isArray(events) ? events : []
  const agents = new Map<any, any>()
  for (const e of list) {
    if (!isRecord(e) || !isRecord(e.data)) continue
    const id = typeof e.data.agentId === 'string' ? e.data.agentId
      : typeof e.data.sessionId === 'string' ? e.data.sessionId : ''
    if (!id) continue
    const row = agents.get(id) || { id, events: 0, lastType: '', merged: false }
    row.events++
    row.lastType = typeof e.type === 'string' ? e.type : ''
    if (typeof e.type === 'string' && (e.type.includes('merge') || e.type.includes('result'))) row.merged = true
    agents.set(id, row)
  }
  const rows = [...agents.values()].sort((a, b) => b.events - a.events)
  return { sampledEvents: list.length, agents: rows, total: rows.length, merged: rows.filter(r => r.merged).length }
}

export function formatReport(a: any, opts: { json?: boolean } = {}): string {
  if (opts.json) return JSON.stringify(a, null, 2)
  const head = '[agents] ' + a.total + ' subagent(s) · ' + a.merged + ' result(s) merged'
  if (a.agents.length === 0) return head + '\n  no subagent activity observed yet'
  const lines = a.agents.slice(0, 15).map(r =>
    '  ' + redact(r.id) + '  ' + r.events + ' event(s)  last=' + redact(r.lastType) + (r.merged ? '  MERGED' : ''))
  return [head, ...lines].join('\n')
}
