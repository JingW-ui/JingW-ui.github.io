"""
神经影像工具知识图谱 -> 三元组提取 (Triples Extraction)

从 tool_knowledge_graph.py 中的 TOOL_KNOWLEDGE_GRAPH 提取实体与关系，
按标准三元组 (实体, 关系, 实体) 组织，输出为前端友好的 JSON。

输出结构:
{
  "metadata": {...},
  "nodes":  [{"id", "label", "type", "properties"}],
  "links":  [{"source", "relation", "target", "label", "properties"}],   # 即三元组
  "triples":[{"head", "relation", "tail"}]   # 纯三元组冗余视图
}

设计说明:
- 节点 id 使用类型前缀 (tool:/disease:/roi:/task:/metric:/input:/output:/category:/modality:)
  避免"海马"既是脑区又是任务关键词的 ID 冲突；label 为原始字符串用于展示。
- 中英文疾病名 (阿尔茨海默病 / AD) 通过 same_as 关系连接。
- JSON 浏览器原生 JSON.parse 解析最快，且为图谱库标准输入格式。
"""
import json
from collections import OrderedDict

from tool_knowledge_graph import TOOL_KNOWLEDGE_GRAPH


# 疾病中文名 <-> 英文缩写 对应表 (基于 disease_roi_mapping 中的成对定义)
DISEASE_ABBR = {
    "阿尔茨海默病": "AD",
    "帕金森病": "PD",
    "脊髓小脑共济失调": "SCA",
    "抑郁症": "MDD",
    "精神分裂症": "SCZ",
    "多发性硬化": "MS",
    "自闭症": "ASD",
    "亨廷顿病": "HD",
    "双相障碍": "BD",
    "创伤后应激障碍": "PTSD",
    "强迫症": "OCD",
    "肌萎缩侧索硬化": "ALS",
    "额颞叶痴呆": "FTD",
    "轻度认知障碍": "MCI",
    "颞叶癫痫": "TLE",
    "焦虑症": "GAD",
}


class GraphBuilder:
    def __init__(self):
        self.nodes = OrderedDict()   # id -> node dict
        self.links = []              # list of link dict
        self.relation_counter = {}

    # ---- 节点 ----
    def add_node(self, type_, label, properties=None):
        node_id = f"{type_}:{label}"
        if node_id not in self.nodes:
            self.nodes[node_id] = {
                "id": node_id,
                "label": label,
                "type": type_,
                "properties": properties or {},
            }
        elif properties:
            # 合并属性
            self.nodes[node_id]["properties"].update(properties)
        return node_id

    # ---- 关系 (三元组) ----
    def add_link(self, source_id, relation, target_id, label=None, properties=None):
        if source_id is None or target_id is None:
            return
        link = {
            "source": source_id,
            "relation": relation,
            "target": target_id,
            "label": label if label is not None else relation,
        }
        if properties:
            link["properties"] = properties
        self.links.append(link)
        self.relation_counter[relation] = self.relation_counter.get(relation, 0) + 1


