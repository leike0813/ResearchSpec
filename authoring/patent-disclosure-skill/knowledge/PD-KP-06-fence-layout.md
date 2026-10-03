<!--
工件类型: knowledge-pack
能力/包 ID: PD-KP-06 fence-layout
提取方式: curated — ResearchSpec 编写，非上游逐字节
来源对照（source mapping）:
    - vendor/patent-disclosure-skill/skills/patent-disclosure/prompts/fence/guardrails.md
    - vendor/patent-disclosure-skill/skills/patent-disclosure/prompts/fence/decompose.md
    - vendor/patent-disclosure-skill/skills/patent-disclosure/prompts/fence/design_around.md
    - vendor/patent-disclosure-skill/skills/patent-disclosure/prompts/fence/matrix.md
    - vendor/patent-disclosure-skill/skills/patent-disclosure/prompts/fence/plan.md
    - vendor/patent-disclosure-skill/skills/patent-disclosure/prompts/fence/score.md
说明: 只保留保护型 1+N 的分步口径；分件成文与立项确认留给人类决定。
-->

# 保护型 1+N 专利布局 (Protective 1+N layout)

只在首篇交底定稿后作为旁路；用户点名可强开，但仍须跑完分解 → 突围 → 矩阵 → 立项
说明。只做保护型（护自己的核心：1 件核心 + N 件外围），不做制衡型、地毯式或全球
组合；本趟只出中国交底。

## 阶段

| 阶段 | 产物 |
|------|------|
| 分解 decompose | `outputs/{案件}/fence/decompose.yaml` |
| 突围 design_around | 全面覆盖 / 等同列表路径 |
| 矩阵 matrix | 手段 × 功效矩阵（未检索标 unchecked，不得标空白 / 蓝海） |
| 立项 plan | `family.yaml` + `专利布局.md` |
| 弱校验 score | 回写「立项校验」章节 |

## 立项约束

- 核心 1 件（默认，最多 2），沿用首篇类型；`slim_note` 写清从首篇拿掉什么。
- 外围三类互不吞并：`scenario`（场景 / 工况 / 产品形态）、`improve`（可单独实施的
  改进）、`chain`（上下游）。
- 外围若只是核心独权的下位，写进核心 `dependents_hint`，不单独立项。
- `family.yaml` 供校验与分件；`专利布局.md` 由模型直接写成给人看的说明稿，禁止用
  脚本从 yaml 生成 md，禁止 Mermaid 或程序画图。
- 矩阵 `dense` 或 `material_ok: false` 的节点可列出但 `write_this_round: false`。
- 这一轮要写：核心 1 + 外围 ≤ 3；禁止核心成稿 > 2 或外围成稿 > 3。

## 立项校验

弱校验（≥ 1 外围、材料够）。把作答表与分件门槛回写说明稿「立项校验」章节。过门槛
则推荐分件，未过则不推荐；这不是高价值达标认定，也不是国知局统计结论。

## 确认

未确认立项说明不得分件写多篇，也不得自动跑申请四件套或案卷。分件后每件自己查新，
外围不复述核心独权。

## 产出

`protection_plan` 索引：`family.yaml`、`专利布局.md`、矩阵与校验结论路径。
