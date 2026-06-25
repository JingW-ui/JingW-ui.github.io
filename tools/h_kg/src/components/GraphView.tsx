import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ForceLayout } from "../forceLayout";
import { getNodeColor, getNodeRadius } from "../graphData";
import type { EntityType, GraphEdge, GraphNode } from "../types";
import { ENTITY_TYPES } from "../types";

type Props = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  visibleTypes: Set<EntityType>;
  hoveredNode: string | null;
  selectedNode: string | null;
  onHoverNode: (id: string | null) => void;
  onSelectNode: (id: string | null) => void;
  onDragNode: (id: string, x: number, y: number) => void;
  isDark: boolean;
};

export function GraphView({
  nodes,
  edges,
  visibleTypes,
  hoveredNode,
  selectedNode,
  onHoverNode,
  onSelectNode,
  onDragNode,
  isDark,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const layoutRef = useRef(new ForceLayout());
  const rafRef = useRef<number>(0);
  const [, forceRender] = useState(0);
  const [viewBox, setViewBox] = useState({ x: -500, y: -400, w: 1000, h: 800 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0, vx: 0, vy: 0 });
  const [dragNodeId, setDragNodeId] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);

  // 过滤可见节点和边
  const visibleNodes = useMemo(
    () => nodes.filter((n) => visibleTypes.has(n.type)),
    [nodes, visibleTypes],
  );
  const visibleNodeIds = useMemo(
    () => new Set(visibleNodes.map((n) => n.id)),
    [visibleNodes],
  );
  const visibleEdges = useMemo(
    () =>
      edges.filter(
        (e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target),
      ),
    [edges, visibleNodeIds],
  );

  // 高亮逻辑
  const activeNode = hoveredNode || selectedNode;
  const highlightedIds = useMemo(() => {
    if (!activeNode) return null;
    const node = nodes.find((n) => n.id === activeNode);
    if (!node) return null;
    return new Set([activeNode, ...node.neighbors]);
  }, [activeNode, nodes]);

  // 力导向布局动画循环
  useEffect(() => {
    const layout = layoutRef.current;
    let running = true;

    const tick = () => {
      if (!running) return;
      layout.step(visibleNodes, visibleEdges, viewBox.w, viewBox.h);
      forceRender((c) => c + 1);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [visibleNodes, visibleEdges, viewBox.w, viewBox.h]);

  // 鼠标滚轮缩放
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 1.1 : 0.9;
      const svg = svgRef.current;
      if (!svg) return;

      const rect = svg.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;

      const newW = viewBox.w * factor;
      const newH = viewBox.h * factor;
      const newX = viewBox.x + (viewBox.w - newW) * mx;
      const newY = viewBox.y + (viewBox.h - newH) * my;

      setViewBox({ x: newX, y: newY, w: newW, h: newH });
    },
    [viewBox],
  );

  // 画布拖拽平移
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (dragNodeId) return;
      if (e.button !== 0) return;
      setIsPanning(true);
      setPanStart({
        x: e.clientX,
        y: e.clientY,
        vx: viewBox.x,
        vy: viewBox.y,
      });
    },
    [viewBox, dragNodeId],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (dragNodeId) {
        // 拖拽节点
        const svg = svgRef.current;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        const svgX = viewBox.x + ((e.clientX - rect.left) / rect.width) * viewBox.w;
        const svgY = viewBox.y + ((e.clientY - rect.top) / rect.height) * viewBox.h;
        onDragNode(dragNodeId, svgX, svgY);
        return;
      }
      if (!isPanning) return;
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const dx = ((e.clientX - panStart.x) / rect.width) * viewBox.w;
      const dy = ((e.clientY - panStart.y) / rect.height) * viewBox.h;
      setViewBox((vb) => ({
        ...vb,
        x: panStart.vx - dx,
        y: panStart.vy - dy,
      }));
    },
    [isPanning, panStart, viewBox.w, viewBox.h, dragNodeId, onDragNode],
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    if (dragNodeId) {
      const node = nodes.find((n) => n.id === dragNodeId);
      if (node) node.fixed = false;
      setDragNodeId(null);
    }
  }, [dragNodeId, nodes]);

  // 节点拖拽开始
  const handleNodeMouseDown = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      e.stopPropagation();
      setDragNodeId(nodeId);
      const node = nodes.find((n) => n.id === nodeId);
      if (node) node.fixed = true;
    },
    [nodes],
  );

  // 缩放按钮
  const zoomIn = () =>
    setViewBox((vb) => ({
      x: vb.x + vb.w * 0.1,
      y: vb.y + vb.h * 0.1,
      w: vb.w * 0.8,
      h: vb.h * 0.8,
    }));
  const zoomOut = () =>
    setViewBox((vb) => ({
      x: vb.x - vb.w * 0.1,
      y: vb.y - vb.h * 0.1,
      w: vb.w * 1.2,
      h: vb.h * 1.2,
    }));
  const zoomReset = () => setViewBox({ x: -500, y: -400, w: 1000, h: 800 });

  // 建立 ID→节点映射
  const nodeMap = useMemo(() => {
    const m = new Map<string, GraphNode>();
    for (const n of visibleNodes) m.set(n.id, n);
    return m;
  }, [visibleNodes]);

  return (
    <div className="graph-container">
      <svg
        ref={svgRef}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isPanning ? "grabbing" : "grab" }}
      >
        {/* 箭头标记定义 */}
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" className="arrow-marker" />
          </marker>
          <marker
            id="arrow-highlight"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)" />
          </marker>
        </defs>

        {/* 边 */}
        <g className="edges">
          {visibleEdges.map((edge, i) => {
            const source = nodeMap.get(edge.source);
            const target = nodeMap.get(edge.target);
            if (!source || !target) return null;

            const isHighlighted =
              highlightedIds &&
              highlightedIds.has(edge.source) &&
              highlightedIds.has(edge.target);
            const isDimmed = highlightedIds && !isHighlighted;

            // 计算边终点偏移（避免箭头被节点遮挡）
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const targetRadius = getNodeRadius(target.degree);
            const offsetX = (dx / dist) * targetRadius;
            const offsetY = (dy / dist) * targetRadius;

            // 曲线控制点
            const midX = (source.x + target.x - offsetX) / 2;
            const midY = (source.y + target.y - offsetY) / 2;
            const perpX = -(target.y - source.y) * 0.08;
            const perpY = (target.x - source.x) * 0.08;

            return (
              <g key={`edge-${i}`}>
                <path
                  className={`graph-edge${isHighlighted ? " highlighted" : ""}${isDimmed ? " dimmed" : ""}`}
                  d={`M ${source.x} ${source.y} Q ${midX + perpX} ${midY + perpY} ${target.x - offsetX} ${target.y - offsetY}`}
                  stroke={isHighlighted ? "var(--accent)" : undefined}
                  markerEnd={
                    isHighlighted ? "url(#arrow-highlight)" : "url(#arrow)"
                  }
                />
                {isHighlighted && (
                  <text
                    className="edge-label visible"
                    x={midX + perpX}
                    y={midY + perpY - 8}
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* 节点 */}
        <g className="nodes">
          {visibleNodes.map((node) => {
            const color = getNodeColor(node.type, isDark);
            const radius = getNodeRadius(node.degree);
            const isHighlighted = highlightedIds?.has(node.id);
            const isDimmed = highlightedIds && !highlightedIds.has(node.id);

            return (
              <g
                key={node.id}
                className={`graph-node${isHighlighted ? " highlighted" : ""}${isDimmed ? " dimmed" : ""}`}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                onMouseEnter={() => onHoverNode(node.id)}
                onMouseLeave={() => onHoverNode(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectNode(selectedNode === node.id ? null : node.id);
                }}
              >
                <circle
                  r={radius}
                  fill={color}
                  stroke={isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"}
                  opacity={0.85}
                />
                {showLabels && (
                  <text
                    className={`node-label${isDimmed ? " dimmed" : ""}`}
                    y={radius + 14}
                  >
                    {node.name}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* 缩放控制 */}
      <div className="graph-controls">
        <button onClick={zoomIn} title="放大">
          +
        </button>
        <button onClick={zoomOut} title="缩小">
          −
        </button>
        <button onClick={zoomReset} title="重置视图">
          ⟲
        </button>
        <button
          onClick={() => setShowLabels((v) => !v)}
          title={showLabels ? "隐藏标签" : "显示标签"}
        >
          A
        </button>
      </div>

      {/* 图例 */}
      <div className="graph-legend">
        {ENTITY_TYPES.map((type) => (
          <span
            key={type}
            className="legend-item"
            onClick={() => {
              // 点击图例可以切换类型可见性（与 filter bar 联动）
            }}
          >
            <span
              className="legend-dot"
              style={{ background: getNodeColor(type, isDark) }}
            />
            {type}
          </span>
        ))}
      </div>
    </div>
  );
}
