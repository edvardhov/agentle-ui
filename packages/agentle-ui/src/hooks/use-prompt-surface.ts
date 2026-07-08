import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import {
  DEFAULT_MAX_ATTACHMENTS,
  DEFAULT_MAX_FILE_SIZE_BYTES,
} from "../constants";
import type { PromptAttachment, SlashCommand } from "../types";

export interface UsePromptSurfaceOptions {
  commands?: SlashCommand[];
  maxAttachments?: number;
  maxFileSize?: number;
  onSubmit?: (text: string, attachments: PromptAttachment[]) => void | Promise<void>;
  disabled?: boolean;
}

export interface UsePromptSurfaceResult {
  text: string;
  setText: (text: string) => void;
  attachments: PromptAttachment[];
  addAttachment: (file: File) => void;
  removeAttachment: (id: string) => void;
  activeCommand: SlashCommand | null;
  selectedCommandIndex: number;
  filteredCommands: SlashCommand[];
  handleKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  submit: () => void | Promise<void>;
  isSubmitting: boolean;
}

export function usePromptSurface(options: UsePromptSurfaceOptions = {}): UsePromptSurfaceResult {
  const {
    commands = [],
    maxAttachments = DEFAULT_MAX_ATTACHMENTS,
    maxFileSize = DEFAULT_MAX_FILE_SIZE_BYTES,
    onSubmit,
    disabled = false,
  } = options;

  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<PromptAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commandQuery, setCommandQuery] = useState<string | null>(null);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);

  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current = onSubmit;

  const filteredCommands = useMemo(() => {
    if (commandQuery === null) return [];
    const query = commandQuery.toLowerCase();
    return commands.filter((command) => command.name.toLowerCase().includes(query));
  }, [commandQuery, commands]);

  useEffect(() => {
    setSelectedCommandIndex(0);
  }, [commandQuery, filteredCommands.length]);

  const activeCommand = filteredCommands[selectedCommandIndex] ?? null;

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

  const submit = useCallback(async () => {
    if (disabled || isSubmitting) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    try {
      await onSubmitRef.current?.(trimmed, attachments);
      setText("");
      setAttachments([]);
      setCommandQuery(null);
    } finally {
      setIsSubmitting(false);
    }
  }, [attachments, disabled, isSubmitting, text]);

  const selectCommand = useCallback((command: SlashCommand) => {
    command.action();
    setText("");
    setCommandQuery(null);
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      const paletteOpen = commandQuery !== null && filteredCommands.length > 0;

      if (paletteOpen && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
        event.preventDefault();
        setSelectedCommandIndex((current) => {
          if (filteredCommands.length === 0) return 0;
          if (event.key === "ArrowDown") {
            return (current + 1) % filteredCommands.length;
          }
          return (current - 1 + filteredCommands.length) % filteredCommands.length;
        });
        return;
      }

      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        if (paletteOpen && activeCommand) {
          selectCommand(activeCommand);
          return;
        }
        submit();
        return;
      }

      if (event.key === "Escape") {
        setCommandQuery(null);
      }
    },
    [activeCommand, commandQuery, filteredCommands.length, selectCommand, submit],
  );

  const setTextWithCommands = useCallback((value: string) => {
    setText(value);

    const slashMatch = value.match(/(?:^|\s)\/([a-zA-Z0-9-_]*)$/);
    if (slashMatch) {
      setCommandQuery(slashMatch[1] ?? "");
    } else {
      setCommandQuery(null);
    }
  }, []);

  return {
    text,
    setText: setTextWithCommands,
    attachments,
    addAttachment,
    removeAttachment,
    activeCommand,
    selectedCommandIndex,
    filteredCommands,
    handleKeyDown,
    submit,
    isSubmitting,
  };
}
