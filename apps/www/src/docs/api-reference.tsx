import { AnchorHeading } from "../components/docs/anchor-heading";
import { CodeBlock } from "../components/docs/code-block";
import { Pill } from "../components/docs/pill";
import { PropsTable } from "../components/docs/props-table";

export function ApiReferencePage() {
  return (
    <>
      <header className="doc-header">
        <Pill>Reference</Pill>
        <h1 className="doc-header__title">API Reference</h1>
        <p className="doc-header__lead">
          Exported hooks, types, stream adapters, and thought-stream helpers from the agentle-ui
          package.
        </p>
      </header>

      <AnchorHeading id="hooks" level={2}>
        Hooks
      </AnchorHeading>
      <PropsTable
        rows={[
          {
            name: "useStabilizedMarkdown",
            type: "(input, options?) => StabilizedMarkdownState",
            description:
              "Markdown block buffering and paint scheduling. Accepts StreamSource. Options: isComplete, settleMs, onError. Returns error on stream failure.",
          },
          {
            name: "useThoughtStream",
            type: "(input, options?) => ThoughtStreamState",
            description:
              "Parse NDJSON thought steps from streams. Accepts StreamSource or ThoughtStep[]. Options: onError. Returns error on stream failure.",
          },
          {
            name: "useActionState",
            type: "(action) => UseActionStateResult",
            description: "Track agent action expansion and duration.",
          },
          {
            name: "usePromptSurface",
            type: "(options?) => UsePromptSurfaceResult",
            description: "Prompt input, attachments, slash commands.",
          },
        ]}
      />

      <AnchorHeading id="stream-adapters" level={2}>
        Stream adapters
      </AnchorHeading>
      <PropsTable
        rows={[
          {
            name: "createStreamSource",
            type: "(factory) => StreamSourceObject",
            description:
              "Wrap a stream factory in a branded object safe for useState, setState, and refs.",
          },
          {
            name: "parseSSE",
            type: "(source) => AsyncIterable<SSEMessage>",
            description: "Parse SSE framing from a fetch body or ReadableStream.",
          },
          {
            name: "openAIStreamToText",
            type: "(source, options?) => AsyncIterable<string>",
            description:
              'Extract OpenAI-compatible delta fields (default "content", or "reasoning") from SSE.',
          },
          {
            name: "textToThoughtStep",
            type: "(source, options?) => AsyncIterable<string>",
            description:
              "Map a free-text token stream into NDJSON lines for one evolving ThoughtStep.",
          },
          {
            name: "openAIReasoningToThoughts",
            type: "(source, options?) => AsyncIterable<string>",
            description:
              "Extract delta.reasoning from SSE and emit NDJSON thought lines (active → complete).",
          },
          {
            name: "splitReadableStream",
            type: "(source, branches?) => ReadableStream[]",
            description:
              "Vendor-neutral ReadableStream fan-out via native tee(). Single-owner use only.",
          },
          {
            name: "collectStreamSource",
            type: "(source) => Promise<string>",
            description: "Drain a StreamSource into a string.",
          },
          {
            name: "getStreamSourceKey",
            type: "(source) => string",
            description: "Stable identity key for StreamSource (including factories).",
          },
        ]}
      />

      <AnchorHeading id="types" level={2}>
        Types
      </AnchorHeading>
      <CodeBlock
        language="ts"
        code={`type StreamInput = string | AsyncIterable<string> | ReadableStream<Uint8Array>;
type StreamFactory = () => Exclude<StreamInput, string>;
interface StreamSourceObject { type: "agentle-stream-factory"; factory: StreamFactory }
type StreamSource = StreamInput | StreamFactory | StreamSourceObject;

type BlockStatus = "incomplete" | "complete" | "stable";
type ThoughtStepStatus = "active" | "complete" | "error";
type AgentActionStatus = "running" | "success" | "error";

interface MarkdownBlock { id, type, content, status, startOffset, endOffset }
interface ThoughtStep { id, label, detail?, status }
interface AgentAction { id, name, status, input?, output?, error?, startedAt?, completedAt? }
interface PromptAttachment { id, name, type, size, preview? }
interface SlashCommand { name, description, action }
interface SSEMessage { event?, data }`}
      />

      <AnchorHeading id="status-arrays" level={2}>
        Status arrays
      </AnchorHeading>
      <CodeBlock
        language="ts"
        code={`BLOCK_STATUSES
MARKDOWN_BLOCK_TYPES
THOUGHT_STEP_STATUSES
AGENT_ACTION_STATUSES`}
      />

      <AnchorHeading id="helpers" level={2}>
        Thought stream helpers
      </AnchorHeading>
      <PropsTable
        rows={[
          {
            name: "parseThoughtJsonLine",
            type: "(line) => ThoughtStep | null",
            description: "Parse one NDJSON thought line.",
          },
          {
            name: "mergeThoughtSteps",
            type: "(existing, incoming) => ThoughtStep[]",
            description: "Merge thought step by id.",
          },
          {
            name: "buildThoughtSummary",
            type: "(steps) => string | null",
            description: "Build collapsed summary string.",
          },
        ]}
      />
    </>
  );
}
