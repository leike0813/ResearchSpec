# 案卷会稿修订 (Docket revision round)

## 何时

已交付的交底与申请需要按问题清单做一次有界的会稿修订。

## 正式状态不在这里

当前节点、当前轮次、是否还有下一轮，都由 ResearchSpec CLI 从图运行给出。本阶段读
当前节点指令与本轮输入，不读也不写 `docket.yaml`，不判断 phase 合法性，不自行
推进或结束节点。

**消费的是本轮选定的 handoff 版本。**每次 continue 之后由 Navigate 通过 CLI 把
handoff 输出更新到上一轮已接受的版本，所以本轮拿到的一定是最新一版，不是初稿。
不要自己去目录里翻「最新」文件——以本轮输入为准。

## 输入

- `patent_case`（必需，node_output）
- `disclosure_bundle`（必需，handoff 或 node_output）
- `application_bundle`（必需，handoff 或 node_output）

## 步骤

1. 解析两个索引，读出本轮的 `问题清单.md`（在 application 目录里），逐条映射为
   `issues[]`，沿用已有稳定 id（`I-01` 起），不重排、不复用已关闭项的 id。
   分诊口径细则见 `knowledge/pd-kp-09-docket-rounds.md`。
2. 按 `references/issue_taxonomy.md` 与 `references/dispositions.yaml` 给每条定 `kind` 与
   默认处置。
3. 选出本轮最高优先级的未关闭条目，**只做这一个受控修订**：
   - 改交底 → 改完必须重新出申请，两件都出新版本；
   - 改申请 → 只出新申请版本，不回改交底。
4. 改稿落到新时间戳文件，上一版原样保留；同步更新受影响的 schema、件号登记表与图。
5. 写两个新版本索引。五个字段一个都不能少：`schema_version`、`kind`、`files`、
   `limitations`、`metadata`——结构见 `contracts/patent-file-index.v1.md`，
   `metadata.round` 记本轮。
   `tools/patent_files.py create` 可以用来生成，写完再用
   `python tools/patent_files.py validate --project-root <root> <索引> --kind <kind>`
   复核一次。
6. 写本轮修订说明：处理了哪些 issue id、改了哪些文件、剩下什么、缺什么技术事实。

## 轮次与继续

默认显示三轮。那是给人看的任务预算，不是引擎上限，也不是本阶段能改的字段。本阶段
照实汇报本轮做完了什么、还剩什么；预算要不要调、要不要再来一轮，是人在 Navigate
或 CLI 里通过 Decision 确认的事，本阶段不代劳确认，也不推测确认结果。

## 硬约束

- 一次只收敛一个受控修订。同一轮里反复派交底却不出新申请属于空转。
- 存在阻塞且仍是 `open` 的问人项时停下问人，不自行推进。
- 禁止为销掉清单条目编造结构、参数、步骤、连接或查新命中。
- 缺技术事实就问人，不代发明人编造。
- 不修改 run、节点、Gate、Decision 或 frontier 状态。
- 本阶段不做保护型 1+N 布局；布局由 `design-patent-protection-layout` 单独产出并经人工确认。

## 失败路径

- 机器检查连续三次失败而根因未改：停下问人或标记 `deferred`，不空转重跑。
- 索引校验失败：照实报告缺什么，停下。

## 完成

输出修订后的 `disclosure_bundle` 与 `application_bundle`（新时间戳版本，`metadata.round` 标轮次）以及本轮修订说明的实际文件路径。
