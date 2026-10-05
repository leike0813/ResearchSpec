# Own Vendor Maintenance Audits

本目录保存用户自有上游项目的统一维护锚点。catalog 驱动，当前包含：

- `paper-humanizer`：`snapshot-84eb2ed`
- `revision-master`：`snapshot-13e69610`

## 工件生成

```bash
pnpm own-vendor-maintenance:artifacts
pnpm own-vendor-maintenance:records
pnpm own-vendor-maintenance:baseline
pnpm own-vendor-maintenance:check
```

详细流程见 `.agents/skills/own-vendor-maintenance/SKILL.md`。
