import type { InvitationTemplate } from "@/lib/templates";

interface Props {
  template: InvitationTemplate;
  childName: string;
  selected: boolean;
  onSelect: () => void;
}

const InvitationPreview = ({ template, childName, selected, onSelect }: Props) => {
  const displayName = childName || "Your Child";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left rounded-lg overflow-hidden transition-all duration-300 ${
        selected ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : "hover:shadow-md"
      }`}
    >
      {/* Landscape invitation preview */}
      <div
        className="aspect-[16/9] flex flex-col items-center justify-center p-6 relative"
        style={{
          backgroundColor: template.palette.background,
          color: template.palette.text,
          fontFamily: template.fontFamily,
        }}
      >
        {/* Decorative border */}
        <div
          className="absolute inset-3 border"
          style={{ borderColor: template.palette.accent + "40" }}
        />

        <div className="text-center space-y-2 z-10">
          <p
            className="text-[10px] tracking-widest uppercase"
            style={{ color: template.palette.muted }}
          >
            You're invited to
          </p>
          <h3
            className="text-xl font-semibold"
            style={{
              fontStyle: template.fontStyle || "normal",
              textTransform: template.textTransform || "none",
              letterSpacing: template.letterSpacing || "normal",
            }}
          >
            {displayName}'s Party
          </h3>
          <div
            className="w-10 h-px mx-auto"
            style={{ backgroundColor: template.palette.accent }}
          />
        </div>
      </div>

      {/* Label */}
      <div className="px-4 py-2.5 bg-card">
        <p className="font-sans text-sm font-medium text-foreground">{template.name}</p>
        <p className="font-sans text-xs text-muted-foreground">{template.description}</p>
      </div>
    </button>
  );
};

export default InvitationPreview;
