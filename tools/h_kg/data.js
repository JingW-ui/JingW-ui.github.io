// 心血管疾病知识图谱 - 实体-关系-实体三元组
const knowledgeGraph = {
  entities: [
    // === 疾病实体 ===
    { id: 'D001', name: '心血管疾病', type: '疾病' },
    { id: 'D002', name: '冠心病', type: '疾病' },
    { id: 'D003', name: '脑血管疾病', type: '疾病' },
    { id: 'D004', name: '高血压', type: '疾病' },
    { id: 'D005', name: '心力衰竭', type: '疾病' },
    { id: 'D006', name: '心律失常', type: '疾病' },
    { id: 'D007', name: '周围血管疾病', type: '疾病' },
    { id: 'D008', name: '风湿性心脏病', type: '疾病' },
    { id: 'D009', name: '先天性心脏病', type: '疾病' },
    { id: 'D010', name: '心肌病', type: '疾病' },
    { id: 'D011', name: '心肌梗死', type: '疾病' },
    { id: 'D012', name: '心绞痛', type: '疾病' },
    { id: 'D013', name: '脑卒中', type: '疾病' },
    { id: 'D014', name: '动脉粥样硬化', type: '疾病' },

    // === 症状实体 ===
    { id: 'S001', name: '胸骨后压榨性疼痛', type: '症状' },
    { id: 'S002', name: '放射性疼痛', type: '症状' },
    { id: 'S003', name: '气短', type: '症状' },
    { id: 'S004', name: '乏力', type: '症状' },
    { id: 'S005', name: '恶心', type: '症状' },
    { id: 'S006', name: '呕吐', type: '症状' },
    { id: 'S007', name: '上腹不适', type: '症状' },
    { id: 'S008', name: '下颌酸胀', type: '症状' },
    { id: 'S009', name: '出冷汗', type: '症状' },
    { id: 'S010', name: '濒死感', type: '症状' },
    { id: 'S011', name: '进行性加重的呼吸困难', type: '症状' },
    { id: 'S012', name: '下肢水肿', type: '症状' },
    { id: 'S013', name: '心悸', type: '症状' },
    { id: 'S014', name: '心慌', type: '症状' },
    { id: 'S015', name: '头晕', type: '症状' },
    { id: 'S016', name: '黑矇', type: '症状' },
    { id: 'S017', name: '晕厥', type: '症状' },
    { id: 'S018', name: '一侧面部麻木无力', type: '症状' },
    { id: 'S019', name: '言语不清', type: '症状' },
    { id: 'S020', name: '视物模糊', type: '症状' },
    { id: 'S021', name: '剧烈头痛', type: '症状' },
    { id: 'S022', name: '行走困难', type: '症状' },

    // === 病因/危险因素实体 ===
    { id: 'R001', name: '高血压', type: '危险因素' },
    { id: 'R002', name: '血脂异常', type: '危险因素' },
    { id: 'R003', name: '低密度脂蛋白胆固醇升高', type: '危险因素' },
    { id: 'R004', name: '糖尿病', type: '危险因素' },
    { id: 'R005', name: '吸烟', type: '危险因素' },
    { id: 'R006', name: '二手烟暴露', type: '危险因素' },
    { id: 'R007', name: '肥胖', type: '危险因素' },
    { id: 'R008', name: '超重', type: '危险因素' },
    { id: 'R009', name: '中心性肥胖', type: '危险因素' },
    { id: 'R010', name: '高盐饮食', type: '危险因素' },
    { id: 'R011', name: '高脂肪饮食', type: '危险因素' },
    { id: 'R012', name: '高糖饮食', type: '危险因素' },
    { id: 'R013', name: '蔬菜水果摄入不足', type: '危险因素' },
    { id: 'R014', name: '缺乏身体活动', type: '危险因素' },
    { id: 'R015', name: '久坐不动', type: '危险因素' },
    { id: 'R016', name: '长期精神紧张', type: '危险因素' },
    { id: 'R017', name: '压力大', type: '危险因素' },
    { id: 'R018', name: '过量饮酒', type: '危险因素' },
    { id: 'R019', name: '睡眠不足', type: '危险因素' },
    { id: 'R020', name: '年龄增长', type: '危险因素' },
    { id: 'R021', name: '男性', type: '危险因素' },
    { id: 'R022', name: '早发心血管病家族史', type: '危险因素' },
    { id: 'R023', name: '女性绝经后', type: '危险因素' },

    // === 治疗/干预实体 ===
    { id: 'T001', name: '生活方式干预', type: '治疗' },
    { id: 'T002', name: '抗血小板药', type: '治疗' },
    { id: 'T003', name: '降脂药', type: '治疗' },
    { id: 'T004', name: '他汀类药物', type: '治疗' },
    { id: 'T005', name: '降压药', type: '治疗' },
    { id: 'T006', name: '降糖药', type: '治疗' },
    { id: 'T007', name: '硝酸酯类', type: '治疗' },
    { id: 'T008', name: '经皮冠状动脉介入治疗', type: '治疗' },
    { id: 'T009', name: '支架植入', type: '治疗' },
    { id: 'T010', name: '冠状动脉旁路移植术', type: '治疗' },
    { id: 'T011', name: '搭桥手术', type: '治疗' },
    { id: 'T012', name: '心脏再同步化治疗', type: '治疗' },
    { id: 'T013', name: '植入式心律转复除颤器', type: '治疗' },
    { id: 'T014', name: '急救', type: '治疗' },

    // === 预防实体 ===
    { id: 'P001', name: '健康饮食', type: '预防' },
    { id: 'P002', name: '地中海饮食', type: '预防' },
    { id: 'P003', name: '规律运动', type: '预防' },
    { id: 'P004', name: '控制体重', type: '预防' },
    { id: 'P005', name: '戒烟', type: '预防' },
    { id: 'P006', name: '限酒', type: '预防' },
    { id: 'P007', name: '管理血压', type: '预防' },
    { id: 'P008', name: '管理血糖', type: '预防' },
    { id: 'P009', name: '管理血脂', type: '预防' },
    { id: 'P010', name: '心理平衡', type: '预防' },
    { id: 'P011', name: '定期体检', type: '预防' },

    // === 流行病学实体 ===
    { id: 'E001', name: '全球头号死因', type: '流行病学' },
    { id: 'E002', name: '每年1790万人死亡', type: '流行病学' },
    { id: 'E003', name: '中国现患人数3.3亿', type: '流行病学' },
    { id: 'E004', name: '高血压2.45亿', type: '流行病学' },
    { id: 'E005', name: '冠心病1139万', type: '流行病学' },
    { id: 'E006', name: '卒中1300万', type: '流行病学' },
    { id: 'E007', name: '心力衰竭890万', type: '流行病学' },
    { id: 'E008', name: '发病率620.33/10万', type: '流行病学' },
    { id: 'E009', name: '冠心病患病率758/10万', type: '流行病学' },
    { id: 'E010', name: '农村死亡率364.16/10万', type: '流行病学' },
    { id: 'E011', name: '城市死亡率305.39/10万', type: '流行病学' },
    { id: 'E012', name: '农村占全部死因48.98%', type: '流行病学' },
    { id: 'E013', name: '城市占全部死因47.35%', type: '流行病学' },
    { id: 'E014', name: '80%可预防', type: '流行病学' },

    // === 人群实体 ===
    { id: 'G001', name: '农村居民', type: '人群' },
    { id: 'G002', name: '城市居民', type: '人群' },
    { id: 'G003', name: '男性', type: '人群' },
    { id: 'G004', name: '女性', type: '人群' },
    { id: 'G005', name: '老年人', type: '人群' },
    { id: 'G006', name: '糖尿病患者', type: '人群' },
    { id: 'G007', name: '高血压患者', type: '人群' },
    { id: 'G008', name: '吸烟者', type: '人群' },
    { id: 'G009', name: '肥胖人群', type: '人群' },
    { id: 'G010', name: '有家族史人群', type: '人群' },

    // === 解剖/病理实体 ===
    { id: 'A001', name: '冠状动脉', type: '解剖' },
    { id: 'A002', name: '心脏', type: '解剖' },
    { id: 'A003', name: '血管', type: '解剖' },
    { id: 'A004', name: '左肩', type: '解剖' },
    { id: 'A005', name: '左臂内侧', type: '解剖' },
    { id: 'A006', name: '下颌', type: '解剖' },
    { id: 'A007', name: '背部', type: '解剖' },
  ],

  // === 三元组关系 ===
  triples: [
    // ---- 分类关系（层级） ----
    { subject: 'D001', predicate: '包含', object: 'D002' },
    { subject: 'D001', predicate: '包含', object: 'D003' },
    { subject: 'D001', predicate: '包含', object: 'D004' },
    { subject: 'D001', predicate: '包含', object: 'D005' },
    { subject: 'D001', predicate: '包含', object: 'D006' },
    { subject: 'D001', predicate: '包含', object: 'D007' },
    { subject: 'D001', predicate: '包含', object: 'D008' },
    { subject: 'D001', predicate: '包含', object: 'D009' },
    { subject: 'D001', predicate: '包含', object: 'D010' },

    // ---- 疾病-症状关系 ----
    { subject: 'D002', predicate: '有症状', object: 'S001' },
    { subject: 'D002', predicate: '有症状', object: 'S002' },
    { subject: 'D002', predicate: '有症状', object: 'S003' },
    { subject: 'D002', predicate: '有症状', object: 'S004' },
    { subject: 'D002', predicate: '有症状', object: 'S005' },
    { subject: 'D002', predicate: '有症状', object: 'S006' },
    { subject: 'D002', predicate: '有症状', object: 'S007' },
    { subject: 'D002', predicate: '有症状', object: 'S008' },
    { subject: 'D002', predicate: '有症状', object: 'S009' },
    { subject: 'D011', predicate: '有症状', object: 'S001' },
    { subject: 'D011', predicate: '有症状', object: 'S010' },
    { subject: 'D011', predicate: '有症状', object: 'S009' },
    { subject: 'D005', predicate: '有症状', object: 'S011' },
    { subject: 'D005', predicate: '有症状', object: 'S004' },
    { subject: 'D005', predicate: '有症状', object: 'S012' },
    { subject: 'D006', predicate: '有症状', object: 'S013' },
    { subject: 'D006', predicate: '有症状', object: 'S014' },
    { subject: 'D006', predicate: '有症状', object: 'S015' },
    { subject: 'D006', predicate: '有症状', object: 'S016' },
    { subject: 'D006', predicate: '有症状', object: 'S017' },
    { subject: 'D013', predicate: '有症状', object: 'S018' },
    { subject: 'D013', predicate: '有症状', object: 'S019' },
    { subject: 'D013', predicate: '有症状', object: 'S020' },
    { subject: 'D013', predicate: '有症状', object: 'S021' },
    { subject: 'D013', predicate: '有症状', object: 'S022' },

    // ---- 疾病-病因/危险因素关系 ----
    { subject: 'D014', predicate: '由...引起', object: 'R001' },
    { subject: 'D014', predicate: '由...引起', object: 'R002' },
    { subject: 'D014', predicate: '由...引起', object: 'R003' },
    { subject: 'D014', predicate: '由...引起', object: 'R004' },
    { subject: 'D002', predicate: '危险因素', object: 'R001' },
    { subject: 'D002', predicate: '危险因素', object: 'R002' },
    { subject: 'D002', predicate: '危险因素', object: 'R004' },
    { subject: 'D002', predicate: '危险因素', object: 'R005' },
    { subject: 'D002', predicate: '危险因素', object: 'R007' },
    { subject: 'D002', predicate: '危险因素', object: 'R020' },
    { subject: 'D002', predicate: '危险因素', object: 'R021' },
    { subject: 'D002', predicate: '危险因素', object: 'R022' },
    { subject: 'D003', predicate: '危险因素', object: 'R001' },
    { subject: 'D003', predicate: '危险因素', object: 'R004' },
    { subject: 'D003', predicate: '危险因素', object: 'R005' },
    { subject: 'D003', predicate: '危险因素', object: 'R007' },
    { subject: 'D004', predicate: '危险因素', object: 'R010' },
    { subject: 'D004', predicate: '危险因素', object: 'R007' },
    { subject: 'D004', predicate: '危险因素', object: 'R014' },
    { subject: 'D004', predicate: '危险因素', object: 'R018' },
    { subject: 'D005', predicate: '危险因素', object: 'R001' },
    { subject: 'D005', predicate: '危险因素', object: 'D002' },

    // ---- 危险因素之间的关联 ----
    { subject: 'R007', predicate: '导致', object: 'R001' },
    { subject: 'R007', predicate: '导致', object: 'R004' },
    { subject: 'R005', predicate: '导致', object: 'R001' },
    { subject: 'R010', predicate: '导致', object: 'R001' },
    { subject: 'R014', predicate: '导致', object: 'R007' },
    { subject: 'R016', predicate: '导致', object: 'R001' },

    // ---- 疾病-治疗关系 ----
    { subject: 'D002', predicate: '治疗方法', object: 'T001' },
    { subject: 'D002', predicate: '治疗方法', object: 'T002' },
    { subject: 'D002', predicate: '治疗方法', object: 'T003' },
    { subject: 'D002', predicate: '治疗方法', object: 'T007' },
    { subject: 'D002', predicate: '治疗方法', object: 'T008' },
    { subject: 'D002', predicate: '治疗方法', object: 'T010' },
    { subject: 'D011', predicate: '治疗方法', object: 'T014' },
    { subject: 'D011', predicate: '治疗方法', object: 'T008' },
    { subject: 'D004', predicate: '治疗方法', object: 'T001' },
    { subject: 'D004', predicate: '治疗方法', object: 'T005' },
    { subject: 'D005', predicate: '治疗方法', object: 'T001' },
    { subject: 'D005', predicate: '治疗方法', object: 'T012' },
    { subject: 'D006', predicate: '治疗方法', object: 'T013' },
    { subject: 'D006', predicate: '治疗方法', object: 'T001' },

    // ---- 治疗细分类系 ----
    { subject: 'T003', predicate: '包含', object: 'T004' },
    { subject: 'T008', predicate: '包含', object: 'T009' },
    { subject: 'T010', predicate: '包含', object: 'T011' },

    // ---- 疾病-预防关系 ----
    { subject: 'D001', predicate: '预防措施', object: 'P001' },
    { subject: 'D001', predicate: '预防措施', object: 'P003' },
    { subject: 'D001', predicate: '预防措施', object: 'P004' },
    { subject: 'D001', predicate: '预防措施', object: 'P005' },
    { subject: 'D001', predicate: '预防措施', object: 'P006' },
    { subject: 'D001', predicate: '预防措施', object: 'P007' },
    { subject: 'D001', predicate: '预防措施', object: 'P008' },
    { subject: 'D001', predicate: '预防措施', object: 'P009' },
    { subject: 'D001', predicate: '预防措施', object: 'P010' },
    { subject: 'D001', predicate: '预防措施', object: 'P011' },
    { subject: 'P001', predicate: '包含', object: 'P002' },

    // ---- 疾病-流行病学关系 ----
    { subject: 'D001', predicate: '流行病学', object: 'E001' },
    { subject: 'D001', predicate: '流行病学', object: 'E002' },
    { subject: 'D001', predicate: '流行病学', object: 'E003' },
    { subject: 'D002', predicate: '流行病学', object: 'E005' },
    { subject: 'D003', predicate: '流行病学', object: 'E006' },
    { subject: 'D004', predicate: '流行病学', object: 'E004' },
    { subject: 'D005', predicate: '流行病学', object: 'E007' },
    { subject: 'D001', predicate: '流行病学', object: 'E008' },
    { subject: 'D002', predicate: '流行病学', object: 'E009' },
    { subject: 'D001', predicate: '流行病学', object: 'E010' },
    { subject: 'D001', predicate: '流行病学', object: 'E011' },
    { subject: 'D001', predicate: '流行病学', object: 'E012' },
    { subject: 'D001', predicate: '流行病学', object: 'E013' },
    { subject: 'D001', predicate: '流行病学', object: 'E014' },

    // ---- 人群-流行病学关系 ----
    { subject: 'G001', predicate: '死亡率', object: 'E010' },
    { subject: 'G002', predicate: '死亡率', object: 'E011' },
    { subject: 'G003', predicate: '发病率高于', object: 'G004' },
    { subject: 'G001', predicate: '死亡率高于', object: 'G002' },
    { subject: 'G005', predicate: '发病率高于', object: 'G003' },

    // ---- 人群-危险因素关系 ----
    { subject: 'G006', predicate: '高风险', object: 'D002' },
    { subject: 'G007', predicate: '高风险', object: 'D002' },
    { subject: 'G008', predicate: '高风险', object: 'D002' },
    { subject: 'G009', predicate: '高风险', object: 'D002' },
    { subject: 'G010', predicate: '高风险', object: 'D002' },

    // ---- 解剖-疾病关系 ----
    { subject: 'A001', predicate: '受累部位', object: 'D002' },
    { subject: 'A002', predicate: '受累部位', object: 'D005' },
    { subject: 'A003', predicate: '受累部位', object: 'D001' },

    // ---- 症状-解剖关系 ----
    { subject: 'S001', predicate: '放射部位', object: 'A004' },
    { subject: 'S001', predicate: '放射部位', object: 'A005' },
    { subject: 'S001', predicate: '放射部位', object: 'A006' },
    { subject: 'S001', predicate: '放射部位', object: 'A007' },
  ]
};

