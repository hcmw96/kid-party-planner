import { useState } from "react";
import { Pin, PinOff, Trash2 } from "lucide-react";
import { useEventThread, type ThreadMessage } from "@/hooks/useEventThread";
import { Button } from "@/components/ui/button";

interface Props {
  eventId: string;
  /** Host view adds pin and delete controls and posts as the host. */
  isHost?: boolean;
  /** Pre-fills the name field. Hosts always post under their own name. */
  defaultName?: string;
}

const underlineBase =
  "w-full border-0 border-b bg-transparent px-0 py-2 text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-colors duration-200 font-sans";
const underlineIdle = "border-muted-foreground/30";
const underlineFilled = "border-foreground";

const NAME_KEY = "partypal:thread-name";

const formatWhen = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  return sameDay
    ? d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
};

const EventThread = ({ eventId, isHost = false, defaultName }: Props) => {
  const { pinned, thread, loading, error, post, setPinned, destroy } =
    useEventThread(eventId);

  // Guests are anonymous, so their name is remembered per browser only.
  const [name, setName] = useState(() => {
    if (defaultName) return defaultName;
    try {
      return localStorage.getItem(NAME_KEY) ?? "";
    } catch {
      return "";
    }
  });
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  const canSend = name.trim().length > 0 && content.trim().length > 0 && !sending;

  const send = async () => {
    if (!canSend) return;
    setSending(true);
    setPostError(null);
    try {
      await post({
        authorType: isHost ? "host" : "guest",
        authorName: name,
        content,
      });
      setContent("");
      if (!isHost) {
        try {
          localStorage.setItem(NAME_KEY, name.trim());
        } catch {
          /* private browsing, not worth surfacing */
        }
      }
    } catch (err: any) {
      setPostError(err.message || "Could not post that. Try again.");
    } finally {
      setSending(false);
    }
  };

  const Bubble = ({ message }: { message: ThreadMessage }) => {
    const fromHost = message.author_type === "host";
    return (
      <div className={`flex ${fromHost ? "justify-start" : "justify-end"}`}>
        <div
          className={`max-w-[85%] rounded-lg px-4 py-3 ${
            fromHost
              ? "bg-foreground text-background"
              : "bg-accent text-foreground border border-border"
          }`}
        >
          <div className="flex items-baseline justify-between gap-3 mb-1">
            <span
              className={`text-[10px] uppercase tracking-[0.18em] font-sans ${
                fromHost ? "text-background/70" : "text-muted-foreground"
              }`}
            >
              {message.author_name}
              {fromHost && " · Host"}
            </span>
            <span
              className={`text-[10px] font-sans shrink-0 ${
                fromHost ? "text-background/50" : "text-muted-foreground/70"
              }`}
            >
              {formatWhen(message.created_at)}
            </span>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
          {isHost && (
            <div className="flex gap-3 mt-2 pt-2 border-t border-current/15">
              <button
                onClick={() => setPinned(message.id, !message.pinned)}
                className={`text-[10px] uppercase tracking-[0.15em] font-sans inline-flex items-center gap-1 transition-opacity hover:opacity-70 ${
                  fromHost ? "text-background/70" : "text-muted-foreground"
                }`}
              >
                {message.pinned ? (
                  <PinOff className="h-3 w-3" strokeWidth={1.5} />
                ) : (
                  <Pin className="h-3 w-3" strokeWidth={1.5} />
                )}
                {message.pinned ? "Unpin" : "Pin"}
              </button>
              <button
                onClick={() => destroy(message.id)}
                className={`text-[10px] uppercase tracking-[0.15em] font-sans inline-flex items-center gap-1 transition-opacity hover:opacity-70 ${
                  fromHost ? "text-background/70" : "text-muted-foreground"
                }`}
              >
                <Trash2 className="h-3 w-3" strokeWidth={1.5} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <section className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-sans mb-2">
          Party thread
        </p>
        <h3 className="text-2xl font-serif italic text-foreground">
          {isHost ? "Talk to your guests" : "Questions and updates"}
        </h3>
      </div>

      {/* Pinned logistics sit above the conversation and stay put. */}
      {pinned.length > 0 && (
        <div className="space-y-2">
          {pinned.map((m) => (
            <div
              key={m.id}
              className="rounded-lg border border-foreground/15 bg-accent/60 px-4 py-3"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Pin className="h-3 w-3 text-muted-foreground" strokeWidth={1.5} />
                <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-sans">
                  Pinned by {m.author_name}
                </span>
              </div>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
                {m.content}
              </p>
              {isHost && (
                <button
                  onClick={() => setPinned(m.id, false)}
                  className="mt-2 text-[10px] uppercase tracking-[0.15em] font-sans text-muted-foreground inline-flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <PinOff className="h-3 w-3" strokeWidth={1.5} />
                  Unpin
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <p className="text-xs text-destructive font-sans">{error}</p>
      ) : thread.length === 0 ? (
        <p className="text-sm text-muted-foreground font-sans leading-relaxed">
          {isHost
            ? "Nothing here yet. Post the practical details and guests will see them straight away."
            : "No messages yet. Ask the host anything about the party."}
        </p>
      ) : (
        <div className="space-y-3">
          {thread.map((m) => (
            <Bubble key={m.id} message={m} />
          ))}
        </div>
      )}

      <div className="space-y-4 pt-2">
        {!isHost && (
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-sans">
              Your name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="First name"
              maxLength={80}
              className={`${underlineBase} ${name ? underlineFilled : underlineIdle}`}
            />
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-sans">
            Message
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              isHost
                ? "Parking is on the left, and the party starts at 2pm sharp."
                : "Ask a question…"
            }
            rows={3}
            maxLength={2000}
            className={`${underlineBase} ${
              content ? underlineFilled : underlineIdle
            } resize-none rounded-none`}
          />
        </div>

        {postError && (
          <p className="text-xs text-destructive font-sans">{postError}</p>
        )}

        <Button
          onClick={send}
          disabled={!canSend}
          size="lg"
          className="w-full uppercase tracking-[0.15em]"
        >
          {sending ? "Posting…" : "Post message"}
        </Button>
      </div>
    </section>
  );
};

export default EventThread;
