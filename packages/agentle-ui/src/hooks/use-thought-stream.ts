import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  buildThoughtSummary,
  getActiveThoughtStep,
  isThoughtStreamComplete,
  mergeThoughtSteps,
  parseThoughtJsonLine,
} from "../engines/thought-parser";
import { getStreamSourceKey, subscribeToStreamSource } from "../engines/stream-input";
import type { StreamSource, ThoughtStep } from "../types";

export interface UseThoughtStreamOptions {
  collapseOnComplete?: boolean;
  reducedMotion?: boolean;
  /** Called when stream consumption fails. Already-parsed steps are kept. */
  onError?: (error: unknown) => void;
}

export interface ThoughtStreamState {
  steps: ThoughtStep[];
  activeStep: ThoughtStep | null;
  isComplete: boolean;
  summary: string | null;
  reducedMotion: boolean;
  error: unknown | null;
}

interface InternalState {
  steps: ThoughtStep[];
  isComplete: boolean;
  summary: string | null;
  error: unknown | null;
}

const EMPTY_STATE: InternalState = {
  steps: [],
  isComplete: false,
  summary: null,
  error: null,
};

export function useThoughtStream(
  input: StreamSource | ThoughtStep[],
  options: UseThoughtStreamOptions = {},
): ThoughtStreamState {
  const { collapseOnComplete = true, onError } = options;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const storeRef = useRef<{ snapshot: InternalState; listeners: Set<() => void> }>({
    snapshot: EMPTY_STATE,
    listeners: new Set(),
  });

  const reducedMotion = useReducedMotion(options.reducedMotion);

  const inputKey = useMemo(() => getThoughtInputKey(input), [input]);
  const inputRef = useRef(input);
  inputRef.current = input;

  useEffect(() => {
    const store = storeRef.current;
    let steps: ThoughtStep[] = [];
    let lineBuffer = "";

    const commit = (done: boolean) => {
      const complete = isThoughtStreamComplete(steps, done);
      const summary =
        collapseOnComplete && complete ? buildThoughtSummary(steps) : null;

      store.snapshot = { steps, isComplete: complete, summary, error: null };
      for (const listener of store.listeners) {
        listener();
      }
    };

    const ingestLines = (text: string, final = false) => {
      lineBuffer += text;
      const parts = lineBuffer.split("\n");
      lineBuffer = final ? "" : (parts.pop() ?? "");

      for (const line of parts) {
        const parsed = parseThoughtJsonLine(line);
        if (parsed) {
          steps = mergeThoughtSteps(steps, parsed);
        }
      }

      if (final && lineBuffer.trim()) {
        const parsed = parseThoughtJsonLine(lineBuffer);
        if (parsed) {
          steps = mergeThoughtSteps(steps, parsed);
        }
        lineBuffer = "";
      }
    };

    const currentInput = inputRef.current;

    if (Array.isArray(currentInput)) {
      steps = currentInput;
      commit(true);
      return;
    }

    if (typeof currentInput === "string") {
      ingestLines(currentInput, true);
      commit(true);
      return;
    }

    store.snapshot = EMPTY_STATE;
    for (const listener of store.listeners) {
      listener();
    }

    const unsubscribe = subscribeToStreamSource(currentInput, (chunk, done, error) => {
      if (error !== undefined) {
        store.snapshot = { steps, isComplete: false, summary: null, error };
        for (const listener of store.listeners) {
          listener();
        }
        onErrorRef.current?.(error);
        return;
      }

      ingestLines(chunk, done);
      commit(done);
    });

    return () => {
      unsubscribe();
    };
  }, [inputKey, collapseOnComplete]);

  const subscribe = useCallback((listener: () => void) => {
    storeRef.current.listeners.add(listener);
    return () => {
      storeRef.current.listeners.delete(listener);
    };
  }, []);

  const getSnapshot = useCallback(() => storeRef.current.snapshot, []);
  const getServerSnapshot = useCallback(() => EMPTY_STATE, []);

  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    steps: state.steps,
    activeStep: getActiveThoughtStep(state.steps),
    isComplete: state.isComplete,
    summary: state.summary,
    reducedMotion,
    error: state.error,
  };
}

function getThoughtInputKey(input: StreamSource | ThoughtStep[]): string {
  if (Array.isArray(input)) {
    return `steps:${input.length}:${input.map((step) => `${step.id}:${step.status}`).join(",")}`;
  }
  return getStreamSourceKey(input);
}

function useReducedMotion(explicit?: boolean): boolean {
  const [detected, setDetected] = useState(false);

  useEffect(() => {
    if (explicit !== undefined) {
      setDetected(explicit);
      return;
    }

    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setDetected(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [explicit]);

  return explicit ?? detected;
}
