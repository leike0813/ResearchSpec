# Education Agent Skills 增量吸纳预览

来源已 pin 到 `6bbbce418f82e11044009c9f3b7373a354de5bd0`。新不可变审计覆盖 241 个 tracked files 与 165 个 Skill；准入保持 136 项，排除保持 29 项。

`skill-audit.json` SHA-256：`57b93c4668e6ca29fcb191e35cdea56e85ab0a7888b78256c6e64096422c6406`。

`evidence-map.json` SHA-256：`5d970cbb765a08f33444f6c9fcabcf4095e469e3fe1dc05730843fd2e7506fd2`。

两个变更 Skill 的 10 条证据声明重绑源哈希，其中 `evidence-0768` 改引用文字但保持 `work-0317`。其余 862 条声明、719 个作品的全部存在性结论和 Scholar 发现记录继承原值，`claim_support_reviewed` 均为 false。九条 advisory relationship 只重绑源哈希，其目标与权限不变。

完整 136 项 raw 预览的逐文件、逐树哈希和证据适配清单见 [preview-manifest.json](artifacts/preview-manifest.json)，逐项绑定继承见 [incremental-binding.json](incremental-binding.json)。136 项预览均为 `SKILL.md`、完整 `LICENSE`、`NOTICE.md` 三文件树，无额外知识或执行资源。

408 个预览文件中只有以下四个变化：

- `education-agent-skills-unassisted-evidence-checkpoint/{SKILL.md,NOTICE.md}`。
- `education-agent-skills-weekly-agency-review/{SKILL.md,NOTICE.md}`。

未变 134 项沿用其此前受审来源 release/revision，逐字节一致。两个变更 raw 树可在 `artifacts/changed-raw-skills/` 审阅；完整 136 项预览位于项目 `.tmp/education-agent-skills-preview/vendors/education-agent-skills/`。

本记录描述待批预览，未写入生产 vendor bundle、生成树或 registry。
