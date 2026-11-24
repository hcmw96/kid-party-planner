import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { haptic } from "@/lib/despia";

interface Props {
  title?: string;
  subtitle?: string;
  largeTitle?: string;
  backLabel?: string;
  onBack?: () => void;
  trailing?: ReactNode;
}

const NativeNavBar = ({ title, subtitle, largeTitle, backLabel = "Back", onBack, trailing }: Props) => {
  const handleBack = async () => {
    await haptic("light");
    onBack?.();
  };

  return (
    <header className="native-nav">
      <div
        className={`flex items-center justify-between px-3 ${subtitle ? "py-3.5" : ""}`}
        style={{ minHeight: subtitle ? "72px" : "var(--native-nav-height)" }}
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

        <div className="min-w-0 flex-1 px-3 text-center">
          {!largeTitle ? (
            <>
              <p className="truncate text-[17px] font-bold leading-none tracking-[-0.03em] text-foreground">{title}</p>
              {subtitle ? (
                <p className="mt-1.5 truncate text-[13px] font-medium leading-none text-[#71677F]">{subtitle}</p>
              ) : null}
            </>
          ) : null}
        </div>

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
