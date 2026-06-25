export type EntityType =
  | "疾病"
  | "症状"
  | "危险因素"
  | "治疗"
  | "预防"
  | "流行病学"
  | "人群"
  | "解剖";

export type Entity = {
  id: string;
  name: string;
  type: EntityType;
};

export type Triple = {
  subject: string;
  predicate: string;
  object: string;
};

export type GraphNode = Entity & {
  x: number;
  y: number;
  vx: number;
  vy: number;
  neighbors: string[];
  degree: number;
  fixed?: boolean;
};

export type GraphEdge = {
  source: string;
  target: string;
  label: string;
};

export type ColorTheme = "light" | "dark";

export const ENTITY_TYPES: EntityType[] = [
  "疾病",
  "症状",
  "危险因素",
  "治疗",
  "预防",
  "流行病学",
  "人群",
  "解剖",
];

export const TYPE_COLORS: Record<EntityType, { light: string; dark: string }> = {
  疾病: { light: "#ef4444", dark: "#f87171" },
  症状: { light: "#f59e0b", dark: "#fbbf24" },
  危险因素: { light: "#8b5cf6", dark: "#a78bfa" },
  治疗: { light: "#3b82f6", dark: "#60a5fa" },
  预防: { light: "#10b981", dark: "#34d399" },
  流行病学: { light: "#ec4899", dark: "#f472b6" },
  人群: { light: "#06b6d4", dark: "#22d3ee" },
  解剖: { light: "#64748b", dark: "#94a3b8" },
};
