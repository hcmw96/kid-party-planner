import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

export const NativeList = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className={`native-list ${className}`.trim()}>{children}</div>
);

interface RowProps {
  title: string;
  subtitle?: string;
  onClick?: () => void;
  trailing?: ReactNode;
  showChevron?: boolean;
}

export const NativeListRow = ({
  title,
  subtitle,
  onClick,
  trailing,
  showChevron = true,
}: RowProps) => {
  const content = (
    <>
      <div className="flex-1 min-w-0">
        <p className="text-[17px] font-sans text-foreground truncate">{title}</p>
        {subtitle ? (
          <p className="text-[13px] font-sans text-muted-foreground truncate mt-0.5">
            {subtitle}
          </p>
        ) : null}
      </div>
      {trailing}
      {showChevron && onClick ? (
        <ChevronRight className="h-5 w-5 text-muted-foreground/50 shrink-0" strokeWidth={1.75} />
      ) : null}
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="native-list-row">
        {content}
      </button>
    );
  }

  return <div className="native-list-row">{content}</div>;
};
