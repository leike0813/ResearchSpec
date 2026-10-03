<!--
工件类型: knowledge-pack
能力/包 ID: PD-KP-11 patent-reading
提取方式: curated — ResearchSpec 编写，非上游逐字节
来源对照（source mapping）:
    - vendor/patent-disclosure-skill/skills/patent-reader/SKILL.md
    - vendor/patent-disclosure-skill/skills/patent-reader/prompts/patent_plain_reader.md
    - vendor/patent-disclosure-skill/skills/patent-reader/prompts/type_hooks.md
    - vendor/patent-disclosure-skill/skills/patent-reader/prompts/patent_reader_self_check.md
说明: 保留特征行与笔记纪律；去掉“入库后自动进地图”的调度语句。
-->

# 专利通俗解读 (Patent plain reading)

把公开号 / PDF / 全文读成通俗笔记与图谱，产出稳定特征行与可机读段落，供对照表与
研究桥接使用。

## 类型判定

取证后按序判定：用户显式声明 → 公开号文献种类码（A/B 发明，U/Y 实用新型，S 外观
设计）→ 扉页关键词。判为实用新型或外观设计后填对应 schema（structure_schema 或
appearance_schema）。

## 特征行

- 独权拆 F1…，每条含原文短语与段号；默认兼拆从属权。
- 权利要求树由 Agent 校对（父号 / 独立权正确，含「权 1 或 2」类多引用）。
- 第四节 / 第六节表与 Canvas 用同一套编号；Fk 不画进 Canvas。

## 笔记纪律

- 正文无实现痕迹：不出现 `*.py`、上下文锚点、附图中间文件名或 schema 脚注。
- 第九节无 URL；推测只写在 warning 内并标「推测」。
- 附图闸门：`insert` 图已嵌入，`placeholder` 仅 callout。
- 术语为 file 节点或已建 stub。

## 投影到库需要人点头

默认不写库，笔记落到工作区普通目录。用户明确要求投影时，先问清三件事：写哪个库
（具体 vault 根路径）、写什么范围（哪几篇笔记）、冲突时覆盖还是并存。问齐了才写，
并把库路径记进 `patent_notes` 的 `metadata.vault`。没问齐就留在普通目录，并说明
为什么没入库。

写入命令（确认为准）：

```bash
python tools/vault/write_patent_obsidian_note.py --vault <库根> --content-file <笔记.md> \
  --manifest <manifest.json> --output <status.json>
python tools/vault/build_patent_canvas.py --vault <库根> --note-rel <笔记相对路径> \
  --manifest <manifest.json> -o <canvas 文件>
python tools/vault/link_patent_notes.py --vault <库根> --dry-run -o <链接结果>
```

## 产出

`patent_notes` 索引与 `claim_features`（含 description_paragraphs、source_url）。
