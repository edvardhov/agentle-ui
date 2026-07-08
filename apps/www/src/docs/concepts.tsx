import { AnchorHeading } from "../components/docs/anchor-heading";
import { Callout } from "../components/docs/callout";
import { CodeBlock } from "../components/docs/code-block";
import { Pill } from "../components/docs/pill";

export function ConceptsPage() {
  return (
    <>
      <header className="doc-header">
        <Pill>Concepts</Pill>
        <h1 className="doc-header__title">How agentle-ui works</h1>
        <p className="doc-header__lead">
          agentle-ui does not manage chat state, model routing, or backends. It stabilizes how AI
          output feels while it arrives.
        </p>
      </header>

      <AnchorHeading id="layout-shift" level={2}>
        The layout shift problem
      </AnchorHeading>
      <p>
        Naive markdown renderers re-parse the entire document on every token. Code fences open
        mid-stream, table rows appear one at a time, and headings flicker. Each partial structure
        triggers layout shift — a jarring experience that reads as broken, not &ldquo;loading.&rdquo;
      </p>

      <AnchorHeading id="block-buffering" level={2}>
        Block buffering
      </AnchorHeading>
      <p>
        The Markdown Stabilizer incrementally parses markdown into blocks (headings, paragraphs,
        lists, tables, code fences). Blocks render only when visually complete — a closed code fence,
        a table with a separator row, a list followed by a blank line.
      </p>
      <Callout variant="tip" title="Pending blocks">
        Incomplete blocks render as skeleton placeholders with stable dimensions, reserving space
        before content commits.
      </Callout>

      <AnchorHeading id="paint-scheduling" level={2}>
        Paint scheduling
      </AnchorHeading>
      <p>
        Updates batch on a frame-aligned schedule (default <code>DEFAULT_DEBOUNCE_MS = 16</code>).
        Token arrival and DOM paint decouple so React is not forced to reconcile on every chunk.
      </p>

      <AnchorHeading id="stream-input" level={2}>
        Stream input
      </AnchorHeading>
      <p>All hooks accept a unified <code>StreamInput</code> type:</p>
      <CodeBlock
        language="ts"
        code={`type StreamInput =
  | string
  | AsyncIterable<string>
  | ReadableStream<Uint8Array>;`}
      />
      <p>
        Pass a growing string with <code>isComplete: false</code> during streaming, or pipe an async
        generator / ReadableStream directly.
      </p>

      <AnchorHeading id="thought-format" level={2}>
        Thought NDJSON format
      </AnchorHeading>
      <p>The Thought Visualizer expects one JSON object per line:</p>
      <CodeBlock
        language="json"
        code={`{"id":"1","label":"Searching the web...","status":"active","detail":"query: docs"}
{"id":"1","label":"Searching the web...","status":"complete"}`}
      />
    </>
  );
}
