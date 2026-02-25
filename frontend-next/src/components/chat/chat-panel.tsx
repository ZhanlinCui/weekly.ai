"use client";

import { useEffect, useRef } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { useLocale } from "@/i18n";
import type { ChatMessage } from "./use-chat";
import { ChatMessageBubble } from "./chat-message";
import { ChatSuggestions } from "./chat-suggestions";

type ChatPanelProps = {
  messages: ChatMessage[];
  isLoading: boolean;
  onSend: (text: string) => void;
  onMinimize: () => void;
};

export function ChatPanel({ messages, isLoading, onSend, onMinimize }: ChatPanelProps) {
  const { t } = useLocale();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = inputRef.current;
    if (!input) return;
    const val = input.value.trim();
    if (!val) return;
    input.value = "";
    onSend(val);
  }

  const hasMessages = messages.length > 0;

  return (
    <div className="chat-panel">
      <header className="chat-panel__header">
        <div className="chat-panel__title">
          <Sparkles size={16} />
          <span>{t.chat.title}</span>
        </div>
        <button
          type="button"
          className="chat-panel__minimize"
          onClick={onMinimize}
          aria-label={t.chat.minimize}
        >
          <ChevronDown size={18} />
        </button>
      </header>

      <div className="chat-panel__body" ref={scrollRef}>
        {!hasMessages ? (
          <div className="chat-welcome">
            <p className="chat-welcome__text">{t.chat.welcome}</p>
            <ChatSuggestions onSelect={onSend} />
          </div>
        ) : (
          <div className="chat-messages">
            {messages.map((msg) => (
              <ChatMessageBubble key={msg.id} message={msg} />
            ))}
            {isLoading && messages[messages.length - 1]?.content === "" ? (
              <div className="chat-thinking">
                <span className="chat-thinking__dot" />
                <span className="chat-thinking__dot" />
                <span className="chat-thinking__dot" />
              </div>
            ) : null}
          </div>
        )}
      </div>

      {hasMessages ? (
        <div className="chat-panel__suggestions-row">
          <ChatSuggestions onSelect={onSend} compact />
        </div>
      ) : null}

      <form className="chat-panel__input-row" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          className="chat-panel__input"
          placeholder={t.chat.placeholder}
          disabled={isLoading}
          autoComplete="off"
        />
        <button
          type="submit"
          className="chat-panel__send"
          disabled={isLoading}
          aria-label={t.chat.send}
        >
          {t.chat.send}
        </button>
      </form>

      <div className="chat-panel__footer">
        <span className="chat-panel__powered">{t.chat.poweredBy}</span>
      </div>
    </div>
  );
}
