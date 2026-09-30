# Design

## Context

见 proposal.md 的动机与 01-analysis.md 的来源证据。Complete Tree Approval 要求候选精确 hash 的单独批准；当前生产锚点必须保持可验证。

## Goals / Non-Goals

建立可独立审阅的完整候选，并保留当前批准生产。暂不吸纳第三方 Skill、Desktop runtime、独立估值法或 provider。

## Decisions

1. 候选审计、政策、authored 树和最终完整树放在新审计目录。renderer/policy loader 接受显式候选路径与定义；默认调用仍验证当前生产。复用现有校验，避免复制转换器或把 candidate 直接标为 approved。
2. 审计 schema 检查实际库存计数和引用关系，生产 loader 用现有固定身份核对；候选另外核对其政策与 audit 字节 hash。旧审计完整保留。
3. 七项来源义务映射到现有能力。公式在 valuation/statements，证据解释在 Agent 程序；period/FX/lineage DTO 使用明确输入，不推测独立性或汇率。
4. 未核实 EV 桥项、不同方法口径、仅期末日期、共享血缘均显式保留为未认证。诊断不自动选择方法，不采用上游经验阈值。
5. 候选 extension 复用既有包结构及 validator，只更新受影响正文、工具、知识 hash、brief 要求；同名 profile 和领域不变。候选产物始终位于审计目录。

## Risks / Trade-offs

- 第三方转存正文原始版本与资源闭包不完整 → 56 项逐项暂缓，不能从根许可推导准入。
- 来源数量增加不证明内容全数语义审过 → 全量 inventory 与七项选中业务审查分别报告。
- 人类尚未看见新树 hash → 准备完成后展示 hash/报告，保持 promotion 任务未完成。

## Migration Plan

先完成候选和检查；精确 hash 获批后更新生产 policy/definitions/authored、vendor pin、raw bundle、extension registry/catalog 与 01–05/manifest，并执行 check/idempotence/maintenance diff。批准前不切换主规格或生产锚点，不提交代码。
