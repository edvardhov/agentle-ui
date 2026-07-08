import { useCallback, useEffect, useRef, useState } from "react";
import { GentleMarkdown } from "../gentle-markdown";
import { NaiveMarkdown } from "../naive-markdown";
import { LiveDemo } from "../docs/live-demo";
import { ReplayButton } from "../docs/replay-button";
import { useLayoutShiftCounter } from "../../hooks/use-layout-shift-counter";
import { DEMO_MARKDOWN, simulateTokenStream } from "../../lib/stream-simulator";

interface MarkdownStabilizerDemoProps {
  autoStart?: boolean;
  compact?: boolean;
}

export function MarkdownStabilizerDemo({
  autoStart = true,
  compact = false,
}: MarkdownStabilizerDemoProps) {
  const [content, setContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [runId, setRunId] = useState(0);
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

    void (async () => {
      try {
        for await (const chunk of simulateTokenStream(DEMO_MARKDOWN, controller.signal)) {
          setContent((prev) => prev + chunk);
        }
      } catch {
        // Aborted — expected on replay/unmount.
      } finally {
        if (!controller.signal.aborted) {
          setIsStreaming(false);
        }
      }
    })();
  }, []);

  useEffect(() => {
    if (!autoStart) return;
    startStream();
    return () => abortRef.current?.abort();
  }, [autoStart, startStream]);

  return (
    <LiveDemo
      title={compact ? "Live comparison" : "Naive vs stabilized markdown"}
      description="Same simulated LLM output. Left re-parses on every token; right buffers incomplete blocks."
      controls={<ReplayButton onClick={startStream} label="Replay stream" />}
    >
      <section className={`comparison${compact ? " comparison--compact" : ""}`} key={runId}>
        <article className="pane">
          <header className="pane-header">
            <h3>Naive render</h3>
            <p className="metric">Layout shifts: {naiveShifts}</p>
          </header>
          <NaiveMarkdown content={content} isStreaming={isStreaming} />
        </article>
        <article className="pane">
          <header className="pane-header">
            <h3>agentle-ui</h3>
            <p className="metric metric--good">Layout shifts: {gentleShifts}</p>
          </header>
          <GentleMarkdown content={content} isComplete={!isStreaming} />
        </article>
      </section>
    </LiveDemo>
  );
}
