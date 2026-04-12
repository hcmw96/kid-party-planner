import type { InvitationTemplate } from "@/lib/templates";

interface Props {
  template: InvitationTemplate;
  childName: string;
  date: string;
  location: string;
}

const InvitationCard = ({ template, childName, date, location }: Props) => {
  const partyDate = new Date(date).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const initial = childName.charAt(0).toUpperCase();

  return (
    <div
      className="w-full animate-fade-in"
      style={{
        backgroundColor: template.palette.background,
        color: template.palette.text,
        fontFamily: template.fontFamily,
      }}
    >
      <div className="max-w-md mx-auto px-8 py-16 relative">
        {/* Decorative border */}
        <div
          className="absolute inset-6 border"
          style={{ borderColor: template.palette.accent + "30" }}
        />

        <div className="text-center space-y-8 relative z-10">
          {/* Monogram for classic cream */}
          {template.id === "classic_cream" && (
            <div
              className="w-16 h-16 rounded-full border-2 flex items-center justify-center mx-auto text-3xl font-display"
              style={{
                borderColor: template.palette.accent,
                color: template.palette.accent,
              }}
            >
              {initial}
            </div>
          )}

          <div className="space-y-2">
            <p
              className="text-xs tracking-[0.2em] uppercase font-sans"
              style={{ color: template.palette.muted }}
            >
              You're invited to
            </p>

            {/* Gold rule for midnight disco */}
            {template.id === "midnight_disco" && (
              <div
                className="w-16 h-px mx-auto mb-4"
                style={{ backgroundColor: template.palette.accent }}
              />
            )}

            <h1
              className="text-4xl font-semibold leading-tight"
              style={{
                fontStyle: template.fontStyle || "normal",
                textTransform: template.textTransform || "none",
                letterSpacing: template.letterSpacing || "normal",
              }}
            >
              {childName}'s Party
            </h1>

            <div
              className="w-12 h-px mx-auto mt-4"
              style={{ backgroundColor: template.palette.accent }}
            />
          </div>

          <div className="space-y-3 font-sans text-sm" style={{ color: template.palette.muted }}>
            <p>{partyDate}</p>
            <p>{location}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitationCard;
