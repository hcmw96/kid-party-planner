import { useLocation, useNavigate } from "react-router-dom";
import { CalendarDays, PlusCircle } from "lucide-react";
import { haptic } from "@/lib/despia";

const tabs = [
  { path: "/parties", label: "Parties", icon: CalendarDays },
  { path: "/create", label: "Create", icon: PlusCircle },
] as const;

const NativeTabBar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === "/parties") {
      return (
        location.pathname === "/parties" ||
        location.pathname.startsWith("/dashboard")
      );
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="native-tab-bar" aria-label="Main">
      <div
        className="grid grid-cols-2"
        style={{ minHeight: "var(--native-tab-height)" }}
      >
        {tabs.map(({ path, label, icon: Icon }) => {
          const active = isActive(path);
          return (
            <button
              key={path}
              type="button"
              onClick={async () => {
                await haptic("light");
                navigate(path);
              }}
              className={`flex flex-col items-center justify-center gap-0.5 pt-1.5 ${
                active ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <Icon
                className="h-[22px] w-[22px]"
                strokeWidth={active ? 2.25 : 1.75}
              />
              <span className="text-[10px] font-sans font-medium leading-none">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default NativeTabBar;
