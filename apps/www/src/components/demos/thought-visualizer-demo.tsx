import { useCallback, useEffect, useRef, useState } from "react";
import type { ThoughtStep } from "agentle-ui";
import { ThoughtVisualizer } from "@registry/thought-visualizer/thought-visualizer";
import { CustomizePanel } from "../docs/customize-panel";
import { LiveDemo } from "../docs/live-demo";
import { ReplayButton } from "../docs/replay-button";
import { DEMO_STEPS, runThoughtSimulation, type ThoughtStepDef } from "../../lib/thought-simulator";
import "@registry/shared/agentle.css";

function createStepDef(): ThoughtStepDef {
  return { label: "New step...", detail: "" };
}

export function ThoughtVisualizerDemo() {
  const [stepDefs, setStepDefs] = useState<ThoughtStepDef[]>(DEMO_STEPS);
  const [steps, setSteps] = useState<ThoughtStep[]>([]);
  const [runId, setRunId] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const stepDefsRef = useRef(stepDefs);
  stepDefsRef.current = stepDefs;

  const startSimulation = useCallback(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setSteps([]);
    setRunId((id) => id + 1);

    void runThoughtSimulation(stepDefsRef.current, setSteps, controller.signal).catch(() => {
      // Aborted — expected on replay/unmount.
    });
  }, []);

  useEffect(() => {
    startSimulation();
    return () => abortRef.current?.abort();
  }, [startSimulation]);

  const updateStep = (index: number, patch: Partial<ThoughtStepDef>) => {
    setStepDefs((current) =>
      current.map((step, stepIndex) => (stepIndex === index ? { ...step, ...patch } : step)),
    );
  };

  const removeStep = (index: number) => {
    setStepDefs((current) => current.filter((_, stepIndex) => stepIndex !== index));
  };

  return (
    <LiveDemo
      title="Thought stream"
      description="Thought steps activate and complete in sequence, then collapse into a summary."
      controls={<ReplayButton onClick={startSimulation} />}
      footer={
        <CustomizePanel>
          {stepDefs.map((step, index) => (
            <div className="field-row" key={`${index}-${step.label}`}>
              <input
                className="field-row__input"
                value={step.label}
                placeholder="Label"
                onChange={(event) => updateStep(index, { label: event.target.value })}
              />
              <input
                className="field-row__input"
                value={step.detail ?? ""}
                placeholder="Detail"
                onChange={(event) => updateStep(index, { detail: event.target.value })}
              />
              <button
                type="button"
                className="field-row__remove"
                aria-label={`Remove step ${index + 1}`}
                onClick={() => removeStep(index)}
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            className="customize__add"
            onClick={() => setStepDefs((current) => [...current, createStepDef()])}
          >
            Add step
          </button>
        </CustomizePanel>
      }
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
