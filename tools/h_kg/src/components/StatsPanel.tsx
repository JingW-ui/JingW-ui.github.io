import { useMemo } from "react";
import type { Entity, EntityType, GraphNode, Triple } from "../types";
import { ENTITY_TYPES } from "../types";
import { getNodeColor } from "../graphData";

type Props = {
  nodes: GraphNode[];
  triples: Triple[];
  entityMap: Map<string, Entity>;
  isDark: boolean;
};

export function StatsPanel({ nodes, triples, entityMap, isDark }: Props) {
  // 统计实体类型分布
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const n of nodes) {
      counts[n.type] = (counts[n.type] || 0) + 1;
    }
    return counts;
  }, [nodes]);

  // 统计关系类型分布
  const predicateCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of triples) {
      counts[t.predicate] = (counts[t.predicate] || 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [triples]);

  // 连接度最高的 Top 5
  const topNodes = useMemo(() => {
    return [...nodes]
      .sort((a, b) => b.degree - a.degree)
      .slice(0, 5);
  }, [nodes]);

  return (
    <div className="stats-row">
      {/* 实体总数 */}
      <div className="stat-card">
        <small>实体总数</small>
        <b>{nodes.length}</b>
        <div className="stat-sub">
          {ENTITY_TYPES.map((type) => (
            <span key={type} className="stat-chip">
              <span
                className="dot"
                style={{ background: getNodeColor(type, isDark) }}
              />
              {typeCounts[type] || 0}
            </span>
          ))}
        </div>
      </div>

      {/* 三元组总数 */}
      <div className="stat-card">
        <small>关系总数</small>
        <b>{triples.length}</b>
        <div className="stat-sub">
          {predicateCounts.map(([pred, count]) => (
            <span key={pred} className="stat-chip">
              {pred}: {count}
            </span>
          ))}
        </div>
      </div>

      {/* 疾病数量 */}
      <div className="stat-card">
        <small>疾病分类</small>
        <b>{typeCounts["疾病"] || 0}</b>
        <div className="stat-sub">
          <span className="stat-chip">心血管疾病子分类</span>
        </div>
      </div>

      {/* 高危人群 */}
      <div className="stat-card">
        <small>高危人群</small>
        <b>{typeCounts["人群"] || 0}</b>
        <div className="stat-sub">
          <span className="stat-chip">关联危险因素</span>
        </div>
      </div>

      {/* Top 5 连接度 */}
      <div className="stat-card">
        <small>核心实体 Top 5</small>
        <div className="top-entities">
          {topNodes.map((node, i) => (
            <div key={node.id} className="top-entity-row">
              <b>{i + 1}</b>
              <span
                style={{
                  color: getNodeColor(node.type, isDark),
                  fontWeight: 700,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {node.name}
              </span>
              <span>{node.degree}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
