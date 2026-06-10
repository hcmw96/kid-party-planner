import { useEffect } from "react";
import { isDespia, setStatusBarColor, registerPush } from "@/lib/despia";
import { useAuth } from "@/hooks/useAuth";

export function useDespia() {
  const { user } = useAuth();

  useEffect(() => {
    if (!isDespia) return;
    setStatusBarColor("{240, 247, 244}");
  }, []);

  useEffect(() => {
    if (!isDespia || !user) return;
    registerPush(user.id);
  }, [user]);
}
