import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  }, [actionKey]);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const timestampsRef = useRef<Map<string, { startedAt?: number; completedAt?: number }>>(
    new Map(),
  );

  const actions = useMemo(() => {
    return incoming.map((item) => {
      const tracked = timestampsRef.current.get(item.id) ?? {};
      const startedAt = item.startedAt ?? tracked.startedAt;
      let completedAt = item.completedAt ?? tracked.completedAt;

      if (item.status === "running" && !startedAt) {
        timestampsRef.current.set(item.id, { startedAt: Date.now(), completedAt });
      } else if (
        (item.status === "success" || item.status === "error") &&
        startedAt &&
        !completedAt
      ) {
        completedAt = Date.now();
        timestampsRef.current.set(item.id, { startedAt, completedAt });
      } else {
        timestampsRef.current.set(item.id, { startedAt, completedAt });
      }

      return {
        ...item,
        startedAt,
        completedAt,
      };
    });
  }, [incoming]);

  useEffect(() => {
    setExpanded((current) => {
      let changed = false;
      const next = { ...current };
      for (const item of actions) {
        if (!(item.id in next)) {
          next[item.id] = item.status === "running";
          changed = true;
        }
        if (item.status === "success" && next[item.id] === undefined) {
          next[item.id] = false;
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
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
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
