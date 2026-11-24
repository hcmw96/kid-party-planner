import type { ButtonHTMLAttributes, ReactNode } from "react";
import { haptic } from "@/lib/despia";

type Variant = "filled" | "plain" | "destructive";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
  hapticOnPress?: "light" | "heavy" | "success" | "warning" | "error" | false;
}

const classFor: Record<Variant, string> = {
  filled: "native-btn-filled",
  plain: "native-btn-plain",
  destructive: "native-btn-destructive",
};

const NativeButton = ({
  variant = "filled",
  children,
  hapticOnPress = "light",
  onClick,
  ...rest
}: Props) => {
  return (
    <button
      type="button"
      className={classFor[variant]}
      onClick={async (e) => {
        if (hapticOnPress) await haptic(hapticOnPress);
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </button>
  );
};

export default NativeButton;
