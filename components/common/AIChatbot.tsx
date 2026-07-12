"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Sparkles, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am your Bokra Stay AI Assistant. 🪄 How can I help you find your next short-term stay in Ethiopia today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestionChips = [
    "Stays in Hawassa 🌅",
    "Bole Addis Ababa condos 🏙️",
    "How to pay with Chapa? 💳",
    "Properties near Wachemo University 🎓",
  ];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const history = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok) throw new Error("Failed to connect to assistant");

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error) {
      console.error("Chatbot Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I am having trouble connecting right now. Please try again in a few moments.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-xl hover:shadow-teal-500/20 hover:scale-105 active:scale-95 transition-all duration-300 group cursor-pointer"
        >
          <Bot className="size-6 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-450 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
          </span>
        </button>
      )}

      {/* Chat Window Popup */}
      {isOpen && (
        <div className="w-[380px] sm:w-[400px] h-[550px] bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-350 ease-out">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/10 rounded-xl">
                <Sparkles className="size-5 text-teal-100" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm tracking-tight">Bokra Stay AI</h3>
                <p className="text-[10px] text-teal-100 font-medium">Online Helper • LLaMA-3.1</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/15 rounded-lg transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Message Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50 dark:bg-neutral-950/40">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[82%] p-3.5 rounded-2xl text-xs md:text-sm leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "bg-teal-600 text-white rounded-br-none"
                      : "bg-white dark:bg-neutral-850 text-neutral-800 dark:text-neutral-250 rounded-bl-none border border-neutral-100 dark:border-neutral-800/60"
                  }`}
                >
                  <p className="whitespace-pre-line font-medium">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-neutral-850 p-3.5 rounded-2xl rounded-bl-none border border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin text-teal-600 dark:text-teal-400" />
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold">AI is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions (Rendered only when last message is assistant or list is short) */}
          {messages.length < 5 && !loading && (
            <div className="px-4 py-2 bg-neutral-50/50 dark:bg-neutral-950/20 border-t border-neutral-100 dark:border-neutral-850 flex flex-wrap gap-1.5">
              {suggestionChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "").trim())}
                  className="px-3 py-1.5 bg-white hover:bg-neutral-50 dark:bg-neutral-850 dark:hover:bg-neutral-800 border border-neutral-250/70 dark:border-neutral-750/70 rounded-full text-[10px] md:text-xs font-semibold text-neutral-600 dark:text-neutral-355 transition-colors cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Footer Input */}
          <div className="p-3 border-t border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
              placeholder="Type your message..."
              className="flex-1 h-10 px-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-750 rounded-xl text-xs md:text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition-all text-neutral-850 dark:text-neutral-150"
            />
            <button
              onClick={() => handleSend(input)}
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
