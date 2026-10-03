<!--
工件类型: knowledge-pack
能力/包 ID: PD-KP-14 exam-policy-brief
提取方式: curated — ResearchSpec 编写，非上游逐字节
来源对照（source mapping）:
    - vendor/patent-disclosure-skill/skills/patent-exam-policy/SKILL.md
    - vendor/patent-disclosure-skill/skills/patent-exam-policy/prompts/guardrails.md
    - vendor/patent-disclosure-skill/skills/patent-exam-policy/prompts/research.md
    - vendor/patent-disclosure-skill/skills/patent-exam-policy/prompts/emit_backlog.md
    - vendor/patent-disclosure-skill/skills/patent-exam-policy/prompts/apply_after_confirm.md
说明: 上游有一条「按简报改技能文件」的旁路白名单。已发布的包由维护流程从
      authoring 源生成，改动交维护者在源码侧走既有 change 流程。
-->

# 政策简报 (Examination-policy brief)

对照国知局近期口径，说明对交底写法的影响（若有定稿，也写「对本稿」）；权要书式、
附图、摘要、外观视图等另写「对申请文件写法」，只说明，默认不改申请包。

## 信源分层

| 层 | 打开谁 | 能否单独支撑改动 |
|----|--------|------------------|
| A | 国知局栏目、专利法 / 实施细则 / 审查指南正文、国务院公报转载 | 仅能支撑建议 |
| B | 新闻发布会、答记者问、典型案例、司法解释 | 否 |
| 另议 | 地方预审须知、代办处公告 | 否 |

C 源（媒体 / 律所二次解读）只作背景并标「待官网复核」。司法口径 ≠ 审查指南，不得
写成审查授权条件。每条观点必须对应可点击的准确 URL。

## 增量与施行日历

每条观点都要带**版本锚点**：文件名、发布机关、发布日期、施行日期，以及它是**当前
现行**还是已被替代。同一部法规或指南的多个版本只取现行版作依据。

对照最近一份 `POLICY-*.md`，每条标 新出现 / 仍有效 / 已废止；无历史则全部标新出现。

已公布但施行日未到的条目单列一张表，与现行条目分开，不混入正文结论，也不写成
当前必须。日期写明确日期，不写「近期」「即将」。

## 建议怎么落地

已发布的能力包由维护流程从本仓库的 authoring 源生成。本阶段产出政策简报，加一节
「建议的源修改」：改哪个生成源文件、为什么、影响哪些已发布的包、建议走不走一次
change 流程。已发布的包不就地改，源也不在本阶段改。

## 产出

`policy_brief`：主表（分层、证据等级、增量、URL）、施行日历、对交底写法、对
申请文件写法、另议，以及一节「建议的落地改动」——只写建议，不落地。
