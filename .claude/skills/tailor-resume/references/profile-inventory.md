# 项目与经历清单索引

> 这是 JD 适配的"原材料清单"。生成定向简历时，从这里快速挑选与岗位最对口的项目，再去 `cv/index.html` / `resume/index.html` 取完整描述与链接。
> 若本索引与 cv/resume 实际内容冲突，以 cv/resume 为准，并提示用户更新本文件。

## 个人信息（固定）
- 姓名：王京 ｜ 男 ｜ 24岁 ｜ 硕士
- 电话：17702376984 ｜ 邮箱：2642144249@qq.com ｜ 微信：Barbarianwj
- GitHub：https://github.com/JingW-ui ｜ 主页：https://jingw-ui.github.io/
- 头像：`/imgs/life_and_others/myavtar.png`
- **不要写政治面貌。**

## 可公开核验的数字（生成简历时直接引用，禁止估算）
> 这些数字可被 GitHub / 公开渠道核验，夸大会成硬伤。以下为 2026-06-17 经 GitHub API 核实的值。
> 简历里单项用"约值"（70+ / 110+）留出增长余量；汇总数写"200+ Star"。
> star 会增长，生成前若有网络可重新 curl 核对；用户群人数 API 查不到，以用户确认为准。

- GitHub 总 Star 汇总：**200+ Star**（约 216，= 79 + 114 + 22 + 1 + 其他小项目）
- AutoTask：实际 79 Star，简历写 **"70+ Star"**，用户群 150+（QQ，用户已确认）
- 通用目标检测与分割（PI-MAPP/universal_object_detection_plus）：实际 114 Star，简历写 **"110+ Star"**，用户群 50+（QQ，用户已确认）
- NEURA：实际 22 Star
- MediScreen-Brain：实际 1 Star（简历一般不写星数，只写"已开源 / SCI 论文"）


## 教育背景
- 电子科技大学（985）· 生物医学工程 · 硕士 ｜ 2024.09-至今 ｜ GPA 3.83/4（前5%）｜ 导师 陈华富教授 ｜ 神经信息教育部重点实验室
- 西南科技大学 · 生物医学工程 · 本科 ｜ 2020.09-2024.06 ｜ GPA 4.15/5（前2%）｜ 四川省优秀毕业生 · 推免生

## 项目清单（按类别，标注：技术栈 / 角色 / 成果 / 链接）

### AI 提效 / 大模型落地（适配 AI 岗、AI 提效工具岗）
- **NEURA 神经影像分析智能体** ｜ 2025.07-2026.02
  - 技术栈：LLM · Agent · Chain-of-Thought · Toolset · RAG · 双知识图谱(DiseaseKG/ToolKG) · Python
  - 角色：主导设计与开发，构建核心认知架构与双知识图谱，编排异构工具链(SPM/FreeSurfer)实现端到端自动化
  - 成果：bioRxiv 已发布
  - 链接：GitHub https://github.com/NeuroScienceLab/NEURA ｜ 论文 https://www.biorxiv.org/content/10.64898/2026.04.27.721217v1.full.pdf
- **AutoTask 自动化办公助手** ｜ 2025.10-2026.01
  - 技术栈：Vibe Coding · PySide6 · PyAutoGUI · RPA · 定时调度
  - 角色：架构师、主迭代、UI 设计与样式优化、测试
  - 成果：GitHub 79 Star（简历写"70+ Star"），用户群 150+
  - 链接：GitHub https://github.com/JingW-ui/AutoTask-UI- ｜ 用户群 https://qm.qq.com/q/8Bm7ntOXte ｜ B站 https://www.bilibili.com/video/BV1FzpLzHEWL ｜ 下载 https://github.com/JingW-ui/AutoTask-UI-/releases
- **通用目标检测与分割系统** ｜ 2025.08-2025.10
  - 技术栈：Vibe Coding · YOLOv8~YOLO26 · PyTorch · PySide6
  - 角色：架构设计、细节迭代、UI 样式优化
  - 成果：GitHub 114 Star（简历写"110+ Star"），用户群 50+，支持多输入、内置 40+ 私有权重
  - 链接：GitHub https://github.com/JingW-ui/PI-MAPP/tree/main/project/universal_object_detection_plus ｜ 用户群 https://qm.qq.com/q/wZRWYGb78I ｜ B站 https://www.bilibili.com/video/BV1dQedz9EKn

