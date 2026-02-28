"use client";

import { useMemo } from "react";
import { useLocale } from "@/i18n";

type ChatSuggestionsProps = {
  onSelect: (text: string) => void;
  compact?: boolean;
};

export function ChatSuggestions({ onSelect, compact = false }: ChatSuggestionsProps) {
  const { t } = useLocale();

  const suggestions = useMemo(
    () => [
      t.chat.chipDarkHorse,
      t.chat.chipFunding,
      t.chat.chipHardware,
      t.chat.chipTrend,
      t.chat.chipAgent,
      t.chat.chipRising,
    ],
    [t]
  );

  const visible = compact ? suggestions.slice(0, 4) : suggestions;

  return (
    <div className="chat-suggestions">
      {visible.map((text) => (
        <button key={text} type="button" className="chat-chip" onClick={() => onSelect(text)}>
          {text}
        </button>
      ))}
    </div>
  );
}
