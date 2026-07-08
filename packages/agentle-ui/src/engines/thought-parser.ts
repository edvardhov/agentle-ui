import { THOUGHT_STEP_STATUSES, type ThoughtStep } from "../types";

export function parseThoughtJsonLine(line: string): ThoughtStep | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  try {
    const parsed = JSON.parse(trimmed) as Partial<ThoughtStep>;
    if (!parsed.id || !parsed.label || !parsed.status) return null;
    if (!(THOUGHT_STEP_STATUSES as readonly string[]).includes(parsed.status)) return null;
    return {
      id: parsed.id,
      label: parsed.label,
      detail: parsed.detail,
      status: parsed.status as ThoughtStep["status"],
    };
  } catch {
    return null;
  }
}

export function mergeThoughtSteps(existing: ThoughtStep[], incoming: ThoughtStep): ThoughtStep[] {
  const index = existing.findIndex((step) => step.id === incoming.id);
  if (index === -1) {
    return [...existing, incoming];
  }

  const next = [...existing];
  next[index] = { ...next[index], ...incoming };
  return next;
}

export function buildThoughtSummary(steps: ThoughtStep[]): string | null {
  const completed = steps.filter((step) => step.status === "complete");
  if (completed.length === 0) return null;

  const labels = completed.map((step) =>
    step.label.replace(/\.{3,}$/, "").trim().toLowerCase(),
  );

  if (labels.length === 1) {
    return labels[0]!.charAt(0).toUpperCase() + labels[0]!.slice(1);
  }

  if (labels.length === 2) {
    return `${capitalize(labels[0]!)} and ${labels[1]!}`;
  }

  const last = labels[labels.length - 1]!;
  const rest = labels.slice(0, -1).join(", ");
  return `${capitalize(rest)}, and ${last}`;
}

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function getActiveThoughtStep(steps: ThoughtStep[]): ThoughtStep | null {
  return steps.find((step) => step.status === "active") ?? null;
}

export function isThoughtStreamComplete(steps: ThoughtStep[], streamDone: boolean): boolean {
  if (!streamDone && steps.length === 0) return false;
  if (steps.length === 0) return streamDone;
  return !steps.some((step) => step.status === "active") && streamDone;
}
