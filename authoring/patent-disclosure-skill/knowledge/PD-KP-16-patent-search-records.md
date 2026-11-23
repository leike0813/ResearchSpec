<!--
工件类型: knowledge-pack
能力/包 ID: PD-KP-16 patent-search-records
提取方式: curated — ResearchSpec 编写，非上游逐字节
来源对照（source mapping）:
    - vendor/patent-disclosure-skill/skills/patent-search/SKILL.md
    - vendor/patent-disclosure-skill/skills/patent-search/prompts/patent_search.md
    - vendor/patent-disclosure-skill/skills/patent-search/prompts/derived_query.md
    - vendor/patent-disclosure-skill/skills/patent-search/prompts/covers_rank.md
    - vendor/patent-disclosure-skill/skills/patent-search/prompts/global_search.md
说明: 保留著录检索输入与精排旁路；去掉结果冒充查新的用法。
-->

# 著录检索 (Bibliographic search)

公布站高级查询（发明人 / 申请人 / 分类号 / 名称 / 摘要等）。个人公开清单只是用法之
一；单图或权要可先抽关键字再查。

## 输入

至少一项：发明人、申请人、分类号、名称、摘要 / 简要说明、申请号或公开号。单图必须
`--type design|utility_model|invention`，不能 `all`；用户没说类型时看图推断并加
`--type-inferred`。权要按文本选类型，可用 `all`。

## 派工

对照表派工或用户点名「按特征精排」时才走覆盖旁路，原列表报告格式不动，另写
`.covers.md` 与 `.covers.json`。

## 护栏

- 结果不得冒充交底查新。
- 国内查询用公布站。明确请求海外或指定海外局别时，由已授权的 Google Patents 渠道查询。
- 海外查询记录局别、过滤条件、来源和页码。只有可解析的空页才记录零命中，限流时停止本轮。
- 翻页按「默认少翻页 / 完整性门禁」执行。
- 机读前缀 `EPUB_SEARCH_MD:` / `EPUB_SEARCH_JSON:` / `EPUB_SEARCH_NOTE:` /
  `EPUB_SEARCH_INCOMPLETE:`，PowerShell 红字或乱码不当作失败。
- 本阶段不设「交付后请确认」。

## 产出

`search_results`：`SEARCH-YYYYMMDD-HHMMSS.md` 与对应 json；精排旁路另出 covers。
