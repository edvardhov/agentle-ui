import type { AgentAction } from "agentle-ui";

const ACTION_DELAY_MS = 1100;

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

export async function runActionSimulation(
  onUpdate: (actions: AgentAction[]) => void,
  signal?: AbortSignal,
): Promise<void> {
  const actions: AgentAction[] = [
    {
      id: "1",
      name: "web_search",
      status: "running",
      input: { query: "layout shift streaming markdown" },
    },
    {
      id: "2",
      name: "read_file",
      status: "running",
      input: { path: "packages/agentle-ui/src/hooks/use-stabilized-markdown.ts" },
    },
  ];

  onUpdate(actions);
  await sleep(ACTION_DELAY_MS, signal);

  onUpdate([
    {
      ...actions[0]!,
      status: "success",
      output: { results: 12 },
      startedAt: Date.now() - 1200,
      completedAt: Date.now(),
    },
    actions[1]!,
  ]);

  await sleep(ACTION_DELAY_MS, signal);

  onUpdate([
    {
      ...actions[0]!,
      status: "success",
      output: { results: 12 },
      startedAt: Date.now() - 2400,
      completedAt: Date.now() - 1200,
    },
    {
      ...actions[1]!,
      status: "success",
      output: { lines: 168 },
      startedAt: Date.now() - 1200,
      completedAt: Date.now(),
    },
    {
      id: "3",
      name: "summarize",
      status: "running",
      input: { model: "gpt-4.1" },
    },
  ]);

  await sleep(ACTION_DELAY_MS, signal);

  onUpdate([
    {
      ...actions[0]!,
      status: "success",
      output: { results: 12 },
      startedAt: Date.now() - 3600,
      completedAt: Date.now() - 2400,
    },
    {
      ...actions[1]!,
      status: "success",
      output: { lines: 168 },
      startedAt: Date.now() - 2400,
      completedAt: Date.now() - 1200,
    },
    {
      id: "3",
      name: "summarize",
      status: "error",
      error: "Rate limit exceeded",
      startedAt: Date.now() - 1200,
      completedAt: Date.now(),
    },
  ]);
}
