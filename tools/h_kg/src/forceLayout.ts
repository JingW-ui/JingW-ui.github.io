import type { GraphEdge, GraphNode } from "./types";

/**
 * 力导向布局算法
 * 每帧调用一次 step() 更新节点位置
 */
export class ForceLayout {
  private repulsion = 8000;
  private attraction = 0.005;
  private centerForce = 0.01;
  private damping = 0.85;
  private maxVelocity = 8;
  private temperature = 1.0;
  private cooling = 0.998;
  private minTemperature = 0.01;

  step(
    nodes: GraphNode[],
    edges: GraphEdge[],
    width: number,
    height: number,
  ): void {
    if (nodes.length === 0) return;

    const cx = width / 2;
    const cy = height / 2;
    const n = nodes.length;

    // 初始化力的累积
    const fx = new Float64Array(n);
    const fy = new Float64Array(n);

    // 斥力：所有节点对
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const distSq = dx * dx + dy * dy + 1;
        const dist = Math.sqrt(distSq);
        const force = this.repulsion / distSq;
        const forceX = (dx / dist) * force;
        const forceY = (dy / dist) * force;
        fx[i] += forceX;
        fy[i] += forceY;
        fx[j] -= forceX;
        fy[j] -= forceY;
      }
    }

    // 建立节点 ID 到索引的映射
    const idToIndex = new Map<string, number>();
    for (let i = 0; i < n; i++) {
      idToIndex.set(nodes[i].id, i);
    }

    // 引力：有边连接的节点对
    for (const edge of edges) {
      const si = idToIndex.get(edge.source);
      const ti = idToIndex.get(edge.target);
      if (si === undefined || ti === undefined) continue;
      const dx = nodes[ti].x - nodes[si].x;
      const dy = nodes[ti].y - nodes[si].y;
      const dist = Math.sqrt(dx * dx + dy * dy) + 0.1;
      const force = this.attraction * dist;
      const forceX = (dx / dist) * force;
      const forceY = (dy / dist) * force;
      fx[si] += forceX;
      fy[si] += forceY;
      fx[ti] -= forceX;
      fy[ti] -= forceY;
    }

    // 中心力
    for (let i = 0; i < n; i++) {
      fx[i] += (cx - nodes[i].x) * this.centerForce;
      fy[i] += (cy - nodes[i].y) * this.centerForce;
    }

    // 更新速度和位置
    for (let i = 0; i < n; i++) {
      if (nodes[i].fixed) continue;

      nodes[i].vx = (nodes[i].vx + fx[i]) * this.damping * this.temperature;
      nodes[i].vy = (nodes[i].vy + fy[i]) * this.damping * this.temperature;

      // 限速
      const speed = Math.sqrt(nodes[i].vx ** 2 + nodes[i].vy ** 2);
      if (speed > this.maxVelocity) {
        nodes[i].vx = (nodes[i].vx / speed) * this.maxVelocity;
        nodes[i].vy = (nodes[i].vy / speed) * this.maxVelocity;
      }

      nodes[i].x += nodes[i].vx;
      nodes[i].y += nodes[i].vy;
    }

    // 退火
    if (this.temperature > this.minTemperature) {
      this.temperature *= this.cooling;
    }
  }

  reset(): void {
    this.temperature = 1.0;
  }

  reheat(): void {
    this.temperature = 0.6;
  }
}
