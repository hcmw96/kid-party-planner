import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useEvent } from "@/hooks/useEvent";
import { useGuests } from "@/hooks/useGuests";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import GuestList from "@/components/GuestList";
import GiftProgress from "@/components/GiftProgress";
import { MoreHorizontal, Send, Bell } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getShareUrl } from "@/lib/shareUrl";
import NativeNavBar from "@/components/native/NativeNavBar";
import NativeButton from "@/components/native/NativeButton";
import {
  nativeShare,
  haptic,
  isDespia,
  showActionSheet,
  saveImageToPhotos,
  scheduleLocalPush,
  showSpinner,
  hideSpinner,
} from "@/lib/despia";

const Dashboard = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user, loading: authLoading } = useAuth();
  const { data: event, isLoading: eventLoading } = useEvent(eventId);
  const { data: guests = [], isLoading: guestsLoading } = useGuests(eventId);
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  if (authLoading || eventLoading || guestsLoading) {
    return (
      <div className="animate-fade-in">
        <NativeNavBar title="Dashboard" onBack={() => navigate("/parties")} backLabel="Parties" />
        <div className="px-6 py-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  if (!event || event.organiser_id !== user.id) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground font-sans">
        Not authorised
      </div>
    );
  }

  const shareUrl = getShareUrl(eventId!);
  const attending = guests.filter((g) => g.rsvp_status === "attending");
  const dietaryNotes = attending
    .filter((g) => g.dietary_notes)
    .map((g) => `${g.name}: ${g.dietary_notes}`);
  const artUrl = (event as { art_url?: string | null }).art_url;

  const handleShare = async () => {
    try {
      await nativeShare(`Come to ${event.child_name}'s party!`, shareUrl);
      await haptic("success");
      if (!isDespia) toast.success("Link ready");
    } catch {
      await haptic("error");
      toast.error("Couldn't share");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      await haptic("success");
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy");
    }
  };

  const handleSaveImage = async () => {
    if (!artUrl) {
      toast.error("No invitation artwork to save");
      return;
    }
    try {
      await saveImageToPhotos(artUrl);
      await haptic("success");
      toast.success("Saved to Photos");
    } catch {
      await haptic("error");
      toast.error("Couldn't save image");
    }
  };

  const handleRemindMe = async () => {
    const partyDate = new Date(event.date);
    partyDate.setHours(8, 0, 0, 0);
    const delaySeconds = Math.floor((partyDate.getTime() - Date.now()) / 1000);
    if (delaySeconds < 60) {
      toast.error("Party is too soon to schedule a reminder");
      return;
    }
    try {
      await scheduleLocalPush({
        title: `${event.child_name}'s party today`,
        body: `Don't forget — ${event.location}`,
        delaySeconds,
        url: `/dashboard/${eventId}`,
      });
      await haptic("success");
      toast.success("Reminder scheduled for the morning of the party");
    } catch {
      toast.error("Couldn't schedule reminder");
    }
  };

  const openActions = async () => {
    await haptic("light");

    if (isDespia) {
      const items = [
        {
          label: "Share party link",
          value: "share",
          iconIos: "square.and.arrow.up",
          iconAndroid: "share",
        },
        {
          label: "Copy link",
          value: "copy",
          iconIos: "doc.on.doc",
          iconAndroid: "content_copy",
        },
        {
          label: "Preview invitation",
          value: "preview",
          iconIos: "eye",
          iconAndroid: "visibility",
        },
        ...(artUrl
          ? [
              {
                label: "Save artwork to Photos",
                value: "save",
                iconIos: "square.and.arrow.down",
                iconAndroid: "download",
              },
            ]
          : []),
        {
          label: "Remind me on the day",
          value: "remind",
          iconIos: "bell",
          iconAndroid: "notifications",
        },
      ];

      const value = await showActionSheet({
        title: `${event.child_name}'s Party`,
        items,
      });

      if (value === "share") await handleShare();
      else if (value === "copy") await handleCopy();
      else if (value === "preview") window.open(`/party/${eventId}`, "_blank");
      else if (value === "save") await handleSaveImage();
      else if (value === "remind") await handleRemindMe();
      return;
    }

    await handleShare();
  };

  const handleSendUpdate = async () => {
    if (!message.trim()) return;
    setSending(true);
    await showSpinner();
    try {
      const { error } = await supabase.functions.invoke("send-event-email", {
        body: { event_id: eventId, message: message.trim(), type: "update" },
      });
      if (error) throw error;
      await haptic("success");
      toast.success("Update sent to attending guests");
      setMessage("");
    } catch {
      await haptic("error");
      toast.error("Failed to send");
    } finally {
      await hideSpinner();
      setSending(false);
    }
  };

  const handleSendReminder = async () => {
    setSending(true);
    await showSpinner();
    try {
      const { error } = await supabase.functions.invoke("send-event-email", {
        body: { event_id: eventId, type: "reminder" },
      });
      if (error) throw error;
      await haptic("success");
      toast.success("Reminder sent");
    } catch {
      await haptic("error");
      toast.error("Failed to send");
    } finally {
      await hideSpinner();
      setSending(false);
    }
  };

  const dateLabel = new Date(event.date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="animate-fade-in pb-8">
      <NativeNavBar
        title={`${event.child_name}'s Party`}
        onBack={() => navigate("/parties")}
        backLabel="Parties"
        trailing={
          <button
            type="button"
            onClick={() => void openActions()}
            className="native-btn-plain p-2"
            aria-label="More"
          >
            <MoreHorizontal className="h-6 w-6" strokeWidth={1.75} />
          </button>
        }
      />

      <div className="px-4 pt-4 space-y-6 max-w-lg mx-auto">
        <p className="text-[13px] text-muted-foreground font-sans px-1">
          {dateLabel} · {event.location}
        </p>

        <NativeButton onClick={() => void openActions()} hapticOnPress="light">
          {isDespia ? "Share & more" : "Share party link"}
        </NativeButton>

        <GiftProgress event={event} guests={guests} />

        {dietaryNotes.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-sans font-medium">Dietary Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5 text-sm text-muted-foreground font-sans">
                {dietaryNotes.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-sans font-medium">
              Guest List ({guests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GuestList guests={guests} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-sans font-medium">Send a message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Type an update for attending parents..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => void handleSendUpdate()}
                disabled={sending || !message.trim()}
                className="native-btn-filled flex-1 h-11 text-[15px] gap-1.5 disabled:opacity-40"
              >
                <Send className="h-4 w-4 inline mr-1" strokeWidth={1.5} />
                Send update
              </button>
              <button
                type="button"
                onClick={() => void handleSendReminder()}
                disabled={sending}
                className="flex-1 h-11 rounded-xl border border-border text-[15px] font-semibold font-sans disabled:opacity-40"
              >
                <Bell className="h-4 w-4 inline mr-1" strokeWidth={1.5} />
                Nudge
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
