import type { AgentAction } from "agentle-ui";

const ACTION_DELAY_MS = 1100;

export type ActionOutcome = "success" | "error";

export interface ActionDef {
  name: string;
  input: string;
  outcome: ActionOutcome;
  output?: string;
  error?: string;
}

export const DEMO_ACTIONS: ActionDef[] = [
  {
    name: "web_search",
    input: '{"query":"layout shift streaming markdown"}',
    outcome: "success",
    output: '{"results":12}',
  },
  {
    name: "read_file",
    input: '{"path":"packages/agentle-ui/src/hooks/use-stabilized-markdown.ts"}',
    outcome: "success",
    output: '{"lines":168}',
  },
  {
    name: "summarize",
    input: '{"model":"gpt-4.1"}',
    outcome: "error",
    error: "Rate limit exceeded",
  },
];

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

export function parseActionInput(raw: string): Record<string, unknown> {
  const trimmed = raw.trim();
  if (!trimmed) return {};
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // Fall through to simple wrapper.
  }
  return { value: trimmed };
}

export function parseActionOutput(raw: string | undefined): unknown {
  if (!raw?.trim()) return undefined;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return raw;
  }
}

export async function runActionSimulation(
  actionDefs: ActionDef[],
  onUpdate: (actions: AgentAction[]) => void,
  signal?: AbortSignal,
): Promise<void> {
  const actions: AgentAction[] = [];

  for (let index = 0; index < actionDefs.length; index += 1) {
    const def = actionDefs[index]!;
    const id = String(index + 1);
    const startedAt = Date.now();

    if (signal?.aborted) return;

    actions[index] = {
      id,
      name: def.name,
      status: "running",
      input: parseActionInput(def.input),
      startedAt,
    };
    onUpdate([...actions]);

    await sleep(ACTION_DELAY_MS, signal);

    const completedAt = Date.now();
    actions[index] = {
      id,
      name: def.name,
      status: def.outcome === "error" ? "error" : "success",
      input: parseActionInput(def.input),
      output: def.outcome === "success" ? parseActionOutput(def.output) : undefined,
      error: def.outcome === "error" ? def.error || "Action failed" : undefined,
      startedAt,
      completedAt,
    };
    onUpdate([...actions]);
  }
}
