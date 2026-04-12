export interface InvitationTemplate {
  id: string;
  name: string;
  description: string;
  mood: string;
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

export const templates: InvitationTemplate[] = [
  {
    id: "classic_cream",
    name: "Classic Cream",
    description: "Timeless elegance for any occasion",
    mood: "A wedding invitation energy applied to a children's party",
    palette: {
      background: "#FAF6F1",
      card: "#FFFFFF",
      text: "#1C1C1E",
      accent: "#B8A089",
      muted: "#9B9898",
    },
    fontFamily: "'Playfair Display', serif",
  },
  {
    id: "garden_party",
    name: "Garden Party",
    description: "For the classic summer birthday",
    mood: "A note tucked into a summer bouquet",
    palette: {
      background: "#F0F4EC",
      card: "#FAFCF8",
      text: "#2D3A2E",
      accent: "#8A9E8C",
      muted: "#A3B5A5",
    },
    fontFamily: "'Cormorant Garamond', serif",
    fontStyle: "italic",
  },
  {
    id: "midnight_disco",
    name: "Midnight Disco",
    description: "For the child who wants something cool",
    mood: "A gilt-edged invitation to something exclusive",
    palette: {
      background: "#1A1F3C",
      card: "#232848",
      text: "#F5F0E8",
      accent: "#C9A96E",
      muted: "#8B8FAA",
    },
    fontFamily: "'Playfair Display', serif",
    textTransform: "uppercase",
    letterSpacing: "0.15em",
  },
  {
    id: "paintbox",
    name: "Paintbox",
    description: "Creative and expressive, never childish",
    mood: "An invite you'd find in a Tate Members bag",
    palette: {
      background: "#FAF6F1",
      card: "#FFFFFF",
      text: "#2C2420",
      accent: "#C4703F",
      muted: "#5A8A87",
    },
    fontFamily: "'Cormorant Garamond', serif",
  },
  {
    id: "wildflower",
    name: "Wildflower",
    description: "Bohemian, outdoorsy, Cotswolds-summer",
    mood: "A note pinned to a farm gate",
    palette: {
      background: "#FBF3EE",
      card: "#FFFEF9",
      text: "#3A3028",
      accent: "#C9A99A",
      muted: "#8A9E8C",
    },
    fontFamily: "'Cormorant Garamond', serif",
    letterSpacing: "0.08em",
  },
];

export const getTemplate = (id: string): InvitationTemplate => {
  return templates.find((t) => t.id === id) || templates[0];
};
