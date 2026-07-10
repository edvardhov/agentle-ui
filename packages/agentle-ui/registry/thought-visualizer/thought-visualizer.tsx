import { useThoughtStream, type StreamSource, type ThoughtStep } from "agentle-ui";
import { CollapsedSummary } from "./collapsed-summary";
import { ThoughtStepRow } from "./thought-step-row";
import "./agentle.css";

export interface ThoughtVisualizerProps {
  thoughts: StreamSource | ThoughtStep[];
}

export function ThoughtVisualizer({ thoughts }: ThoughtVisualizerProps) {
  const { steps, activeStep, isComplete, summary, reducedMotion } = useThoughtStream(thoughts);

  if (isComplete && summary) {
    return <CollapsedSummary text={summary} steps={steps} />;
  }

  return (
    <div className="agentle-thoughts" role="status" aria-live="polite">
      {steps.map((step) => (
        <ThoughtStepRow
          key={step.id}
          step={step}
          isActive={step.id === activeStep?.id}
          reducedMotion={reducedMotion}
        />
      ))}
    </div>
  );
}
