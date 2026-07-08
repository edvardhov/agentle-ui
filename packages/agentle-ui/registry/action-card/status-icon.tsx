import type { AgentActionStatus } from "agentle-ui";

interface StatusIconProps {
  status: AgentActionStatus;
}

export function StatusIcon({ status }: StatusIconProps) {
  if (status === "running") {
    return <span className="agentle-action-card__icon agentle-action-card__icon--running" aria-hidden="true" />;
  }

  if (status === "success") {
    return <span className="agentle-action-card__icon agentle-action-card__icon--success" aria-hidden="true">✓</span>;
  }

  return <span className="agentle-action-card__icon agentle-action-card__icon--error" aria-hidden="true">!</span>;
}
