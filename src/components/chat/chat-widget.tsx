"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Bot, User, Sparkles, ShoppingCart, Flame, Search, Gift, HelpCircle, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const STORAGE_KEY = "shopmo-chat";

const QUICK_ACTIONS = [
  { label: "🔥 Today's deals", icon: Flame, query: "What flash deals do you have right now? I want the best savings!" },
  { label: "🛒 Shop trending", icon: ShoppingCart, query: "Show me your most popular trending products right now" },
  { label: "🎁 Gift ideas", icon: Gift, query: "I need gift ideas, what do you recommend?" },
  { label: "📦 Track order", icon: Package, query: "I want to track my order" },
  { label: "🔍 Find product", icon: Search, query: "I'm looking for a specific product, can you help me find it?" },
  { label: "❓ Help", icon: HelpCircle, query: "What can you help me with? Tell me everything you can do" },
];

function loadChat(): { messages: Message[]; isOpen: boolean } {
  if (typeof window === "undefined") return { messages: [], isOpen: false };
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { messages: [], isOpen: false };
}

function saveChat(messages: Message[], isOpen: boolean) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, isOpen }));
  } catch { /* ignore */ }
}

export function ChatWidget() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load chat from sessionStorage on mount
  useEffect(() => {
    const saved = loadChat();
    if (saved.messages.length > 0) {
      setMessages(saved.messages);
      setIsOpen(saved.isOpen);
      setShowPulse(false);
    }
    setMounted(true);
  }, []);

  // Save chat to sessionStorage whenever messages or open state changes
  useEffect(() => {
    if (mounted) {
      saveChat(messages, isOpen);
    }
  }, [messages, isOpen, mounted]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Auto-pulse after 15 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen && messages.length === 0) {
        setShowPulse(true);
      }
    }, 15000);
    return () => clearTimeout(timer);
  }, [isOpen, messages.length]);

  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageText.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const chatHistory = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistory }),
      });

      const data = await res.json();

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response || "Let me look into that for you!",
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Oops, something went wrong! Try again or browse our [products](/products) directly.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickAction = (query: string) => {
    sendMessage(query);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setShowPulse(false);
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "Hey there! 👋 I'm **ShopMO AI** — your personal shopping assistant, product hunter, and full customer service team!\n\nI can find any product, hunt down the best deals, track your orders, handle returns, and recommend the perfect items for you.\n\n**We've got 🔥 flash deals ending soon!** What can I help you with?",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  // Parse markdown-like formatting safely (no dangerouslySetInnerHTML)
  const renderMessage = (content: string) => {
    // Split by newlines first
    const lines = content.split("\n");
    return (
      <span>
        {lines.map((line, lineIdx) => {
          // Parse bold and links within each line
          const parts: React.ReactNode[] = [];
          let remaining = line;
          let partKey = 0;

          while (remaining.length > 0) {
            // Check for bold **text**
            const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
            // Check for link [text](url)
            const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);

            // Find which comes first
            const boldIdx = boldMatch ? remaining.indexOf(boldMatch[0]) : Infinity;
            const linkIdx = linkMatch ? remaining.indexOf(linkMatch[0]) : Infinity;

            if (boldIdx === Infinity && linkIdx === Infinity) {
              // No more special formatting
              parts.push(<span key={partKey++}>{remaining}</span>);
              break;
            }

            if (boldIdx <= linkIdx && boldMatch) {
              // Bold comes first
              if (boldIdx > 0) {
                parts.push(<span key={partKey++}>{remaining.slice(0, boldIdx)}</span>);
              }
              parts.push(<strong key={partKey++}>{boldMatch[1]}</strong>);
              remaining = remaining.slice(boldIdx + boldMatch[0].length);
            } else if (linkMatch) {
              // Link comes first — only allow safe relative URLs
              if (linkIdx > 0) {
                parts.push(<span key={partKey++}>{remaining.slice(0, linkIdx)}</span>);
              }
              const href = linkMatch[2];
              const isSafe = href.startsWith("/") || href.startsWith("https://shopmo");
              if (isSafe) {
                parts.push(
                  <a key={partKey++} href={href} className="text-primary underline hover:text-primary/80 font-medium">
                    {linkMatch[1]}
                  </a>
                );
              } else {
                parts.push(<span key={partKey++}>{linkMatch[1]}</span>);
              }
              remaining = remaining.slice(linkIdx + linkMatch[0].length);
            }
          }

          return (
            <span key={lineIdx}>
              {lineIdx > 0 && <br />}
              {parts}
            </span>
          );
        })}
      </span>
    );
  };

  if (!mounted) return null;

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-20 lg:bottom-6 right-4 z-50 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-105 flex items-center justify-center group"
        >
          <MessageCircle size={24} />
          {showPulse && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full animate-ping" />
          )}
          {showPulse && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full" />
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 lg:bottom-6 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-cyan-700 text-white p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">ShopMO AI</h3>
                <p className="text-xs text-white/80 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full inline-block" />
                  Online — Ready to help
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1",
                    msg.role === "user" ? "bg-primary text-white" : "bg-gradient-to-br from-primary to-cyan-600 text-white"
                  )}
                >
                  {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div
                  className={cn(
                    "max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-primary text-white rounded-br-md"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm"
                  )}
                >
                  {renderMessage(msg.content)}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-cyan-600 text-white flex items-center justify-center shrink-0">
                  <Bot size={14} />
                </div>
                <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions (only show at start) */}
          {messages.length <= 1 && !isLoading && (
            <div className="px-4 pb-2 pt-1 bg-gray-50 shrink-0">
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 flex-wrap">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action.query)}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700 hover:border-primary hover:text-primary transition-colors whitespace-nowrap shrink-0"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-white border-t border-gray-200 shrink-0"
          >
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:hover:bg-primary shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
