"use client";

import { Sparkles, User } from "lucide-react";
import type { ChatMessage } from "./use-chat";
import { useLocale } from "@/i18n";

type ChatMessageProps = {
  message: ChatMessage;
};

export function ChatMessageBubble({ message }: ChatMessageProps) {
  const { t } = useLocale();
  const isUser = message.role === "user";
  const isError = message.content === "__ERROR__";

  return (
    <div className={`chat-message ${isUser ? "chat-message--user" : "chat-message--assistant"}`}>
      <div className="chat-message__avatar">
        {isUser ? <User size={14} /> : <Sparkles size={14} />}
      </div>
      <div className="chat-message__content">
        {isError ? (
          <p className="chat-message__error">{t.chat.error}</p>
        ) : (
          <>
            <div className="chat-message__text">
              {message.content}
              {message.isStreaming ? <span className="chat-cursor" /> : null}
            </div>
            {message.products?.length ? (
              <div className="chat-message__products">
                {message.products.map((id) => (
                  <a
                    key={id}
                    href={`/product/${encodeURIComponent(id)}`}
                    className="chat-product-link"
                  >
                    {id}
                  </a>
                ))}
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
