"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, X, Send, Sparkles } from "lucide-react";

const MAX_CHARS = 500;

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Render assistant message content — converts leading "- " list items to <li> elements */
function MessageContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = (key: string) => {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={key} className="list-disc list-inside space-y-0.5 pl-1">
          {listBuffer.map((item, i) => (
            <li key={i} className="text-xs leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      );
      listBuffer = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      listBuffer.push(trimmed.replace(/^[-•]\s+/, ""));
    } else {
      flushList(`list-${idx}`);
      if (trimmed) {
        elements.push(
          <p key={`p-${idx}`} className="text-xs leading-relaxed">
            {trimmed}
          </p>
        );
      }
    }
  });
  flushList("list-end");

  return <div className="space-y-1.5">{elements}</div>;
}

/** Animated typing indicator */
function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1.5 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

const QUICK_REPLIES = [
  "How do I book a property?",
  "How does payment work?",
  "How do I list my property?",
  "What is the platform fee?",
];

const GREETING_MESSAGE: Message = {
  role: "assistant",
  content:
    "Hi! I'm your Bokra Stay assistant. I can help with bookings, property listings, payments, and platform policies. What can I help you with?",
  timestamp: new Date().toISOString(),
};

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const charCount = input.length;
  const isOverLimit = charCount > MAX_CHARS;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading || trimmed.length > MAX_CHARS) return;

      const userMessage: Message = {
        role: "user",
        content: trimmed,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setLoading(true);
      setShowQuickReplies(false);

      // Build conversation history for context (exclude greeting)
      const history = messages
        .filter((m) => m.content !== GREETING_MESSAGE.content)
        .map((m) => ({ role: m.role, content: m.content }));

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, conversationHistory: history }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to connect");
        }

        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.response || "I didn't catch that. Please try again.",
            timestamp: data.timestamp || new Date().toISOString(),
          },
        ]);
      } catch (error) {
        console.error("Chatbot Error:", error);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Sorry, I'm having trouble connecting. Please try again in a moment.",
            timestamp: new Date().toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages]
  );

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <>
          <style>{`
            @keyframes ai-bounce {
              0%, 100% { transform: translateY(0) scale(1); }
              30%       { transform: translateY(-10px) scale(1.05); }
              60%       { transform: translateY(-4px) scale(1.02); }
            }
            .ai-float-btn { animation: ai-bounce 2.8s ease-in-out infinite; }
            .ai-float-btn:hover { animation: none; transform: scale(1.1); }
          `}</style>
          <button
            onClick={() => setIsOpen(true)}
            className="ai-float-btn relative flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-600 text-white shadow-xl hover:shadow-teal-500/30 active:scale-95 transition-transform duration-200 cursor-pointer"
            aria-label="Open AI Chat"
          >
            <Bot className="size-6" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500" />
            </span>
          </button>
        </>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[580px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white flex justify-between items-center shadow-md shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/10 rounded-xl">
                <Sparkles className="size-5 text-teal-100" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm tracking-tight">Bokra Stay AI</h3>
                <p className="text-[10px] text-teal-100 font-medium">
                  Online • Policy-Focused Assistant
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/15 rounded-lg transition-colors cursor-pointer"
              aria-label="Close chat"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Message Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50 dark:bg-neutral-950/40">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col gap-0.5 ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[84%] px-3.5 py-2.5 rounded-2xl shadow-sm ${
                    msg.role === "user"
                      ? "bg-teal-600 text-white rounded-br-none"
                      : "bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-bl-none border border-neutral-100 dark:border-neutral-700"
                  }`}
                >
                  {msg.role === "user" ? (
                    <p className="text-xs leading-relaxed font-medium">{msg.content}</p>
                  ) : (
                    <MessageContent content={msg.content} />
                  )}
                </div>
                <span className="text-[9px] text-neutral-400 px-1 font-medium">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            ))}

            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {showQuickReplies && !loading && (
            <div className="px-3 pt-2 pb-1 bg-neutral-50/80 dark:bg-neutral-900/60 border-t border-neutral-100 dark:border-neutral-800 shrink-0">
              <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 px-0.5">
                Quick questions
              </p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_REPLIES.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(chip)}
                    className="px-2.5 py-1.5 bg-white dark:bg-neutral-800 hover:bg-teal-50 dark:hover:bg-teal-950/30 border border-neutral-200 dark:border-neutral-700 hover:border-teal-400 rounded-full text-[10px] font-semibold text-neutral-600 dark:text-neutral-300 hover:text-teal-700 dark:hover:text-teal-400 transition-all cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Footer */}
          <div className="p-3 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0 space-y-1.5">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(input);
                  }
                }}
                placeholder="Ask about Bokra Stay..."
                maxLength={MAX_CHARS + 50}
                className={`flex-1 h-10 px-3 rounded-xl text-xs outline-none transition-all border ${
                  isOverLimit
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/10 bg-red-50 dark:bg-red-950/20"
                    : "border-neutral-200 dark:border-neutral-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 bg-neutral-50 dark:bg-neutral-950"
                } text-neutral-800 dark:text-neutral-100`}
                aria-label="Chat input"
              />
              <button
                onClick={() => handleSend(input)}
                disabled={loading || !input.trim() || isOverLimit}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                aria-label="Send message"
              >
                <Send className="size-4" />
              </button>
            </div>

            {/* Character counter */}
            <div className="flex justify-end px-0.5">
              <span
                className={`text-[9px] font-mono font-semibold ${
                  isOverLimit
                    ? "text-red-500"
                    : charCount > MAX_CHARS * 0.85
                    ? "text-amber-500"
                    : "text-neutral-300 dark:text-neutral-600"
                }`}
              >
                {charCount}/{MAX_CHARS}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
