import { useCallback, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { PromptAttachment, SlashCommand } from "../types";

export interface UsePromptSurfaceOptions {
  commands?: SlashCommand[];
  maxAttachments?: number;
  maxFileSize?: number;
  onSubmit?: (text: string, attachments: PromptAttachment[]) => void;
  disabled?: boolean;
}

export interface UsePromptSurfaceResult {
  text: string;
  setText: (text: string) => void;
  attachments: PromptAttachment[];
  addAttachment: (file: File) => void;
  removeAttachment: (id: string) => void;
  activeCommand: SlashCommand | null;
  filteredCommands: SlashCommand[];
  handleKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  submit: () => void;
  isSubmitting: boolean;
}

export function usePromptSurface(options: UsePromptSurfaceOptions = {}): UsePromptSurfaceResult {
  const {
    commands = [],
    maxAttachments = 5,
    maxFileSize = 5 * 1024 * 1024,
    onSubmit,
    disabled = false,
  } = options;

  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<PromptAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commandQuery, setCommandQuery] = useState<string | null>(null);

  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current = onSubmit;

  const filteredCommands = useMemo(() => {
    if (commandQuery === null) return [];
    const query = commandQuery.toLowerCase();
    return commands.filter((command) => command.name.toLowerCase().includes(query));
  }, [commandQuery, commands]);

  const activeCommand = filteredCommands[0] ?? null;

  const addAttachment = useCallback(
    (file: File) => {
      if (file.size > maxFileSize) return;

      const attachment: PromptAttachment = {
        id: `${file.name}-${file.lastModified}`,
        name: file.name,
        type: file.type,
        size: file.size,
      };

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          setAttachments((current) =>
            current.map((item) =>
              item.id === attachment.id
                ? { ...item, preview: String(reader.result) }
                : item,
            ),
          );
        };
        reader.readAsDataURL(file);
      }

      setAttachments((current) => {
        if (current.length >= maxAttachments) return current;
        return [...current, attachment];
      });
    },
    [maxAttachments, maxFileSize],
  );

  const removeAttachment = useCallback((id: string) => {
    setAttachments((current) => current.filter((item) => item.id !== id));
  }, []);

  const submit = useCallback(() => {
    if (disabled || isSubmitting) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    onSubmitRef.current?.(trimmed, attachments);
    setText("");
    setAttachments([]);
    setCommandQuery(null);
    setIsSubmitting(false);
  }, [attachments, disabled, isSubmitting, text]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        if (activeCommand && commandQuery !== null) {
          activeCommand.action();
          setText("");
          setCommandQuery(null);
          return;
        }
        submit();
        return;
      }

      if (event.key === "Escape") {
        setCommandQuery(null);
      }
    },
    [activeCommand, commandQuery, submit],
  );

  const setTextWithCommands = useCallback(
    (value: string) => {
      setText(value);

      const slashMatch = value.match(/(?:^|\s)\/([a-zA-Z0-9-_]*)$/);
      if (slashMatch) {
        setCommandQuery(slashMatch[1] ?? "");
      } else {
        setCommandQuery(null);
      }
    },
    [],
  );

  return {
    text,
    setText: setTextWithCommands,
    attachments,
    addAttachment,
    removeAttachment,
    activeCommand,
    filteredCommands,
    handleKeyDown,
    submit,
    isSubmitting,
  };
}
