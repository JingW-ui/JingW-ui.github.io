import { X } from "lucide-react";
import { getEntityRelations, getNodeColor } from "../graphData";
import type { Entity, EntityType, GraphNode, Triple } from "../types";

type Props = {
  node: GraphNode | null;
  triples: Triple[];
  entityMap: Map<string, Entity>;
  isDark: boolean;
  onClose: () => void;
  onNavigateTo: (id: string) => void;
};

const PREDICATE_LABELS: Record<string, string> = {
  包含: "📦 包含",
  有症状: "🩺 症状",
  危险因素: "⚠️ 危险因素",
  "由...引起": "🔗 病因",
  导致: "→ 导致",
  治疗方法: "💊 治疗",
  预防措施: "🛡️ 预防",
  流行病学: "📊 流行病学",
  受累部位: "🫁 受累部位",
  放射部位: "📍 放射至",
  高风险: "🔴 高风险",
  死亡率: "💀 死亡率",
  发病率高于: "📈 发病率高于",
  死亡率高于: "📉 死亡率高于",
};

function getLabel(predicate: string): string {
  return PREDICATE_LABELS[predicate] || predicate;
}

export function DiseaseDetail({
  node,
  triples,
  entityMap,
  isDark,
  onClose,
  onNavigateTo,
}: Props) {
  if (!node) return null;

  const relations = getEntityRelations(node.id, triples, entityMap);
  const color = getNodeColor(node.type, isDark);

  const renderGroup = (
    keyPrefix: string,
    entities: Entity[],
    predicateLabel: string,
  ) => {
    if (entities.length === 0) return null;
    // 去重：同一个实体可能因多条三元组出现多次
    const seen = new Set<string>();
    const unique = entities.filter((e) => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    });
    return (
      <div className="detail-section" key={`${keyPrefix}-${predicateLabel}`}>
        <div className="detail-section-title">{predicateLabel}</div>
        <div className="detail-entity-list">
          {unique.map((e) => (
            <button
              key={e.id}
              className="detail-entity-chip"
              onClick={() => onNavigateTo(e.id)}
            >
              <span
                className="chip-dot"
                style={{ background: getNodeColor(e.type, isDark) }}
              />
              {e.name}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // 合并出站和入站关系
  const allOutGroups = Object.entries(relations.outgoing);
  const allInGroups = Object.entries(relations.incoming);

  return (
    <div className="detail-panel">
      <div className="detail-header">
        <h2>
          <span
            className="detail-type-badge"
            style={{ background: `${color}22`, color }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: color,
                display: "inline-block",
              }}
            />
            {node.type}
          </span>
          {node.name}
        </h2>
        <button className="detail-close" onClick={onClose}>
          <X size={16} />
        </button>
      </div>
      <div className="detail-body">
        {/* 基本信息 */}
        <div className="detail-section">
          <div className="detail-section-title">基本信息</div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
            }}
          >
            <div className="stat-chip" style={{ justifyContent: "center" }}>
              连接数: <b>{node.degree}</b>
            </div>
            <div className="stat-chip" style={{ justifyContent: "center" }}>
              ID: <b>{node.id}</b>
            </div>
          </div>
        </div>

        {/* 出站关系 */}
        {allOutGroups.map(([predicate, entities]) =>
          renderGroup(
            `out-${predicate}`,
            entities,
            getLabel(predicate),
          ),
        )}

        {/* 入站关系 */}
        {allInGroups.map(([predicate, entities]) =>
          renderGroup(
            `in-${predicate}`,
            entities,
            `← ${getLabel(predicate)}`,
          ),
        )}

        {allOutGroups.length === 0 && allInGroups.length === 0 && (
          <div className="empty-state">
            <b>无关联实体</b>
            <small>该实体暂无关系数据</small>
          </div>
        )}
      </div>
    </div>
  );
}
