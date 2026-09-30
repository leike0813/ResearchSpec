# Education Agent Skills 增量转换预览

转换器从新版不可变审计派生 pin 身份，并用已绑定旧审计确定未变 Skill 的受审来源；扩展生成器从 vendor bundle 取得 release/revision 与 anchor，不再缓存旧版本。扩展生成只在字节变化时写文件。

隔离目录生成的 extension registry 通过现有 `loadPluginExtensionRegistry` 校验。136 个 raw 预览均恢复为上游完整正文，136 个 extension 预览均保留其 raw 程序正文。扩展差异只有：

| capability | 变化文件 |
|---|---|
| `plugin-education-agent-skills-unassisted-evidence-checkpoint` | `SKILL.md`、`manifest.yaml` |
| `plugin-education-agent-skills-weekly-agency-review` | `SKILL.md`、`manifest.yaml` |

全部 136 个 profile 和 validator 未变；其余 134 个 package 逐字节一致。全部仍为 `llm`，`knowledge_refs: []`，validator 要求 `scope`、`source_ledger`、`method_plan`、`work_products`、`validation_results`、`conclusions` 六字段。三个领域仍为 54 / 9 / 73 项。

重复生成确认相同文件的内容及修改时间均保持。逐文件 SHA-256 和机器验证结果见 [incremental-preview.json](artifacts/incremental-preview.json)；两个变更包位于 `artifacts/changed-extensions/`。

本次没有写入生产 extension registry、package 或 profile。未获用户精确树批准时，转换和幂等检查均拒绝发布；完整验证结果由 [04-review.md](04-review.md) 记录。生产 baseline/check 将在批准后执行。
