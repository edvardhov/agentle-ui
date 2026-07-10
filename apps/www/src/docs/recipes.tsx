import { Link } from "react-router-dom";
import { AnchorHeading } from "../components/docs/anchor-heading";
import { Callout } from "../components/docs/callout";
import { CodeBlock } from "../components/docs/code-block";
import { Pill } from "../components/docs/pill";
import { PropsTable } from "../components/docs/props-table";

export function RecipesPage() {
  return (
    <>
      <header className="doc-header">
        <Pill>Guide</Pill>
        <h1 className="doc-header__title">Integration recipes</h1>
        <p className="doc-header__lead">
          Copy-paste glue from your model output into agentle-ui hooks. Each recipe shows where the
          data comes from and which hook consumes it.
        </p>
      </header>

      <Callout variant="tip" title="See it composed">
        For all four pillars wired together in one screen, see the{" "}
        <Link to="/example">Example chat</Link>.
      </Callout>

      <AnchorHeading id="input-shapes" level={2}>
        Three input shapes
      </AnchorHeading>
      <p>
        The package contract is strings and structured steps — not raw SSE frames or provider SDKs.
        Map your backend first, then pass the shape each hook expects.
      </p>
      <PropsTable
        rows={[
          {
            name: "Answer markdown",
            type: "MarkdownStabilizer / useStabilizedMarkdown",
            description: "Growing string or StreamSource of text tokens",
          },
          {
            name: "Thinking",
            type: "ThoughtVisualizer / useThoughtStream",
            description: "NDJSON thought lines or ThoughtStep[]",
          },
          {
            name: "Tools",
            type: "ActionCard / useActionState",
            description: "AgentAction[] — app state, not a stream",
          },
        ]}
      />

      <Callout variant="info" title="Production streaming">
        Prefer <code>isComplete</code> when your transport has a done signal (fetch complete, SSE
        end, SDK done event). Use <code>settleMs</code> auto-settle only for firehose text with no
        explicit end event. Stabilization is block-level layout safety — not ChatGPT-style character
        typing.
      </Callout>

      <AnchorHeading id="any-backend" level={2}>
        Any backend (string + isComplete)
      </AnchorHeading>
      <p>
        The default path: accumulate tokens in your transport layer, pass a growing string, flip{" "}
        <code>isComplete</code> when done.
      </p>
      <CodeBlock
        filename="lib/streamed-answer.tsx"
        language="tsx"
        code={`import { useEffect, useState } from "react";
import { MarkdownStabilizer } from "@/components/agentle/markdown-stabilizer";

export function StreamedAnswer({ url }: { url: string }) {
  const [content, setContent] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setContent("");
    setDone(false);

    void (async () => {
      const res = await fetch(url, { signal: controller.signal });
      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      while (true) {
        const { value, done: eof } = await reader.read();
        if (eof) break;
        setContent((current) => current + decoder.decode(value, { stream: true }));
      }
      setDone(true);
    })();

    return () => controller.abort();
  }, [url]);

  return <MarkdownStabilizer content={content} isComplete={done} />;
}`}
      />

      <Callout variant="info" title="StrictMode and single-use streams">
        Async generators and <code>ReadableStream</code> bodies can only be consumed once. In React
        StrictMode, effects mount twice in development. Pass a <strong>factory</strong> that creates a{" "}
        <strong>fresh</strong> underlying source on each call — a new fetch or generator — not a cached
        stream from <code>useMemo</code>. Capturing a single <code>response.body</code> in a factory
        still breaks on remount.
      </Callout>

      <Callout variant="tip" title="Fast APIs hide stabilization">
        The stabilizer holds incomplete markdown blocks as skeletons. If your backend returns the
        full answer in one chunk (or completes in a few milliseconds), you will not see skeletons.
        Use a slow source, replay demo, or increase <code>settleMs</code> to observe the effect.
      </Callout>

      <AnchorHeading id="vercel-ai-sdk" level={2}>
        Vercel AI SDK
      </AnchorHeading>
      <p>
        Pass the assistant message string from <code>useChat()</code> into{" "}
        <code>useStabilizedMarkdown</code>. Set <code>isComplete</code> from chat status.
      </p>
      <CodeBlock
        filename="app/chat/page.tsx"
        code={`import { useChat } from "ai/react";
import { useStabilizedMarkdown } from "agentle-ui";
import { MarkdownStabilizer } from "@/components/agentle/markdown-stabilizer";

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit, status } = useChat();

  const assistant = messages.find((m) => m.role === "assistant");
  const content = assistant?.content ?? "";
  const streaming = status === "streaming";

  // Headless: drive your own markup
  const { renderedBlocks, pendingBlocks } = useStabilizedMarkdown(content, {
    isComplete: !streaming,
  });

  return (
    <form onSubmit={handleSubmit}>
      {messages.map((m) =>
        m.role === "user" ? <p key={m.id}>{m.content}</p> : null,
      )}
      {/* Or use the copied template — pass the same string */}
      <MarkdownStabilizer content={content} isComplete={!streaming} />
      <input value={input} onChange={handleInputChange} />
    </form>
  );
}`}
      />

      <AnchorHeading id="openai-anthropic" level={2}>
        OpenAI / Anthropic SDK
      </AnchorHeading>
      <p>
        Wrap the SDK stream in an async generator and pass a <strong>factory</strong> that returns
        it. Hooks accept <code>StreamSource</code> — strings, streams, async iterables, or{" "}
        <code>() =&gt; AsyncIterable&lt;string&gt;</code>.
      </p>
      <CodeBlock
        filename="lib/stream-answer.ts"
        language="ts"
        code={`import OpenAI from "openai";
import { useStabilizedMarkdown } from "agentle-ui";

async function* streamOpenAIText(prompt: string) {
  const client = new OpenAI();
  const stream = await client.chat.completions.create({
    model: "gpt-4.1",
    messages: [{ role: "user", content: prompt }],
    stream: true,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) yield delta;
  }
}

export function Answer({ prompt }: { prompt: string }) {
  const { renderedBlocks, pendingBlocks, isStreaming } = useStabilizedMarkdown(
    () => streamOpenAIText(prompt),
  );

  return (
    <div data-streaming={isStreaming}>
      {renderedBlocks.map((block) => (
        <div key={block.id}>{block.content}</div>
      ))}
    </div>
  );
}`}
      />
      <CodeBlock
        filename="lib/stream-answer-anthropic.ts"
        language="ts"
        code={`import Anthropic from "@anthropic-ai/sdk";
import { useStabilizedMarkdown } from "agentle-ui";

async function* streamAnthropicText(prompt: string) {
  const client = new Anthropic();
  const stream = client.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield event.delta.text;
    }
  }
}

export function Answer({ prompt }: { prompt: string }) {
  const { renderedBlocks, isStreaming } = useStabilizedMarkdown(
    () => streamAnthropicText(prompt),
  );

  return (
    <div data-streaming={isStreaming}>
      {renderedBlocks.map((block) => (
        <div key={block.id}>{block.content}</div>
      ))}
    </div>
  );
}`}
      />

      <AnchorHeading id="fetch-sse" level={2}>
        OpenAI-compatible SSE (fetch)
      </AnchorHeading>
      <p>
        Do <strong>not</strong> pass <code>response.body</code> directly — raw SSE frames contain{" "}
        <code>data: {"{...}"}</code> JSON, not markdown. Use{" "}
        <code>openAIStreamToText</code> to parse SSE and extract <code>choices[0].delta.content</code>.
      </p>
      <CodeBlock
        filename="lib/stream-sse.ts"
        language="ts"
        code={`import { openAIStreamToText, useStabilizedMarkdown } from "agentle-ui";

export function AnswerFromSSE({ url }: { url: string }) {
  const { renderedBlocks, pendingBlocks, isStreaming } = useStabilizedMarkdown(() =>
    (async function* () {
      const res = await fetch(url);
      if (!res.body) return;
      yield* openAIStreamToText(res.body);
    })(),
  );

  return (
    <div data-streaming={isStreaming}>
      {renderedBlocks.map((block) => (
        <div key={block.id}>{block.content}</div>
      ))}
      {pendingBlocks.map((block) => (
        <div key={block.id} aria-hidden="true" />
      ))}
    </div>
  );
}`}
      />

      <AnchorHeading id="reasoning-to-thought" level={2}>
        Reasoning → collapsible thought
      </AnchorHeading>
      <p>
        OpenAI-compatible APIs emit free-text <code>delta.reasoning</code> tokens — not structured
        NDJSON steps. Use <code>openAIReasoningToThoughts</code> to map them into a single evolving{" "}
        <code>ThoughtStep</code> (active while streaming, collapses when complete).
      </p>
      <CodeBlock
        filename="lib/reasoning-panel.tsx"
        language="tsx"
        code={`import { openAIReasoningToThoughts } from "agentle-ui";
import { ThoughtVisualizer } from "@/components/agentle/thought-visualizer";

export function ReasoningPanel({ url }: { url: string }) {
  return (
    <ThoughtVisualizer
      thoughts={() =>
        (async function* () {
          const res = await fetch(url);
          if (!res.body) return;
          yield* openAIReasoningToThoughts(res.body);
        })()
      }
    />
  );
}`}
      />

      <AnchorHeading id="split-stream" level={2}>
        Dual-channel split (splitReadableStream)
      </AnchorHeading>
      <p>
        When one HTTP body carries multiple channels (e.g. reasoning + content in the same SSE
        stream), <code>splitReadableStream(body, 2)</code> fans out bytes via native{" "}
        <code>tee()</code>. Use in a <strong>single owner</strong> — tee branches are
        single-consumption. Do not attach two independently-remounting hooks to split branches under
        StrictMode. For hook dual-channel UI, prefer the{" "}
        <a href="#pollinations">single-fetch fan-out recipe</a> below.
      </p>
      <CodeBlock
        filename="lib/split-sse.ts"
        language="ts"
        code={`import { openAIStreamToText, splitReadableStream } from "agentle-ui";

async function consumeDualChannel(url: string) {
  const res = await fetch(url);
  if (!res.body) return { answer: "", reasoning: "" };

  const [reasoningBody, contentBody] = splitReadableStream(res.body, 2);

  const [reasoning, answer] = await Promise.all([
    collectText(openAIStreamToText(reasoningBody, { field: "reasoning" })),
    collectText(openAIStreamToText(contentBody, { field: "content" })),
  ]);

  return { answer, reasoning };
}

async function collectText(source: AsyncIterable<string>) {
  let text = "";
  for await (const chunk of source) text += chunk;
  return text;
}`}
      />

      <AnchorHeading id="pollinations" level={2}>
        Pollinations / delta.reasoning + content
      </AnchorHeading>
      <p>
        Pollinations emits both <code>delta.content</code> and <code>delta.reasoning</code> in one SSE
        stream. Use a <strong>single fetch</strong> and fan out deltas into two React state strings —
        do not double-fetch or <code>tee()</code> the body (streams are single-consumption).
      </p>
      <CodeBlock
        filename="lib/pollinations-chat.tsx"
        language="tsx"
        code={`import { useEffect, useState } from "react";
import { parseSSE } from "agentle-ui";
import { MarkdownStabilizer } from "@/components/agentle/markdown-stabilizer";
import { ThoughtVisualizer } from "@/components/agentle/thought-visualizer";

function extractDelta(data: string, field: "content" | "reasoning"): string {
  if (data === "[DONE]") return "";
  try {
    const parsed = JSON.parse(data) as {
      choices?: Array<{ delta?: Record<string, unknown> }>;
    };
    const value = parsed.choices?.[0]?.delta?.[field];
    return typeof value === "string" ? value : "";
  } catch {
    return "";
  }
}

export function PollinationsAnswer({ prompt }: { prompt: string }) {
  const [answer, setAnswer] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setAnswer("");
    setReasoning("");
    setDone(false);

    void (async () => {
      const res = await fetch("https://text.pollinations.ai/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai",
          messages: [{ role: "user", content: prompt }],
          stream: true,
        }),
      });
      if (!res.body || cancelled) return;

      for await (const message of parseSSE(res.body)) {
        if (cancelled) return;
        const content = extractDelta(message.data, "content");
        const thought = extractDelta(message.data, "reasoning");
        if (content) setAnswer((current) => current + content);
        if (thought) setReasoning((current) => current + thought);
      }

      if (!cancelled) setDone(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [prompt]);

  return (
    <>
      {reasoning ? (
        <section aria-label="Reasoning">
          <ThoughtVisualizer
            thoughts={[
              {
                id: "reasoning",
                label: done ? "Thought process" : "Thinking…",
                status: done ? "complete" : "active",
                detail: reasoning,
              },
            ]}
          />
        </section>
      ) : null}
      <MarkdownStabilizer content={answer} isComplete={done} />
    </>
  );
}`}
      />
      <Callout variant="tip" title="Structured steps vs free-text reasoning">
        For multi-step agent UI, emit NDJSON lines matching{" "}
        <code>{"{ id, label, status, detail? }"}</code> and pass them to{" "}
        <code>useThoughtStream</code>. For OpenAI-style <code>delta.reasoning</code> tokens, use{" "}
        <code>openAIReasoningToThoughts</code> or the fan-out pattern above.
      </Callout>

      <AnchorHeading id="tool-calls" level={2}>
        Tool calls → ActionCard
      </AnchorHeading>
      <p>
        Map SDK tool-call events into <code>AgentAction[]</code> and pass to{" "}
        <code>useActionState</code> or the <code>ActionCard</code> template.
      </p>
      <CodeBlock
        filename="lib/map-tool-calls.ts"
        language="ts"
        code={`import type { AgentAction } from "agentle-ui";
import { ActionCard } from "@/components/agentle/action-card";

// Example: OpenAI streaming tool_calls accumulated in your agent loop
type ToolCallEvent = {
  id: string;
  name: string;
  status: "running" | "success" | "error";
  input?: Record<string, unknown>;
  output?: unknown;
  error?: string;
};

function toAgentActions(events: ToolCallEvent[]): AgentAction[] {
  return events.map((e) => ({
    id: e.id,
    name: e.name,
    status: e.status,
    input: e.input,
    output: e.output,
    error: e.error,
  }));
}

export function AgentTools({ events }: { events: ToolCallEvent[] }) {
  const actions = toAgentActions(events);
  return <ActionCard action={actions} />;
}`}
      />

      <AnchorHeading id="thoughts-ndjson" level={2}>
        Thoughts → ThoughtVisualizer
      </AnchorHeading>
      <p>
        Your backend emits one JSON object per line (NDJSON). Pass the stream body to{" "}
        <code>useThoughtStream</code> or <code>ThoughtVisualizer</code>.
      </p>
      <CodeBlock
        language="json"
        filename="thought-stream.ndjson"
        code={`{"id":"1","label":"Searching the web...","status":"active","detail":"query: docs"}
{"id":"1","label":"Searching the web...","status":"complete"}
{"id":"2","label":"Reading 3 files...","status":"active"}
{"id":"2","label":"Reading 3 files...","status":"complete"}`}
      />
      <CodeBlock
        filename="components/agent-thoughts.tsx"
        code={`import { ThoughtVisualizer } from "@/components/agentle/thought-visualizer";

export function AgentThoughts({ stream }: { stream: ReadableStream<Uint8Array> }) {
  return <ThoughtVisualizer thoughts={() => stream} />;
}

// Or headless:
import { useThoughtStream } from "agentle-ui";

const { steps, activeStep, isComplete, summary } = useThoughtStream(
  () => thoughtStream,
);`}
      />

      <AnchorHeading id="prompt-input" level={2}>
        Prompt input
      </AnchorHeading>
      <p>
        Wire <code>usePromptSurface</code> or the copied <code>PromptSurface</code> template to your
        submit handler — same pattern regardless of backend.
      </p>
      <CodeBlock
        code={`import { PromptSurface } from "@/components/agentle/prompt-surface";

<PromptSurface
  commands={[{ name: "clear", description: "Clear chat", action: () => reset() }]}
  onSubmit={(text, attachments) => {
    void sendToAgent({ text, attachments });
  }}
/>`}
      />
    </>
  );
}
