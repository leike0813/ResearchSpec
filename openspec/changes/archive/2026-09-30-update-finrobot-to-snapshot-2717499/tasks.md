# Tasks

## 1. 审计与隔离

- [x] 1.1 生成新版 inventory、129 surfaces、八来源与七许可及候选政策；逐项核对 Git tree/blob/bytes/hash，并保留旧审计。
- [x] 1.2 复用政策 loader 和 renderer 支持隔离候选；测试缺失/重复记录、错误身份和候选 hash，确认旧生产仍通过 check。

## 2. 业务增量

- [x] 2.1 完成估值脚本与 Skill 合同，验证桥重复扣减、无效 DCF、方法可比性与 sensitivity 一致性。
- [x] 2.2 完成报表脚本及三项 Agent 文档，验证日期缺口/重叠、FX 证据、股数口径和独立性限制。

## 3. 候选审阅

- [x] 3.1 输出六份完整候选树及隔离 extension 投影，逐包审查七项新增和旧义务，绑定所有 hash 和 validator/brief 字段。
- [x] 3.2 完成 check/lint/targeted/full tests、candidate 重生成检查及生产 maintenance check；形成可复现审阅报告和 01–05 候选记录。

## 4. 生产吸纳

- [x] 4.1 将当前完整候选树与报告展示给人类，获得该精确树 hash 的批准。
- [x] 4.2 按批准树切换 vendor pin、政策、定义、raw/extension 与 catalog/文档；验证其他 vendor 不变。
- [x] 4.3 同步主规格，固化新 production manifest 和 maintenance diff；验证 check/idempotence 和完整测试。