// === 浏览器环境暴露 ===
if (typeof window !== 'undefined') {
  window.knowledgeGraph = knowledgeGraph;
}

// === 辅助工具函数 ===

// 1. 获取所有实体
function getAllEntities() {
  return knowledgeGraph.entities;
}

// 2. 根据ID获取实体
function getEntityById(id) {
  return knowledgeGraph.entities.find(e => e.id === id);
}

// 3. 根据类型获取实体
function getEntitiesByType(type) {
  return knowledgeGraph.entities.filter(e => e.type === type);
}

// 4. 获取某个实体的所有关系
function getRelationsForEntity(entityId) {
  const asSubject = knowledgeGraph.triples.filter(t => t.subject === entityId);
  const asObject = knowledgeGraph.triples.filter(t => t.object === entityId);
  return { asSubject, asObject };
}

// 5. 获取两个实体之间的所有关系
function getRelationsBetween(entityId1, entityId2) {
  return knowledgeGraph.triples.filter(
    t => (t.subject === entityId1 && t.object === entityId2) ||
         (t.subject === entityId2 && t.object === entityId1)
  );
}

// 6. 获取某种类型的关系
function getTriplesByPredicate(predicate) {
  return knowledgeGraph.triples.filter(t => t.predicate === predicate);
}

// 7. 获取某个实体的所有邻接实体（一跳）
function getNeighbors(entityId) {
  const neighbors = [];
  knowledgeGraph.triples.forEach(t => {
    if (t.subject === entityId) {
      neighbors.push(getEntityById(t.object));
    }
    if (t.object === entityId) {
      neighbors.push(getEntityById(t.subject));
    }
  });
  return neighbors.filter(Boolean);
}

