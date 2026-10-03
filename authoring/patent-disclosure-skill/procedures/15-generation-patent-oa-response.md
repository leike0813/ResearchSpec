# 审查答复草稿 (Office-action response)

## 何时

须显式触发。用户给出审查意见通知书，要问答或出草稿。

## 输入

- `office_action`（必需，handoff 或 node_output）：审查意见通知书。
- `application_bundle`（必需，handoff 或 node_output）：本申请四件套。
- `comparison_materials`（可选，handoff 或 node_output）：通知书里列出的对比文件。

## 步骤

1. 默认产出是内部草稿，不替代代理签字与正式递交；意见陈述 Word 只在人确认采纳后出。
   案例记录与工具细则见 `knowledge/pd-kp-13-oa-response.md`。
2. 读通知书与本申请文件。通知书是 PDF 时先转文本：

```bash
python tools/pdf_text.py --input <通知书.pdf> --output <通知书.md>
```

3. 检索黄金案例。`--project-root` 与 `--cases-dir` 两项必填，工具不猜位置：

```bash
python tools/oa_history.py search --project-root . --cases-dir cases \
  --query-text "<本案要点>" --patent-type invention --defect novelty --top-k 5
```

   查询三选一：`--query-text` / `--query-file` / `--query-vector`。`--query-vector` 接收
   本阶段 Agent 自己配置的工具产出的查询向量文件——本包不生成向量，也不带模型。
   `--statute`、`--tag`、`--patent-type`、`--defect` 是可选过滤。
4. 多策略相对打分。同一点数下给多个应对策略打分，看哪个更贴合、哪个更保范围：

```bash
python tools/oa_history.py score --project-root . --cases-dir cases --input cases/assessment.json
```

   分差与保范围门槛都满足才选定一个策略出稿。换策略另存新时间戳稿，保留旧稿。
5. 库需要扩充时，先由**你**把脱敏后的摘录写进 `cases/draft.json`，再入库。工具不做
   自动脱敏，也不读凭据：

```bash
python tools/oa_history.py ingest --project-root . --cases-dir cases --input cases/draft.json
```

   每条案例的字段就是 `schema_version`、`case_id`、`title`、`patent_type`、
   `statutes`、`defects`、`tags`、`domain`、`strategies`、`outcome`、
   `source_paths`、`body`、`redacted`，外加 `gold`。**不要发明别的字段**——
   多出来的键会让入库失败。

   `redacted` 必须是 `true`；脱敏是你入库前做好的，工具不替你脱敏。
   `outcome` 取 `granted` / `rejected` / `pending` / `withdrawn` / `unknown` /
   `amended_then_granted`。

   `gold` 由**人**在确认真实历史结果之后置为 `true`：已脱敏、且确实拿到了这个案子
   的实际结果。工具永远不会自己标 gold，分高也不等于 gold。没确认过的一律留
   `false`，只作参考材料，不进打分依据。
6. 新颖性 / 创造性且通知书列了对比文件时，用本包对照副本收三件套，把驳回映射导出到
   同一会话目录：

```bash
python tools/write_intake.py --dir outputs/patent-oa/<案件> --alloc
python tools/write_intake.py --into <会话目录> --json <临时json>
python tools/emit_chart.py --json <会话目录>/_payload.json --into <会话目录>
```

   表留在 xlsx，不写入陈述正文。
7. **人确认采纳后**才出意见陈述 Word：

```bash
python tools/emit_opinion_docx.py --input <草稿.md> --output <意见陈述.docx>
```

8. 写 `oa_response`（`kind: response` 索引）：草稿路径、场景、采纳状态、命中案例 id 与
   相对分口径；有对比文件时另列驳回映射 xlsx。

## 硬约束

- 默认产出是内部草稿，不替代代理签字与正式递交。
- 修改超原申请记载范围必须标注风险。
- 无检索命中或库为空就说明，不长篇糊弄意见陈述。
- 不把相对分写成授权率或授权概率。
- 不把未脱敏材料（客户名、电话、未公开核心参数原文）写进 `cases/draft.json`。
- 库薄（历史案 < 3）时在对话末块提示「案例入库」，至多 2 句，不写进草稿正文。

## 失败路径

- 库为空或未检索到命中：说明库为空，只给可核对的部分。
- 工具不可用：照实说明哪一步没做，不假装有检索依据。
- 通知书法条或对比文件缺失：标 `not_checked` 并说明。

## 完成

输出 `oa_response`（`oa-response.v1`，`kind: response`）的实际文件路径；有对比文件时另列驳回映射 xlsx。未确认采纳就不出意见陈述 docx。
