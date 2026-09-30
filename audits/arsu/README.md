# ARSU Maintenance Audits

本目录保存上游 ARS 项目维护路径的锚点审计记录。每个锚点目录对应一次可验证的
`分析 -> 吸纳 -> 转换 -> 审阅 -> 审计` 闭环。

当前维护目标：`v3.22.2-7de1c9d`。历史首锚点：`v3.19.0-828ef3b`。

## 工件生成

```bash
pnpm arsu-maintenance:artifacts
node scripts/arsu-maintenance.mjs records <anchor>
node scripts/arsu-maintenance.mjs baseline <anchor>
node scripts/arsu-maintenance.mjs check <anchor>
```

`pnpm arsu-maintenance:artifacts` 会统一重新生成：

- `artifacts/generated/capability-parity-report.json`
- `audits/arsu/<anchor>/artifacts/arsu-mode-capability-review.html`
- `audits/arsu/<anchor>/artifacts/arsu-mode-graph-match-assessment.html`
- `audits/arsu/<anchor>/artifacts/arsu-mode-gap-semantic-review.html`

## 增量维护

```bash
node scripts/arsu-maintenance.mjs diff <old-anchor> <new-anchor>
```

详细流程见 `.agents/skills/arsu-maintenance/SKILL.md`。
