# 专利通俗解读 (Patent plain reading)

## 何时

用户给出公开号、专利 PDF 或全文并想读懂；或对照阶段需要 `claim_features`。

## 输入

- `patent_corpus`（必需，handoff 或 node_output，`kind: corpus`）：公开号、专利 PDF 或粘贴的权要 / 说明书集合。

## 步骤

1. 判文献类型：用户声明优先，其次公开号文献种类码，最后扉页关键词。笔记结构与线索
   细则见 `knowledge/pd-kp-11-patent-reading.md`。
2. 判定文献类型：用户声明优先，其次公开号文献种类码，最后扉页关键词。判定结果写进笔记前言。
3. 取全文。外观设计（CN…S）走视图抓取，其余走 PDF：

```bash
python tools/extract/fetch_patent_pdf.py --pub <公开号> -o <工作区相对目录>
python tools/extract/fetch_design_views.py --pub <公开号> --outdir <工作区相对目录>
python tools/extract/extract_patent_text.py --input <来源.pdf> --output <全文.md> --pub-number <公开号>
python tools/extract/extract_patent_figures.py --input <来源.pdf> --output <图目录>
```

   抓取链路失败就停下请人给 PDF，并记 `fetch_failed`；不要用检索摘要冒充全文。
4. 拆权利要求：把独权拆成特征行 F1…，每行带原文短语与段号。默认兼拆从属权，形成权利要求树：

```bash
python tools/analyze/validate_claim_tree.py --input <claim_tree.json> --require-review
python tools/analyze/validate_claim_features.py --input <claim_features.json>
```

   校验器只查结构，权利要求树的语义归属由你校对。
5. 写通俗笔记：讲清这本专利解决什么问题、怎么做、和最接近的现有做法差在哪。笔记里不得出现实现痕迹、仓库路径或工具名；第九节不放 URL；推测只写在 warning 并标注。
6. 公开线索与图文一致性检查（可用时）：

```bash
python tools/analyze/validate_public_clues.py --input <public_clues.json>
python tools/analyze/lint_patent_note.py --note <笔记.md> --claim-features <claim_features.json> --output <lint.json>
python tools/analyze/build_claim_mermaid.py --claim-tree <claim_tree.json> --output <权项树.md> --pub-number <公开号>
```

7. 写两个输出：
   - `claim_features`：普通 JSON 文件，含 `features[]`（F 编号、原文短语、段号）、`claim_tree`、`description_paragraphs`、`source_url`。
   - `patent_notes`：`kind: notes` 索引，登记每篇笔记的实际路径。

```bash
python tools/patent_files.py create --project-root <root> --kind notes \
  --out <out>/notes.index.json --file note=<root>/<解读笔记.md> --limitation "<证据限制>"
```

## 要不要投到 Obsidian 库

**库路径不等于同意。**环境变量里配了 vault 目录，或者本机装了 Obsidian，都不构成
「可以往里写」的授权。

默认**不写库**：笔记与特征行落到工作区普通目录下，本阶段到此为止。

用户明确要求投影到库时，先把三件事问清楚、拿到明确答复再写：

1. 写哪个库——具体 vault 根路径，落到 `patent_notes` 索引的 `metadata.vault`；
2. 写什么范围——只写本轮这几篇笔记，还是整个目录；
3. 覆盖还是并存——库里已有同名笔记时默认并存，不覆盖。

三件事没确认齐就不写，把笔记留在普通目录并说明为什么没入库。写入范围之外的任何文件
都不动。库未就绪时降级到普通输出目录继续写，不停下。

确认之后才写，用本包工具：

```bash
python tools/vault/write_patent_obsidian_note.py --vault <库根> --content-file <笔记.md> \
  --manifest <manifest.json> --output <status.json>
python tools/vault/build_patent_canvas.py --vault <库根> --note-rel <笔记相对路径> \
  --manifest <manifest.json> -o <canvas 文件>
python tools/vault/link_patent_notes.py --vault <库根> --dry-run -o <链接结果>
```

先 `--dry-run` 看链接结果，确认无误再落盘。

## 硬约束

- 只有本包 Tools 能取全文与写笔记。对照派工场景只产出两份机读文件（特征行与权项树），不写笔记、不入库。
- 特征行必须带原文短语与段号；无出处的特征不写。
- 摘要级判断不得写成已通读全文；每条证据标证据等级。

## 失败路径

- PDF 抓取失败：请用户给 PDF，或记 `fetch_failed` 后继续处理可得材料。
- 校验器报结构错：修结构后重跑；修不动就标 `not_checked` 并说明。
- 单文件过大或数量超限：如实说明被截断的范围。

## 完成

输出 `patent_notes`（`patent-notes.v1`，`kind: notes`）与 `claim_features`（`claim-features.v1`）的实际文件路径，附文献类型、证据等级与已知限制。
