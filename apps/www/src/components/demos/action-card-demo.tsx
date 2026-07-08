import { useCallback, useEffect, useRef, useState } from "react";
import type { AgentAction } from "agentle-ui";
import { ActionCard } from "@registry/action-card/action-card";
import { CustomizePanel } from "../docs/customize-panel";
import { LiveDemo } from "../docs/live-demo";
import { ReplayButton } from "../docs/replay-button";
import {
  DEMO_ACTIONS,
  runActionSimulation,
  type ActionDef,
  type ActionOutcome,
} from "../../lib/action-simulator";
import "@registry/shared/agentle.css";

function createActionDef(): ActionDef {
  return {
    name: "new_action",
    input: '{"value":"example"}',
    outcome: "success",
    output: '{"ok":true}',
    error: "",
  };
}

export function ActionCardDemo() {
  const [actionDefs, setActionDefs] = useState<ActionDef[]>(DEMO_ACTIONS);
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [runId, setRunId] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const actionDefsRef = useRef(actionDefs);
  actionDefsRef.current = actionDefs;

  const startSimulation = useCallback(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setActions([]);
    setRunId((id) => id + 1);

    void runActionSimulation(actionDefsRef.current, setActions, controller.signal).catch(() => {
      // Aborted — expected on replay/unmount.
    });
  }, []);

  useEffect(() => {
    startSimulation();
    return () => abortRef.current?.abort();
  }, [startSimulation]);

  const updateAction = (index: number, patch: Partial<ActionDef>) => {
    setActionDefs((current) =>
      current.map((action, actionIndex) =>
        actionIndex === index ? { ...action, ...patch } : action,
      ),
    );
  };

  const removeAction = (index: number) => {
    setActionDefs((current) => current.filter((_, actionIndex) => actionIndex !== index));
  };

  return (
    <LiveDemo
      title="Agent tool calls"
      description="Running actions auto-expand; completed actions show duration and collapsible JSON."
      controls={<ReplayButton onClick={startSimulation} />}
      footer={
        <CustomizePanel>
          {actionDefs.map((action, index) => (
            <div className="field-row field-row--action" key={`${index}-${action.name}`}>
              <input
                className="field-row__input"
                value={action.name}
                placeholder="Name"
                onChange={(event) => updateAction(index, { name: event.target.value })}
              />
              <input
                className="field-row__input"
                value={action.input}
                placeholder='Input JSON or text'
                onChange={(event) => updateAction(index, { input: event.target.value })}
              />
              <select
                className="field-row__select"
                value={action.outcome}
                onChange={(event) =>
                  updateAction(index, { outcome: event.target.value as ActionOutcome })
                }
              >
                <option value="success">success</option>
                <option value="error">error</option>
              </select>
              <button
                type="button"
                className="field-row__remove"
                aria-label={`Remove action ${index + 1}`}
                onClick={() => removeAction(index)}
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            className="customize__add"
            onClick={() => setActionDefs((current) => [...current, createActionDef()])}
          >
            Add action
          </button>
        </CustomizePanel>
      }
    >
      <div className="demo-panel" key={runId}>
        {actions.length > 0 ? <ActionCard action={actions} /> : <p className="demo-empty">Starting agent...</p>}
      </div>
    </LiveDemo>
  );
}
