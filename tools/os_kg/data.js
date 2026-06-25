// ============================================================
// 手机操作系统市场知识图谱 - 三元组数据 (JSON-LD 风格)
// 适用场景：ECharts、D3.js、G6 等可视化库
// 数据日期：2026年Q1 | 生成日期：2026-06-25
// 数据来源：Counterpoint Research, Omdia
// ============================================================

const knowledgeGraph = {
  // ---------- 节点定义 ----------
  nodes: [
    // ---- 操作系统实体 ----
    { id: 'OS_Android', name: 'Android', type: 'OperatingSystem', marketShare: '73%', region: 'Global' },
    { id: 'OS_iOS', name: 'iOS', type: 'OperatingSystem', marketShare: '22%', region: 'Global' },
    { id: 'OS_HarmonyOS', name: 'HarmonyOS', type: 'OperatingSystem', marketShare: '5%', region: 'Global' },

    // ---- 品牌实体 (手机厂商) ----
    { id: 'Brand_Samsung', name: 'Samsung', type: 'Brand', shipment: '65.4M', share: '22%' },
    { id: 'Brand_Apple', name: 'Apple', type: 'Brand', shipment: '60.4M', share: '20%' },
    { id: 'Brand_Xiaomi', name: 'Xiaomi', type: 'Brand', shipment: '—', share: '—' },
    { id: 'Brand_OPPO', name: 'OPPO', type: 'Brand', shipment: '—', share: '~10%' },
    { id: 'Brand_vivo', name: 'vivo', type: 'Brand', shipment: '—', share: '~7%' },
    { id: 'Brand_Huawei', name: 'Huawei', type: 'Brand', shipment: '—', share: '20% (CN)' },
    { id: 'Brand_Honor', name: 'Honor', type: 'Brand', shipment: '—', share: '—' },

    // ---- 地区实体 ----
    { id: 'Region_Global', name: 'Global', type: 'Region' },
    { id: 'Region_China', name: 'China', type: 'Region' },
    { id: 'Region_USA', name: 'USA', type: 'Region' },
    { id: 'Region_India', name: 'India', type: 'Region' },

    // ---- 数据来源实体 ----
    { id: 'Source_Counterpoint', name: 'Counterpoint Research', type: 'Source' },
    { id: 'Source_Omdia', name: 'Omdia', type: 'Source' },
  ],

  // ---------- 关系三元组 (edges) ----------
  edges: [
    // ---- 1. 操作系统 - 全球市场份额关系 ----
    { source: 'OS_Android', target: 'Region_Global', relation: 'market_share_in', value: '73%' },
    { source: 'OS_iOS', target: 'Region_Global', relation: 'market_share_in', value: '22%' },
    { source: 'OS_HarmonyOS', target: 'Region_Global', relation: 'market_share_in', value: '5%' },

    // ---- 2. 操作系统 - 地区市场份额关系 ----
    // 中国
    { source: 'OS_Android', target: 'Region_China', relation: 'market_share_in', value: '63%' },
    { source: 'OS_iOS', target: 'Region_China', relation: 'market_share_in', value: '17%' },
    { source: 'OS_HarmonyOS', target: 'Region_China', relation: 'market_share_in', value: '19%' },
    // 美国
    { source: 'OS_iOS', target: 'Region_USA', relation: 'market_share_in', value: '59%' },
    { source: 'OS_Android', target: 'Region_USA', relation: 'market_share_in', value: '41%' },
    // 印度
    { source: 'OS_Android', target: 'Region_India', relation: 'market_share_in', value: '90%' },
    { source: 'OS_iOS', target: 'Region_India', relation: 'market_share_in', value: '10%' },

    // ---- 3. 品牌 - 操作系统关系 (预装/使用) ----
    { source: 'Brand_Samsung', target: 'OS_Android', relation: 'uses' },
    { source: 'Brand_Xiaomi', target: 'OS_Android', relation: 'uses' },
    { source: 'Brand_OPPO', target: 'OS_Android', relation: 'uses' },
    { source: 'Brand_vivo', target: 'OS_Android', relation: 'uses' },
    { source: 'Brand_Huawei', target: 'OS_HarmonyOS', relation: 'uses' },
    { source: 'Brand_Honor', target: 'OS_Android', relation: 'uses' },  // 荣耀目前主要使用Android
    { source: 'Brand_Apple', target: 'OS_iOS', relation: 'uses' },

    // ---- 4. 品牌 - 地区出货/份额关系 ----
    // 全球出货排名/份额
    { source: 'Brand_Samsung', target: 'Region_Global', relation: 'shipment_share', value: '22%' },
    { source: 'Brand_Apple', target: 'Region_Global', relation: 'shipment_share', value: '20%' },
    { source: 'Brand_OPPO', target: 'Region_Global', relation: 'shipment_share', value: '~10%' },
    { source: 'Brand_vivo', target: 'Region_Global', relation: 'shipment_share', value: '~7%' },
    // 中国市场份额
    { source: 'Brand_Huawei', target: 'Region_China', relation: 'market_share_in', value: '20%' },
    { source: 'Brand_Apple', target: 'Region_China', relation: 'market_share_in', value: '19%' },

    // ---- 5. 全球收入份额关系 (品牌-收入) ----
    { source: 'Brand_Apple', target: 'Region_Global', relation: 'revenue_share', value: '48%' },
    { source: 'Brand_Samsung', target: 'Region_Global', relation: 'revenue_share', value: '18%' },
    { source: 'Brand_OPPO', target: 'Region_Global', relation: 'revenue_share', value: '6%' },

    // ---- 6. 数据来源关系 (关联数据与来源) ----
    // Counterpoint 数据
    { source: 'Source_Counterpoint', target: 'OS_Android', relation: 'reports' },
    { source: 'Source_Counterpoint', target: 'OS_iOS', relation: 'reports' },
    { source: 'Source_Counterpoint', target: 'OS_HarmonyOS', relation: 'reports' },
    { source: 'Source_Counterpoint', target: 'Brand_Apple', relation: 'reports' },
    { source: 'Source_Counterpoint', target: 'Brand_Samsung', relation: 'reports' },
    { source: 'Source_Counterpoint', target: 'Region_China', relation: 'reports' },
    { source: 'Source_Counterpoint', target: 'Region_USA', relation: 'reports' },
    { source: 'Source_Counterpoint', target: 'Region_India', relation: 'reports' },
    // Omdia 数据
    { source: 'Source_Omdia', target: 'Brand_Samsung', relation: 'reports' },
    { source: 'Source_Omdia', target: 'Brand_Apple', relation: 'reports' },
    { source: 'Source_Omdia', target: 'Brand_Xiaomi', relation: 'reports' },
    { source: 'Source_Omdia', target: 'Region_Global', relation: 'reports' },
  ]
};

