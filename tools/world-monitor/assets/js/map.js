/* ============================================================
   世界实时监控 - 地图渲染
   加载 world-atlas TopoJSON → 等距圆柱投影 → SVG 路径
   ============================================================ */

import { CONFIG } from './config.js';

const NS = 'http://www.w3.org/2000/svg';

const W = CONFIG.map.width;
const H = CONFIG.map.height;

/* 等距圆柱投影 */
const project = (lon, lat) => [
  ((lon + 180) / 360) * W,
  ((90 - lat) / 180) * H,
];

export function toXY(lon, lat) {
  const [x, y] = project(lon, lat);
  return [x, y];
}

/* 多边形 → SVG path */
function ringToPoints(ring) {
  return ring.map(([lon, lat]) => {
    const [x, y] = project(lon, lat);
    return Math.round(x * 2) / 2 + ',' + Math.round(y * 2) / 2;
  }).join(' ');
}

function featureToPath(geom) {
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  if (!polys || !polys.length) return '';
  const parts = [];
  for (const poly of polys) {
    const outer = poly[0];
    if (!outer || outer.length < 3) continue;
    parts.push('M' + ringToPoints(outer) + 'Z');
    for (let i = 1; i < poly.length; i++) {
      const hole = poly[i];
      if (hole && hole.length >= 3) parts.push('M' + ringToPoints(hole) + 'Z');
    }
  }
  return parts.join('');
}

/* ---------------- 初始化 ---------------- */

let mapSvg;
let landGroup;
let markerGroup;
let graticuleGroup;
let resolveReady;
let _readyResolved = false;

export const mapReady = new Promise(res => { resolveReady = res; });

function ready() {
  if (!_readyResolved) { _readyResolved = true; resolveReady(); }
}

export async function initMap(svgEl) {
  mapSvg = svgEl;
  landGroup = createGroup('land-group');
  graticuleGroup = createGroup('graticule-group');
  markerGroup = createGroup('marker-group');
  mapSvg.appendChild(graticuleGroup);
  mapSvg.appendChild(landGroup);
  mapSvg.appendChild(markerGroup);
  renderGraticule();
  try {
    await renderLand();
  } catch (err) {
    console.error('世界地图加载失败:', err);
  } finally {
    ready();
  }
}

function createGroup(cls) {
  const g = document.createElementNS(NS, 'g');
  g.setAttribute('class', cls);
  return g;
}

/* 经纬网格(可选氛围层) */
function renderGraticule() {
  const frag = document.createDocumentFragment();
  for (let lon = -180; lon <= 180; lon += 30) {
    const [x, y0] = project(lon, -90);
    const [, y1] = project(lon, 90);
    const line = document.createElementNS(NS, 'line');
    line.setAttribute('x1', x); line.setAttribute('x2', x);
    line.setAttribute('y1', y0); line.setAttribute('y2', y1);
    line.setAttribute('class', 'graticule');
    frag.appendChild(line);
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    const [x0, y] = project(-180, lat);
    const [x1] = project(180, lat);
    const line = document.createElementNS(NS, 'line');
    line.setAttribute('x1', x0); line.setAttribute('x2', x1);
    line.setAttribute('y1', y); line.setAttribute('y2', y);
    line.setAttribute('class', 'graticule');
    frag.appendChild(line);
  }
  graticuleGroup.appendChild(frag);
}

async function renderLand() {
  const res = await fetch(CONFIG.map.geoUrl);
  if (!res.ok) throw new Error('地图 HTTP ' + res.status);
  const topo = await res.json();
  const world = topojson.feature(topo, topo.objects.countries);
  const frag = document.createDocumentFragment();
  for (const feat of world.features) {
    const d = featureToPath(feat.geometry);
    if (!d) continue;
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('class', 'land');
    path.setAttribute('data-name', feat.properties && feat.properties.name || '');
    frag.appendChild(path);
  }
  landGroup.appendChild(frag);
}

/* 标记层的增删交由 markers.js 使用 markerGroup */
export function getMarkerGroup() { return markerGroup; }
export function getMapSize() { return { width: W, height: H }; }
