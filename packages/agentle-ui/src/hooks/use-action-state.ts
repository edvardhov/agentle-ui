import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DURATION_MS_THRESHOLD } from "../constants";
import type { AgentAction } from "../types";

export interface UseActionStateResult {
  actions: AgentAction[];
  runningCount: number;
  toggleExpanded: (id: string) => void;
  isExpanded: (id: string) => boolean;
  formatDuration: (action: AgentAction) => string;
}

function getActionKey(action: AgentAction | AgentAction[]): string {
  const items = Array.isArray(action) ? action : [action];
  return items
    .map(
      (item) =>
        `${item.id}:${item.status}:${item.startedAt ?? ""}:${item.completedAt ?? ""}:${item.name}`,
    )
    .join("|");
}

export function useActionState(action: AgentAction | AgentAction[]): UseActionStateResult {
  const actionRef = useRef(action);
  actionRef.current = action;
  const actionKey = getActionKey(action);

  const incoming = useMemo(() => {
    const current = actionRef.current;
    return Array.isArray(current) ? current : [current];
    // actionKey serializes action updates for memo invalidation
    // eslint-disable-next-line react-hooks/exhaustive-deps -- actionKey tracks serialized action changes
  }, [actionKey]);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const timestampsRef = useRef<Map<string, { startedAt?: number; completedAt?: number }>>(
    new Map(),
  );
  const [timestampVersion, setTimestampVersion] = useState(0);

  useEffect(() => {
    let changed = false;

    for (const item of incoming) {
      const tracked = timestampsRef.current.get(item.id) ?? {};
      let startedAt = item.startedAt ?? tracked.startedAt;
      let completedAt = item.completedAt ?? tracked.completedAt;

      if (item.status === "running" && !startedAt) {
        startedAt = Date.now();
        changed = true;
      } else if (
        (item.status === "success" || item.status === "error") &&
        startedAt &&
        !completedAt
      ) {
        completedAt = Date.now();
        changed = true;
      }

      const next = { startedAt, completedAt };
      if (next.startedAt !== tracked.startedAt || next.completedAt !== tracked.completedAt) {
        timestampsRef.current.set(item.id, next);
        changed = true;
      }
    }

    if (changed) {
      setTimestampVersion((version) => version + 1);
    }
  }, [incoming]);

  const actions = useMemo(() => {
    void timestampVersion;
    return incoming.map((item) => {
      const tracked = timestampsRef.current.get(item.id) ?? {};
      return {
        ...item,
        startedAt: item.startedAt ?? tracked.startedAt,
        completedAt: item.completedAt ?? tracked.completedAt,
      };
    });
  }, [incoming, timestampVersion]);

  useEffect(() => {
    setExpanded((current) => {
      let changed = false;
      const next = { ...current };
      for (const item of actions) {
        if (!(item.id in next)) {
          next[item.id] = item.status === "running";
          changed = true;
        }
      }
      return changed ? next : current;
    });
  }, [actions]);

  const toggleExpanded = useCallback((id: string) => {
    setExpanded((current) => ({ ...current, [id]: !current[id] }));
  }, []);

  const isExpanded = useCallback((id: string) => Boolean(expanded[id]), [expanded]);

  const formatDuration = useCallback((item: AgentAction) => {
    if (item.startedAt == null || item.completedAt == null) return "";
    const ms = item.completedAt - item.startedAt;
    if (ms < DURATION_MS_THRESHOLD) return `${ms}ms`;
    return `${(ms / DURATION_MS_THRESHOLD).toFixed(1)}s`;
  }, []);

  const runningCount = actions.filter((item) => item.status === "running").length;

  return {
    actions,
    runningCount,
    toggleExpanded,
    isExpanded,
    formatDuration,
  };
}
