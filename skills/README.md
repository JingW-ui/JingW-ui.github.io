# 📚 Skills 技能库

本目录包含一系列 Agent Skills，用于扩展 AI 助手的能力。每个技能都是一个独立的模块，可以通过简单的命令安装使用。

## 快速开始

### 发现技能

```bash
npx skills add https://github.com/JingW-ui/JingW-ui.github.io/tree/main/skills --find-skills
```

### 创建自己的技能

```bash
npx skills add https://github.com/JingW-ui/JingW-ui.github.io/tree/main/skills --skill-creator
```

## 可用技能

### 🔍 学术研究工具

- **nature-academic-search** - 多源文献搜索、引用验证、MeSH搜索策略和参考文献管理
- **nature-citation** - 为手稿添加严格的Nature/CNS引用
- **nature-data** - 准备Nature就绪的数据可用性声明和FAIR元数据
- **nature-figure** - 生成Nature风格的期刊图表（Python/R）
- **nature-paper2ppt** - 从科学论文构建Nature风格中文PPT演示文稿
- **nature-polishing** - 将学术文本润色为Nature风格英语
- **nature-reader** - 构建全文中英文对照Markdown阅读器
- **nature-response** - 起草Nature系列手稿修回的逐点审稿人回复信
- **nature-writing** - 起草Nature风格的手稿章节

### 🛠️ 实用工具

- **python-auto-type** - 自动将Python代码输入到任意目标窗口，模拟真实打字行为

## 安装方法

使用以下命令安装任意技能：

```bash
npx skills add https://github.com/JingW-ui/JingW-ui.github.io/tree/main/skills --<skill-name>
```

将 `<skill-name>` 替换为你想要安装的技能名称。

## 更多资源

访问 [skills.sh](https://www.skills.sh/trending) 查看更多可用技能。
