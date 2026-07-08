import { useCallback, useEffect, useRef, useState } from "react";
import { GentleMarkdown } from "../gentle-markdown";
import { NaiveMarkdown } from "../naive-markdown";
import { CustomizePanel } from "../docs/customize-panel";
import { LiveDemo } from "../docs/live-demo";
import { ReplayButton } from "../docs/replay-button";
import { useLayoutShiftCounter } from "../../hooks/use-layout-shift-counter";
import {
  DEMO_MARKDOWN,
  MARKDOWN_PRESETS,
  simulateTokenStream,
} from "../../lib/stream-simulator";

interface MarkdownStabilizerDemoProps {
  autoStart?: boolean;
  compact?: boolean;
}

export function MarkdownStabilizerDemo({
  autoStart = true,
  compact = false,
}: MarkdownStabilizerDemoProps) {
  const [markdown, setMarkdown] = useState(DEMO_MARKDOWN);
  const [speed, setSpeed] = useState(1);
  const [content, setContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [runId, setRunId] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const markdownRef = useRef(markdown);
  const speedRef = useRef(speed);
  markdownRef.current = markdown;
  speedRef.current = speed;

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
        for await (const chunk of simulateTokenStream(
          markdownRef.current,
          controller.signal,
          speedRef.current,
        )) {
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
      footer={
        compact ? null : (
          <CustomizePanel>
            <div className="customize__field">
              <label className="customize__label" htmlFor="markdown-input">
                Markdown input
              </label>
              <textarea
                id="markdown-input"
                className="customize__textarea"
                value={markdown}
                onChange={(event) => setMarkdown(event.target.value)}
                spellCheck={false}
              />
            </div>
            <div className="customize__field">
              <label className="customize__label" htmlFor="stream-speed">
                Stream speed
              </label>
              <input
                id="stream-speed"
                className="customize__range"
                type="range"
                min={0.25}
                max={4}
                step={0.25}
                value={speed}
                onChange={(event) => setSpeed(Number(event.target.value))}
              />
              <span className="customize__range-value">{speed.toFixed(2)}x</span>
            </div>
            <div className="customize__field">
              <span className="customize__label">Presets</span>
              <div className="customize__presets">
                {MARKDOWN_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    className="customize__chip"
                    onClick={() => setMarkdown(preset.value)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </CustomizePanel>
        )
      }
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
