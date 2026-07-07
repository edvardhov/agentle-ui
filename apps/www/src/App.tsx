import { useCallback, useEffect, useRef, useState } from "react";
import { GentleMarkdown } from "./components/gentle-markdown";
import { NaiveMarkdown } from "./components/naive-markdown";
import { useLayoutShiftCounter } from "./hooks/use-layout-shift-counter";
import { DEMO_MARKDOWN, simulateTokenStream } from "./lib/stream-simulator";
import "./styles.css";

export default function App() {
  const [content, setContent] = useState("");
  const [stream, setStream] = useState<AsyncIterable<string> | null>(null);
  const [runId, setRunId] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const naiveShifts = useLayoutShiftCounter(isStreaming);
  const gentleShifts = useLayoutShiftCounter(isStreaming);

  const startStream = useCallback(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setContent("");
    setIsStreaming(true);
    setRunId((id) => id + 1);

    async function* run() {
      try {
        for await (const chunk of simulateTokenStream(DEMO_MARKDOWN, controller.signal)) {
          setContent((prev) => prev + chunk);
          yield chunk;
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsStreaming(false);
        }
      }
    }

    setStream(run());
  }, []);

  useEffect(() => {
    startStream();
    return () => abortRef.current?.abort();
  }, [startStream]);

  return (
    <div className="app">
      <header className="hero">
        <p className="eyebrow">agentle-ui</p>
        <h1>A gentle UI for chaotic AI streams.</h1>
        <p className="subtitle">
          Same simulated LLM output. Left: naive markdown on every token. Right: stabilized
          rendering with buffered blocks.
        </p>
        <button type="button" className="replay" onClick={startStream}>
          Replay stream
        </button>
      </header>

      <section className="comparison" key={runId}>
        <article className="pane">
          <header className="pane-header">
            <h2>Naive render</h2>
            <p className="metric">Layout shifts: {naiveShifts}</p>
          </header>
          <NaiveMarkdown content={content} />
        </article>

        <article className="pane">
          <header className="pane-header">
            <h2>agentle-ui</h2>
            <p className="metric metric--good">Layout shifts: {gentleShifts}</p>
          </header>
          {stream ? <GentleMarkdown content={stream} /> : null}
        </article>
      </section>
    </div>
  );
}
