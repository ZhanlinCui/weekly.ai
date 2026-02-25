"use client";

import { useState } from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import { useLocale } from "@/i18n";
import { useChat } from "./use-chat";
import { ChatPanel } from "./chat-panel";
import { ChatSuggestions } from "./chat-suggestions";

export function ChatBar() {
  const { locale, t } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const { messages, isLoading, sendMessage, clearMessages } = useChat({ locale });

  function handleOpen(text?: string) {
    setIsOpen(true);
    if (text) {
      sendMessage(text);
    }
  }

  function handleMinimize() {
    setIsOpen(false);
  }

  function handleBarSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("chatInput") as HTMLInputElement;
    const val = input?.value.trim();
    if (!val) return;
    input.value = "";
    handleOpen(val);
  }

  if (isOpen) {
    return (
      <div className="chat-overlay">
        <div className="chat-overlay__backdrop" onClick={handleMinimize} />
        <ChatPanel
          messages={messages}
          isLoading={isLoading}
          onSend={sendMessage}
          onMinimize={handleMinimize}
        />
      </div>
    );
  }

  return (
    <div className="chat-bar">
      <form className="chat-bar__form" onSubmit={handleBarSubmit}>
        <span className="chat-bar__icon">
          <Sparkles size={18} />
        </span>
        <input
          name="chatInput"
          type="text"
          className="chat-bar__input"
          placeholder={t.chat.placeholder}
          autoComplete="off"
          onFocus={() => handleOpen()}
        />
        <button type="submit" className="chat-bar__send" aria-label={t.chat.send}>
          <ArrowUp size={16} />
        </button>
      </form>
      <ChatSuggestions onSelect={(text) => handleOpen(text)} compact />
    </div>
  );
}
