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
          Exported hooks, types, constants, and low-level engines from the agentle-ui package.
        </p>
      </header>

      <AnchorHeading id="hooks" level={2}>
        Hooks
      </AnchorHeading>
      <PropsTable
        rows={[
          { name: "useStabilizedMarkdown", type: "(input, options?) => StabilizedMarkdownState", description: "Markdown block buffering and paint scheduling." },
          { name: "useThoughtStream", type: "(input, options?) => ThoughtStreamState", description: "Parse NDJSON thought steps from streams." },
          { name: "useActionState", type: "(action) => UseActionStateResult", description: "Track agent action expansion and duration." },
          { name: "usePromptSurface", type: "(options?) => UsePromptSurfaceResult", description: "Prompt input, attachments, slash commands." },
        ]}
      />

      <AnchorHeading id="types" level={2}>
        Types
      </AnchorHeading>
      <CodeBlock
        language="ts"
        code={`type StreamInput = string | AsyncIterable<string> | ReadableStream<Uint8Array>;

type BlockStatus = "incomplete" | "complete" | "stable";
type ThoughtStepStatus = "active" | "complete" | "error";
type AgentActionStatus = "running" | "success" | "error";

interface MarkdownBlock { id, type, content, status, startOffset, endOffset }
interface ThoughtStep { id, label, detail?, status }
interface AgentAction { id, name, status, input?, output?, error?, startedAt?, completedAt? }
interface PromptAttachment { id, name, type, size, preview? }
interface SlashCommand { name, description, action }`}
      />

      <AnchorHeading id="constants" level={2}>
        Constants
      </AnchorHeading>
      <PropsTable
        rows={[
          { name: "DEFAULT_DEBOUNCE_MS", type: "16", description: "Default paint debounce." },
          { name: "INPUT_KEY_FINGERPRINT_LENGTH", type: "32", description: "Stream input key prefix length." },
          { name: "DEFAULT_MAX_ATTACHMENTS", type: "5", description: "Default attachment limit." },
          { name: "DEFAULT_MAX_FILE_SIZE_BYTES", type: "5242880", description: "Default 5 MiB file limit." },
          { name: "DURATION_MS_THRESHOLD", type: "1000", description: "Ms threshold for seconds display." },
          { name: "CODE_FENCE_CLOSE_COUNT", type: "2", description: "Fence markers for complete code block." },
          { name: "TABLE_MIN_ROWS", type: "2", description: "Minimum rows for complete table." },
          { name: "MAX_HEADING_LEVEL", type: "6", description: "Maximum ATX heading level." },
          { name: "THEMATIC_BREAK_MIN_CHARS", type: "3", description: "Minimum thematic break length." },
        ]}
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

      <AnchorHeading id="engines" level={2}>
        Engines
      </AnchorHeading>
      <PropsTable
        rows={[
          { name: "MarkdownCompletenessParser", type: "class", description: "Incremental markdown block parser." },
          { name: "partitionBlocks", type: "function", description: "Split blocks into rendered vs pending." },
          { name: "flushIncompleteBlocks", type: "function", description: "Mark incomplete blocks stable at end." },
          { name: "parseThoughtJsonLine", type: "function", description: "Parse one NDJSON thought line." },
          { name: "mergeThoughtSteps", type: "function", description: "Merge thought step by id." },
          { name: "buildThoughtSummary", type: "function", description: "Build collapsed summary string." },
          { name: "subscribeToStreamInput", type: "function", description: "Subscribe to any StreamInput." },
          { name: "collectStreamInput", type: "function", description: "Collect stream into string." },
          { name: "getStreamInputKey", type: "function", description: "Stable key for stream identity." },
          { name: "isReadableStream", type: "function", description: "Type guard for ReadableStream." },
          { name: "PaintScheduler", type: "class", description: "rAF-aligned paint batching." },
          { name: "StreamStore", type: "class", description: "External store with scheduler." },
        ]}
      />
    </>
  );
}
