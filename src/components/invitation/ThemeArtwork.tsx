import type { ReactElement } from "react";
import balloon from "@/assets/balloon-hero.png";

const frame = "absolute inset-0 h-full w-full";

function RainbowArt() {
  return (
    <svg viewBox="0 0 400 240" className={frame} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="400" height="240" fill="#FFF6FA" />
      <circle cx="318" cy="52" r="18" fill="#F6C15B" />
      <path d="M-10 196c80-150 340-150 420 0" fill="none" stroke="#6B7AFF" strokeWidth="16" strokeLinecap="round" />
      <path d="M24 196c68-118 284-118 352 0" fill="none" stroke="#F34AA5" strokeWidth="16" strokeLinecap="round" />
      <path d="M58 196c56-88 228-88 284 0" fill="none" stroke="#F6C15B" strokeWidth="16" strokeLinecap="round" />
      <path d="M92 196c44-58 172-58 216 0" fill="none" stroke="#7DCEA0" strokeWidth="16" strokeLinecap="round" />
      <ellipse cx="92" cy="168" rx="28" ry="10" fill="#FFFFFF" />
      <ellipse cx="118" cy="164" rx="18" ry="8" fill="#FFFFFF" />
    </svg>
  );
}

function DinosaurArt() {
  return (
    <svg viewBox="0 0 400 240" className={frame} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="400" height="240" fill="#F3F0E4" />
      <path d="M0 176c40-18 70-8 110 6 46 16 70 8 120-8 40-12 90 6 170 10v56H0Z" fill="#E4E0CE" />
      <path d="M46 168c18-70 28-96 34-108 8 22 20 48 46 78" fill="none" stroke="#3E7A4F" strokeWidth="8" strokeLinecap="round" />
      <path d="M78 150c22-8 40 6 52 22" fill="none" stroke="#3E7A4F" strokeWidth="8" strokeLinecap="round" />
      <circle cx="248" cy="132" r="7" fill="#C47A4A" />
      <path d="M292 188c16-46 28-62 22-78 10 20 28 36 48 42" fill="none" stroke="#2F6A45" strokeWidth="6" strokeLinecap="round" />
      <path d="M210 188c40-6 70 8 110 4" fill="none" stroke="#C47A4A" strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" />
    </svg>
  );
}

function SpaceArt() {
  return (
    <svg viewBox="0 0 400 240" className={frame} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="400" height="240" fill="#14182B" />
      <circle cx="300" cy="84" r="46" fill="#F4EFE4" />
      <circle cx="318" cy="72" r="46" fill="#14182B" />
      <circle cx="78" cy="54" r="2" fill="#F7F4FF" />
      <circle cx="120" cy="96" r="1.5" fill="#F7F4FF" />
      <circle cx="164" cy="40" r="1.4" fill="#F34AA5" />
      <circle cx="210" cy="70" r="1.6" fill="#F7F4FF" />
      <circle cx="250" cy="150" r="1.3" fill="#F7F4FF" />
      <circle cx="60" cy="140" r="1.2" fill="#B7B4D6" />
      <circle cx="150" cy="160" r="1.2" fill="#F7F4FF" />
      <path d="M40 200c80-30 240-30 320 10" fill="none" stroke="#6B7AFF" strokeWidth="1.5" opacity="0.7" />
    </svg>
  );
}

function FootballArt() {
  return (
    <svg viewBox="0 0 400 240" className={frame} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="400" height="240" fill="#E7F3E4" />
      <path d="M0 150h400" stroke="#F7FBF6" strokeWidth="10" />
      <path d="M0 188h400" stroke="#32936A" strokeWidth="8" opacity="0.35" />
      <circle cx="250" cy="118" r="28" fill="none" stroke="#F7FBF6" strokeWidth="8" />
      <circle cx="250" cy="118" r="8" fill="#F7FBF6" />
      <path d="M40 70c30 16 48 16 70 0" fill="none" stroke="#F6C15B" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

function FairyArt() {
  return (
    <svg viewBox="0 0 400 240" className={frame} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="400" height="240" fill="#FBF6FB" />
      <circle cx="292" cy="70" r="28" fill="#F7E7A6" opacity="0.9" />
      <path d="M70 190c20-50 18-78 8-96 16 28 40 46 62 50" fill="#C86BBE" opacity="0.85" />
      <path d="M118 186c14-36 12-58 4-74 12 22 30 36 48 38" fill="#E7A0D4" />
      <path d="M168 196c16-40 14-64 2-80 14 24 34 40 56 42" fill="#8EBF7A" />
      <circle cx="210" cy="78" r="2" fill="#F6C15B" />
      <circle cx="246" cy="110" r="1.6" fill="#F6C15B" />
      <circle cx="96" cy="64" r="1.5" fill="#C86BBE" />
    </svg>
  );
}

function SafariArt() {
  return (
    <svg viewBox="0 0 400 240" className={frame} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="400" height="240" fill="#F8F1E6" />
      <circle cx="310" cy="68" r="26" fill="#E7A15A" />
      <path d="M0 168c60-20 100 10 160-8 50-16 90 12 140 4 30-6 60 8 100 6v70H0Z" fill="#E7D3B4" />
      <path d="M150 168c8-46 18-70 18-70s10 24 18 70" fill="#8C5A32" />
      <path d="M132 118c28-10 48-6 70 8" fill="none" stroke="#6E8A4E" strokeWidth="6" strokeLinecap="round" />
      <path d="M168 108c18-16 36-14 52 2" fill="none" stroke="#6E8A4E" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

function SeaArt() {
  return (
    <svg viewBox="0 0 400 240" className={frame} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="400" height="240" fill="#E7F6F6" />
      <path d="M0 150c40 18 60-10 100 4 40 14 60-16 100 0 40 16 70-8 100 6 30 12 60-6 100 4v76H0Z" fill="#B7E0E2" />
      <path d="M0 178c50 16 70-12 120 2 46 14 70-14 116 0 40 12 70-8 104 4 20 8 40 0 60 4v56H0Z" fill="#7EC8CE" />
      <circle cx="86" cy="64" r="6" fill="none" stroke="#F34AA5" strokeWidth="2" opacity="0.7" />
      <circle cx="150" cy="96" r="4" fill="none" stroke="#1F8A9A" strokeWidth="2" />
      <circle cx="250" cy="52" r="8" fill="none" stroke="#F7F4FF" strokeWidth="3" />
      <path d="M300 120c10 16 18 16 28 0 8 14 16 14 26 0" fill="none" stroke="#E07A8A" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function ClassicArt() {
  return (
    <div className={frame} aria-hidden>
      <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2">
        <img src={balloon} alt="" className="h-full w-full object-contain motion-safe:animate-float" />
      </div>
    </div>
  );
}

const scenes: Record<string, () => ReactElement> = {
  rainbow: RainbowArt,
  dinosaurs: DinosaurArt,
  space: SpaceArt,
  football: FootballArt,
  fairy: FairyArt,
  safari: SafariArt,
  sea: SeaArt,
  classic: ClassicArt,
};

const ThemeArtwork = ({ id }: { id: string }) => {
  const Scene = scenes[id] ?? ClassicArt;
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Scene />
    </div>
  );
};

export default ThemeArtwork;