// ---------- 导出 (用于 Node.js / ESM) ----------
if (typeof module !== 'undefined' && module.exports) {
  module.exports = knowledgeGraph;
}

// ---------- 数据来源说明 ----------
// 1. Counterpoint Research - 2026年Q1全球/中国/美国/印度市场份额数据
//    链接: https://www.counterpointresearch.com/
// 2. Omdia - 2026年Q1全球智能手机出货量排名数据
//    链接: https://www.omdia.com/

// ============================================================
// 可视化使用示例 (ECharts 力导向图)
// ============================================================
/*
// 在 HTML 中引入 ECharts 后，可使用以下代码渲染：

const graphData = {
  nodes: knowledgeGraph.nodes.map(n => ({
    id: n.id,
    name: n.name,
    symbolSize: n.type === 'OperatingSystem' ? 40 :
                n.type === 'Brand' ? 30 :
                n.type === 'Source' ? 20 : 25,
    category: n.type,
    label: { show: true, formatter: '{b}' },
    // 附加数据
    marketShare: n.marketShare || '',
    shipment: n.shipment || '',
  })),
  links: knowledgeGraph.edges.map(e => ({
    source: e.source,
    target: e.target,
    label: { show: true, formatter: e.value || e.relation, fontSize: 10 },
    lineStyle: { curveness: 0.2 },
    value: e.value || '',
  })),
  categories: [
    { name: 'OperatingSystem', itemStyle: { color: '#5470c6' } },
    { name: 'Brand', itemStyle: { color: '#fac858' } },
    { name: 'Region', itemStyle: { color: '#ee6666' } },
    { name: 'Source', itemStyle: { color: '#73c0de' } },
  ]
};

// 使用 ECharts 的 graph 类型进行渲染
// option = { title: { text: '手机OS知识图谱' }, series: [{ type: 'graph', ...graphData }] };
*/