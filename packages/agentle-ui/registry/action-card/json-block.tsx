import { useMemo, useState } from "react";

interface JsonBlockProps {
  label: string;
  data: unknown;
}

const PREVIEW_LIMIT = 800;

export function JsonBlock({ label, data }: JsonBlockProps) {
  const [expanded, setExpanded] = useState(false);
  const serialized = useMemo(() => JSON.stringify(data, null, 2), [data]);
  const truncated = serialized.length > PREVIEW_LIMIT;
  const visible = expanded || !truncated ? serialized : `${serialized.slice(0, PREVIEW_LIMIT)}\n…`;

  return (
    <div className="agentle-json-block">
      <div className="agentle-json-block__label">{label}</div>
      <pre className="agentle-json-block__content">{visible}</pre>
      {truncated ? (
        <button
          type="button"
          className="agentle-json-block__toggle"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      ) : null}
    </div>
  );
}
