"use client";

import { useLocale } from "@/i18n";

type ChatSuggestionsProps = {
  onSelect: (text: string) => void;
  compact?: boolean;
};

export function ChatSuggestions({ onSelect, compact = false }: ChatSuggestionsProps) {
  const { t } = useLocale();

  const chips = [
    t.chat.chipDarkHorse,
    t.chat.chipFunding,
    t.chat.chipHardware,
    t.chat.chipTrend,
    t.chat.chipAgent,
    t.chat.chipRising,
  ];

  const visible = compact ? chips.slice(0, 4) : chips;

  return (
    <div className="chat-suggestions">
      {visible.map((chip) => (
        <button
          key={chip}
          type="button"
          className="chat-chip"
          onClick={() => onSelect(chip)}
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
