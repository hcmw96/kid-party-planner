import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ThreadMessage {
  id: string;
  event_id: string;
  author_type: "host" | "guest";
  author_name: string;
  content: string;
  pinned: boolean;
  created_at: string;
}

const TABLE = "messages";

/**
 * Loads an event's thread and keeps it live.
 *
 * Realtime delivers inserts, updates (pinning) and deletes for this event
 * only. Rows are reconciled by id so a message the local client just posted
 * is not duplicated when its own insert echoes back.
 */
export const useEventThread = (eventId: string | undefined) => {
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const upsert = useCallback((row: ThreadMessage) => {
    setMessages((prev) => {
      const next = prev.some((m) => m.id === row.id)
        ? prev.map((m) => (m.id === row.id ? row : m))
        : [...prev, row];
      return next.sort((a, b) => a.created_at.localeCompare(b.created_at));
    });
  }, []);

  const remove = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  useEffect(() => {
    if (!eventId) return;
    let active = true;

    (async () => {
      setLoading(true);
      setError(null);
      const { data, error: loadError } = await supabase
        .from(TABLE)
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: true });

      if (!active) return;
      if (loadError) {
        setError(loadError.message);
      } else {
        setMessages((data ?? []) as ThreadMessage[]);
      }
      setLoading(false);
    })();

    const channel = supabase
      .channel(`event-thread-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: TABLE,
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const old = payload.old as Partial<ThreadMessage>;
            if (old?.id) remove(old.id);
            return;
          }
          upsert(payload.new as ThreadMessage);
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [eventId, upsert, remove]);

  const post = useCallback(
    async (input: {
      authorType: "host" | "guest";
      authorName: string;
      content: string;
    }) => {
      if (!eventId) throw new Error("No event");
      const { error: postError } = await supabase.from(TABLE).insert({
        event_id: eventId,
        author_type: input.authorType,
        author_name: input.authorName.trim(),
        content: input.content.trim(),
      });
      if (postError) throw new Error(postError.message);
    },
    [eventId],
  );

  const setPinned = useCallback(async (id: string, pinned: boolean) => {
    const { error: pinError } = await supabase
      .from(TABLE)
      .update({ pinned })
      .eq("id", id);
    if (pinError) throw new Error(pinError.message);
  }, []);

  const destroy = useCallback(async (id: string) => {
    const { error: delError } = await supabase.from(TABLE).delete().eq("id", id);
    if (delError) throw new Error(delError.message);
  }, []);

  const pinned = messages.filter((m) => m.pinned);
  const thread = messages.filter((m) => !m.pinned);

  return { messages, pinned, thread, loading, error, post, setPinned, destroy };
};
