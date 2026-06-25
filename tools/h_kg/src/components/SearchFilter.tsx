import { ENTITY_TYPES, type EntityType } from "../types";
import { getNodeColor } from "../graphData";

type Props = {
  visibleTypes: Set<EntityType>;
  onToggleType: (type: EntityType) => void;
  onShowAll: () => void;
  isDark: boolean;
};

export function SearchFilter({
  visibleTypes,
  onToggleType,
  onShowAll,
  isDark,
}: Props) {
  const allVisible = visibleTypes.size === ENTITY_TYPES.length;

  return (
    <div className="filter-bar">
      <button
        className={`filter-chip${allVisible ? " active" : ""}`}
        onClick={onShowAll}
      >
        全部
      </button>
      {ENTITY_TYPES.map((type) => {
        const active = visibleTypes.has(type);
        const color = getNodeColor(type, isDark);
        return (
          <button
            key={type}
            className={`filter-chip${active ? " active" : ""}`}
            onClick={() => onToggleType(type)}
          >
            <span className="chip-dot" style={{ background: color }} />
            {type}
          </button>
        );
      })}
    </div>
  );
}
