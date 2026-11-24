import type { InvitationTemplate } from "@/lib/templates";
import ThemeArtwork from "@/components/invitation/ThemeArtwork";

interface Props {
  template: InvitationTemplate;
  selected: boolean;
  onSelect: () => void;
}

const InvitationPreview = ({ template, selected, onSelect }: Props) => (
  <button
    type="button"
    onClick={onSelect}
    aria-pressed={selected}
    className={`w-[148px] shrink-0 snap-start overflow-hidden rounded-[20px] bg-white text-left shadow-[0_8px_24px_rgba(40,32,53,0.05)] transition-transform duration-200 active:scale-[0.98] ${
      selected ? "ring-2 ring-[#282035] ring-offset-2 ring-offset-[#F9F7FC]" : ""
    }`}
  >
    <div className="relative h-24">
      <ThemeArtwork id={template.id} />
    </div>
    <div className="px-3 py-2.5">
      <p className="text-[14px] font-bold tracking-[-0.02em] text-[#282035]">{template.name}</p>
      <p className="mt-0.5 text-[12px] leading-snug text-[#71677F]">{template.description}</p>
    </div>
  </button>
);

export default InvitationPreview;
