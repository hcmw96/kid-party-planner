import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  isDespia,
  setStatusBarColor,
  setStatusBarTextColor,
  registerPush,
} from "@/lib/despia";
import { useAuth } from "@/hooks/useAuth";

declare global {
  interface Window {
    focusin?: () => void;
    focusout?: () => void;
    openParties?: () => void;
    openCreateParty?: () => void;
  }
}

export function useDespia() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isDespia) return;
    void setStatusBarColor("{247, 245, 242}");
    void setStatusBarTextColor("black");
  }, []);

  useEffect(() => {
    if (!isDespia || !user) return;
    void registerPush(user.id);
  }, [user]);

  // Refresh host data when returning from background (Messages, Mail, etc.).
  useEffect(() => {
    if (!isDespia) return;

    window.focusin = () => {
      void queryClient.invalidateQueries({ queryKey: ["events"] });
      void queryClient.invalidateQueries({ queryKey: ["guests"] });
      void queryClient.invalidateQueries({ queryKey: ["event"] });
    };

    window.focusout = () => {
      // Pause nothing critical yet — reserved for future draft persistence.
    };

    return () => {
      delete window.focusin;
      delete window.focusout;
    };
  }, [queryClient]);

  // Despia Editor Quick Actions → globals (see docs/despia-editor.md).
  useEffect(() => {
    window.openParties = () => {
      window.location.assign("/parties");
    };
    window.openCreateParty = () => {
      window.location.assign("/create");
    };
    return () => {
      delete window.openParties;
      delete window.openCreateParty;
    };
  }, []);
}
