import { useCallback, useEffect, useRef, useState } from "react";
import type { ThoughtStep } from "agentle-ui";
import { ThoughtVisualizer } from "@registry/thought-visualizer/thought-visualizer";
import { LiveDemo } from "../docs/live-demo";
import { ReplayButton } from "../docs/replay-button";
import { runThoughtSimulation } from "../../lib/thought-simulator";
import "@registry/shared/agentle.css";

export function ThoughtVisualizerDemo() {
  const [steps, setSteps] = useState<ThoughtStep[]>([]);
  const [runId, setRunId] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const startSimulation = useCallback(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setSteps([]);
    setRunId((id) => id + 1);

    void runThoughtSimulation(setSteps, controller.signal).catch(() => {
      // Aborted — expected on replay/unmount.
    });
  }, []);

  useEffect(() => {
    startSimulation();
    return () => abortRef.current?.abort();
  }, [startSimulation]);

  return (
    <LiveDemo
      title="Thought stream"
      description="Thought steps activate and complete in sequence, then collapse into a summary."
      controls={<ReplayButton onClick={startSimulation} />}
    >
      <div className="demo-panel" key={runId}>
        {steps.length > 0 ? (
          <ThoughtVisualizer thoughts={steps} />
        ) : (
          <p className="demo-empty">Starting agent...</p>
        )}
      </div>
    </LiveDemo>
  );
}
