# FinRobot `snapshot-297a8d2` Skill 迁移复审

## 复审对象

本次复审对象是六棵完整候选树的精确聚合哈希：

`eecf6fc9e7669f46ef9c58d4fd5938cabedb6d8d7aceac59e15688e178f3765e`

旧批准生产树仍绑定
`83cc17371bd3e0b82434f67e74adc5ed8a12cf11979480e1eb1f83debe1a9bb3`
和 converter version 1；该批准不授权本次新树。用户已明确批准本报告绑定的
候选聚合哈希，生产提升必须保持此精确值。

| Skill | 厚度 | 文件数 | 候选树 SHA-256 |
| --- | --- | ---: | --- |
| `financial-research-company-fundamentals` | Tier 3：script-assisted | 6 | `a8df7c19b89c53a792370373d3fae53cf6353e9e7db9144934bd51409347efd7` |
| `financial-research-competitive-position` | Tier 1：Agent procedure | 4 | `d2aef99ec9593b8d3ec00e3c999e44231061dbe7247dc6f0097c8ce86cd527eb` |
| `financial-research-corporate-risk` | Tier 1：Agent procedure | 4 | `e64ba8253c1a5c2ec233b02cf2a38fe5db0979d14016731b3ef8e40246df0fee` |
| `financial-research-event-evidence` | Tier 3：script-assisted | 6 | `a4d867a96fcc9dd960d98eb4b96f7fb9ef7ffe7e40f4f71a0b9e3d24dd21a681` |
| `financial-research-relative-valuation` | Tier 3：script-assisted | 6 | `882699d08e5bbb1f290aaec3c940465a8cf9061a63d777b3b1b4b767672c4866` |
| `financial-research-statement-analysis` | Tier 3：script-assisted | 6 | `152f62220d36c4ca4643fb167644a370f87ee451379fb930c9bcdb6498e09137` |

## 厚度与运行结构

四项具有稳定确定性计算的能力采用 Tier 3：company fundamentals 提供
`metrics`、`forecast`；event evidence 提供 `prepare`、`rank`；relative
valuation 提供 `value`、`sensitivity`；statement analysis 提供
`normalize`、`metrics`、`forecast`。四棵树均包含一份正式入口和字节一致的
`lib/financial_support.py`。

Competitive position 与 corporate risk 的核心工作是同行可比性、风险传导、
证据冲突和商业判断，采用 Tier 1 完整 Agent procedure，不包含伪计算脚本或
空资源。

原候选的 12 份 reference 都是短规则、简短清单或普通执行路径材料，不能显著
节省主上下文，因而不符合 Progressive Disclosure。现已全部删除；其中必要的
治理规则已合并进相应 `SKILL.md`。当前六棵树均不含 `references/`。未来只有在
详细材料不需要每次读取且确实能显著节省主上下文时才允许增加 reference，并且
必须由 `SKILL.md` 直接说明读取条件，主文件仍保留约束与普通决策规则。

不需要更重的 stateful、Gate、runner 或固定机器 envelope：这些 Skill 没有
跨会话唯一状态、ResearchSpec workflow authority 或下游 runner 消费契约。

## 来源与能力覆盖

候选继续绑定不可变审计 `snapshot-297a8d2`、revision
`297a8d28d099be328c8a8eb658b4f782b93f3651` 和 audit SHA-256
`6b518a933f036333203276263b94cc5b4bd45a924f426972c4547165c5cbb9c3`。

`skill-definitions.ts` 将审计中的 32 个已准入 surface 恰好映射一次。每项
能力的主实现是 `agent-procedure` 或 `bundled-script`；外部浏览器、filing、
market-data 或本地语料工具仅负责用户授权的数据检索，不替代语义结论。
六个固定 Skill ID、既有域 membership、Apache-2.0、空 hard dependencies
和 advisory-only relationships 均不改变。

## Agent 与脚本边界

Agent 负责来源质量、同行选择、商业解释、风险传导、情绪、概率、影响、
估值方法、假设、权重、证据冲突、rating、target、recommendation 和最终
结论。脚本只负责 JSON/数值/日期/单位校验、规范化、比率、预测、DCF、
multiples、敏感性、精确或显式去重、基于 Agent 输入分数的排序、哈希和
原子写入。

脚本不联网、不读取凭证、不安装依赖、不导入 ResearchSpec/FinRobot、不访问
仓库路径、不在 import 时执行 I/O，并默认拒绝覆盖；只有显式
`--overwrite` 才替换目标文件。

## 删除与替换范围

生产树不包含 AgentSpec JSON、`dependencies.json`、prompt factory、LLM
wrapper、provider contracts/adapters、统一八段输出模板、runner、通用 schema、
doctor、状态机或 `agents/openai.yaml`。Converter 已删除 fragments、shared
contract 和旧 Python/AgentSpec curation，并把 version 2 完整树原子提升为
生产树。

## 依赖、副作用与分发

正式脚本唯一运行依赖为 Python 3.11 标准库。数据检索工具和数据权限完全由
目标 Agent 与用户配置拥有。ResearchSpec 的 conversion、check、idempotence、
packaging、installation、discovery、update 和 registry assembly 始终为离线
文件操作，不执行正式脚本。

每棵生产树包含运行所需文件、`LICENSE`、`NOTICE` 和 `DERIVATION.json`；
Tier 3 额外包含入口与共享支撑库。`DERIVATION.json` 逐项记录 surface、来源
路径、来源 hash、symbol 和实现机制。

## 验证状态

当前已通过六棵生产树的 `validateNonNativeVendorSkill`、完整文件闭包、
敏感值、禁止依赖、禁止仓库耦合与 aggregate hash 校验。四棵 Tier 3 树已复制
到仓库外，并通过 `$HOME/.ar` 的 uv Python 环境验证全部正式命令、非法输入、
默认拒绝覆盖、显式覆盖、确定性重复运行和 import-time 惰性。

聚焦 FinRobot 测试 7/7、全量测试 168/168、`pnpm check`、`pnpm lint`、
`pnpm build`、全部 OpenSpec strict validation、五个 vendor 的 check 与
idempotence、`pnpm release:verify` 和 `git diff --check` 均通过。Version 2
manifest、生成树与发布包均绑定已批准聚合哈希，其他四个 vendor 的投影保持
字节隔离。已批准树的 hash 发生任何变化都必须重新执行上述验证并重新复审。

## 人工复审结论

当前结论：`approved`。

用户已明确批准候选聚合哈希
`eecf6fc9e7669f46ef9c58d4fd5938cabedb6d8d7aceac59e15688e178f3765e`。
批准记录时间为 `2026-07-15T21:49:26Z`；该哈希提升为 published，candidate
槽清空，并选择 converter version 2。
