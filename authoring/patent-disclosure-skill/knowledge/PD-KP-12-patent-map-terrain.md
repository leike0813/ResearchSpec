<!--
工件类型: knowledge-pack
能力/包 ID: PD-KP-12 patent-map-terrain
提取方式: curated — ResearchSpec 编写，非上游逐字节
来源对照（source mapping）:
    - vendor/patent-disclosure-skill/skills/patent-map/SKILL.md
    - vendor/patent-disclosure-skill/skills/patent-map/prompts/guardrails.md
    - vendor/patent-disclosure-skill/skills/patent-map/prompts/intake.md
说明: 上游扫全局 Obsidian 库并自动下载向量模型到 {Documents}。ResearchSpec 改为
      只读显式冻结的笔记索引，模型由用户配置且只读，缓存落在项目内 .patent-map。
-->

# 专利地图地形 (Patent map terrain)

把**已选定的**解读笔记摊成图，给代理师找相近案子、看申请人重叠与文内引证。不是
全库检索沙盘；空白点只表示「这次选的文件里没读到」。

## 取数只有一个入口：显式冻结的笔记索引

地图不从全局库、环境变量或目录通配里发现材料。上游拿到的 `patent_notes` 索引就是
全部输入：先把本轮要用的笔记收成一份 `kind: notes` 的索引，再交给地图工具。

索引里的每个 `path` 都必须在 `--project-root` 内、存在、且不在
`researchspec/` 内；越界、缺失或分类不符一律报错退出，不静默跳过。笔记数量与
单文件大小在工具内有上限，被截断时如实说明。

## 模型由用户配置，只读

语义坐标需要一个本地 ONNX 模型。模型目录由用户通过 `PATENT_MAP_MODEL_DIR`
配置，工具只检查权重、配置与分词器是否齐备：

- 未配置：地形退回 IPC 小类，并在页面上说明没有语义坐标。
- 配置了但文件不全：同样退回 IPC，并说明本地模型不完整。

工具只读这个目录，不下载、不安装、不移动、不删除里面的任何文件。语义检索
需要向量能力而本机没有时，用本阶段 Agent 自己已配置的工具去做，或如实说明地形
只到 IPC 粒度。

## 缓存

加速副本是派生数据，写在项目内 `.patent-map/`（可用 `PATENT_MAP_HOME` 改到别处），
按所选笔记集的路径摘要分目录。笔记的 mtime 或大小变了才重解析。缓存位置可清，
丢了只是重新解析。

## 本地页面

只绑 `127.0.0.1:0` 随机端口。工具输出 `MAP_URL:`、`MAP_PORT:`、`MAP_CORPUS:`、
`MAP_MODEL:`、`MAP_SOURCE:`、`MAP_CACHE:`、`MAP_COUNT:`，按这些前缀取地址
给用户。需要停服务时结束对应进程。

## 边界

禁止把图上邻近写成侵权、无效或 FTO 结论。未读专利的灰节点不得当成已通读。地图是
找案子的入口，不是结论。

## 产出

`patent_map`：页面地址、所选索引路径、取数来源、缓存位置，以及是否退回 IPC。
