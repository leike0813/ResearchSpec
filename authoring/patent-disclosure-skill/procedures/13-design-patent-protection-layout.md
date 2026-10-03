# 保护型 1+N 专利布局 (Protection layout)

## 何时

首篇交底已定稿，并且布局决策选择了「包含布局」。

## 布局先确认，再逐案出件

布局是**在分件之前**的一道设计决定，不是顺手补的一份文档。顺序是：

1. 本阶段只产出一份布局方案（`protection_plan`）——分解、突围、功效矩阵、立项清单。
2. 方案要经**人工确认**。这个确认是独立的 Gate，由人在 Navigate 或 CLI 里做。
3. 只有确认之后，才按方案分件，逐案回到 `generation-patent-disclosure` 与
   `generation-patent-application` 出交底与申请。

本阶段不分件、不写多篇交底、不出申请。确认之前不动第一篇之外的任何东西。

如果布局决策选择「不包含布局」，本阶段不执行，流程直接进入逐案成文。

## 输入

- `disclosure_bundle`（必需，handoff 或 node_output）：已定稿的首篇交底。

## 步骤

1. 只做保护型、只出中国交底；矩阵每格标检索状态（`checked` / `unchecked`），
   `unchecked` 就写 `unchecked`。分解与评分细则见 `knowledge/pd-kp-06-fence-layout.md`。
2. 技术分解：把首篇拆成可分别主张的技术单元，标出各单元的独立贡献与相互依赖。
3. 突围路径：逐单元定全面覆盖或等同列表。
4. 技术功效矩阵（手段 × 功效），写清每个格子的检索状态：
   - `checked`：本轮检索过，有公开号；
   - `unchecked`：本轮没检索。

   `unchecked` 就写 `unchecked`，不标空白、蓝海。
5. 立项：核心 1 件（最多 2）+ 外围不超过 3。三类分别是 `scenario`、`improve`、
   `chain`，三类之间互不吞并——外围件不复述核心独权。
6. 写两份产出：
   - `family.yaml`：供校验与分件用的结构化族树；
   - `专利布局.md`：给人看的说明稿，章节骨架固定（分解 / 突围 / 矩阵 / 立项 /
     立项校验）。
7. 跑弱校验并把结论回写进说明稿的「立项校验」章节：

```bash
python tools/fence/check_layout.py --decompose <产出目录>/fence/decompose.yaml
python tools/fence/check_layout.py --around <产出目录>/fence/design_around.yaml
python tools/fence/check_layout.py --matrix <产出目录>/fence/matrix.yaml
python tools/fence/check_layout.py --family <产出目录>/fence/family.yaml
python tools/fence/check_scorecard.py --table
python tools/fence/check_scorecard.py --answers <产出目录>/fence/scorecard.yaml --case-dir <产出目录>
```

8. 写 `protection_plan`（普通文件）：family.yaml、专利布局.md、矩阵与校验结论的实际路径，
   并明确写出「待人工确认，确认后才分件」。

## 硬约束

- 只做保护型，只出中国交底；不做制衡型、地毯式、全球组合。
- 矩阵未检索就标 `unchecked`，不得标空白 / 蓝海。`dense` 或 `material_ok=false` 的格子
  不列入本轮。
- 不编造营收、同族、金奖、质押、估值。这不是资产评估，也不是国知局高价值达标。
- 外围件不复述核心独权；三类立项互不吞并。
- 不自动跑申请四件套或案卷，也不自行确认布局。

## 失败路径

- 未过立项门槛：建议只留首篇，不强行开写布局。
- 校验报出冲突：改 `family.yaml` 或矩阵后重跑，不掩盖。

## 完成

输出 `protection_plan`（`protection-plan.v1`）的实际文件路径，含 family.yaml、专利布局.md、矩阵与校验结论，并停在「待人工确认」这一步。
