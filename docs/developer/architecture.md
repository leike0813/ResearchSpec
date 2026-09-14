# ResearchSpec 架构

ResearchSpec 是 ARSU 面向的 Agent-neutral、spec-driven 文件框架。它把“研究事实”“可执行能力图”
和“一次运行的状态”分开保存，让任何宿主 Agent 都能通过同一组文件合同工作。

## 系统边界

```text
用户与宿主 Agent
  ├─ 通过 Navigate 检索 Procedure 卡片
  ├─ 按需读取一个 activation packet
  ├─ 调用宿主原生能力或显式 Adapter Skills
  └─ 取得人的确认
             │
             ▼
ResearchSpec CLI ──写──> stable specs / changes / frozen runs / node instances / handoffs
             │
             └─引用──> researchspec/ 外的论文、报告、评审、图表和数据
```

ResearchSpec 不调用模型 API，不管理数据库，不执行 vendor 脚本，也不接管 Zotero 或交付物。Git
可以管理外部文件版本；ResearchSpec 只保存边界角色与安全相对路径。

## 每个概念只有一个 owner

| 概念 | Owner |
| --- | --- |
| 研究问题与长期边界 | `specs/project.md` |
| 来源身份与限制 | `specs/sources.yaml` |
| 接受的 claims | `specs/claims.yaml` |
| 稿件结构与交付意图 | `specs/manuscript.yaml` |
| capability graph 模板 | `profiles/*.yaml` |
| run 身份与生命周期 | `runs/<run>/run.yaml` |
| 一次运行的冻结调度图 | `runs/<run>/graph.yaml` |
| node 状态、Gate attempts、overrides、Decisions | `runs/<run>/nodes/*.yaml` |
| 跨节点和跨 run 的输入输出 | `runs/<run>/handoff.md` |
| 高影响 proposed/current 分离 | `changes/<change-id>/` |

Status、history、parent/child summary、frontier 和 completion readiness 都是扫描 owner 文件得到的
read model，不持久化全局索引或 children list。

## Graph 是自由组合层

Profile 定义 entry、route binding、节点、依赖、parallel/join、Gates、Decisions、动态轮次和
subgraph bindings。Core 只提供图语义，不内置 deep-research 或 academic-pipeline 的固定阶段。

启动根 run 时，CLI 校验 `entry_id`、`entry_node_id`，并在 entry 声明 `route_ref` 时校验其
route binding，然后将 profile 冻结为 `graph.yaml`。Mid-entry run 只执行从所选入口可达的图切片。Child-profile 节点把父节点输出按 role
映射进 child handoff；`from_role` 解决上下游角色名不同的问题。Typed parent binding 是唯一亲子
关系事实。

动态 revision template 按 round 投影重复节点和决定。下一轮是否存在由上一轮 Decision 决定，不由
Skill 文本或另一个状态文件控制。

## 合同层次

合同从稳定到具体依次为：

1. Zod DTO 与 schema：字段、枚举、安全路径和状态机约束；
2. Project profile 与 registry：当前可分发的能力图；
3. Frozen graph：一次 run 的调度合同；
4. Node instance 与 handoff：当前执行事实和文件交换；
5. CLI read models：面向 Agent 的即时 instructions、status 与 context pack。

所有控制写入先读取 owner 的当前字节并验证预期状态，再通过临时 sibling 与原子 rename 提交。
静态 Agent 投影由 ownership manifest 与 hash 保护。系统没有跨 owner 的隐藏事务日志，也不会从
对话内容猜测语义修复。

## 模块方向

```text
typed contracts
  -> workspace discovery / validation
  -> graph runtime + project changes + handoff
  -> CLI handlers and read models
  -> Agent delivery adapters

现有 ARSU / Companion / capability / extension registries
  -> runtime-derived Procedure catalog
  -> standalone 或 graph activation packet

authored profile sources -> projected profiles -> workspace runs
```

Converter 的 TypeScript profile source 是 authored SSOT；仓库中的 profile YAML、registry 和 Agent
表面是确定性投影。Vendor converter 只生成自己的 bundle，中央 assembler 拥有跨 vendor registry。

## Agent 与扩展边界

宿主只常驻 Navigate。Navigate 先读取紧凑卡片，选定后才加载完整 Procedure；Propose、Verify、
Decide 与 ARSU/core/plugin 程序都走同一按需入口。Standalone Procedure 只返回普通项目文件；graph
Procedure 读取 stable specs 与 handoff inputs，并仅通过激活包给出的 CLI selector 更新 owner。

Domain Plugin 与 Zotero Adapter 只能返回有界辅助材料。它们不能修改 stable specs、run/node、
handoff、Gate、Decision 或 transition。异模型复核也由宿主 Agent 执行，ResearchSpec 不保存模型
配置或授权。

## 失败与演进

当前实现只读取 schema `"2"` workspace。旧或未知格式 fail closed 并保持字节不变；系统不提供
兼容 reader、migration、rollback 或 semantic repair。新增能力应先确定 DTO、owner 和图接口，再
扩展实现，避免重新产生双重事实源。

更具体的运行协议和工作流见[运行时文档](runtime/README.md)，产品层面的行为以
[用户使用模型](../user/usage-model.md)为准。
