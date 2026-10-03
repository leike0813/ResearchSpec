<!--
工件类型: knowledge-pack
能力/包 ID: PD-KP-03 patent-point-mining
提取方式: curated — ResearchSpec 编写，非上游逐字节
来源对照（source mapping）:
    - vendor/patent-disclosure-skill/skills/patent-disclosure/prompts/invention/patent_points_analyzer.md
    - vendor/patent-disclosure-skill/skills/patent-disclosure/prompts/utility_model/patent_points.md
    - vendor/patent-disclosure-skill/skills/patent-disclosure/prompts/design/patent_points.md
说明: 只保留挖点维度与 uncertain 处理，不保留“然后自动进入查新”。
-->

# 专利点挖掘与检索请求 (Invention mining and search request)

## 挖掘

从技术材料中提取候选专利点，每个点写清：问题 → 手段 → 效果。三种类型各有侧重：

- 发明：技术问题、技术手段闭环、模块与流程、分支与依赖来源。
- 实用新型：部件、连接关系、布局改进，且可单独实施。
- 外观设计：造型、图案、色彩的设计要点。

术语贴合领域，标题中的领域实词在全案作为同一执行主体出现，不靠定义保留空词。

## 评分与筛选

- 对候选点按可实施性、与材料现有做法的距离、保护落点评级。未检索不得标「空白 /
  蓝海」。
- 材料未披露的部件写入 `uncertain`，不进入权利要求或说明书。
- 每条保护点必须是可实施机制，不是仅罗列标题对象。

## 检索请求 (search_request)

派生内容：专利类型、核心手段词与功效词、可选发明人 / 申请人 / 分类号线索。检索词
同时给中文与英文形式，一行一词组，供检索阶段直接使用。

## 产出

- `invention_brief`：候选点、问题 - 手段 - 效果、假设与证据限制、类型。
- `search_request`：检索请求。
