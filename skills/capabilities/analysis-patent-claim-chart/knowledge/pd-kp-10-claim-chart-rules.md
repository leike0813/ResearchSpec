<!--
工件类型: knowledge-pack
能力/包 ID: PD-KP-10 claim-chart-rules
提取方式: curated — ResearchSpec 编写，非上游逐字节
来源对照（source mapping）:
    - vendor/patent-disclosure-skill/skills/patent-chart/SKILL.md
    - vendor/patent-disclosure-skill/skills/patent-chart/prompts/guardrails.md
    - vendor/patent-disclosure-skill/skills/patent-chart/prompts/intake.md
    - vendor/patent-disclosure-skill/skills/patent-chart/prompts/fill_chart.md
说明: 保留三件套、强度、跨列同色与场景页；去掉“派工即自动进入解读 / 检索包”的调度。
-->

# 权利要求对照表规则 (Claim chart rules)

## 三件套

- `scene`：`invalidity` / `fto` / `infringement` / `sep` / `patentability` /
  `oa`。用户未说清就问，不默认成 FTO 或侵权。
- 左列：已公开给专利号；未公开给方案文件或权要原文（交底 5.1 可用）。
- 右列：至少一份对照；无效 / 可专利性给专利号，FTO / 侵权给产品名称 + 链接或说明书
  / 截图，SEP 给标准号或标准文件。

FTO / 侵权不能靠补搜代替产品名称与链接；可专利性 / 无效且用户明说补搜时才
`search_fill: true`。三件套不齐只提问，收齐后再解读、检索、填格、写 `intake.json`。

## 强度

| 值 | 何时 | 显示 |
|----|------|------|
| 强 | 原文几乎覆盖该限定，且有链接或段号 | 很强 |
| 中 | 手段对应但术语或限定不完全对齐 | 中等 |
| 弱 | 仅可能同义或片段相关 | 偏弱 |
| 无 | 未见，单元格留空 | 未见 |

术语不对齐不得标强；无摘录不得标强。全部强时警告过拟合，不删表。FTO / 侵权的强行
仍标「须人审」。

## 跨列同色

同一概念共用一个 id（H1、H2…），权要与对照的字面可以不同、颜色相同。对应说明分三
块：对应（哪一限定对应哪一句）、差别（术语不同 / 更宽更窄 / 未记载）、依据（段号或
文件名）。禁止写「应当无效 / 构成侵权 / 不具备新颖性」。

## 场景页

无效加路径备忘、FTO 加风险清单、侵权加证据缺口、审查答复加驳回映射（不写入意见
陈述正文）；SEP / 可专利性只用四页矩阵。

## 产出

会话目录 `intake.json`（输入归档）+ `对照表-{场景}-{时间戳}.xlsx`（主交付）+
`chart.json`（机读底稿），另出 `chart_evidence` 索引。