def build():
    g = GraphBuilder()
    kg = TOOL_KNOWLEDGE_GRAPH

    # ============================================================
    # 1. 工具节点及其属性关系
    # ============================================================
    for tool_key, info in kg["tools"].items():
        tid = g.add_node("tool", info.get("name", tool_key), {
            "key": tool_key,
            "function": info.get("function", ""),
            "confidence": info.get("confidence"),
            "processing_time": info.get("processing_time"),
            "software_version": info.get("software_version"),
            "evidence_level": info.get("evidence_level"),
        })

        # category
        cat = info.get("category")
        if cat:
            cid = g.add_node("category", cat)
            g.add_link(tid, "属于类别", cid)

        # modality
        mod = info.get("modality")
        if mod:
            mid = g.add_node("modality", mod)
            g.add_link(tid, "支持模态", mid)

        # inputs
        for inp in info.get("inputs", []):
            iid = g.add_node("input", inp)
            g.add_link(tid, "需要输入", iid)

        # outputs
        for out in info.get("outputs", []):
            oid = g.add_node("output", out)
            g.add_link(tid, "产出输出", oid)

        # depends_on
        for dep in info.get("depends_on", []):
            dep_info = kg["tools"].get(dep)
            dep_name = dep_info["name"] if dep_info else dep
            dep_id = g.add_node("tool", dep_name, {"key": dep})
            g.add_link(tid, "依赖工具", dep_id)

        # followed_by
        for fb in info.get("followed_by", []):
            fb_info = kg["tools"].get(fb)
            fb_name = fb_info["name"] if fb_info else fb
            fb_id = g.add_node("tool", fb_name, {"key": fb})
            g.add_link(tid, "可后接", fb_id)

        # best_for -> Task
        for bf in info.get("best_for", []):
            bfid = g.add_node("task", bf)
            g.add_link(tid, "擅长任务", bfid)

        # not_for -> Task
        for nf in info.get("not_for", []):
            nfid = g.add_node("task", nf)
            g.add_link(tid, "不适用任务", nfid)

    # ============================================================
    # 2. 任务-工具映射  (Task --推荐工具--> Tool)
    # ============================================================
    for task, tool_keys in kg["task_tool_mapping"].items():
        task_id = g.add_node("task", task)
        for tk in tool_keys:
            tinfo = kg["tools"].get(tk)
            tname = tinfo["name"] if tinfo else tk
            tid = g.add_node("tool", tname, {"key": tk})
            g.add_link(task_id, "推荐工具", tid)

    # ============================================================
    # 3. 疾病-脑区/工具/指标映射
    # ============================================================
    for disease_key, dinfo in kg["disease_roi_mapping"].items():
        did = g.add_node("disease", disease_key, {
            "evidence": dinfo.get("evidence", ""),
            "typical_findings": dinfo.get("typical_findings", ""),
            "confidence": dinfo.get("confidence"),
            "early_detection": dinfo.get("early_detection", False),
        })

        # primary ROI
        for roi in dinfo.get("primary", []):
            rid = g.add_node("roi", roi)
            g.add_link(did, "主要受累脑区", rid)

        # secondary ROI
        for roi in dinfo.get("secondary", []):
            rid = g.add_node("roi", roi)
            g.add_link(did, "次要受累脑区", rid)

        # recommended tools
        for tk in dinfo.get("recommended_tools", []):
            tinfo = kg["tools"].get(tk)
            tname = tinfo["name"] if tinfo else tk
            tid = g.add_node("tool", tname, {"key": tk})
            g.add_link(did, "推荐分析工具", tid)

        # recommended metrics
        for metric in dinfo.get("recommended_metrics", []):
            mid = g.add_node("metric", metric)
            g.add_link(did, "推荐测量指标", mid)

        # progression sequence -> 链式 progression 脑区 (若存在)
        seq = dinfo.get("progression_sequence")
        if seq:
            for i in range(len(seq) - 1):
                r1 = g.add_node("roi", seq[i])
                r2 = g.add_node("roi", seq[i + 1])
                g.add_link(r1, "疾病进展至", r2, properties={"disease": disease_key})

    # 中英文疾病名 same_as 关系
    for cn, abbr in DISEASE_ABBR.items():
        if cn in kg["disease_roi_mapping"] and abbr in kg["disease_roi_mapping"]:
            cn_id = g.add_node("disease", cn)
            ab_id = g.add_node("disease", abbr)
            g.add_link(cn_id, "同义简称", ab_id)

    # ============================================================
    # 4. 工具等价性  (Tool --功能等价--> Tool)
    # ============================================================
    for group_name, tool_keys in kg["tool_equivalences"].items():
        ids = []
        for tk in tool_keys:
            tinfo = kg["tools"].get(tk)
            tname = tinfo["name"] if tinfo else tk
            ids.append(g.add_node("tool", tname, {"key": tk}))
        for i in range(len(ids)):
            for j in range(i + 1, len(ids)):
                g.add_link(ids[i], "功能等价", ids[j], properties={"group": group_name})

    # ============================================================
    # 组装输出
    # ============================================================
    nodes = list(g.nodes.values())
    links = g.links

    # 三元组冗余视图 (head/relation/tail + 原始标签)
    id2label = {n["id"]: n["label"] for n in nodes}
    triples = []
    for lk in links:
        triples.append({
            "head": id2label[lk["source"]],
            "relation": lk["relation"],
            "tail": id2label[lk["target"]],
        })

    # 统计
    type_counts = {}
    for n in nodes:
        type_counts[n["type"]] = type_counts.get(n["type"], 0) + 1

    result = {
        "metadata": {
            "title": "神经影像工具知识图谱 (NeuroImaging Tool KG)",
            "source": "tools/kg/tool_knowledge_graph.py",
            "description": "从 TOOL_KNOWLEDGE_GRAPH 提取的实体-关系三元组，用于前端可视化",
            "schema": "节点(nodes) + 关系/三元组(links: source-relation-target)",
            "node_count": len(nodes),
            "link_count": len(links),
            "entity_types": type_counts,
            "relation_types": g.relation_counter,
        },
        "nodes": nodes,
        "links": links,
        "triples": triples,
    }
    return result


if __name__ == "__main__":
    data = build()
    out_path = "kg_data.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    m = data["metadata"]
    print("=" * 60)
    print("知识图谱三元组提取完成")
    print("=" * 60)
    print(f"输出文件: {out_path}")
    print(f"节点数: {m['node_count']}")
    print(f"关系(三元组)数: {m['link_count']}")
    print("\n实体类型分布:")
    for t, c in m["entity_types"].items():
        print(f"  {t:12s} {c}")
    print("\n关系类型分布:")
    for r, c in sorted(m["relation_types"].items(), key=lambda x: -x[1]):
        print(f"  {r:14s} {c}")
