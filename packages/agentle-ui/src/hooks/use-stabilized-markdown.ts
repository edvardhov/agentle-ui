import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore, type MutableRefObject } from "react";
import { DEFAULT_DEBOUNCE_MS } from "../constants";
import {
  flushIncompleteBlocks,
  MarkdownCompletenessParser,
  partitionBlocks,
} from "../engines/markdown-parser";
import { PaintScheduler, StreamStore } from "../engines/scheduler";
import { getStreamSourceKey, subscribeToStreamSource } from "../engines/stream-input";
import type { MarkdownBlock, StreamSource } from "../types";

export interface UseStabilizedMarkdownOptions {
  debounceMs?: number;
  /** Idle time before auto-detected string streams are treated as complete. Defaults to debounceMs. */
  settleMs?: number;
  flushOnComplete?: boolean;
  onBlockRendered?: (block: MarkdownBlock) => void;
  /** When using string input, set false while tokens are still arriving. Omit to auto-detect streaming. */
  isComplete?: boolean;
}

export interface StabilizedMarkdownState {
  renderedBlocks: MarkdownBlock[];
  pendingBlocks: MarkdownBlock[];
  isStreaming: boolean;
  isComplete: boolean;
}

interface InternalState {
  renderedBlocks: MarkdownBlock[];
  pendingBlocks: MarkdownBlock[];
  isStreaming: boolean;
  isComplete: boolean;
}

const EMPTY_STATE: InternalState = {
  renderedBlocks: [],
  pendingBlocks: [],
  isStreaming: false,
  isComplete: false,
};

function ensureStore(
  schedulerRef: MutableRefObject<PaintScheduler | null>,
  storeRef: MutableRefObject<StreamStore<InternalState> | null>,
  debounceMs: number,
): StreamStore<InternalState> {
  if (!schedulerRef.current) {
    schedulerRef.current = new PaintScheduler(debounceMs);
  }
  if (!storeRef.current) {
    storeRef.current = new StreamStore(EMPTY_STATE, schedulerRef.current);
  }
  return storeRef.current;
}

function parseStringSnapshot(
  text: string,
  complete: boolean,
  flushOnComplete: boolean,
): InternalState {
  const parser = new MarkdownCompletenessParser();
  let blocks = parser.parse(text, complete);
  if (complete && flushOnComplete) {
    blocks = flushIncompleteBlocks(blocks);
  }
  const { renderedBlocks, pendingBlocks } = partitionBlocks(blocks);
  return {
    renderedBlocks,
    pendingBlocks,
    isStreaming: !complete,
    isComplete: complete,
  };
}

export function useStabilizedMarkdown(
  input: StreamSource,
  options: UseStabilizedMarkdownOptions = {},
): StabilizedMarkdownState {
  const {
    debounceMs = DEFAULT_DEBOUNCE_MS,
    flushOnComplete = true,
    onBlockRendered,
    isComplete: isCompleteOption,
  } = options;
  const settleMs = options.settleMs ?? debounceMs;
  const onBlockRenderedRef = useRef(onBlockRendered);
  onBlockRenderedRef.current = onBlockRendered;

  const parserRef = useRef<MarkdownCompletenessParser | null>(null);
  if (!parserRef.current) {
    parserRef.current = new MarkdownCompletenessParser();
  }

  const schedulerRef = useRef<PaintScheduler | null>(null);
  const storeRef = useRef<StreamStore<InternalState> | null>(null);
  const seenRenderedIdsRef = useRef<Set<string>>(new Set());
  const prevStringRef = useRef<string>("");
  ensureStore(schedulerRef, storeRef, debounceMs);

  const inputKey = useMemo(() => getStreamSourceKey(input), [input]);

  const serverSnapshot = useMemo(() => {
    if (typeof input !== "string") {
      return EMPTY_STATE;
    }
    const complete = isCompleteOption ?? true;
    return parseStringSnapshot(input, complete, flushOnComplete);
  }, [input, isCompleteOption, flushOnComplete]);
  const inputRef = useRef(input);
  inputRef.current = input;

  useEffect(() => {
    schedulerRef.current?.setDebounceMs(debounceMs);
  }, [debounceMs]);

  useEffect(() => {
    const parser = parserRef.current!;
    const store = ensureStore(schedulerRef, storeRef, debounceMs);
    const currentInput = inputRef.current;

    let buffer = "";
    const seenRenderedIds = seenRenderedIdsRef.current;

    const commit = (complete: boolean) => {
      const activeStore = storeRef.current;
      if (!activeStore) return;

      let blocks = parser.parse(buffer, complete);
      if (complete && flushOnComplete) {
        blocks = flushIncompleteBlocks(blocks);
      }

      const { renderedBlocks, pendingBlocks } = partitionBlocks(blocks);

      for (const block of renderedBlocks) {
        if (!seenRenderedIds.has(block.id)) {
          seenRenderedIds.add(block.id);
          onBlockRenderedRef.current?.(block);
        }
      }

      const nextState: InternalState = {
        renderedBlocks,
        pendingBlocks,
        isStreaming: !complete,
        isComplete: complete,
      };

      if (complete) {
        activeStore.flush(nextState);
      } else {
        activeStore.update(nextState);
      }
    };

    if (typeof currentInput === "string") {
      const prev = prevStringRef.current;
      if (prev && currentInput.startsWith(prev)) {
        // keep seenRenderedIds across growing-string updates
      } else {
        seenRenderedIds.clear();
      }
      prevStringRef.current = currentInput;

      parser.reset();
      buffer = currentInput;

      if (isCompleteOption !== undefined) {
        commit(isCompleteOption);
        return;
      }

      commit(false);
      const settleTimer = setTimeout(() => commit(true), settleMs);
      return () => {
        clearTimeout(settleTimer);
      };
    }

    seenRenderedIds.clear();
    prevStringRef.current = "";

    parser.reset();
    store.update({
      renderedBlocks: [],
      pendingBlocks: [],
      isStreaming: true,
      isComplete: false,
    });

    const unsubscribe = subscribeToStreamSource(currentInput, (chunk, done) => {
      buffer += chunk;
      commit(done);
    });

    return () => {
      unsubscribe();
    };
  }, [debounceMs, inputKey, flushOnComplete, isCompleteOption, settleMs]);

  useEffect(() => {
    return () => {
      storeRef.current?.dispose();
      schedulerRef.current?.dispose();
      storeRef.current = null;
      schedulerRef.current = null;
    };
  }, []);

  const subscribe = useCallback((listener: () => void) => {
    const store = storeRef.current ?? ensureStore(schedulerRef, storeRef, debounceMs);
    return store.subscribe(listener);
  }, [debounceMs]);

  const getSnapshot = useCallback(() => {
    return storeRef.current?.getSnapshot() ?? EMPTY_STATE;
  }, []);

  const getServerSnapshot = useCallback(() => serverSnapshot, [serverSnapshot]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
