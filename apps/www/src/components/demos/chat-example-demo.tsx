import { useCallback, useRef, useState } from "react";
import type { AgentAction, ThoughtStep } from "agentle-ui";
import { ActionCard } from "@registry/action-card/action-card";
import { PromptSurface } from "@registry/prompt-surface/prompt-surface";
import { ThoughtVisualizer } from "@registry/thought-visualizer/thought-visualizer";
import { GentleMarkdown } from "../gentle-markdown";
import { LiveDemo } from "../docs/live-demo";
import { ReplayButton } from "../docs/replay-button";
import {
  DEMO_ACTIONS,
  runActionSimulation,
} from "../../lib/action-simulator";
import { DEMO_MARKDOWN, simulateTokenStream } from "../../lib/stream-simulator";
import { DEMO_STEPS, runThoughtSimulation } from "../../lib/thought-simulator";
import "@registry/shared/agentle.css";

type Phase = "idle" | "thinking" | "acting" | "answering" | "done";

export function ChatExampleDemo() {
  const [userMessage, setUserMessage] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [thoughts, setThoughts] = useState<ThoughtStep[]>([]);
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [answer, setAnswer] = useState("");
  const [answerComplete, setAnswerComplete] = useState(false);
  const [runId, setRunId] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const runAgent = useCallback((prompt: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setUserMessage(prompt);
    setPhase("thinking");
    setThoughts([]);
    setActions([]);
    setAnswer("");
    setAnswerComplete(false);
    setRunId((id) => id + 1);

    void (async () => {
      try {
        await runThoughtSimulation(DEMO_STEPS, setThoughts, controller.signal);
        if (controller.signal.aborted) return;

        setPhase("acting");
        await runActionSimulation(DEMO_ACTIONS, setActions, controller.signal);
        if (controller.signal.aborted) return;

        setPhase("answering");
        for await (const chunk of simulateTokenStream(DEMO_MARKDOWN, controller.signal, 2)) {
          setAnswer((prev) => prev + chunk);
        }
        if (!controller.signal.aborted) {
          setAnswerComplete(true);
          setPhase("done");
        }
      } catch {
        // Aborted — expected on replay/unmount.
      }
    })();
  }, []);

  const replay = useCallback(() => {
    if (userMessage) runAgent(userMessage);
  }, [runAgent, userMessage]);

  const showThoughts = thoughts.length > 0 && (phase === "thinking" || phase === "acting" || phase === "answering" || phase === "done");
  const showActions = actions.length > 0 && (phase === "acting" || phase === "answering" || phase === "done");
  const showAnswer = phase === "answering" || phase === "done" || answer.length > 0;

  return (
    <LiveDemo
      title="Mini chat"
      description="Submit a prompt to run the full agent loop: thoughts, tool calls, then a stabilized markdown answer."
      controls={userMessage ? <ReplayButton onClick={replay} label="Replay" /> : null}
    >
      <div className="chat-example" key={runId}>
        <div className="chat-example__thread">
          {userMessage ? (
            <div className="chat-example__message chat-example__message--user">
              <span className="chat-example__role">You</span>
              <p>{userMessage}</p>
            </div>
          ) : (
            <p className="chat-example__empty">Send a message to start the agent loop.</p>
          )}

          {userMessage ? (
            <div className="chat-example__message chat-example__message--assistant">
              <span className="chat-example__role">Agent</span>
              {showThoughts ? (
                <div className="chat-example__block">
                  <ThoughtVisualizer thoughts={thoughts} />
                </div>
              ) : null}
              {showActions ? (
                <div className="chat-example__block">
                  <ActionCard action={actions} />
                </div>
              ) : null}
              {showAnswer ? (
                <div className="chat-example__block chat-example__block--answer">
                  <GentleMarkdown content={answer} isComplete={answerComplete} />
                </div>
              ) : null}
              {phase === "thinking" && thoughts.length === 0 ? (
                <p className="demo-empty">Starting agent...</p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="chat-example__input">
          <PromptSurface
            disabled={phase === "thinking" || phase === "acting" || phase === "answering"}
            onSubmit={(text) => runAgent(text)}
          />
        </div>
      </div>
    </LiveDemo>
  );
}