// 8. 格式化输出三元组
function formatTriple(triple) {
  const subject = getEntityById(triple.subject);
  const object = getEntityById(triple.object);
  return `${subject?.name || triple.subject} --${triple.predicate}--> ${object?.name || triple.object}`;
}

// 9. 导出所有三元组为可读字符串
function getAllTriplesFormatted() {
  return knowledgeGraph.triples.map(t => formatTriple(t));
}

// 10. 统计信息
function getStats() {
  const entityTypes = {};
  knowledgeGraph.entities.forEach(e => {
    entityTypes[e.type] = (entityTypes[e.type] || 0) + 1;
  });
  const predicateCounts = {};
  knowledgeGraph.triples.forEach(t => {
    predicateCounts[t.predicate] = (predicateCounts[t.predicate] || 0) + 1;
  });
  return {
    totalEntities: knowledgeGraph.entities.length,
    totalTriples: knowledgeGraph.triples.length,
    entityTypes: entityTypes,
    predicateCounts: predicateCounts
  };
}

// 11. 按疾病查询相关信息（综合查询）
function getDiseaseInfo(diseaseId) {
  const disease = getEntityById(diseaseId);
  if (!disease) return null;

  const relations = getRelationsForEntity(diseaseId);
  const neighbors = getNeighbors(diseaseId);

  return {
    disease: disease,
    symptoms: relations.asSubject.filter(t => t.predicate === '有症状').map(t => getEntityById(t.object)),
    treatments: relations.asSubject.filter(t => t.predicate === '治疗方法').map(t => getEntityById(t.object)),
    riskFactors: relations.asSubject.filter(t => t.predicate === '危险因素').map(t => getEntityById(t.object)),
    prevention: relations.asSubject.filter(t => t.predicate === '预防措施').map(t => getEntityById(t.object)),
    epidemiology: relations.asSubject.filter(t => t.predicate === '流行病学').map(t => getEntityById(t.object)),
    subTypes: relations.asSubject.filter(t => t.predicate === '包含').map(t => getEntityById(t.object)),
    allNeighbors: neighbors
  };
}

