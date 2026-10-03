<!--
工件类型: knowledge-pack
能力/包 ID: PD-KP-09 docket-rounds
提取方式: curated — ResearchSpec 编写，非上游逐字节
来源对照（source mapping）:
    - vendor/patent-disclosure-skill/skills/patent-docket/prompts/guardrails.md
    - vendor/patent-disclosure-skill/skills/patent-docket/prompts/intake.md
    - vendor/patent-disclosure-skill/skills/patent-docket/prompts/triage.md
    - vendor/patent-disclosure-skill/skills/patent-docket/prompts/round_close.md
    - vendor/patent-disclosure-skill/skills/patent-docket/references/phase_machine.md
    - vendor/patent-disclosure-skill/skills/patent-docket/references/max_rounds.md
    - vendor/patent-disclosure-skill/skills/patent-docket/references/issue_taxonomy.md
    - vendor/patent-disclosure-skill/skills/patent-docket/references/handoff_contract.md
说明: 上游用 validate_docket / emit_tracker 校验本包自有的 docket.yaml 阶段机。
      ResearchSpec 不发布这两个脚本，阶段机随自建图引擎迁到 CLI：节点与轮次
      的正式状态只由 CLI 写，本包只剩会稿语义。下文按此重写。
-->

# 案卷会稿与轮次 (Docket rounds and the round budget)

本阶段是单次有界的会稿修订：读入本轮问题清单，对已交付的交底或申请做**一轮**
语义修订，输出新的时间戳版本。它不写交底正文以外的产物，不出四件套，不自行
推进节点。

## 正式状态归 CLI

当前节点、当前轮次、是否还有下一轮，都由 ResearchSpec CLI 从图运行里给出。本阶段
不读也不写 `docket.yaml`，不判断 phase 合法性，不声明自己是第几轮的开始或
结束。要确认轮次，读 `researchspec status` 与节点指令。

三件事只有人能在 Navigate 或 CLI 里确认：本阶段不代劳确认，也不推测确认结果。

- 继续下一轮（continue）是一次 Decision。
- 收口本轮（complete）是一次确认。
- 调整轮次预算是对运行配置的显式改动，不是本阶段的输出。

## 轮次预算是显示口径

默认显示三轮。这是给人看的任务预算，不是引擎上限，也不是本阶段能改写的字段。
本阶段照实汇报本轮解决了什么、还剩什么；剩余轮次够不够由人看着清单决定，需要
加预算时由人显式调整运行配置。

存在阻塞项且仍是 `open` 时，停下来问人，不派工、不自行推进。

## 分诊

读交底或申请目录的 `问题清单.md`，逐条映射为 `issues[]`，沿用已有稳定 id
（`I-01` 起），不重排、不复用已关闭项的 id。`kind` 取
`machine_format`、`claim_form`、`scope_strategy`、`disclosure_gap`、
`human_fact`、`noise`。

默认处置：

| kind | 默认处置 |
|------|----------|
| `machine_format`、`claim_form` | 改申请（`application_fix`） |
| `scope_strategy` | 问人（`ask_human`，默认非阻塞；用户已要求改独权却没说怎么改才算阻塞） |
| `disclosure_gap` | 改交底（`disclosure_fix`）；材料里没有对应事实就转 `ask_human` |
| `human_fact`、著录项与文头联系人 | 问人，默认非阻塞 |
| 点名某张图是否入文 | 问人，阻塞 |

## 一轮只收敛一个受控修订

选定本轮最高优先级的未关闭条目，做完就停：改完交底就重新出申请，改申请不回改
交底。同一轮里反复派交底却不出新申请属于空转。

禁止为销掉清单条目编造结构、参数、步骤、连接或查新命中。缺技术事实就问人。

机器检查连续失败三次而根因未改时停下问人或标记 `deferred`，不空转重跑。

## 收口

`check-patent-docket` 是只读复核：它对着清单标 done / deferred / open，列出残留
条目与文件路径，然后交回人。是否收口、是否再来一轮，是人的决定。

## 产出

修订后的 `disclosure_bundle` 与 `application_bundle`（新时间戳版本），外加一份
本轮修订说明：本轮处理了哪些 issue id、改了哪些文件、剩下什么、缺什么技术事实。