### 游戏开发（适配游戏测试开发、游戏研发、图形/交互岗）
- **Games Hub 个人游戏网站（18 款网页游戏）** ｜ 2023-至今
  - 技术栈：Three.js · WebGL · JavaScript · HTML5 Canvas · CSS3（3D 渲染、游戏循环、物理与碰撞、交互输入）
  - 角色：独立设计并开发全部游戏，从玩法设定、渲染、交互到性能调优与跨浏览器兼容性自测
  - 成果：覆盖 3D 极速赛车、星空漂流、赛博回廊、霓虹贪吃蛇、数独、扑克、像素物语、赛博木鱼、3D 骰子/地球、交互式蜘蛛、形态工坊等多品类，体验不同类型游戏并持续迭代
  - 链接：在线试玩 https://jingw-ui.github.io/Games/ ｜ 源码见 GitHub https://github.com/JingW-ui （JingW-ui.github.io 仓库）
  - 适配要点：①热爱游戏、钻研设定、勇于提体验改进建议 ②深入理解游戏研发各环节，可为测试工具/自动化测试框架设计提供研发侧视角 ③每款游戏自测（跨浏览器、帧率/内存、边界 Bug），体现质量保障流程
  - 适配岗位：游戏测试开发工程师、游戏研发、图形渲染、交互开发

### 跨平台 / Web 全栈（适配前端、跨平台、Web 开发岗）
- **MediScreen-Brain 脑肿瘤检测平台（Web）** ｜ 技术栈：HTML·CSS·JavaScript·YOLO·PyTorch·多模态
  - 角色：前端页面设计与实现，关注多端一致性与体验
  - 成果：SCI 论文 + 已开源
  - 链接：主页 https://jingw-ui.github.io/MediScreen-Brain/ ｜ GitHub https://github.com/JingW-ui/MediScreen-Brain
- **结直肠癌智能检测与诊断系统（全栈 Web）** ｜ 2023.04-2023.07
  - 技术栈：YOLOv8·Django·HTML·CSS·MySQL·Python
  - 角色：独立完成全栈（页面设计美化、MySQL 设计、接口开发测试）
  - 成果：全国二等奖 · 四川省一等奖
  - 链接：证书 /imgs/competitions/8.png
- **C 语言能力考试系统（Java 前后端 Web）** ｜ 2022.06-2022.11
  - 技术栈：Spring Boot·Vue·MySQL·Java
  - 角色：MySQL 设计、后端接口开发测试
  - 成果：已投入学校使用，数百学生使用

### 深度学习 / 算法（适配算法、CV 岗）
- **海马体自动分割系统** ｜ 2024.04-2024.07 ｜ nnU-Net·Python·3D Slicer ｜ Dice=0.9554, HD95=1.0mm ｜ 国赛一等奖 ｜ 证书 /imgs/competitions/9.png
- **摔倒行为识别预警系统** ｜ 2025.04-2025.07 ｜ YoloPose·OpenPose·BlazePose·PySide6·Transformer ｜ 省一等奖 ｜ 证书 /imgs/competitions/3.png
- **结直肠息肉检测** ｜ 见上（全栈 Web 条目同源）｜ 全国二等奖/省一等奖

### 教学内容（适配有教学/表达力要求的岗位，一般省略）
- 微机原理与接口技术复习课 ｜ B站播放 20w+ ｜ https://www.bilibili.com/video/BV1Sd4y1J7k5/

## 实习经历
- **国网宁夏电力有限公司 · AI 算法实习生** ｜ 2023.10-2023.12
  - 技术栈：YOLO·OpenPose·Python·无人机数据采集
  - 内容：头盔检测、人体姿态估计、危险姿势识别与安全预警；数据采集与算法实现

