import { Link } from "react-router-dom";
import { AnchorHeading } from "../components/docs/anchor-heading";
import { Callout } from "../components/docs/callout";
import { CodeBlock } from "../components/docs/code-block";
import { Pill } from "../components/docs/pill";

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
        Wrap the SDK stream in an async generator and pass it directly as{" "}
        <code>StreamInput</code>. Hooks accept <code>AsyncIterable&lt;string&gt;</code>.
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
  const stream = useMemo(() => streamOpenAIText(prompt), [prompt]);
  const { renderedBlocks, pendingBlocks, isStreaming } = useStabilizedMarkdown(stream);

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
}`}
      />

      <AnchorHeading id="fetch-sse" level={2}>
        Raw fetch + SSE
      </AnchorHeading>
      <p>
        Pass <code>response.body</code> directly — it is a{" "}
        <code>ReadableStream&lt;Uint8Array&gt;</code>, which agentle-ui already accepts as{" "}
        <code>StreamInput</code>.
      </p>
      <CodeBlock
        filename="lib/stream-sse.ts"
        language="ts"
        code={`import { useStabilizedMarkdown } from "agentle-ui";

export function AnswerFromSSE({ url }: { url: string }) {
  const [stream, setStream] = useState<ReadableStream<Uint8Array> | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await fetch(url);
      if (!cancelled && res.body) setStream(res.body);
    })();
    return () => {
      cancelled = true;
    };
  }, [url]);

  const { renderedBlocks, pendingBlocks, isStreaming } = useStabilizedMarkdown(
    stream ?? "",
  );

  if (!stream) return null;

  return (
    <div data-streaming={isStreaming}>
      {renderedBlocks.map((block) => (
        <div key={block.id}>{block.content}</div>
      ))}
    </div>
  );
}`}
      />

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
  return <ThoughtVisualizer thoughts={stream} />;
}

// Or headless:
import { useThoughtStream } from "agentle-ui";

const { steps, activeStep, isComplete, summary } = useThoughtStream(thoughtStream);`}
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
