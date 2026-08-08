export interface WidgetTheme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  bgFrom: string;
  bgTo: string;
  text: string;
  muted: string;
}

export const WIDGET_THEMES: WidgetTheme[] = [
  {
    name: "aurora",
    primary: "#8b5cf6",
    secondary: "#6366f1",
    accent: "#22d3ee",
    bgFrom: "#0f0a2e",
    bgTo: "#1e1147",
    text: "#f5f3ff",
    muted: "#c4b5fd",
  },
  {
    name: "sunset",
    primary: "#f97316",
    secondary: "#ec4899",
    accent: "#facc15",
    bgFrom: "#1f0a1a",
    bgTo: "#3d0f24",
    text: "#fff7ed",
    muted: "#fdba74",
  },
  {
    name: "emerald",
    primary: "#10b981",
    secondary: "#059669",
    accent: "#a3e635",
    bgFrom: "#04120d",
    bgTo: "#062018",
    text: "#ecfdf5",
    muted: "#6ee7b7",
  },
  {
    name: "royal",
    primary: "#3b82f6",
    secondary: "#6366f1",
    accent: "#f472b6",
    bgFrom: "#050b1f",
    bgTo: "#0b1740",
    text: "#eff6ff",
    muted: "#93c5fd",
  },
  {
    name: "ember",
    primary: "#ef4444",
    secondary: "#f97316",
    accent: "#fde047",
    bgFrom: "#1a0505",
    bgTo: "#2e0a0a",
    text: "#fef2f2",
    muted: "#fca5a5",
  },
  {
    name: "orchid",
    primary: "#d946ef",
    secondary: "#a855f7",
    accent: "#67e8f9",
    bgFrom: "#170a29",
    bgTo: "#2b0f45",
    text: "#fdf4ff",
    muted: "#e9a8fd",
  },
  {
    name: "arctic",
    primary: "#06b6d4",
    secondary: "#0ea5e9",
    accent: "#e0e7ff",
    bgFrom: "#04141c",
    bgTo: "#062534",
    text: "#ecfeff",
    muted: "#67e8f9",
  },
  {
    name: "gold",
    primary: "#eab308",
    secondary: "#f59e0b",
    accent: "#fb923c",
    bgFrom: "#1c1505",
    bgTo: "#332608",
    text: "#fffbeb",
    muted: "#fde68a",
  },
];

export function hashToIndex(id: string, mod: number): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash % mod;
}

export function getWidgetTheme(widgetId: string): WidgetTheme {
  return WIDGET_THEMES[hashToIndex(widgetId, WIDGET_THEMES.length)]!;
}
