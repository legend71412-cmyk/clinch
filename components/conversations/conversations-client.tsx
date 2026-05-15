"use client";

import { useState, useEffect, useRef } from "react";
import { Bot, Send, ToggleLeft, ToggleRight, MessageSquare, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn, formatRelativeTime, truncate, getLeadFullName } from "@/lib/utils";
import { sendMessage, toggleAI, markConversationRead } from "@/actions/conversations";
import type { Conversation, Message, Business } from "@/types";
import { createClient } from "@/lib/supabase/client";

interface ConversationsClientProps {
  initialConversations: (Conversation & { lead?: any })[];
  business: Pick<Business, "id" | "name" | "booking_link" | "ai_tone">;
}

export function ConversationsClient({ initialConversations, business }: ConversationsClientProps) {
  const [conversations, setConversations] = useState(initialConversations);
  const [selected, setSelected] = useState<string | null>(initialConversations[0]?.id ?? null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<{ label: string; text: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const selectedConv = conversations.find((c) => c.id === selected);

  // Load messages when conversation changes
  useEffect(() => {
    if (!selected) return;
    loadMessages(selected);
    markConversationRead(selected);
  }, [selected]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!selected) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${selected}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${selected}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selected]);

  async function loadMessages(conversationId: string) {
    setIsLoadingMessages(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("sent_at", { ascending: true });
    setMessages((data as Message[]) ?? []);
    setIsLoadingMessages(false);
  }

  async function handleSend() {
    if (!draft.trim() || !selected || !selectedConv) return;
    const content = draft.trim();
    setDraft("");
    setIsSending(true);
    const result = await sendMessage({ conversationId: selected, content, channel: selectedConv.channel });
    if (!result.success) {
      toast({ title: "Send failed", description: result.error, variant: "destructive" });
      setDraft(content);
    }
    setIsSending(false);
  }

  async function handleToggleAI() {
    if (!selected || !selectedConv) return;
    const newState = !selectedConv.ai_active;
    setConversations((prev) =>
      prev.map((c) => (c.id === selected ? { ...c, ai_active: newState } : c))
    );
    await toggleAI(selected, newState);
  }

  async function generateSuggestions() {
    if (!selected) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: selected }),
      });
      const data = await res.json();
      setSuggestions(data.suggestions ?? []);
    } catch {
      toast({ title: "Could not generate suggestions", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] max-w-7xl mx-auto -m-6 overflow-hidden rounded-xl border border-border bg-white dark:bg-gray-900">
      {/* Conversation list */}
      <div className="w-72 shrink-0 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-base">Conversations</h2>
          <p className="text-xs text-muted-foreground">{conversations.length} total</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No conversations yet.
            </div>
          ) : (
            conversations.map((conv) => {
              const name = conv.lead
                ? getLeadFullName(conv.lead)
                : "Unknown Lead";
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelected(conv.id)}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 text-left hover:bg-accent/50 transition-colors border-b border-border/40",
                    selected === conv.id && "bg-brand-50 dark:bg-brand-900/10"
                  )}
                >
                  <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900/20 flex items-center justify-center text-brand-700 dark:text-brand-300 font-semibold text-sm shrink-0">
                    {name[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={cn("text-sm font-medium truncate", selected === conv.id && "text-brand-700 dark:text-brand-300")}>
                        {name}
                      </span>
                      {conv.unread_count > 0 && (
                        <span className="w-4 h-4 bg-brand-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold ml-1 shrink-0">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {conv.last_message ? truncate(conv.last_message, 40) : "No messages"}
                    </div>
                    <div className="text-[10px] text-muted-foreground/70 mt-0.5">
                      {formatRelativeTime(conv.updated_at)}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Message pane */}
      {selectedConv ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Conversation header */}
          <div className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-2">
              <div className="font-semibold text-sm">
                {selectedConv.lead ? getLeadFullName(selectedConv.lead) : "Unknown"}
              </div>
              <Badge variant="outline" className="text-[10px] capitalize">{selectedConv.channel}</Badge>
              {selectedConv.lead?.status && (
                <Badge variant="outline" className="text-[10px] capitalize">{selectedConv.lead.status}</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* AI toggle */}
              <button
                onClick={handleToggleAI}
                className={cn(
                  "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors",
                  selectedConv.ai_active
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400"
                    : "border-border text-muted-foreground hover:bg-accent"
                )}
              >
                <Bot className="w-3 h-3" />
                AI {selectedConv.ai_active ? "On" : "Off"}
                {selectedConv.ai_active ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
              </button>
              {/* Suggest button */}
              <Button variant="outline" size="sm" onClick={generateSuggestions} disabled={isGenerating}>
                <Sparkles className={cn("w-3.5 h-3.5 mr-1.5", isGenerating && "animate-spin")} />
                Suggest
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoadingMessages ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-12">
                No messages yet. Start the conversation below.
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn("flex", msg.direction === "outbound" ? "justify-end" : "justify-start")}
                >
                  <div className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    msg.direction === "outbound"
                      ? "bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-tr-sm"
                      : "bg-gray-100 dark:bg-gray-800 rounded-tl-sm"
                  )}>
                    {msg.ai_generated && (
                      <div className={cn("flex items-center gap-1 text-[10px] mb-1", msg.direction === "outbound" ? "text-white/70" : "text-muted-foreground")}>
                        <Bot className="w-3 h-3" />
                        AI generated
                      </div>
                    )}
                    <p>{msg.content}</p>
                    <div className={cn("text-[10px] mt-1", msg.direction === "outbound" ? "text-white/60" : "text-muted-foreground")}>
                      {formatRelativeTime(msg.sent_at)}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* AI suggestions */}
          {suggestions.length > 0 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s.label}
                  onClick={() => { setDraft(s.text); setSuggestions([]); }}
                  className="text-xs bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 rounded-full px-3 py-1 hover:bg-brand-100 transition-colors"
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border flex gap-2 items-end shrink-0">
            <Textarea
              placeholder={`Type a message (${selectedConv.channel.toUpperCase()})...`}
              className="resize-none text-sm min-h-[40px] max-h-[120px]"
              rows={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button
              className="gradient-brand text-white shrink-0 h-10 w-10 p-0"
              onClick={handleSend}
              disabled={!draft.trim() || isSending}
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Select a conversation to start</p>
          </div>
        </div>
      )}
    </div>
  );
}
