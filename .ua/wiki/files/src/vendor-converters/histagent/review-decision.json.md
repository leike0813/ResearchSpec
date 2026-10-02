
# src/vendor-converters/histagent/review-decision.json
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/histagent](../../../../modules/src/vendor-converters/histagent.md)
<!-- node: config:src/vendor-converters/histagent/review-decision.json -->

HistAgent 人工评审决定：记录 approved 状态与被批准的树集合哈希 c44f136b…dbd3，批准时间 2026-07-15，作为生产字节与准入的最终绑定点。
源码：[src/vendor-converters/histagent/review-decision.json](../../../../../../src/vendor-converters/histagent/review-decision.json)
<!-- node: resource:src/vendor-converters/histagent/review-decision.json:tree-set-approval -->

评审结论：review_status 为 approved，tree_set_sha256 与 approved_tree_set_sha256 一致（c44f136b…dbd3），注明用户在完整预览树审阅后批准。
源码：[src/vendor-converters/histagent/review-decision.json](../../../../../../src/vendor-converters/histagent/review-decision.json)

## 配置

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [converter.ts](converter.ts.md) | src/vendor-converters/histagent/converter.ts | HistAgent 转换主流程：在临时暂存区生成三个 Skill 树、vendor bundle 与转换清单，装配中央注册表，并提供生成物检查与幂等性校验。 |
| [policy.ts](policy.ts.md) | src/vendor-converters/histagent/policy.ts | HistAgent 生产策略：固定 release/revision/audit 哈希，声明 120 条源条目、31 个知识面、21 项能力映射与三个 Skill 契约的条目数量。 |

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [production-policy.json](production-policy.json.md) | src/vendor-converters/histagent/production-policy.json | HistAgent 生产策略 SSOT：在 snapshot-47bbe21 审计基线上，把 120 个源条目、31 个知识面、5 个内容来源、4 条许可声明、10 项运行时权威、16 个外部资源、10 条安全发现与 3 个候选 Skill 逐条映射为 excluded / retained-evidence / independent-reimplementation，并附带 21 项能力面映射与 3 份 Skill 契约。 |
