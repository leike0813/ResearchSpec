# Academic Paper Workflow

## 1. 语义生产

`academic-paper` 以配置、结构、论证、起草、引文、摘要、内部评审和格式化等 12 个角色、8 个 phase 生产论文内容。writer/evaluator separation、citation/abstract 并行和内部 peer review 是语义纪律，不等于 CLI parallelism、Gate 或 transition。

十一条 route 的 route contract 仍由 routing catalog 拥有。`academic-paper-reviewer` 是只读的独立评审 Skill；writer 内部的质量检查不能取代它。

## 2. Adaptive default

Adaptive 将每条 route 的 durable outputs 作为 obligations，例如 outline、evidence map、draft、citation audit、revised draft 或 response。Agent 按 `obligation:` instructions 记录 attempts，并仅在 CLI 验证 artifact/hash/producer/declared dependency 后接受 evidence。没有声明的文本顺序或 ARSU phase 不构成 hard edge。

`annotation:<id>` 把确定性 JSON candidate 冻结为绑定已注册 Markdown 稿件的
Annotation Set。自由 Markdown/CriticMarkup 解析不属于当前流程。Adaptive Start 会把选中的
set 绑定到 receipt；它不创建 hidden round。

`revision_patch` 不作为 adaptive obligation output；它是跨 runtime 的 draft-patch lifecycle 候选，绑定 base artifact/hash，经 `submit patch:` 创建 pending patch，再由 `decide patch:` 解析并只通过 `advance patch:` 形成 revised output、apply report、Annotation Resolution Report 和 receipt。Patch v3 的 operation references 是 annotation-to-operation mapping 的唯一事实源；answered、deferred、rejected、unresolved 与 superseded 也在同一 resolution entries 中完整记录。ARSU producer 不得直接覆盖原稿。高影响 scope、claim、structure 或 failed-Gate override 进入 Decision；Gate 和 completion 使用当前 `gate:`/`completion:` selector。

## 3. Strict compatibility

![Strict compatibility：Academic Paper 外层 work graph](diagrams/rendered/academic-paper-workflow.svg)

Strict profile 把每条 route 投影为 artifact DAG。`full` 的 outline/evidence-map parallel group、ready `work:`、required Gate 与 `transition:` 都是 Schema `0.2` compatibility 的 graph fact，不应投射到 adaptive。

`enter-annotated-revision` 接受已注册稿件和匹配 Annotation Set，随后复用现有动态 revision
round 与 re-review。`revision_completeness` 在 passing verdict 前核验 set、patch、apply
report、Resolution Report、registry 与文件 hashes；机械覆盖通过后，reviewer、Verify 和
用户继续判断学术回应是否充分。

## 4. 失败与恢复

缺材料、引用或审稿意见时，按当前 instructions 记录限制、重试或请求 resolution；不得把内部 checkpoint、旧稿或聊天确认伪装成 accepted evidence。