// 12. 搜索实体
function searchEntities(keyword) {
  return knowledgeGraph.entities.filter(e =>
    e.name.includes(keyword) || e.id.includes(keyword)
  );
}

// === 导出模块 ===
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    knowledgeGraph,
    getAllEntities,
    getEntityById,
    getEntitiesByType,
    getRelationsForEntity,
    getRelationsBetween,
    getTriplesByPredicate,
    getNeighbors,
    formatTriple,
    getAllTriplesFormatted,
    getStats,
    getDiseaseInfo,
    searchEntities
  };
}

// === 使用示例 ===
console.log('=== 心血管疾病知识图谱 ===');
console.log(`实体总数: ${knowledgeGraph.entities.length}`);
console.log(`三元组总数: ${knowledgeGraph.triples.length}`);
console.log('\n实体类型分布:', getStats().entityTypes);
console.log('\n关系类型分布:', getStats().predicateCounts);

// 示例：查询冠心病信息
console.log('\n--- 冠心病综合信息 ---');
const cadInfo = getDiseaseInfo('D002');
if (cadInfo) {
  console.log('疾病:', cadInfo.disease.name);
  console.log('症状:', cadInfo.symptoms.map(s => s.name).join(', '));
  console.log('危险因素:', cadInfo.riskFactors.map(r => r.name).join(', '));
  console.log('治疗方法:', cadInfo.treatments.map(t => t.name).join(', '));
}

// 示例：输出前10条三元组
console.log('\n--- 部分三元组示例 ---');
getAllTriplesFormatted().slice(0, 10).forEach(t => console.log(t));