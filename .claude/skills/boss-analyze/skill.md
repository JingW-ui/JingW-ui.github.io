---
name: boss-analyze
description: 分析BOSS直聘抓取的职位数据，生成带可视化图表的HTML分析报告。jieba自动提取JD关键词、动态雷达维度适配岗位类型、P75/P25动态薪资阈值、花叔Design编辑式排版。触发词：分析岗位、岗位分析、boss数据分析、职位分析。
---

# BOSS直聘岗位数据分析

读取 `boss-scrape` 抓取的数据，进行多维度分析并生成带图表的 HTML 报告。

## 前置条件检测（每次必先执行）

检查是否有可分析的数据：

```bash
ls -lt data/*_jobs.json 2>/dev/null | head -5
```

- 找到 JSON 文件 → 继续，默认使用最新的那个
- 无文件或 data 目录不存在 → 告诉用户：「没有找到抓取数据，请先说"抓取boss岗位"来采集数据。」**不要继续执行**

同时检查 Python 环境（分析脚本需要 Python + jieba）：

```bash
source .venv/bin/activate 2>/dev/null && python -c "import jieba; print('ENV:OK')" 2>&1
```

- jieba 未安装 → `pip install jieba`
- 其他报错 → 告诉用户先说"配置boss抓取"初始化环境

## 参数获取

从用户消息中提取分析意图，如果不明确则默认做全维度分析：

| 参数 | 说明 | 默认值 |
|------|------|--------|
| **数据文件** | data/ 下的 JSON 文件 | 自动检测最新的 `*_jobs.json` |
| **分析维度** | 用户关注的维度 | 全部（JD总结+薪资+技能+经验+学历） |

## 执行流程

### Step 1: 定位数据文件

```bash
ls -lt data/*_jobs.json 2>/dev/null | head -5
```

如果有多个文件，让用户选择或默认使用最新的。

### Step 2: 使用 analyzer_redesign.py 生成报告

项目中已有 `tools/analyzer_redesign.py`，它是花叔Design重设计版分析器，包含完整功能。直接调用：

```bash
source .venv/bin/activate && python -c "
import sys; sys.path.insert(0, 'tools')
from analyzer_redesign import analyze
import json
with open('data/{{DATA_FILE}}', 'r', encoding='utf-8') as f:
    jobs = json.load(f)
with open('reports/{{REPORT_NAME}}.html', 'w', encoding='utf-8') as f:
    f.write(analyze(jobs))
print('报告已生成')
"
```

将 `{{DATA_FILE}}` 替换为实际数据文件名，`{{REPORT_NAME}}` 替换为报告名。

如果 `tools/analyzer_redesign.py` 不存在，则使用内置模板生成。模板包含完整的花叔Design报告生成器，特性如下：

- **jieba 自动关键词提取**：从 JD 文本中动态提取高频技能词，不依赖写死的关键词列表
- **JD 总结模块**：自动将岗位分类，生成各方向岗位画像卡片（薪资范围、主流经验/学历、核心技能标签）和市场信号洞察
- **动态雷达维度**：24 个候选维度池（覆盖技术/商务/外贸/财务/通用），自动选出与当前 JD 最相关的 8 个作为雷达轴。Java 后端选编程/框架/数据库，会计岗选财务核算/税务/审计
- **P75/P25 动态薪资阈值**：高薪线和低薪线根据数据分布自动计算，不同岗位类型的阈值完全不同
- **动态报告标题**：从数据中的 keyword 和 city 自动提取，生成如「北京 会计岗位市场报告」的标题
- **花叔Design编辑式排版**：Noto Serif SC 宋体标题、暖白底色（#FAF9F6）、赭石accent（#9A3412）、DM Mono 数据字体
- **JS 分页 + 详情弹窗**：岗位明细每页10条，省略号分页器（首页+末页+5页窗口），点击行弹出完整 JD
- **高薪技能对比**：双列布局，左侧高薪优势 TOP5，右侧入门岗偏好 TOP5
- **反 AI slop**：不用暗色主题、不用 emoji 标题、不用彩虹配色、不用圆角卡片+左border accent

### Step 3: 打开报告

```bash
open reports/*_分析报告.html   # macOS
```

### Step 4: 呈现结果

分析完成后：
1. 自动用浏览器打开 HTML 报告
2. 向用户展示关键发现的摘要（3-5条）
3. 告知报告文件路径

## 报告包含的可视化

| 模块 | 类型 | 内容 |
|------|------|------|
| JD 总结 · 岗位画像 | 卡片网格 | 每个方向：岗位数、薪资范围/中位数、主流经验/学历、核心技能标签 |
| JD 总结 · 技能雷达 | 雷达图×2 | 高薪vs入门对比 + 各方向技能对比（维度从24候选池自动选8个） |
| JD 总结 · 市场信号 | 列表 | 月薪中位数、高频技能、经验门槛、各类型概况 |
| 薪资分析 | 柱状图+表格 | 月薪区间分布 + 城市薪资对比（中位数/平均/范围） |
| 经验与学历 | 环形图×2 | 各经验区间/学历层次分布 |
| 技能需求 | 横向柱状图 | 从JD自动提取的高频技能词（jieba分词） |
| 高薪vs入门技能 | 双列表格 | P75+与P25以下岗位的技能差异TOP5 |
| 岗位明细 | 分页表格 | JS分页（省略号页码）+ 点击查看JD详情弹窗 |
