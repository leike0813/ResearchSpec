# Zotero Adapter 与领域插件用户旅程

本文属于 [ResearchSpec 目标态用户使用预演](../researchspec_user_usage_rehearsal.md)。Zotero
是馆藏事实权威，ResearchSpec 是 subflow 权威；Adapter 与 plugin 都只是有界助手。

## 共同边界

- 这些旅程以 workspace 已选择 `zotero-library`、用户已安装 Zotero 与
  [Zotero-Agents](https://github.com/leike0813/zotero-agents) 插件为前提。未选择时 `status`
  报告 `not-selected`，Agent 应先引导用户执行 `update --literature-adapters zotero-library`。
- Adapter 不启动 subflow、不写 `control.yaml`、不确认 Gate、不更新 stable specs。
- 查询/分析授权不等于馆藏写入授权；每次 acquisition/curation 的实际写入范围单独确认。
- Producer 决定如何使用 Adapter 结果，并把接受的研究事实写入自己的交付物或 specs。
- Adapter readiness 检查可以访问当前配置状态，但 `status`/`check` 不执行二进制、不联系 Zotero。
- Domain plugin 安装同意与 ARSU route/child 确认分开，失败或拒绝不改变核心 producer。

## 1. `zotero-library-agent`：宽泛馆藏任务路由

用户说：“看看我的 Zotero 里有没有城市绿地降温方面的材料，缺什么也告诉我。”该请求的
主目标是馆藏任务，Navigate 路由到 `zotero-library-agent`，不启动 ResearchSpec subflow。

Agent 确认 library/profile、允许读取的 collections、是否允许外部发现，以及“告诉我缺什么”
不包含自动导入。Router 检查 live readiness，然后把任务拆成 query、可能的 acquisition 和
synthesis；每个任务仍遵守对应 Adapter 边界。

结果是一份对话内或用户指定路径的 provider evidence handoff，说明查询范围、命中、缺口、
未执行写入和推荐下一步。Router 自己不伪造综合，不把结果写入 sources/claims，也不创建
第二套长期任务状态。Readiness 失败时给出有界恢复信息，核心 research route 仍可改用外部
检索继续。

## 2. `zotero-library-query`：查询当前馆藏

Research producer 需要已有来源，或用户明确说“查询 Urban Heat collection”。Adapter 确认
collection、关键词、字段、时间范围和结果上限，然后执行只读查询。

返回项保留 Zotero identity、书目信息、collection/tag/note/attachment 可用性和查询限制。
Producer 可以把结果用于 shortlist；只有用户接受的来源才由原 producer 更新
`sources.yaml`。Query 不去外部补全缺失记录，不修改标签，不把“未命中”等同于文献不存在。

Profile 不可用或 Zotero 未运行时，返回结构化恢复建议；不得自动改配置、启动 Zotero 或
把旧缓存冒充当前馆藏。

## 3. `zotero-literature-acquisition`：发现并准备补充来源

在 `deep-research:lit-review` 中，query 显示干旱气候城市研究不足。Producer 嵌套调用
acquisition，先确认发现范围、去重标准、候选质量门槛和是否只生成候选清单。

默认先返回外部候选及与当前馆藏的 duplicate assessment，不写 Zotero。若用户希望导入，
Adapter 再展示精确候选、目标 collection、元数据/附件行为和风险，获得单独写入授权后执行。

导入结果回到 research producer，由其决定哪些来源进入 bibliography、synthesis 和 stable
sources。授权只覆盖本次明确集合；route confirmation、plugin consent 或“允许使用 Zotero”
都不能替代。部分导入失败时逐项报告，不回滚或重试未授权项，也不修改 ResearchSpec control。

## 4. `zotero-literature-analysis`：分析重点论文

用户或 producer 选中五篇核心论文，要求提取设计、样本、绿地指标、温度指标、效应和限制。
Adapter 确认 item identity、可读取 attachments、分析问题和输出格式后，只读当前馆藏材料。

输出区分书目元数据、原文观察、作者解释和 Adapter 推断，并对不可读附件或缺页标 unknown。
结果可以进入外部 literature matrix 或 producer 的 synthesis，但 Adapter 不确认 claim，也不
写 notes/annotations，除非用户另行发起 curation。

同名 item 或多个版本时先请求精确选择；不得根据标题猜测当前版本。

## 5. `zotero-research-synthesis`：跨来源综合

Producer 已有一组经选择的 Zotero items，要求比较湿润/干旱气候、遥感/实测温度与绿地类型。
Adapter 确认 item set、综合问题、证据边界和期望 handoff，然后生成主题、分歧、方法差异、
空白与可追溯来源引用。

Synthesis 是 provider evidence，不是 ResearchSpec Gate 或 stable claim。原 ARSU producer 将其
与外部来源、project 约束和方法判断结合，再生成正式 synthesis/report。Adapter 不把 library
覆盖率描述成系统综述完整性，也不启动 `deep-research:systematic-review`。

## 6. `zotero-library-curation`：经批准的馆藏整理

用户明确要求：“把确认的 12 篇论文放入 Urban Heat collection，补齐 DOI，并合并这两组
重复项。”由于这是馆藏写入，Adapter 先读取精确 items，展示逐项计划、目标 collection、
字段变更、duplicate merge 后果和无法自动确定的冲突。

用户按有界范围确认后才执行。未确认项、私有 notes、其它 collections 和附件保持不变。
结果报告成功、跳过、冲突与失败；不能用一次授权持续整理整个 library。

Curation 不更新 `sources.yaml`。若这些馆藏变化应成为研究来源，原 producer 重新查询并由
用户接受。授权撤回或冲突无法解决时安全停止，不猜测元数据。

## 7. `zotero-bridge-cli`：精确低层操作与恢复

用户或上层 Adapter 需要查看命令能力、执行一个精确只读操作或诊断结构化错误时使用
`zotero-bridge-cli`。它根据 profile 选择平台 runtime，展示确切命令、目标和读写性质。

机制 Skill 不重新解释学术任务，不自行扩大 selector，也不把 CLI stdout 写入 ResearchSpec
control。涉及写入的低层命令仍要继承相应 acquisition/curation 的明确授权；直接调用机制
不能绕过同意。

Binary 缺失、版本/校验不符、协议错误或 Zotero 不可达时返回结构化恢复路径。ResearchSpec
静态检查只检查受管文件，不执行 binary 来“验证健康”。

## 8. Producer 中的嵌套 Zotero 旅程

在 `deep-research:full` child 中，用户允许读取 Zotero 并进行外部检索。Producer 调用 query
取得已有来源，调用 acquisition 形成候选，调用 analysis 研究重点论文，再调用 synthesis
形成 provider handoff。

整个序列只有一个 ResearchSpec research child。Adapter 的内部任务不出现在 parent profile、
children 或 Gate 集合中。涉及实际导入时另问用户；用户拒绝后，producer 使用已获授权的
外部检索继续，并在 research handoff 中说明 Zotero 覆盖限制。

## 9. Domain plugin：发现、安装与使用

### 发现与单独同意

Research producer 发现环境科学 domain 中有城市热岛测量和绿地分类 Skill。Navigate 最多
提出三个相关 domain，说明具体辅助能力、静态安装变化和“不会改变 route/control”。Plugin
同意不能和 research child 确认合并。

用户同意后，`researchspec plugin` 先展示精确安装内容，再更新：

- `researchspec/config.yaml` 中的 plugin 选择；
- `tool-installation-manifest.json`；
- 对应 host 的静态 Skill 投影。

它不修改任何 subflow control，不安装第三方 runtime/dependencies，不执行 plugin scripts。

### 使用

Host 已加载新 Skill 时，原 producer 给它一个有界 helper brief，例如比较 LCZ 与公园分类的
适用性。Helper 输出返回原 producer；它不成为新 producer，不写 route、Gate、Decision、
handoff 或 stable specs。Host 尚未加载时，只能在完成 availability 与 manifest 检查后读取
静态 instructions；不能伪装成已执行 Skill。

### 拒绝、失败与卸载

用户拒绝安装、投影失败或 domain 变为空时，当前 ARSU producer 与 frontier 保持不变。
Agent 说明缺少可选帮助并继续核心工作。卸载只移除选中 plugin 的 config/manifest/host
投影，不改 controls、handoffs、外部结果或曾经参考过该 helper 的学术内容。

## 10. Adapter/plugin 分册验收

- 七个 Adapter 都有独立入口、授权边界、结果去向与失败路径。
- Query/analysis/synthesis 保持只读；acquisition/curation 写入逐次授权。
- Adapter 与 plugin 从不成为 ResearchSpec workflow authority。
- Plugin 安装只改变静态投影，拒绝或失败不会阻塞核心 route。
- Zotero/插件结果只有经过原 producer 和用户接受后才影响 stable research facts。
