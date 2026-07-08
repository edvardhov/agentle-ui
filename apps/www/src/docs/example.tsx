import { Link } from "react-router-dom";
import { AnchorHeading } from "../components/docs/anchor-heading";
import { Callout } from "../components/docs/callout";
import { CodeBlock } from "../components/docs/code-block";
import { Pill } from "../components/docs/pill";
import { ChatExampleDemo } from "../components/demos/chat-example-demo";

export function ExamplePage() {
  return (
    <>
      <header className="doc-header">
        <Pill>Guide</Pill>
        <h1 className="doc-header__title">Example chat</h1>
        <p className="doc-header__lead">
          All four pillars composed into one agent screen: prompt input, thought stream, tool calls,
          and a stabilized markdown answer. The demo below is simulated; the source matches the
          wiring you would use with real model output.
        </p>
      </header>

      <Callout variant="tip" title="Wire your sources">
        See <Link to="/recipes">Integration recipes</Link> for Vercel AI SDK, OpenAI/Anthropic, and
        fetch + SSE glue.
      </Callout>

      <AnchorHeading id="live-demo" level={2}>
        Live demo
      </AnchorHeading>
      <ChatExampleDemo />

      <AnchorHeading id="composition" level={2}>
        Composition source
      </AnchorHeading>
      <p>
        Install the four templates, then orchestrate phases in your chat container. Thoughts and
        actions arrive as arrays; the answer string feeds{" "}
        <code>useStabilizedMarkdown</code> via <code>GentleMarkdown</code> (or your own markup).
      </p>
      <CodeBlock
        filename="components/agent-chat.tsx"
        code={`import { useCallback, useRef, useState } from "react";
import type { AgentAction, ThoughtStep } from "agentle-ui";
import { ActionCard } from "@/components/agentle/action-card";
import { MarkdownStabilizer } from "@/components/agentle/markdown-stabilizer";
import { PromptSurface } from "@/components/agentle/prompt-surface";
import { ThoughtVisualizer } from "@/components/agentle/thought-visualizer";

type Phase = "idle" | "thinking" | "acting" | "answering" | "done";

export function AgentChat() {
  const [userMessage, setUserMessage] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [thoughts, setThoughts] = useState<ThoughtStep[]>([]);
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [answer, setAnswer] = useState("");
  const [answerComplete, setAnswerComplete] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const runAgent = useCallback(async (prompt: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setUserMessage(prompt);
    setPhase("thinking");
    setThoughts([]);
    setActions([]);
    setAnswer("");
    setAnswerComplete(false);

    // 1. Stream thought steps (NDJSON body or push updates into state)
    await consumeThoughtStream(prompt, setThoughts, controller.signal);
    if (controller.signal.aborted) return;

    // 2. Map SDK tool-call events into AgentAction[]
    setPhase("acting");
    await consumeToolCalls(prompt, setActions, controller.signal);
    if (controller.signal.aborted) return;

    // 3. Stream answer tokens into a string
    setPhase("answering");
    for await (const chunk of streamAnswer(prompt, controller.signal)) {
      setAnswer((prev) => prev + chunk);
    }
    if (!controller.signal.aborted) {
      setAnswerComplete(true);
      setPhase("done");
    }
  }, []);

  const busy = phase === "thinking" || phase === "acting" || phase === "answering";

  return (
    <div className="agent-chat">
      {userMessage ? (
        <>
          <p className="agent-chat__user">{userMessage}</p>
          <ThoughtVisualizer thoughts={thoughts} />
          <ActionCard action={actions} />
          <MarkdownStabilizer content={answer} isComplete={answerComplete} />
        </>
      ) : null}
      <PromptSurface disabled={busy} onSubmit={(text) => void runAgent(text)} />
    </div>
  );
}`}
      />

      <CodeBlock
        filename="lib/consume-thought-stream.ts"
        language="ts"
        code={`import type { ThoughtStep } from "agentle-ui";

/** Example: fetch NDJSON thought stream from your backend. */
export async function consumeThoughtStream(
  prompt: string,
  onUpdate: (steps: ThoughtStep[]) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch("/api/agent/thoughts", {
    method: "POST",
    body: JSON.stringify({ prompt }),
    signal,
  });
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let steps: ThoughtStep[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.trim()) continue;
      const step = JSON.parse(line) as ThoughtStep;
      steps = [...steps.filter((s) => s.id !== step.id), step];
      onUpdate(steps);
    }
  }
}`}
      />
    </>
  );
}
