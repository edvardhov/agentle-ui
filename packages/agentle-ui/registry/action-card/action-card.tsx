import { useActionState, type AgentAction } from "agentle-ui";
import { JsonBlock } from "./json-block";
import { StatusIcon } from "./status-icon";
import "./agentle.css";

export interface ActionCardProps {
  action: AgentAction | AgentAction[];
}

export function ActionCard({ action }: ActionCardProps) {
  const { actions, toggleExpanded, isExpanded, formatDuration } = useActionState(action);

  return (
    <div className="agentle-action-cards">
      {actions.map((item) => {
        const expanded = isExpanded(item.id);
        return (
          <div key={item.id} className="agentle-action-card" data-status={item.status}>
            <button
              type="button"
              className="agentle-action-card__header"
              onClick={() => toggleExpanded(item.id)}
              aria-expanded={expanded}
            >
              <StatusIcon status={item.status} />
              <span className="agentle-action-card__name">{item.name}</span>
              {item.completedAt ? (
                <span className="agentle-action-card__duration">{formatDuration(item)}</span>
              ) : null}
            </button>
            {expanded ? (
              <div className="agentle-action-card__body">
                {item.input ? <JsonBlock label="Input" data={item.input} /> : null}
                {item.output ? <JsonBlock label="Output" data={item.output} /> : null}
                {item.error ? <p className="agentle-action-card__error">{item.error}</p> : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
