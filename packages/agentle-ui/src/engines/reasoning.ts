import type { ThoughtStep } from "../types";
import { openAIStreamToText } from "./sse";

export interface TextToThoughtStepOptions {
  id?: string;
  label?: string;
  completedLabel?: string;
}

export type OpenAIReasoningToThoughtsOptions = TextToThoughtStepOptions;

function formatThoughtLine(step: ThoughtStep): string {
  return `${JSON.stringify(step)}\n`;
}

export async function* textToThoughtStep(
  source: AsyncIterable<string>,
  options: TextToThoughtStepOptions = {},
): AsyncIterable<string> {
  const id = options.id ?? "reasoning";
  const label = options.label ?? "Thinking…";
  const completedLabel = options.completedLabel ?? "Thought process";
  let detail = "";
  let emitted = false;

  for await (const chunk of source) {
    if (!chunk) continue;
    detail += chunk;
    emitted = true;
    yield formatThoughtLine({
      id,
      label,
      status: "active",
      detail,
    });
  }

  if (!emitted) {
    return;
  }

  yield formatThoughtLine({
    id,
    label: completedLabel,
    status: "complete",
    detail,
  });
}

export async function* openAIReasoningToThoughts(
  source: ReadableStream<Uint8Array> | Response,
  options: OpenAIReasoningToThoughtsOptions = {},
): AsyncIterable<string> {
  yield* textToThoughtStep(openAIStreamToText(source, { field: "reasoning" }), options);
}
