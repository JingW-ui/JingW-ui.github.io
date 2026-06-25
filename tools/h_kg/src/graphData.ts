import type { Entity, EntityType, GraphEdge, GraphNode, Triple } from "./types";

// 从 data.js 内联导入的知识图谱数据
// 由于 data.js 是 CommonJS 格式，我们直接在此文件中包含转换逻辑
// data.js 通过 script 标签在 index.html 中加载，挂载到 window 上

declare global {
  interface Window {
    knowledgeGraph?: {
      entities: Entity[];
      triples: Triple[];
    };
  }
}

export function loadGraphData(): { entities: Entity[]; triples: Triple[] } {
  // 尝试从 window 对象读取（data.js 在 index.html 中通过 script 标签加载）
  if (window.knowledgeGraph) {
    return window.knowledgeGraph;
  }
  return { entities: [], triples: [] };
}

export function buildGraphNodes(entities: Entity[], triples: Triple[]): GraphNode[] {
  // 计算每个实体的邻居和度数
  const neighborMap = new Map<string, Set<string>>();
  for (const e of entities) {
    neighborMap.set(e.id, new Set());
  }
  for (const t of triples) {
    neighborMap.get(t.subject)?.add(t.object);
    neighborMap.get(t.object)?.add(t.subject);
  }

  const cx = 0;
  const cy = 0;
  const radius = Math.min(entities.length * 4, 400);

  return entities.map((e, i) => {
    const angle = (2 * Math.PI * i) / entities.length;
    const neighbors = Array.from(neighborMap.get(e.id) || []);
    return {
      ...e,
      x: cx + radius * Math.cos(angle) + (Math.random() - 0.5) * 20,
      y: cy + radius * Math.sin(angle) + (Math.random() - 0.5) * 20,
      vx: 0,
      vy: 0,
      neighbors,
      degree: neighbors.length,
    };
  });
}

export function buildGraphEdges(triples: Triple[]): GraphEdge[] {
  return triples.map((t) => ({
    source: t.subject,
    target: t.object,
    label: t.predicate,
  }));
}

export function getNodeColor(type: EntityType, isDark: boolean): string {
  const colors = {
    疾病: { light: "#ef4444", dark: "#f87171" },
    症状: { light: "#f59e0b", dark: "#fbbf24" },
    危险因素: { light: "#8b5cf6", dark: "#a78bfa" },
    治疗: { light: "#3b82f6", dark: "#60a5fa" },
    预防: { light: "#10b981", dark: "#34d399" },
    流行病学: { light: "#ec4899", dark: "#f472b6" },
    人群: { light: "#06b6d4", dark: "#22d3ee" },
    解剖: { light: "#64748b", dark: "#94a3b8" },
  };
  return colors[type][isDark ? "dark" : "light"];
}

export function getNodeRadius(degree: number): number {
  return Math.max(6, Math.min(22, 6 + degree * 1.8));
}

export function getEntityRelations(
  entityId: string,
  triples: Triple[],
  entityMap: Map<string, Entity>,
) {
  const asSubject = triples.filter((t) => t.subject === entityId);
  const asObject = triples.filter((t) => t.object === entityId);

  const categorize = (triples: Triple[], direction: "out" | "in") => {
    const groups: Record<string, Entity[]> = {};
    for (const t of triples) {
      const targetId = direction === "out" ? t.object : t.subject;
      const target = entityMap.get(targetId);
      if (!target) continue;
      const key = t.predicate;
      if (!groups[key]) groups[key] = [];
      groups[key].push(target);
    }
    return groups;
  };

  return {
    outgoing: categorize(asSubject, "out"),
    incoming: categorize(asObject, "in"),
  };
}
