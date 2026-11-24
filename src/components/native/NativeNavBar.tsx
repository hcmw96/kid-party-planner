import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { haptic } from "@/lib/despia";

interface Props {
  title?: string;
  largeTitle?: string;
  backLabel?: string;
  onBack?: () => void;
  trailing?: ReactNode;
}

const NativeNavBar = ({ title, largeTitle, backLabel = "Back", onBack, trailing }: Props) => {
  const handleBack = async () => {
    await haptic("light");
    onBack?.();
  };

  return (
    <header className="native-nav">
      <div
        className="flex items-center justify-between px-2"
        style={{ minHeight: "var(--native-nav-height)" }}
      >
        <div className="min-w-[72px] flex items-center">
          {onBack ? (
            <button
              type="button"
              onClick={handleBack}
              className="native-btn-plain inline-flex items-center gap-0.5 -ml-1 text-[17px]"
            >
              <ChevronLeft className="h-6 w-6 -mr-0.5" strokeWidth={2} />
              <span className="text-[17px]">{backLabel}</span>
            </button>
          ) : null}
        </div>

        <p className="flex-1 text-center text-[17px] font-semibold font-sans text-foreground truncate px-2">
          {!largeTitle ? title : null}
        </p>

        <div className="min-w-[72px] flex items-center justify-end gap-1">{trailing}</div>
      </div>

      {largeTitle ? (
        <div className="px-4 pb-2 pt-1">
          <h1 className="text-[34px] leading-tight font-bold tracking-tight font-sans text-foreground">
            {largeTitle}
          </h1>
        </div>
      ) : null}
    </header>
  );
};

export default NativeNavBar;
