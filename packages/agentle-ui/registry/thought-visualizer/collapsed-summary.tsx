import { useState } from "react";
import type { ThoughtStep } from "agentle-ui";

interface CollapsedSummaryProps {
  text: string;
  steps: ThoughtStep[];
}

export function CollapsedSummary({ text, steps }: CollapsedSummaryProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="agentle-thoughts agentle-thoughts--collapsed">
      <button
        type="button"
        className="agentle-thoughts__summary"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
      >
        <span className="agentle-thoughts__check" aria-hidden="true">
          ✓
        </span>
        {text}
      </button>
      {expanded ? (
        <div className="agentle-thoughts__expanded-list">
          {steps.map((step) => (
            <div key={step.id} className="agentle-thoughts__row" data-status={step.status}>
              <span className="agentle-thoughts__label">{step.label}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
