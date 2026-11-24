import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useEvent } from "@/hooks/useEvent";
import { useGuests } from "@/hooks/useGuests";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MoreHorizontal } from "lucide-react";
import GuestList from "@/components/GuestList";
import GiftProgress from "@/components/GiftProgress";
import InvitationCard from "@/components/InvitationCard";
import NativeNavBar from "@/components/native/NativeNavBar";
import { Field, FieldArea } from "@/components/design/Field";
import AddressField from "@/components/AddressField";
import { getShareUrl } from "@/lib/shareUrl";
import { shareMessage } from "@/lib/sharePreview";
import { getTemplate } from "@/lib/templates";
import { ageFromTitle, birthdayTitle, countdownLabel, formatPartyDate, formatUkDate, splitPartyNotes } from "@/lib/party";
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
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState({
    childName: "",
    date: "",
    location: "",
    locationAddress: "",
    locationLat: null as number | null,
    locationLng: null as number | null,
    description: "",
    giftEnabled: false,
    giftAmount: "10",
  });

  if (authLoading || eventLoading || guestsLoading) {
    return (
      <div>
        <NativeNavBar title="Party" onBack={() => navigate("/parties")} backLabel="Parties" />
        <div className="mx-auto max-w-lg space-y-4 px-5 py-6">
          <div className="h-44 animate-pulse rounded-[24px] bg-[#EAE2F8]" />
          <div className="h-8 w-1/2 animate-pulse rounded-full bg-[#EAE2F8]" />
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
      <div className="flex min-h-[50vh] items-center justify-center px-6 text-center text-[#71677F]">
        This party belongs to someone else.
      </div>
    );
  }

  const shareUrl = getShareUrl(eventId!);
  const template = getTemplate(event.template || "classic");
  const { timeLabel, body } = splitPartyNotes(event.description);
  const artUrl = event.art_url;

  const handleShare = async () => {
    try {
      await nativeShare(
        shareMessage({
          childName: event.child_name,
          title: event.title,
          date: event.date,
          location: event.location,
          description: event.description,
        }),
        shareUrl,
      );
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
      toast.error("There's no artwork to save");
      return;
    }
    try {
      await saveImageToPhotos(artUrl);
      await haptic("success");
      toast.success("Saved to Photos");
    } catch {
      await haptic("error");
      toast.error("Couldn't save the image");
    }
  };

  const handleRemindMe = async () => {
    const partyDate = new Date(`${event.date}T08:00:00`);
    const delaySeconds = Math.floor((partyDate.getTime() - Date.now()) / 1000);
    if (delaySeconds < 60) {
      toast.error("The party is too soon for a morning reminder");
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
      toast.success("We'll nudge you on the morning of the party");
    } catch {
      toast.error("Couldn't schedule the reminder");
    }
  };

  const openActions = async () => {
    await haptic("light");
    if (!isDespia) {
      await handleShare();
      return;
    }
    const value = await showActionSheet({
      title: event.title,
      items: [
        { label: "Share party link", value: "share", iconIos: "square.and.arrow.up", iconAndroid: "share" },
        { label: "Copy link", value: "copy", iconIos: "doc.on.doc", iconAndroid: "content_copy" },
        { label: "Preview invitation", value: "preview", iconIos: "eye", iconAndroid: "visibility" },
        ...(artUrl
          ? [{ label: "Save artwork to Photos", value: "save", iconIos: "square.and.arrow.down", iconAndroid: "download" }]
          : []),
        { label: "Remind me on the day", value: "remind", iconIos: "bell", iconAndroid: "notifications" },
      ],
    });
    if (value === "share") await handleShare();
    else if (value === "copy") await handleCopy();
    else if (value === "preview") window.open(`/party/${eventId}`, "_blank");
    else if (value === "save") await handleSaveImage();
    else if (value === "remind") await handleRemindMe();
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
      toast.success("Update sent to everyone coming");
      setMessage("");
    } catch {
      await haptic("error");
      toast.error("Couldn't send that");
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
      toast.error("Couldn't send the reminder");
    } finally {
      await hideSpinner();
      setSending(false);
    }
  };

  const startEdit = () => {
    setEditDraft({
      childName: event.child_name,
      date: event.date,
      location: event.location,
      locationAddress: event.location_address ?? "",
      locationLat: event.location_lat,
      locationLng: event.location_lng,
      description: event.description ?? "",
      giftEnabled: event.gift_enabled,
      giftAmount: event.gift_amount ? String(event.gift_amount / 100) : "10",
    });
    setEditing(true);
  };

  const saveEdit = async () => {
    setSending(true);
    try {
      const years = ageFromTitle(event.title);
      const { error } = await supabase
        .from("events")
        .update({
          child_name: editDraft.childName.trim(),
          title: birthdayTitle(editDraft.childName, years ? String(years) : ""),
          date: editDraft.date,
          location: editDraft.location.trim(),
          location_address: editDraft.locationAddress.trim() || null,
          location_lat: editDraft.locationLat,
          location_lng: editDraft.locationLng,
          description: editDraft.description.trim() || null,
          gift_enabled: editDraft.giftEnabled,
          gift_amount: editDraft.giftEnabled ? Math.round(parseFloat(editDraft.giftAmount) * 100) : 0,
        })
        .eq("id", event.id);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      await queryClient.invalidateQueries({ queryKey: ["events", user.id] });
      setEditing(false);
      toast.success("Party updated");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Couldn't save those changes");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="pb-10">
      <NativeNavBar
        title={`${event.child_name}'s party`}
        subtitle={formatUkDate(event.date)}
        onBack={() => navigate("/parties")}
        backLabel="Parties"
        trailing={
          <button type="button" onClick={() => void openActions()} className="native-btn-plain p-2" aria-label="More">
            <MoreHorizontal className="h-6 w-6" strokeWidth={1.75} />
          </button>
        }
      />

      <div className="mx-auto max-w-lg space-y-8 px-5 pt-4">
        <div className="overflow-hidden rounded-[24px] shadow-[0_16px_40px_rgba(40,32,53,0.08)]">
          <InvitationCard
            template={template}
            childName={event.child_name}
            age={ageFromTitle(event.title)}
            dateLabel={formatPartyDate(event.date)}
            timeLabel={timeLabel}
            location={event.location}
            artUrl={artUrl}
            variant="poster"
          />
        </div>

        <div>
          <p className="text-[15px] font-semibold text-[#6B7AFF]">{countdownLabel(event.date)}</p>
          <h1 className="mt-1 text-[2rem] font-extrabold leading-none tracking-[-0.045em] text-[#282035]">
            {event.child_name}'s birthday
          </h1>
          <p className="mt-2 text-[15px] text-[#71677F]">
            {[formatPartyDate(event.date), timeLabel, event.location].filter(Boolean).join(" · ")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button type="button" className="soft-button" onClick={() => void handleShare()}>
            Share invitation
          </button>
          <button
            type="button"
            className="soft-button"
            onClick={() => document.getElementById("guests")?.scrollIntoView({ behavior: "smooth", block: "start" })}
          >
            View guest list
          </button>
          <button type="button" className="soft-button" onClick={startEdit}>
            Edit party
          </button>
          <button type="button" className="soft-button" onClick={() => void handleSendReminder()} disabled={sending}>
            Send reminder
          </button>
        </div>

        {editing ? (
          <section className="space-y-4 rounded-[24px] bg-white p-5 shadow-[0_8px_24px_rgba(40,32,53,0.04)]">
            <h2 className="text-[1.15rem] font-extrabold tracking-[-0.03em] text-[#282035]">Edit party</h2>
            <Field label="Name" name="edit-name" value={editDraft.childName} onChange={(e) => setEditDraft((d) => ({ ...d, childName: e.target.value }))} />
            <Field label="Date" name="edit-date" type="date" value={editDraft.date} onChange={(e) => setEditDraft((d) => ({ ...d, date: e.target.value }))} />
            <AddressField
              value={editDraft.location}
              onChange={(place) =>
                setEditDraft((draft) => ({
                  ...draft,
                  location: place.label,
                  locationAddress: place.address ?? "",
                  locationLat: place.lat,
                  locationLng: place.lng,
                }))
              }
            />
            <FieldArea label="Note on the invitation" name="edit-description" rows={4} value={editDraft.description} onChange={(e) => setEditDraft((d) => ({ ...d, description: e.target.value }))} />
            <label className="flex items-center justify-between gap-3 text-[15px] font-semibold text-[#282035]">
              Group gift
              <input
                type="checkbox"
                checked={editDraft.giftEnabled}
                onChange={(e) => setEditDraft((d) => ({ ...d, giftEnabled: e.target.checked }))}
                className="h-5 w-5 accent-[#282035]"
              />
            </label>
            {editDraft.giftEnabled ? (
              <Field
                label="Suggested amount (£)"
                name="edit-gift"
                type="number"
                min={1}
                value={editDraft.giftAmount}
                onChange={(e) => setEditDraft((d) => ({ ...d, giftAmount: e.target.value }))}
              />
            ) : null}
            <button type="button" className="ink-button" onClick={() => void saveEdit()} disabled={sending}>
              Save changes
            </button>
            <button type="button" className="ghost-button w-full" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </section>
        ) : null}

        <section id="guests" className="space-y-4">
          <h2 className="text-[1.25rem] font-extrabold tracking-[-0.03em] text-[#282035]">Guest responses</h2>
          <GuestList guests={guests} />
        </section>

        <GiftProgress event={event} guests={guests} />

        {body ? <p className="text-[14px] leading-relaxed text-[#71677F]">{body}</p> : null}

        <section className="space-y-3">
          <h2 className="text-[1.25rem] font-extrabold tracking-[-0.03em] text-[#282035]">A note to parents</h2>
          <FieldArea
            label="Message"
            name="update"
            rows={3}
            placeholder="Running ten minutes late, or bring a jumper…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button type="button" className="ink-button" onClick={() => void handleSendUpdate()} disabled={sending || !message.trim()}>
            Send to everyone coming
          </button>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
