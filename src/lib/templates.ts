export interface InvitationTemplate {
  id: string;
  name: string;
  description: string;
  headline: string;
  mood: string;
  dark?: boolean;
  palette: {
    background: string;
    card: string;
    text: string;
    accent: string;
    muted: string;
  };
  fontFamily: string;
  fontStyle?: string;
  letterSpacing?: string;
  textTransform?: "uppercase" | "none";
}

const sans = "'Manrope', system-ui, sans-serif";

export const templates: InvitationTemplate[] = [
  {
    id: "rainbow",
    name: "Rainbow",
    description: "Soft arcs, after the rain",
    headline: "Colour, cake and everyone you love",
    mood: "A bright day, quietly composed",
    palette: {
      background: "#FFF8FB",
      card: "#FFFFFF",
      text: "#282035",
      accent: "#F34AA5",
      muted: "#71677F",
    },
    fontFamily: sans,
  },
  {
    id: "dinosaurs",
    name: "Dinosaurs",
    description: "Ferns, footprints, warm stone",
    headline: "Stomp on over",
    mood: "A prehistoric afternoon",
    palette: {
      background: "#F3F0E4",
      card: "#FBF8F0",
      text: "#243028",
      accent: "#3E7A4F",
      muted: "#6A7364",
    },
    fontFamily: sans,
  },
  {
    id: "space",
    name: "Space",
    description: "A pale planet and a pink star",
    headline: "One small step, one big birthday",
    mood: "Night sky, held gently",
    dark: true,
    palette: {
      background: "#14182B",
      card: "#1C2140",
      text: "#F7F4FF",
      accent: "#F34AA5",
      muted: "#B7B4D6",
    },
    fontFamily: sans,
  },
  {
    id: "football",
    name: "Football",
    description: "A sunlit pitch, kick-off soon",
    headline: "Kick-off is this birthday",
    mood: "Saturday on the grass",
    palette: {
      background: "#F4F7F2",
      card: "#FFFFFF",
      text: "#1C2B22",
      accent: "#32936A",
      muted: "#5E6B62",
    },
    fontFamily: sans,
  },
  {
    id: "fairy",
    name: "Fairy garden",
    description: "Blossom, moss and fireflies",
    headline: "A little magic in the garden",
    mood: "Dusk among the flowers",
    palette: {
      background: "#FBF6FB",
      card: "#FFFFFF",
      text: "#3A2740",
      accent: "#C86BBE",
      muted: "#8A7390",
    },
    fontFamily: sans,
  },
  {
    id: "safari",
    name: "Safari",
    description: "Ochre sun, one acacia",
    headline: "Pack your sense of adventure",
    mood: "Late light on the plain",
    palette: {
      background: "#F8F1E6",
      card: "#FFF9F1",
      text: "#3A2A1C",
      accent: "#D07A3A",
      muted: "#8A7058",
    },
    fontFamily: sans,
  },
  {
    id: "sea",
    name: "Under the sea",
    description: "Tide pools and soft coral",
    headline: "Dive in, the party's this way",
    mood: "Clear water, late afternoon",
    palette: {
      background: "#E7F6F6",
      card: "#F5FCFC",
      text: "#12343A",
      accent: "#1F8A9A",
      muted: "#5C7C82",
    },
    fontFamily: sans,
  },
  {
    id: "classic",
    name: "Classic birthday",
    description: "The balloon, and very little else",
    headline: "Come and celebrate",
    mood: "The PartyPal birthday",
    palette: {
      background: "#F9F7FC",
      card: "#FFFFFF",
      text: "#282035",
      accent: "#6B7AFF",
      muted: "#71677F",
    },
    fontFamily: sans,
  },
];

const aliases: Record<string, string> = {
  classic_cream: "classic",
  garden_party: "fairy",
  midnight_disco: "space",
  paintbox: "rainbow",
  wildflower: "safari",
};

export const getTemplate = (id: string): InvitationTemplate => {
  const resolved = aliases[id] ?? id;
  return templates.find((template) => template.id === resolved) ?? templates[7];
};
