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
      {/* Mini invitation card */}
      <div
        className="aspect-[4/5] flex flex-col items-center justify-center p-8 relative"
        style={{
          backgroundColor: template.palette.background,
          color: template.palette.text,
          fontFamily: template.fontFamily,
        }}
      >
        {/* Decorative border */}
        <div
          className="absolute inset-4 border"
          style={{ borderColor: template.palette.accent + "40" }}
        />

        <div className="text-center space-y-3 z-10">
          <p
            className="text-xs tracking-widest uppercase"
            style={{ color: template.palette.muted }}
          >
            You're invited to
          </p>
          <h3
            className="text-2xl font-semibold"
            style={{
              fontStyle: template.fontStyle || "normal",
              textTransform: template.textTransform || "none",
              letterSpacing: template.letterSpacing || "normal",
            }}
          >
            {displayName}'s Party
          </h3>
          <div
            className="w-12 h-px mx-auto"
            style={{ backgroundColor: template.palette.accent }}
          />
        </div>
      </div>

      {/* Label */}
      <div className="px-4 py-3 bg-card">
        <p className="font-sans text-sm font-medium text-foreground">{template.name}</p>
        <p className="font-sans text-xs text-muted-foreground">{template.description}</p>
      </div>
    </button>
  );
};

export default InvitationPreview;
