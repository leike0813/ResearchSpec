# 专利地图 (Patent map)

## 何时

须显式触发。已有解读笔记，需要把其中选定的部分摊成可交互的本地地图。

## 输入

- `patent_notes`（必需，handoff 或 node_output，`kind: notes`）：已解读入库的笔记索引。

## 步骤

1. 地图只读本轮显式选定的 `notes` 索引，不做全局库发现。地形与缓存细则见
   `knowledge/pd-kp-12-patent-map-terrain.md`。
2. 从 `patent_notes` 里挑出本轮要上图的那些笔记，汇总成一份冻结的 `notes` 索引，
   显式给出 `--project-root`。**地图只读这份索引**：

```bash
python tools/patent_files.py create --project-root <root> --kind notes \
  --out <out>/map-notes.index.json --file note=<root>/<解读笔记.md>
python tools/serve_map.py --index <out>/map-notes.index.json --project-root <root> --skip-embed
```

   不做全局库发现，不从环境变量或目录通配里额外捞材料。要加材料就改这份索引，
   重跑一次。
3. 语义坐标需要一个本地 ONNX 模型，由用户通过 `PATENT_MAP_MODEL_DIR` 配置。工具只
   读这个目录，不下载、不安装、不移动、不删除。
   - 未配置或文件不全 → 地形退回 IPC 小类，页面上会说明没有语义坐标。照实转达。
   - 确实需要语义坐标而本机没有 → 用本阶段 Agent 自己已配置的工具去算，或就按 IPC
     粒度交付并说明。
   - 加了 `--skip-embed` 就完全不碰模型，地形固定退回 IPC。
4. 工具只绑 `127.0.0.1:0` 随机端口。按机读前缀取地址给用户：
   `MAP_URL:`、`MAP_PORT:`、`MAP_CORPUS:`、`MAP_MODEL:`、`MAP_SOURCE:`、
   `MAP_CACHE:`、`MAP_COUNT:`。需要停服务时结束对应进程。
5. 写 `patent_map`（普通文件）：页面 URL、所用索引路径与 `--project-root`、取数来源、
   缓存位置、是否退回 IPC。

## 硬约束

- 只读。地图不写笔记、不改笔记、不入库，也不修改用户配置或模型文件。
- 缓存是派生数据，写在项目内 `.patent-map/`（或用户指定的 `PATENT_MAP_HOME`），丢了
  只是重新解析。
- 空白点只表示「这次选的文件里没读到」；禁止把图上邻近写成侵权、无效或 FTO 结论。
- 未读专利的灰节点不得当成已通读。

## 失败路径

- 索引无效（`kind` 不是 `notes`、路径越界、文件缺失）：工具会报错退出，照实转达，
  不改索引去迁就。
- 笔记为空：页面仍可启动但没有数据，提醒先入库；不改为随手读一篇专利。
- 笔记数量或单文件大小超限被截断：说明截断了多少。

## 完成

输出 `patent_map`（`patent-map.v1`）的实际文件路径，含页面 URL、所用索引、`--project-root`、缓存位置与 IPC 退回情况。
