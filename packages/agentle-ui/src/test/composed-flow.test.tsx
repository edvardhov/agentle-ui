import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useActionState } from "../hooks/use-action-state";
import { useStabilizedMarkdown } from "../hooks/use-stabilized-markdown";
import { useThoughtStream } from "../hooks/use-thought-stream";
import type { AgentAction, ThoughtStep } from "../types";

function useComposedAgent({
  thoughts,
  actions,
  answer,
  complete,
}: {
  thoughts: ThoughtStep[];
  actions: AgentAction[];
  answer: string;
  complete: boolean;
}) {
  const thought = useThoughtStream(thoughts);
  const action = useActionState(actions);
  const markdown = useStabilizedMarkdown(answer, { isComplete: complete });
  return { thought, action, markdown };
}

describe("composed agent flow", () => {
  it("progresses through thinking, acting, and answering phases", async () => {
    const { result, rerender } = renderHook(
      ({ thoughts, actions, answer, complete }) =>
        useComposedAgent({ thoughts, actions, answer, complete }),
      {
        initialProps: {
          thoughts: [{ id: "1", label: "Searching...", status: "active" as const }],
          actions: [] as AgentAction[],
          answer: "",
          complete: false,
        },
      },
    );

    expect(result.current.thought.activeStep?.label).toBe("Searching...");
    expect(result.current.action.runningCount).toBe(0);
    expect(result.current.markdown.renderedBlocks).toHaveLength(0);

    rerender({
      thoughts: [{ id: "1", label: "Searching...", status: "complete" as const }],
      actions: [] as AgentAction[],
      answer: "",
      complete: false,
    });

    await waitFor(() => {
      expect(result.current.thought.isComplete).toBe(true);
    });
    expect(result.current.thought.summary).toContain("Searching");

    rerender({
      thoughts: [{ id: "1", label: "Searching...", status: "complete" as const }],
      actions: [{ id: "a1", name: "web_search", status: "running" as const }],
      answer: "",
      complete: false,
    });

    expect(result.current.action.runningCount).toBe(1);
    expect(result.current.action.isExpanded("a1")).toBe(true);

    rerender({
      thoughts: [{ id: "1", label: "Searching...", status: "complete" as const }],
      actions: [
        {
          id: "a1",
          name: "web_search",
          status: "success" as const,
          startedAt: Date.now() - 500,
          completedAt: Date.now(),
        },
      ],
      answer: "# Answer\n\nStreaming",
      complete: false,
    });

    await waitFor(() => {
      expect(result.current.action.runningCount).toBe(0);
    });
    expect(result.current.markdown.isStreaming).toBe(true);
    expect(result.current.markdown.renderedBlocks.some((block) => block.type === "heading")).toBe(
      true,
    );

    rerender({
      thoughts: [{ id: "1", label: "Searching...", status: "complete" as const }],
      actions: [
        {
          id: "a1",
          name: "web_search",
          status: "success" as const,
          startedAt: Date.now() - 500,
          completedAt: Date.now(),
        },
      ],
      answer: "# Answer\n\nStreaming complete.",
      complete: true,
    });

    await waitFor(() => {
      expect(result.current.markdown.isStreaming).toBe(false);
    });
    expect(result.current.markdown.renderedBlocks.some((block) => block.type === "paragraph")).toBe(
      true,
    );
  });
});
