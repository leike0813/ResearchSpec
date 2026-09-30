# Education Agent Skills 增量预览审阅

候选 `snapshot-6bbbce4` 保持 136 项准入、29 项排除及三个既有教育域。完整 raw 预览 aggregate SHA-256：

`4d42fa3190d1e45f4bafce8c06a539d6e41bdc86d380b2cafb230eb6892ad633`

production policy SHA-256：`ecf28c3d3bd001384f91f6934c11b095e89313450c6ef1d9fc0934620a213e3f`。

机器工件为 [preview-manifest.json](artifacts/preview-manifest.json)、[incremental-preview.json](artifacts/incremental-preview.json)；完整预览审阅说明见 [preview-review.zh-CN.md](artifacts/preview-review.zh-CN.md)，两项程序语义判定见 [05-semantic-review.md](05-semantic-review.md)。

已确认：新 pin 干净；不可变审计与证据检查离线通过；134 个未变 raw 与 package 字节保真；136 个 profile、validator 和领域成员不变；预览 registry 合法；生产转换的未批准路径拒绝写入。原根许可证通知只补强 Gareth 自有内容来源，不扩大第三方或原创框架准入。

验证结果：`pnpm check`、`pnpm build`、`pnpm lint`、审计/证据 targeted tests（15/15）及 `UV_CACHE_DIR=/tmp/researchspec-uv-cache pnpm test`（438/438，零失败）通过。全量测试同时覆盖来源保真、待批生产转换拒绝写入、旧生产和旧不可变锚点保留，以及现有 graph/validator 行为。完整日志位于 `/tmp/researchspec-education-incremental-tests.log`；记录 hash 绑定见 `artifacts/verification.json`。

较早的并行 targeted graph 测试有三项 JSON 解析失败：另一测试命令清理并重建了共享 `.test-dist`，使运行中的 CLI 文件暂时不可读取。停止并行使用该输出目录后，全量测试全部通过，包括这三项；没有为此修改产品代码。

`review-decision.json` 状态为 `pending-human-review`，批准人、时间和 approved hash 均为空。生产仍在 `snapshot-32fce5c`。本目录没有 production `manifest.json`，没有将候选校验冒充为生产 baseline 验收。

用户批准此精确 aggregate 后，才执行生产转换、extension artifacts、records、baseline、check 与旧新锚点 diff，并再次验证批准树与生产字节一致。
