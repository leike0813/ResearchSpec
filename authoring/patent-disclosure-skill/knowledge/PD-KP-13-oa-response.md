<!--
工件类型: knowledge-pack
能力/包 ID: PD-KP-13 oa-response
提取方式: curated — ResearchSpec 编写，非上游逐字节
来源对照（source mapping）:
    - vendor/patent-disclosure-skill/skills/patent-oa/SKILL.md
    - vendor/patent-disclosure-skill/skills/patent-oa/prompts/guardrails.md
    - vendor/patent-disclosure-skill/skills/patent-oa/prompts/respond_office_action.md
    - vendor/patent-disclosure-skill/skills/patent-oa/prompts/configure_embedding.md
    - vendor/patent-disclosure-skill/skills/patent-oa/prompts/soft_nudge.md
说明: 上游用 config.py 在 {Documents} 下写向量配置与密钥、用 search_cases.py 查向量库。
      ResearchSpec 两个脚本都不发布，也不带凭据与模型：黄金案例改由本包 stdlib 工具
      oa_history.py 显式按 --project-root / --cases-dir 管理，向量召回由目标 Agent
      自己配置的工具产出查询向量后喂进来。
-->

# 审查答复辅助 (Office action response)

须显式触发；主场景是问和答、出草稿。不替代专利代理签字与正式递交，默认产出为
内部草稿；意见陈述 Word 仅在人确认采纳后出具。

## 黄金案例库由本包工具管

`tools/oa_history.py` 只用 Python 标准库，不读凭据、不联网、不下载模型。`--project-root`
与 `--cases-dir` 两项在每个子命令上都必填，工具不猜位置、不做全局发现。

入库：

```bash
python tools/oa_history.py ingest --project-root . --cases-dir cases --input cases/draft.json
```

检索：

```bash
python tools/oa_history.py search --project-root . --cases-dir cases \
  --query-text "<要点>" --patent-type invention --defect novelty --top-k 5
```

`--query-text` / `--query-file` / `--query-vector` 三选一。`--query-vector` 接收目标
Agent 自己配置的工具产出的查询向量文件，工具本身不生成向量。`--statute`、`--tag`、
`--patent-type`、`--defect` 是可选过滤条件。

相对打分：

```bash
python tools/oa_history.py score --project-root . --cases-dir cases --input cases/assessment.json
```

对同一批要点给多个应对策略打分，结果是**相对**的：用于在同一批要点上比较不同策略
的贴合度，不是授权率、授权概率或任何法律结论。

## 案例记录长什么样

`draft.json` 里每条案例的字段是 `schema_version`、`case_id`、`title`、
`patent_type`、`statutes`、`defects`、`tags`、`domain`、`strategies`、
`outcome`、`source_paths`、`body`、`redacted`，外加 `gold`。不要发明别的字段：
多出来的键会让入库失败。

- `redacted` 必须是 `true`。工具**不做自动脱敏**，`--input` 按原样入库，脱敏在
  入库前由你或人做完。客户名、电话、未公开核心参数原文不要写进 `draft.json`。
- `outcome` 取 `granted` / `rejected` / `pending` / `withdrawn` / `unknown` /
  `amended_then_granted`。
- `gold` 由**人**在确认了这个案子的真实历史结果之后置 `true`。工具自己不标 gold，
  分高也不等于 gold。没确认过的一律 `false`，只作参考材料，不进打分依据。

输出是相对路径，锚在 `--project-root` 下。`ingest` / `search` / `score` 各有
机读前缀（`OA_HISTORY_INGEST:`、`OA_HISTORY_SEARCH:`、`OA_HISTORY_SCORE:`），
按前缀取结果。

## 答复

读通知书与本申请文件，检索黄金案例；同点多策略相对分，分差与保范围门槛都满足才选定
一个策略出稿。选定后换策略要另存新时间戳稿，保留旧稿。

新颖性 / 创造性且通知书列了对比文件时，用本包对照副本收三件套，把驳回映射导出到同一
会话目录；表留在 xlsx，不写入陈述正文。

库薄（历史案 < 3）时在对话末块提示「案例入库」，至多 2 句，不写进草稿正文。

## 禁止

- 无检索命中或未说明库为空，就长篇糊弄意见陈述。
- 修改超原申请记载范围却不标注风险。
- 无人审确认就把草稿当已递交文件，或未确认就出意见陈述 Word。
- 把密钥写进仓库或在回复里回显；把相对分写成授权率或授权概率。
- 把未脱敏材料写进 `draft.json`。

## 产出

`oa_response`（`kind: response` 索引）：草稿路径、场景、采纳状态、命中案例 id 与相对分
口径；有对比文件时另列驳回映射 xlsx。
