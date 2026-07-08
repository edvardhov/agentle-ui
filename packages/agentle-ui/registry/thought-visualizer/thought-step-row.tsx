import type { ThoughtStep } from "agentle-ui";

interface ThoughtStepRowProps {
  step: ThoughtStep;
  isActive: boolean;
  reducedMotion: boolean;
}

export function ThoughtStepRow({ step, isActive, reducedMotion }: ThoughtStepRowProps) {
  return (
    <div
      className="agentle-thoughts__row"
      data-status={step.status}
      data-active={isActive ? "true" : "false"}
    >
      <span
        className={`agentle-thoughts__indicator${isActive && !reducedMotion ? " agentle-thoughts__indicator--pulse" : ""}`}
        aria-hidden="true"
      />
      <div className="agentle-thoughts__content">
        <span className="agentle-thoughts__label">{step.label}</span>
        {step.detail ? <span className="agentle-thoughts__detail">{step.detail}</span> : null}
      </div>
      {step.status === "complete" ? (
        <span className="agentle-thoughts__check" aria-label="Complete">
          ✓
        </span>
      ) : null}
      {step.status === "error" ? (
        <span className="agentle-thoughts__error" aria-label="Error">
          !
        </span>
      ) : null}
    </div>
  );
}
