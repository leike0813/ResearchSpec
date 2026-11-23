# 著录检索 (Bibliographic search)

## 何时

要按著录字段查公布公告，或从单图 / 权要生成检索式。`search_request` 已给出检索输入。

## 输入

- `search_request`（必需，handoff 或 node_output）。

## 步骤

1. 从 `search_request` 取至少一项著录字段作为检索输入；单图检索必须先确定专利类型，
   不能用 `all`。记录格式与词表细则见 `knowledge/pd-kp-16-patent-search-records.md`。
2. 从请求确认渠道。默认使用中国公布站，用户点名海外或指定局别并授权查询时使用 Google Patents。
   未点名局别的海外查询覆盖 US、EP、WO、JP、KR。保留原始查询意图，按目标局别选用同义词和过滤条件。
3. 国内检索使用下列命令。海外检索用本页的「海外检索」命令。用户同时指定两类范围时，
   分别执行并在结果中区分来源。

```bash
python tools/cnipa_search.py --inventor "<姓名>" --applicant "<单位>"
python tools/cnipa_search.py --title "<名称>" --abstract "<摘要词 and 词>" --class <分类号> --max-pages 2
python tools/cnipa_search.py --abstract "<词 and 词>" --type design --derived-from image --type-inferred
```

4. 公布站翻页按「默认少翻页、完整性有门禁」处理。结果里出现 `EPUB_SEARCH_INCOMPLETE:` 就报告不完整。
5. 对照表派工或用户点名「按特征精排」时，可另出国内检索的覆盖旁路，保留主列表报告：

```bash
python tools/emit_search_report.py --json <检索结果.json> --output-dir <out>
python tools/emit_covers_report.py --beside <检索结果.json> --output-dir <out>
```

6. 写 `search_results`：一个普通 JSON 结果文件加一份 Markdown 列表，列出实际路径、命中条数与完整性说明。它不是规范文件索引，不要套用 `kind`。

## 海外检索

用 `tools/gp_search.py` 提交一次查询，记录局别、条件、来源、返回条数和页码。分页由用户明确请求。
仅把成功查询的空结果记为零命中。限流结束本轮，服务不可用或响应无法解析则记录查询状态与已取得的
材料。命中片段只能用于筛选，技术比对需要由解读 Procedure 取得原文。

```bash
python tools/gp_search.py --project-root <项目根> -q "<关键词>" \
  --country US,EP,WO,JP,KR --note "<原始检索意图>"
```

## 硬约束

- 检索结果不冒充交底查新，也不冒充新颖性结论。
- 单图或权要派生的常规国内检索使用公布站布尔式。海外渠道按用户确认的查找范围使用。
- 解析以 `EPUB_SEARCH_MD:` / `EPUB_SEARCH_JSON:` 等机读前缀为准，终端红字或编码乱码不当作失败。
- 不得编造公开号、链接或条数。

## 失败路径

- 网络或站点不可用：报告 `EPUB_SEARCH_INCOMPLETE:` 与已得条目，不假装完整。
- 检索式返回零条：说明用的什么词、返回零条，不要换成宽泛词直到有结果。

## 完成

输出 `search_results`（`search-results.v1`）的实际文件路径，含列表 md / json 路径、命中条数与完整性说明。
