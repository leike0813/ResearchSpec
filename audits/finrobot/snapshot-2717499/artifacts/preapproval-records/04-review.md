# FinRobot 候选机器审阅

日期：2026-09-30。审阅对象为隔离候选；状态仍为 pending-human-review。

| 对象 | SHA-256 |
| --- | --- |
| 完整 raw 树集合（renderer 算法） | `1a101495abecacbc702a8ce8fd3b376631b88e9cc45de3d9a216d6aaedb3a4c6` |
| 全部 63 产物文件清单 review.json | `c589313de43ec4926bcec01871f55cd6a1eeab6239330f5c083e5c9cdcdb10dc` |
| extension registry subset | `d7eacbac9fafc76733df88947e554df33960de766343d0fe05aa97ac6e75089e` |
| 六 extension package 树（maintenance 算法） | `ee56c24ea0be04691cbdc8fa5f2b0911feab6e6ce7ae36440a89a34b7a5854e7` |
| 六 profile 树（maintenance 算法） | `82ca68e84308925a269845cf5316f61b4acad4265329ebe31d2d8f8154996f49` |

renderer 的 tree hash 与 maintenance 的目录 hash 使用各自既有序列化算法；不得把两者
当作同一种标识。逐包身份、brief 字段与 knowledge refs 见
[extension-review.json](artifacts/extension-review.json)；逐文件身份见
[review.json](artifacts/candidate/review.json)。

## 检查结果

- 六 raw 对应六 capability、六 profile；四 mixed、两 llm；全部 gate_policy 为 advisory。
- banking-finance-and-investment 包含六 capability/profile，accounting-auditing-and-accountability 包含两份。
- 八份 tools 与 raw 对应资产 byte-identical，knowledge_refs 的 SHA-256 与真实字节一致。
- profiles 与生产逐字节相同。risk/event extension 正文与生产逐字节相同。
- 三项 brief 增量落在正文和 manifest --required：numeric_evidence、evidence_checks、comparability_checks/equity_bridge。
- SKILL 流程词 next-node/next-phase/agent-team/proceed-to-next 检索无命中；validator 无工具、模型或网络调用。
- preview --check 通过，检验完整文件闭包和每份字节；旧生产 check、idempotence、maintenance check 均通过。

## 发布前人类批准

待批准完整树 SHA-256 为 `1a101495abecacbc702a8ce8fd3b376631b88e9cc45de3d9a216d6aaedb3a4c6`。
请连同六个 [完整树](artifacts/candidate/vendors/finrobot/) 与
[Agent 语义审阅](05-semantic-review.md) 一起审阅。

根据 `openspec/specs/finrobot-vendor-conversion/spec.md` 的 Complete Tree Approval，
该候选需要展示后显式批准。用户的实施授权已经用于完成候选；当前没有记录精确树批准。
生产仍绑定旧 hash `eecf6fc9e7669f46ef9c58d4fd5938cabedb6d8d7aceac59e15688e178f3765e`。

本目录未生成 production manifest，未运行针对新 pin 的 production baseline/diff；这些
步骤在批准后的 pin、政策、包和 catalog 切换中完成。旧审计和生产 manifest 原样保留。
