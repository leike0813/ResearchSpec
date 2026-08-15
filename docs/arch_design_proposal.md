# ResearchSpec Architecture

## 1. 架构目标

ResearchSpec 是服务 ARSU 的 Agent-neutral、spec-driven 文件框架。它提供稳定合同、确定性控制
和静态 Agent 投影，不调用模型 API，不管理数据库，也不接管论文文件、Zotero 或宿主 Agent。

## 2. 权威边界

每个持久概念只有一个 owner：

| 概念 | Owner |
| --- | --- |
| 研究问题与长期边界 | `specs/project.md` |
| 来源身份与限制 | `specs/sources.yaml` |
| 接受的 claims | `specs/claims.yaml` |
| 稿件结构意图 | `specs/manuscript.yaml` |
| capability graph | `profiles/*.yaml` |
| 单个 run 状态、frozen graph、node 状态、Gate、Decision、transition | `runs/<run>/run.yaml`、`runs/<run>/graph.yaml`、`runs/<run>/nodes/*.yaml` |
| 跨节点/跨 run 输入输出路径 | `runs/<run>/handoff.md` |
| 高影响 proposed/current 分离 | `changes/<change-id>/` |

边界交付物是 `researchspec/` 外的普通项目文件。Git 管理其版本；ResearchSpec 只在 handoff 中
保存 role、type、path、purpose、producer/source 或 consumer 及限制。

## 3. 模块方向

```text
typed contracts
  -> workspace discovery / validation
  -> subflow control + handoff + project change
  -> CLI handlers and read models
  -> Agent delivery adapters

ARSU routing + workflow source
  -> project profile / routing catalog / generated Skills
```

Core 不硬编码 ARSU graph。Converter 的 academic-pipeline source 是项目 profile 的唯一 authored
source；workspace YAML 是 manifest-owned projection。Status、history 和 parent/child 视图由扫描
controls、handoffs 和 changes 临时计算，不保存隐藏索引。

## 4. 写入模型

Stable specs、changes 和 handoffs 可直接编辑并独立校验。Control mutation 读取 owning 文件当前
字节、验证预期状态、写临时 sibling，再原子 rename。静态投影使用 manifest hash 保护 drift。

这种设计把失败范围限制在一个 owner 文件。CLI 不维护跨 owner 的事务日志，也不根据聊天内容
猜测修复语义矛盾。

## 5. ARSU 与 Companion

ARSU Skills 读取 stable specs、route instructions 和 handoff inputs，写外部语义交付物并维护自身
handoff。Navigate 负责路由与恢复；Propose 负责 project change；Verify 准备 Gate 建议；Decide
在用户确认后请求 CLI 写入 owning control 或 change。Domain Skills 与 Zotero Adapter 只向原
producer 返回有界辅助材料。

## 6. 安全与演进

只有 schema `"1"` workspace 可被当前实现读取。旧或未知格式 fail closed 且保持字节不变。
ResearchSpec 不提供兼容 reader、migration、rollback 或 semantic repair。新增能力应先明确 DTO、
schema 和 owner，避免重新引入双重事实源。
