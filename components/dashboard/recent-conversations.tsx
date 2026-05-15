import Link from "next/link";
import { ArrowRight, MessageSquare, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRelativeTime, truncate } from "@/lib/utils";
import type { Conversation } from "@/types";

interface RecentConversationsProps {
  conversations: (Conversation & { lead?: { first_name: string; last_name: string | null } | null })[];
}

export function RecentConversations({ conversations }: RecentConversationsProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-base">Conversations</h3>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/conversations" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </Button>
      </div>

      {conversations.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          Conversations will appear here as leads respond.
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const ChannelIcon = conv.channel === "sms" ? MessageSquare : Mail;
            const name = conv.lead
              ? `${conv.lead.first_name} ${conv.lead.last_name ?? ""}`.trim()
              : "Unknown Lead";

            return (
              <Link
                key={conv.id}
                href={`/conversations/${conv.id}`}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/20 flex items-center justify-center text-brand-700 dark:text-brand-300 text-xs font-bold shrink-0">
                  {name[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-sm truncate">{name}</span>
                    {conv.unread_count > 0 && (
                      <span className="w-4 h-4 bg-brand-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold shrink-0">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {conv.last_message ? truncate(conv.last_message, 50) : "No messages yet"}
                  </div>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <div className="text-xs text-muted-foreground">{formatRelativeTime(conv.updated_at)}</div>
                  <ChannelIcon className="w-3 h-3 text-muted-foreground" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
