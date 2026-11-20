# ARSU Maintenance Audits

本目录保存上游 ARS 项目维护路径的锚点审计记录。每个锚点目录对应一次可验证的
`分析 -> 吸纳 -> 转换 -> 审阅 -> 审计` 闭环。

当前维护目标：`v3.24.4-23807f9`（上游提交 `23807f987024f2e038d12fd9e4e5d2a7cc228674`）。新增 `sr-screener` 的 8 个 mode；维护源码会纳入 `screening-*` extraction 与 capability。

## 工件生成

```bash
pnpm arsu-maintenance:artifacts
node scripts/arsu-maintenance.mjs records <anchor>
node scripts/arsu-maintenance.mjs baseline <anchor>
node scripts/arsu-maintenance.mjs check <anchor>
```

`pnpm arsu-maintenance:artifacts` 仅按需重新生成审阅工件：

- `artifacts/generated/capability-parity-report.json`
- `audits/arsu/<anchor>/artifacts/arsu-mode-capability-review.html`
- `audits/arsu/<anchor>/artifacts/arsu-mode-graph-match-assessment.html`
- `audits/arsu/<anchor>/artifacts/arsu-mode-gap-semantic-review.html`

## 增量维护

```bash
node scripts/arsu-maintenance.mjs diff <old-anchor> <new-anchor>
```

详细流程见 `.agents/skills/arsu-maintenance/SKILL.md`。
