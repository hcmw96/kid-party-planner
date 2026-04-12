import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useEvent } from "@/hooks/useEvent";
import { useGuests } from "@/hooks/useGuests";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GuestList from "@/components/GuestList";
import GiftProgress from "@/components/GiftProgress";
import { Copy, Check, Send, Bell, LogOut, CalendarDays, MapPin } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user, loading: authLoading, signOut } = useAuth();
  const { data: event, isLoading: eventLoading } = useEvent(eventId);
  const { data: guests = [], isLoading: guestsLoading } = useGuests(eventId);
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  if (authLoading || eventLoading || guestsLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  if (!event || event.organiser_id !== user.id) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Not authorised</div>;
  }

  const shareUrl = `${window.location.origin}/party/${eventId}`;
  const attending = guests.filter((g) => g.rsvp_status === "attending");
  const dietaryNotes = attending
    .filter((g) => g.dietary_notes)
    .map((g) => `${g.name}: ${g.dietary_notes}`);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy");
    }
  };

  const handleSendUpdate = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-event-email", {
        body: { event_id: eventId, message: message.trim(), type: "update" },
      });
      if (error) throw error;
      toast.success("Update sent to all attending guests!");
      setMessage("");
    } catch {
      toast.error("Failed to send — try again");
    } finally {
      setSending(false);
    }
  };

  const handleSendReminder = async () => {
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-event-email", {
        body: { event_id: eventId, type: "reminder" },
      });
      if (error) throw error;
      toast.success("Reminder sent to non-responders!");
    } catch {
      toast.error("Failed to send — try again");
    } finally {
      setSending(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen px-6 py-8 max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{event.child_name}'s Party</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {new Date(event.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {event.location}</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      {/* Share link */}
      <Button onClick={handleCopy} variant="outline" className="w-full justify-start gap-2">
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied!" : "Copy share link"}
      </Button>

      {/* Gift progress */}
      <GiftProgress event={event} guests={guests} />

      {/* Dietary summary */}
      {dietaryNotes.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">🥜 Dietary Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {dietaryNotes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Guest list */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Guest List ({guests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <GuestList guests={guests} />
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Send a message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Type an update for attending parents..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
          />
          <div className="flex gap-3">
            <Button onClick={handleSendUpdate} disabled={sending || !message.trim()} className="flex-1">
              <Send className="h-4 w-4 mr-1" /> Send update
            </Button>
            <Button onClick={handleSendReminder} disabled={sending} variant="outline" className="flex-1">
              <Bell className="h-4 w-4 mr-1" /> Nudge
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
