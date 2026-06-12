"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { SendHorizonal, Bot, User, RefreshCcw } from "lucide-react";

export function PlaygroundChat({ agentId, agentName }: { agentId: string; agentName: string }) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error, clearError, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ai/chat",
      body: { agentId },
    }),
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    void sendMessage({ text });
  }

  return (
    <div className="card flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Bot size={32} style={{ color: "var(--faint)" }} aria-hidden />
            <p className="mt-3 text-sm font-medium">Test {agentName} before deploying</p>
            <p className="mt-1 max-w-sm text-[13px]" style={{ color: "var(--faint)" }}>
              Messages here are charged against your org credits but are not saved as
              customer conversations.
            </p>
          </div>
        )}

        {messages.map((m) => {
          const text = m.parts
            .filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
            .map((p) => p.text)
            .join("");
          const isUser = m.role === "user";
          return (
            <div key={m.id} className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                style={{
                  background: isUser ? "rgba(255,92,26,.10)" : "rgba(39,66,255,.08)",
                  color: isUser ? "var(--accent)" : "var(--brand)",
                }}
                aria-hidden
              >
                {isUser ? <User size={14} /> : <Bot size={14} />}
              </span>
              <div
                className="max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                style={{
                  background: isUser ? "rgba(39,66,255,.05)" : "var(--surface)",
                  border: "1px solid var(--border)",
                  borderTopLeftRadius: isUser ? undefined : 6,
                  borderTopRightRadius: isUser ? 6 : undefined,
                }}
              >
                {text}
                {!isUser && busy && m.id === messages[messages.length - 1]?.id && (
                  <span
                    className="ml-1 inline-block h-3.5 w-0.5 align-middle"
                    style={{ background: "var(--brand)", animation: "pulse-soft .8s ease infinite" }}
                    aria-hidden
                  />
                )}
              </div>
            </div>
          );
        })}

        {status === "submitted" && (
          <div className="flex items-center gap-2 pl-10 text-[13px]" style={{ color: "var(--faint)" }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--brand)", animation: "pulse-soft 1s ease infinite" }} />
            Thinking…
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="flex items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm"
            style={{ background: "rgba(248,113,113,.08)", border: "1px solid rgba(248,113,113,.25)", color: "var(--danger)" }}
          >
            <span>{error.message || "Something went wrong."}</span>
            <button onClick={clearError} className="btn-ghost shrink-0 text-[12px]" style={{ color: "var(--danger)" }}>
              <RefreshCcw size={12} aria-hidden /> Dismiss
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <form
        onSubmit={submit}
        className="flex items-end gap-2 border-t p-3"
        style={{ borderColor: "var(--border)" }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          placeholder={`Message ${agentName}…  (Enter to send, Shift+Enter for newline)`}
          className="input max-h-32 flex-1 resize-none"
          aria-label="Message"
        />
        {busy ? (
          <button type="button" onClick={() => stop()} className="btn-secondary" aria-label="Stop generating">
            Stop
          </button>
        ) : (
          <button type="submit" disabled={!input.trim()} className="btn-primary" aria-label="Send message">
            <SendHorizonal size={15} aria-hidden />
          </button>
        )}
      </form>
    </div>
  );
}
