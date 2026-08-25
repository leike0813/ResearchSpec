# ResearchSpec Product Requirements

## 1. 产品定位

ResearchSpec 是 ARSU 学术写作工作流的 Agent-neutral、spec-driven framework。它让研究者通过
稳定文件合同在不同 Agent、会话和 Skills 之间传递研究意图、来源、claims、稿件约束、formal
Gates 和交付物路径。

它不调用 LLM API，不替代 citation manager，不托管论文，不执行 plugin 或 adapter runtime，
也不根据聊天内容自动接受高影响学术决定。

## 2. 用户表面

固定表面包含四个 ARSU Skills、两个 Core Skills、五个 Companion Skills、七个 Zotero Adapter Skills 和十六个
CLI commands。可选 domain Skills 只提供经审查的语义辅助。

`init` 准备 workspace，不启动工作。模糊、跨 Skill、恢复、解释和导出请求进入 Navigate；明确
Skill/mode 可直接路由，但必须完成同样的 prerequisite、route summary 和确认。

## 3. 核心需求

- 只识别 schema `"2"` current workspace；其它格式零写入拒绝。
- 四份 stable specs 分别拥有 project、sources、claims 和 manuscript facts。
- converter-owned project profile 拥有 academic-pipeline graph。
- 每个 run 的 frozen graph 和 node instances 是该实例唯一运行时 authority。
- 每个 handoff 以 role/path 指向 `researchspec/` 外的边界文件。
- Project change 表达高影响 proposed/current 分离；accepted 不自动应用。
- 每个 parent、child、branch 和 revision round 独立确认。
- Formal Gate 必须人类确认；Decision 和 advance 分开。
- ARSU revision patch 是唯一稿件 patch contract，helper 无状态且 fail closed。
- Status、history 和 workspace index 均按需扫描，不持久化派生事实。

## 4. 运行体验

Agent 使用 `status -> instructions -> start/decide/advance -> status`。生产者在显式外部路径写
boundary deliverable，更新自己的 handoff；下游按 role/path 消费。外部路径丢失只阻塞当前消费
动作，不重写生产者历史。

Pipeline parent 只按 profile 和直接 child controls 计算 frontier。Core 不硬编码 ARSU stage graph，
ARSU 内部 agent/phase/checkpoint 也不自动成为 ResearchSpec state。

## 5. 安全与发布

所有 control 写入都是单文件原子更新。Generated profile、Skills 和 wrappers 受 manifest drift
保护。Plugin、Zotero 和 vendor converters 的静态检查不执行第三方代码或读取 credentials。

发布必须通过 packaged CLI 的 fresh workspace、unsupported workspace、固定 Skills/commands、
converter idempotence、current documentation 和 package allowlist 验证。