## 科研成果
- SCI：MediScreen-Brain（多模态脑肿瘤检测 GUI）
- SCI：NEURA（自主神经影像分析智能体，bioRxiv）
- SCI：脑干纤维束萎缩预测 SCA3 疾病进展
- 专利：基于深度学习的 MRI 海马体 3D 智能分析诊断平台
- 软著 ×5：结直肠息肉检测、摔倒识别、批量图像处理、海马体分析、脑肿瘤检测

## 获奖荣誉（精选，按岗位相关性取舍）
- 国家级：第九届(2024)/第八届(2023) 全国大学生生物医学工程创新设计竞赛 一等奖/二等奖
- 省级：第三/四/五届四川省生物医学工程创新设计大赛一等奖 ×4（2023-2025）
- 省级：湖北"华为云杯"昇腾云血液图像处理大赛二等奖（2025）
- 省级：第十届 BOE 全球创新挑战赛二等奖（2025）
- 奖学金：国家励志奖学金 ×2、电子科大优秀研究生、学业奖学金一等奖、研究生"学术青苗"奖
- 其他：四川省优秀毕业生、绵阳市三好学生

## 通用技能池（按 JD 选用，相关项用 primary 高亮）

> 按 JD 方向从中挑选相关项，最相关的用 `class="skill primary"`（灰底黑字加粗）高亮。带 **★** 的是强项，相关时应优先高亮 / 置顶。分组标题保持简洁，不要塞 JD 原话括号（见 SKILL.md 输出规范）。

### 编程语言
- **★ Python**（主力）
- **★ C / C++**
- **★ TypeScript / JavaScript**
- Java
- HTML5 / CSS3
- Go（了解）

### AI / 大模型 / Agent
- **★ LLM / GPT 类模型应用开发**
- **★ Agent 开发**（Planning / Memory / Tool Use）
- **★ Multi-Agent 协作架构**
- Prompt 工程
- RAG（检索增强生成）
- Chain-of-Thought
- Function Calling / Structured Output
- JSON / XML 输出控制
- LangChain（了解）/ 自研 Agent 框架
- Temperature / Top-p 调参

### AI Coding 工具
- **★ Claude Code（CLI）**
- **★ Cursor**
- Codex / GitHub Copilot CLI
- Vibe Coding
- AI 原生开发 / "先复核再采用"
- 代码生成 / 跨文件重构 / 自动化测试用例生成

### 深度学习 / 计算机视觉
- **★ PyTorch**
- **★ YOLO 系列（v8~v26，2D 目标检测）**
- **★ 图像分割（nnU-Net）**
- Transformer
- 姿态估计（OpenPose / YOLO-Pose / BlazePose）
- 深度学习 / 机器学习
- 图像预处理 / 数据增强

### 前端 / Web
- **★ Vue**（组件化 / 状态管理）
- React（迁移中）
- Three.js / WebGL / HTML5 Canvas
- Jekyll / Liquid 模板
- Django 模板
- 响应式布局 / W3C 标准

### 前端工程化
- 前端工程化
- Vite / Webpack（构建）
- Babel
- Node.js 生态
- 代码规范 / 自动化测试
- GitHub Pages CI

### 后端 / 数据库
- Java / Spring Boot
- Django
- MySQL
- 接口开发与测试

### 工程 / 工科基础
- **★ 数据结构与算法**
- 操作系统
- 计算机网络
- Linux 开发环境
- 电路 / 模电 / 数电
- 传感器与测量
- 信号与系统
- 工程数学

### 工具链 / 综合
- Git / GitHub
- PySide6 / Qt GUI
- PyAutoGUI（自动化 / 可迁移运动控制、自动化测试）
- 3D Slicer
- 技术文档撰写
- 文献阅读（CVPR / ICCV 等）
- 英语六级


## 一般应省略（除非 JD 相关）
- 体育奖项（跳大绳、4×100、乒乓球等）
- 佳能摄影接客等"爱好与生活"
- 各类校级体育/寝室奖项
- 注意：**健身 vlog 博主（抖音 5000+ 粉、获赞 10w+）虽属"爱好"，但对运动 / 健康 / 体适能类岗位（如 OPPO 运动产品生物医学工程师）高度相关，应前置为独立项目**，不要一刀切省略。
