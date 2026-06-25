import { useCallback, useEffect, useMemo, useState } from "react";
import { DiseaseDetail } from "./components/DiseaseDetail";
import { GraphView } from "./components/GraphView";
import { Header } from "./components/Header";
import { SearchFilter } from "./components/SearchFilter";
import { StatsPanel } from "./components/StatsPanel";
import {
  buildGraphEdges,
  buildGraphNodes,
  loadGraphData,
} from "./graphData";
import { readColorTheme, writeColorTheme } from "./storage";
import type { ColorTheme, Entity, EntityType, GraphNode } from "./types";
import { ENTITY_TYPES } from "./types";

export function App() {
  // 主题
  const [theme, setTheme] = useState<ColorTheme>(() => readColorTheme());
  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      writeColorTheme(next);
      return next;
    });
  }, []);

  // 应用主题 class
  useEffect(() => {
    document.documentElement.classList.toggle("theme-dark", theme === "dark");
    document.documentElement.classList.toggle("theme-light", theme === "light");
  }, [theme]);

  // 加载数据
  const [data] = useState(() => loadGraphData());
  const nodes = useMemo(
    () => buildGraphNodes(data.entities, data.triples),
    [data],
  );
  const edges = useMemo(() => buildGraphEdges(data.triples), [data]);

  // 实体映射
  const entityMap = useMemo(() => {
    const m = new Map<string, Entity>();
    for (const e of data.entities) m.set(e.id, e);
    return m;
  }, [data]);

  // 搜索
  const [searchQuery, setSearchQuery] = useState("");

  // 过滤类型
  const [visibleTypes, setVisibleTypes] = useState<Set<EntityType>>(
    () => new Set(ENTITY_TYPES),
  );

  // 搜索过滤后的可见类型（搜索时自动显示匹配的实体类型）
  const effectiveVisibleTypes = useMemo(() => {
    if (!searchQuery.trim()) return visibleTypes;
    const query = searchQuery.toLowerCase();
    const matchedTypes = new Set<EntityType>();
    for (const n of nodes) {
      if (n.name.toLowerCase().includes(query)) {
        matchedTypes.add(n.type);
      }
    }
    // 搜索时，取交集：只显示既在过滤中又匹配搜索的类型
    const result = new Set<EntityType>();
    for (const t of matchedTypes) {
      if (visibleTypes.has(t)) result.add(t);
    }
    return result.size > 0 ? result : visibleTypes;
  }, [searchQuery, visibleTypes, nodes]);

  // 搜索时过滤节点
  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return nodes;
    const query = searchQuery.toLowerCase();
    return nodes.filter((n) => n.name.toLowerCase().includes(query));
  }, [nodes, searchQuery]);

  // 悬停/选中
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // 选中的节点数据
  const selectedNodeData = useMemo<GraphNode | null>(() => {
    if (!selectedNode) return null;
    return nodes.find((n) => n.id === selectedNode) || null;
  }, [selectedNode, nodes]);

  // 导航到节点
  const navigateToNode = useCallback(
    (id: string) => {
      const node = nodes.find((n) => n.id === id);
      if (!node) return;
      // 确保该类型可见
      setVisibleTypes((prev) => {
        const next = new Set(prev);
        next.add(node.type);
        return next;
      });
      setSelectedNode(id);
    },
    [nodes],
  );

  // 切换类型可见性
  const toggleType = useCallback((type: EntityType) => {
    setVisibleTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        // 如果只剩一个类型，不允许取消
        if (next.size <= 1) return prev;
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  const showAllTypes = useCallback(() => {
    setVisibleTypes(new Set(ENTITY_TYPES));
  }, []);

  // 拖拽节点
  const handleDragNode = useCallback(
    (id: string, x: number, y: number) => {
      const node = nodes.find((n) => n.id === id);
      if (node) {
        node.x = x;
        node.y = y;
        node.vx = 0;
        node.vy = 0;
      }
    },
    [nodes],
  );

  // 点击空白处取消选中
  const handleBackgroundClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  return (
    <div
      className={`app-shell theme-${theme}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleBackgroundClick();
      }}
    >
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <div className="main-content">
        <StatsPanel
          nodes={nodes}
          triples={data.triples}
          entityMap={entityMap}
          isDark={theme === "dark"}
        />
        <SearchFilter
          visibleTypes={effectiveVisibleTypes}
          onToggleType={toggleType}
          onShowAll={showAllTypes}
          isDark={theme === "dark"}
        />
        <div className="graph-area">
          <GraphView
            nodes={filteredNodes}
            edges={edges}
            visibleTypes={effectiveVisibleTypes}
            hoveredNode={hoveredNode}
            selectedNode={selectedNode}
            onHoverNode={setHoveredNode}
            onSelectNode={setSelectedNode}
            onDragNode={handleDragNode}
            isDark={theme === "dark"}
          />
          <DiseaseDetail
            node={selectedNodeData}
            triples={data.triples}
            entityMap={entityMap}
            isDark={theme === "dark"}
            onClose={() => setSelectedNode(null)}
            onNavigateTo={navigateToNode}
          />
        </div>
      </div>
    </div>
  );
}
