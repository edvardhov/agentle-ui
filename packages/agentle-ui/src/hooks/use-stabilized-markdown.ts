import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import {
  flushIncompleteBlocks,
  MarkdownCompletenessParser,
  partitionBlocks,
} from "../engines/markdown-parser";
import { PaintScheduler, StreamStore } from "../engines/scheduler";
import { subscribeToStreamInput } from "../engines/stream-input";
import type { MarkdownBlock, StreamInput } from "../types";

export interface UseStabilizedMarkdownOptions {
  debounceMs?: number;
  flushOnComplete?: boolean;
  onBlockRendered?: (block: MarkdownBlock) => void;
  /** When using string input, set false while tokens are still arriving. Default: true */
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

export function useStabilizedMarkdown(
  input: StreamInput,
  options: UseStabilizedMarkdownOptions = {},
): StabilizedMarkdownState {
  const { debounceMs = 16, flushOnComplete = true, onBlockRendered, isComplete = true } = options;
  const onBlockRenderedRef = useRef(onBlockRendered);
  onBlockRenderedRef.current = onBlockRendered;

  const parserRef = useRef<MarkdownCompletenessParser | null>(null);
  if (!parserRef.current) {
    parserRef.current = new MarkdownCompletenessParser();
  }

  const schedulerRef = useRef<PaintScheduler | null>(null);
  if (!schedulerRef.current) {
    schedulerRef.current = new PaintScheduler(debounceMs);
  }

  const storeRef = useRef<StreamStore<InternalState> | null>(null);
  if (!storeRef.current) {
    storeRef.current = new StreamStore(EMPTY_STATE, schedulerRef.current);
  }

  useEffect(() => {
    schedulerRef.current?.setDebounceMs(debounceMs);
  }, [debounceMs]);

  const inputKey = useMemo(() => getInputKey(input), [input]);
  const inputRef = useRef(input);
  inputRef.current = input;

  useEffect(() => {
    const parser = parserRef.current!;
    const store = storeRef.current!;
    const currentInput = inputRef.current;

    let buffer = "";
    let streamDone = false;
    const seenRenderedIds = new Set<string>();

    const commit = (complete: boolean) => {
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
        store.flush(nextState);
      } else {
        store.update(nextState);
      }
    };

    if (typeof currentInput === "string") {
      parser.reset();
      buffer = currentInput;
      commit(isComplete);
      return;
    }

    parser.reset();
    store.update({
      renderedBlocks: [],
      pendingBlocks: [],
      isStreaming: true,
      isComplete: false,
    });

    const unsubscribe = subscribeToStreamInput(currentInput, (chunk, done) => {
      buffer += chunk;
      streamDone = done;
      commit(done);
    });

    return () => {
      unsubscribe();
    };
  }, [inputKey, flushOnComplete, isComplete]);

  useEffect(() => {
    return () => {
      schedulerRef.current?.dispose();
      storeRef.current?.dispose();
    };
  }, []);

  const subscribe = useCallback((listener: () => void) => {
    return storeRef.current!.subscribe(listener);
  }, []);

  const getSnapshot = useCallback(() => {
    return storeRef.current!.getSnapshot();
  }, []);

  const getServerSnapshot = useCallback(() => EMPTY_STATE, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function getInputKey(input: StreamInput): string {
  if (typeof input === "string") {
    return `string:${input.length}:${input.slice(0, 32)}`;
  }
  if (isReadableStream(input)) {
    return `stream:readable:${input}`;
  }
  return `stream:async:${input}`;
}

function isReadableStream(value: StreamInput): value is ReadableStream<Uint8Array> {
  return typeof value === "object" && value !== null && "getReader" in value;
}
