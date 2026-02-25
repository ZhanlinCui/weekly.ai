"use client";

import { useCallback, useRef, useState } from "react";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: string[];
  isStreaming?: boolean;
};

type UseChatOptions = {
  locale: string;
};

const API_BASE =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1")
    : "http://localhost:5000/api/v1";

let msgCounter = 0;
function nextId() {
  msgCounter += 1;
  return `msg-${Date.now()}-${msgCounter}`;
}

const TYPING_SPEED = 18;

export function useChat({ locale }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      if (typingRef.current) {
        clearInterval(typingRef.current);
        typingRef.current = null;
      }

      const userMsg: ChatMessage = { id: nextId(), role: "user", content: trimmed };
      const assistantId = nextId();
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsLoading(true);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(`${API_BASE}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, locale }),
          signal: controller.signal,
        });

        const data = await res.json();
        const fullContent = data.content || data.message || "";

        if (!fullContent || !data.success) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: fullContent || "__ERROR__", isStreaming: false }
                : m
            )
          );
          setIsLoading(false);
          return;
        }

        let charIndex = 0;
        typingRef.current = setInterval(() => {
          charIndex += 2;
          const partial = fullContent.slice(0, charIndex);
          const done = charIndex >= fullContent.length;

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: partial, isStreaming: !done }
                : m
            )
          );

          if (done) {
            if (typingRef.current) clearInterval(typingRef.current);
            typingRef.current = null;
            setIsLoading(false);
          }
        }, TYPING_SPEED);

      } catch (err) {
        if ((err as Error).name === "AbortError") return;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: "__ERROR__", isStreaming: false }
              : m
          )
        );
        setIsLoading(false);
      }
    },
    [isLoading, locale]
  );

  const clearMessages = useCallback(() => {
    abortRef.current?.abort();
    if (typingRef.current) {
      clearInterval(typingRef.current);
      typingRef.current = null;
    }
    setMessages([]);
    setIsLoading(false);
  }, []);

  return { messages, isLoading, sendMessage, clearMessages };
}
