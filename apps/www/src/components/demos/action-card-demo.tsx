import { useCallback, useEffect, useRef, useState } from "react";
import type { AgentAction } from "agentle-ui";
import { ActionCard } from "@registry/action-card/action-card";
import { LiveDemo } from "../docs/live-demo";
import { runActionSimulation } from "../../lib/action-simulator";
import "@registry/shared/agentle.css";

export function ActionCardDemo() {
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [runId, setRunId] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const startSimulation = useCallback(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setActions([]);
    setRunId((id) => id + 1);

    void runActionSimulation(setActions, controller.signal).catch(() => {
      // Aborted — expected on replay/unmount.
    });
  }, []);

  useEffect(() => {
    startSimulation();
    return () => abortRef.current?.abort();
  }, [startSimulation]);

  return (
    <LiveDemo
      title="Agent tool calls"
      description="Running actions auto-expand; completed actions show duration and collapsible JSON."
      controls={
        <button type="button" className="btn btn--ghost" onClick={startSimulation}>
          Replay
        </button>
      }
    >
      <div className="demo-panel" key={runId}>
        {actions.length > 0 ? <ActionCard action={actions} /> : <p className="demo-empty">Starting agent...</p>}
      </div>
    </LiveDemo>
  );
}
