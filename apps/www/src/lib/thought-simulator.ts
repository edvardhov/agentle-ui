import { mergeThoughtSteps, type ThoughtStep } from "agentle-ui";

const STEP_DELAY_MS = 900;
const FINAL_DELAY_MS = 400;

const DEMO_STEPS: Omit<ThoughtStep, "status">[] = [
  { id: "1", label: "Searching the web...", detail: "query: agentic UI patterns" },
  { id: "2", label: "Reading 3 files...", detail: "hooks/use-thought-stream.ts" },
  { id: "3", label: "Writing response...", detail: "markdown stabilizer" },
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

export async function runThoughtSimulation(
  onUpdate: (steps: ThoughtStep[]) => void,
  signal?: AbortSignal,
): Promise<void> {
  let steps: ThoughtStep[] = [];

  for (const template of DEMO_STEPS) {
    if (signal?.aborted) return;

    steps = mergeThoughtSteps(steps, { ...template, status: "active" });
    onUpdate([...steps]);
    await sleep(STEP_DELAY_MS, signal);

    steps = mergeThoughtSteps(steps, { ...template, status: "complete" });
    onUpdate([...steps]);
    await sleep(FINAL_DELAY_MS, signal);
  }
}
