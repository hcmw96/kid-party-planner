import gardenCanopy from "@/assets/garden-spray.jpg";
import gardenFloor from "@/assets/garden-garland.jpg";
import gardenMotif from "@/assets/garden-butterfly.jpg";
import gardenSprig from "@/assets/garden-sprig.jpg";

export interface StationeryPreset {
  id: string;
  title: string;
  blurb: string;
  kicker: string;
  paper: string;
  ink: string;
  soft: string;
  kickerColor: string;
  age: string;
  rule: string;
  diamond: string;
  spine: string;
  canopy: string;
  floor: string;
  motif: string;
  sprig?: string;
}

export const stationery: StationeryPreset[] = [
  {
    id: "garden",
    title: "The Garden",
    blurb: "Wildflowers on ivory paper",
    kicker: "A little garden celebration",
    paper: "#F7F2E6",
    ink: "#243027",
    soft: "#4A433C",
    kickerColor: "#44523A",
    age: "#B85D6C",
    rule: "#E0D3BC",
    diamond: "#E3C15A",
    spine: "#B85D6C",
    canopy: gardenCanopy,
    floor: gardenFloor,
    motif: gardenMotif,
    sprig: gardenSprig,
  },
];

const byId = new Map(stationery.map((preset) => [preset.id, preset]));

export const isStationery = (id: string) => byId.has(id);

export const getStationery = (id: string) => byId.get(id) ?? stationery[0];

export const shelfStyles = ["paint", "garden", "poster", "midnight", "ticket"] as const;

export const isShelfStyle = (id: string) => (shelfStyles as readonly string[]).includes(id);
