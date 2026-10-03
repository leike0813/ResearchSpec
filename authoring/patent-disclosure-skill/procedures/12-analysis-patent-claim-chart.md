# 权利要求对照表 (Claim chart)

## 何时

须显式触发。已有一侧的 `claim_features`，要把独权（默认兼从权）拆成技术特征，逐格
比对对照对象并附证据强弱。

## 输入

- `claim_features`（必需，handoff 或 node_output）：本方专利的特征行。
- `comparison_materials`（必需，handoff 或 node_output）：对照对象的材料清单。

## 对照材料要什么

`comparison_materials` 必须覆盖对照对象的**特征行与说明书段落**：

| 需要 | 从哪来 |
|------|--------|
| 对照方 `claim_features` | 对照专利的特征行，含 F 编号、原文短语、段号 |
| 对照方 `description_paragraphs` | 对照说明书的段落切分，供「对应 / 差别 / 依据」定位 |
| 对照原文或产品材料 | 链接、文件或截图 |

缺前两项时，按 `analysis-patent-reading` 的口径做一次**有界的语义补齐**：只产出
这两份机读文件，不写解读笔记、不入库。

**不要声称图里的 reading 节点已经跑过。**补齐是本阶段自己做的有界执行，就写
「本轮按解读口径补齐了对照方特征行与段落切分」，并把它记进 `limitations`。上游节点
跑没跑，只能由上游的记录说明。

## 步骤

1. 填格四列：特征 / 对应内容 / 差别 / 依据，跨列同色。标「强」的格必须带链接或段号，
   否则标「须人审」。口径细则见 `knowledge/pd-kp-10-claim-chart-rules.md`。
2. 建本轮会话目录，三件套（场景、左列、右列）不齐只提问，不开填：

```bash
python tools/write_intake.py --dir outputs/patent-chart/<案件> --alloc
python tools/write_intake.py --into <会话目录> --json <临时json>
python tools/write_intake.py --into <会话目录> --check
```

3. 收齐并见 `INTAKE_OK:1` 之后才解读、检索、填格。
4. 用户允许补 D 且会话里还有空格时，才用检索覆盖旁路补对照；已指定全部对照对象就不再检索。
5. 填格：四列（特征 / 对应内容 / 差别 / 依据），跨列同色，每格写书面对应说明
   （对应 / 差别 / 依据），标「强」的格必须带链接或段号。
6. 出表：

```bash
python tools/emit_chart.py --json <会话目录>/_payload.json --into <会话目录>
```

7. 写 `claim_chart` 与 `chart_evidence`（普通文件，xlsx 路径与逐格出处），对话里只给
   xlsx 路径。

## 硬约束

- 不输出无效、侵权、自由实施（FTO）、可专利性等法律结论。对照表是内部底稿，需人工复核。
- 术语不对齐不标强；无摘录不标强；FTO / 侵权这类格子标「须人审」。
- 一次对照用一个会话目录，不覆盖上一次的结果。
- 不同次对照用不同会话目录。

## 失败路径

- 产品只有名称、无链接也无文件：停在这一问，点名缺什么，不派解读、不检索、不填格。
- 对照方特征行补不齐：如实说明补到哪一步，标 `not_checked`，不把空格填成「对应」。

## 完成

输出 `claim_chart`（`claim-chart.v1`）与 `chart_evidence`（`chart-evidence.v1`）的实际文件路径，含 `intake.json` 路径与本轮补齐说明。
