import { analyze, formatReport } from './core.js'

export const name = 'dsh-plugin-subagent-board'
/** The command registry is the only host service we activate. */
export const inject = ['commands']

interface CommandContext {
  commands: {
    register(command: {
      name: string
      description: string
      input?: { hint?: string }
      handler: (args: { agent?: { session?: { events?: readonly unknown[] } }; rawInput?: string }) =>
        | { kind: 'success'; text: string }
        | { kind: 'error'; text: string }
    }): () => void
  }
  /** Cordis lifecycle scope; registers disposables so disable/reload leaves no duplicate command. */
  effect?: (body: () => Generator, label?: string) => void
  logger?: { info?: (message: string) => void; warn?: (message: string) => void }
}

/**
 * Cordis bundle entry. Registers /agents, a read-only subagent task board view.
 */
export function apply(ctx: CommandContext, config?: unknown): void {
  const dispose = ctx.commands.register({
    name: 'agents',
    description: "See who the subagents are, what each is doing, dependencies, spend and whether results were merged — a read-only task tree.",
    input: { hint: '[--json]' },
    handler: ({ agent, rawInput }) => {
      try {
        const events = Array.isArray(agent?.session?.events) ? agent.session.events : []
        const summary = analyze(events)
        const json = (rawInput ?? '').trim() === '--json'
        return { kind: 'success', text: formatReport(summary, { json }) }
      } catch (error) {
        return { kind: 'error', text: `[agents] failed: ${error instanceof Error ? error.message : String(error)}` }
      }
    },
  })

  if (typeof ctx.effect === 'function') {
    ctx.effect(function* () { yield dispose }, `${name} lifecycle`)
  }

  ctx.logger?.info?.('[dsh-plugin-subagent-board] loaded (read-only; /agents available)')
}
