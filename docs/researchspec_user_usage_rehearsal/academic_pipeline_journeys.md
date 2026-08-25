# Academic Pipeline 用户旅程

本文属于 [ResearchSpec 用户模型验收基线](../researchspec_user_usage_rehearsal.md)。Pipeline 的
学术方法由 child capabilities 提供；converter-owned profile 与每个 run 的 frozen graph 负责调度。

## 共同合同

`profiles/academic-pipeline.yaml` 声明 entries、child-profile nodes、dependencies、parallel/join、
formal Gates、Decisions、override policy 与动态 revision templates。根 run 确认授权整张 frozen
graph；eligible child-profile node 通过 `start node:<parent-run>/<node>[@round]` 创建或返回唯一绑定
child run，不再请求第二次 run-level 确认。

每个 child run 记录 parent binding，只能执行自己的 frozen graph。每个 formal Gate 与 Decision 仍
由人确认，alternate-model review 也按当前 run/node 另行确认。

## 1. End-to-end

用户提出从研究目标到论文交付的跨阶段请求。Navigate 先维护已确认 stable facts，再读取
`instructions profile:academic-pipeline`，展示 end-to-end entry：首个 child、预计边界 outputs、全部
Gates/Decisions、风险和 long-horizon cost。

确认后，CLI 创建 parent run 和 frozen graph。Frontier 首先暴露 research child-profile node：

```text
start node:<pipeline-run>/research
```

Research child 在 `research/urban-heat/` 写 bibliography、synthesis 和 report，通过自己的 handoff
暴露角色。Evidence Gate 经人确认，accepted sources/claims 才进入 stable specs。Child 完成后，
parent graph 依次暴露 writing 与 reviewer children。

Writing child 输出 outline、evidence map 和 manuscript；reviewer child 输出 review、editorial outcome
和 revision roadmap。Review Decision 的 `accept` 进入 format，`revision` 实例化 repeatable revision
round，`stop` 结束相应 branch。Failed Gate 只有在 profile 允许且人单独批准 override 时才能继续。

Revision 与 re-review 轮次使用 `@round` node selectors。ARSU patch helper 只修改显式外部路径；
round Gate/Decision 仍保存在所属 child node。Accepted branch 经过 format 后才进入 final integrity。

## 2. Mid-entry

已有 research report、稿件或审稿意见时，用户选择 profile 声明的 entry，例如 writing、review、
revision、re-review、format 或 final-integrity。Start payload 记录 `entry_id` 与 `entry_node_id`；
frozen graph 只把所选入口对应的首个 child-profile node置为 eligible。

外部材料保持原路径，通过 parent handoff 明确声明。新的 workspace 不继承旧 Gate、Decision、round
或 completion。Revision 与 re-review 从本地 round 1 开始。首个 child 完成后，普通 dependency、
Gate、Decision 与 repeatable-template 规则恢复。

## 3. 暂停、拒绝与恢复

恢复 parent 时，Navigate 读取 status 与精确 run/node instructions。拒绝当前工作不会伪造 child 或
完成状态。Gate fail 可追加新的 attempt；override 保留原 verdict，并要求批准人、时间与理由。

## 4. 验收

- Root entry 只确认一次；bound child runs 继承 graph 授权并具有 typed parent binding。
- 每个 Gate、Decision、override 与 alternate-model dispatch 保持自己的确认边界。
- Profile 决定顺序、并行、branch 和 round；Agent 不从 prose 创建节点。
- 外部材料与交付物不进入 `researchspec/`，也不被 pack 复制。
- 所有 mid-entry 都从唯一声明的 entry node 启动，旧运行状态不会泄漏。
