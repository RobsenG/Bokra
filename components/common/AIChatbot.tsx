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

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-[#f8fafc] border border-[#e5e7eb] rounded-2xl rounded-tl-sm px-4 py-2.5 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed] animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed] animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed] animate-bounce [animation-delay:300ms]" />
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
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#7c3aed] hover:bg-[#5b21b6] shadow-[0_4px_14px_0_rgb(124_58_237_/_0.4)] flex items-center justify-center transition-all duration-200 cursor-pointer text-white"
          aria-label="Open AI Chat"
        >
          <Bot className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#a855f7] opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#7c3aed]" />
          </span>
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] sm:w-[380px] bg-white rounded-2xl border border-[#e5e7eb] shadow-[0_20px_60px_0_rgb(0_0_0_/_0.15)] flex flex-col overflow-hidden max-h-[520px] h-[520px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#5b21b6] to-[#7c3aed] px-4 py-3.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-white/10 rounded-lg">
                <Sparkles className="w-4 h-4 text-purple-200" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Bokra Stay AI</h3>
                <p className="text-[10px] text-purple-200">Policy & Help Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/15 rounded-lg transition-colors cursor-pointer text-white"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8fafc]">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col gap-0.5 ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={
                    msg.role === "user"
                      ? "bg-[#7c3aed] text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm max-w-[80%] ml-auto"
                      : "bg-[#f8fafc] border border-[#e5e7eb] text-[#111827] rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm max-w-[80%]"
                  }
                >
                  {msg.role === "user" ? (
                    <p className="text-xs leading-relaxed font-medium">{msg.content}</p>
                  ) : (
                    <MessageContent content={msg.content} />
                  )}
                </div>
                <span className="text-[9px] text-[#6b7280] px-1 font-medium">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            ))}

            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {showQuickReplies && !loading && (
            <div className="px-3 pt-2 pb-1.5 bg-white border-t border-[#e5e7eb] shrink-0">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-[#6b7280] mb-1.5 px-0.5">
                Quick questions
              </p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_REPLIES.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(chip)}
                    className="inline-flex px-3 py-1.5 rounded-full border border-[#7c3aed]/30 bg-[#7c3aed]/5 text-[#7c3aed] text-xs font-medium hover:bg-[#7c3aed]/10 cursor-pointer transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Footer */}
          <div className="border-t border-[#e5e7eb] p-3 flex flex-col gap-1.5 bg-white shrink-0">
            <div className="flex items-center gap-2">
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
                className={`flex-1 px-4 py-2.5 rounded-xl border text-sm text-[#111827] bg-white placeholder:text-[#6b7280] focus:outline-none focus:ring-2 transition-all duration-200 ${
                  isOverLimit
                    ? "border-red-400 focus:ring-red-400/20 focus:border-red-500"
                    : "border-[#e5e7eb] focus:ring-[#7c3aed]/20 focus:border-[#7c3aed]"
                }`}
                aria-label="Chat input"
              />
              <button
                onClick={() => handleSend(input)}
                disabled={loading || !input.trim() || isOverLimit}
                className="w-9 h-9 rounded-xl bg-[#7c3aed] hover:bg-[#5b21b6] text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-end px-0.5">
              <span
                className={`text-[9px] font-mono font-semibold ${
                  isOverLimit ? "text-red-500" : "text-[#6b7280]"
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
