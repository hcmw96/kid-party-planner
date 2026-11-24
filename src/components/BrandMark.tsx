import balloonIcon from "@/assets/balloon-icon.png";

interface Props {
  size?: number;
  className?: string;
  showWordmark?: boolean;
  inverted?: boolean;
}

const BrandMark = ({
  size = 40,
  className = "",
  showWordmark = false,
  inverted = false,
}: Props) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`.trim()}>
      <img
        src={balloonIcon}
        alt=""
        width={size}
        height={size}
        className="brand-mark object-contain"
        style={{ width: size, height: size }}
      />
      {showWordmark ? (
        <span
          className={`font-sans font-bold tracking-tight text-[20px] ${
            inverted ? "text-white" : "text-foreground"
          }`}
        >
          PartyPal
        </span>
      ) : null}
    </div>
  );
};

export default BrandMark;
