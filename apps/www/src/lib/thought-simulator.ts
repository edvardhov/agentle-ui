import { mergeThoughtSteps, type ThoughtStep } from "agentle-ui";

const STEP_DELAY_MS = 900;
const FINAL_DELAY_MS = 400;

export interface ThoughtStepDef {
  label: string;
  detail?: string;
}

export const DEMO_STEPS: ThoughtStepDef[] = [
  { label: "Searching the web...", detail: "query: agentic UI patterns" },
  { label: "Reading 3 files...", detail: "hooks/use-thought-stream.ts" },
  { label: "Writing response...", detail: "markdown stabilizer" },
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
  stepDefs: ThoughtStepDef[],
  onUpdate: (steps: ThoughtStep[]) => void,
  signal?: AbortSignal,
): Promise<void> {
  let steps: ThoughtStep[] = [];

  for (let index = 0; index < stepDefs.length; index += 1) {
    const template = stepDefs[index]!;
    const id = String(index + 1);

    if (signal?.aborted) return;

    steps = mergeThoughtSteps(steps, { id, ...template, status: "active" });
    onUpdate([...steps]);
    await sleep(STEP_DELAY_MS, signal);

    steps = mergeThoughtSteps(steps, { id, ...template, status: "complete" });
    onUpdate([...steps]);
    await sleep(FINAL_DELAY_MS, signal);
  }
}
