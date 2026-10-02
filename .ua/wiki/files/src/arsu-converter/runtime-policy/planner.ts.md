
# src/arsu-converter/runtime-policy/planner.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/runtime-policy](../../../../modules/src/arsu-converter/runtime-policy.md)
<!-- node: file:src/arsu-converter/runtime-policy/planner.ts -->

运行时策略计划器：按目录逐条读取上游源文件，把命中段落或整文件改写为 host-native 委托文本，注入 checker 闭包与「不可用上游运行时」替换段落，并校验目录分类完整性、源 commit 与 41/5 数量约束，全部通过后才返回带 SHA-256 证据的改写计划。
源码：[src/arsu-converter/runtime-policy/planner.ts](../../../../../../src/arsu-converter/runtime-policy/planner.ts)

## 符号（9）
<!-- node: function:src/arsu-converter/runtime-policy/planner.ts:addReviewerAssetsRootRewrite -->
<!-- node: function:src/arsu-converter/runtime-policy/planner.ts:addSprintSchemaRewrite -->
<!-- node: function:src/arsu-converter/runtime-policy/planner.ts:addUnavailableRuntimeRewrites -->
<!-- node: function:src/arsu-converter/runtime-policy/planner.ts:buildRuntimePolicyPlan -->
<!-- node: function:src/arsu-converter/runtime-policy/planner.ts:buildRuntimePolicyReport -->
<!-- node: function:src/arsu-converter/runtime-policy/planner.ts:markRuntimePolicyAdapted -->
<!-- node: function:src/arsu-converter/runtime-policy/planner.ts:paragraphSpans -->
<!-- node: function:src/arsu-converter/runtime-policy/planner.ts:serializableRuntimePolicyPlan -->
<!-- node: function:src/arsu-converter/runtime-policy/planner.ts:validateCheckerClosure -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| addReviewerAssetsRootRewrite | 函数 | 276–309 | 中等 | 源码改写、checker 闭包、路径改写 | 0 | 为 review_panel_provenance.py 生成 REPO_ROOT 指向生成包 assets 目录的改写 span，并要求该行在源文件中唯一出现。 |
| addSprintSchemaRewrite | 函数 | 241–274 | 中等 | 源码改写、checker 闭包、校验 | 0 | 为 check_sprint_contract.py 生成唯一一处 schema 路径改写 span，使评审 Skill 复用自身 assets 下的 sprint contract schema，匹配次数不为 1 时报错。 |
| addUnavailableRuntimeRewrites | 函数 | 311–375 | 复杂 | 源码改写、可用性边界、冲突检测 | 0 | 为目录中每条「未随包分发」引用在上游源文件里定位唯一锚点并注入 ResearchSpec 可用性边界段落，同时检测同一源文件内多条不可用引用造成的 span 冲突。 |
| buildRuntimePolicyPlan | 函数 | 27–132 | 复杂 | 计划器、校验、源码改写、运行时策略 | 0 | 构建完整运行时策略计划：先核对源 commit、条目去重与 41/5 数量约束，再以关键词正则双向比对目录分类与实际命中文件，按 adapt 策略生成段落级或整文件改写 span，并补充 checker 闭包与不可用引用改写，任一错误即在触碰生成产物前整体抛错。 |
| buildRuntimePolicyReport | 函数 | 172–209 | 中等 | 报告生成、审计、markdown-渲染 | 0 | 生成 runtime-policy-report.md 审计报告：列出目录与 commit、计数、checker 闭包映射，并逐条给出 before/after SHA-256 与围栏原文，明确声明报告不是 Skill 指导。 |
| markRuntimePolicyAdapted | 函数 | 134–146 | 简单 | 计划器、回填、审计证据 | 1 | 在改写实际落地后回填对应适配记录：标记 adapted、登记输出路径并写入 after_text 与其 SHA-256。 |
| paragraphSpans | 函数 | 211–231 | 中等 | 源码改写、正则、区间计算 | 0 | 按空行切分源文件段落，跳过 frontmatter，仅保留命中主动触发正则的段落，合并相邻命中区间后为每段生成稳定编号的替换 span。 |
| serializableRuntimePolicyPlan | 函数 | 148–170 | 简单 | 序列化、计划器、报告数据 | 1 | 把含 span 与原文的计划裁剪为可 JSON 序列化的形态，去掉大段 before/after 正文并按 rewrite_id 排序输出。 |
| validateCheckerClosure | 函数 | 377–398 | 简单 | 校验、checker 闭包、安全边界 | 0 | 校验 checker 闭包中的每个上游脚本确实存在且是已审阅的 Python 文件，防止未审阅脚本进入生成产物。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [catalog.ts](catalog.ts.md) | src/arsu-converter/runtime-policy/catalog.ts | ARSU 上游运行时策略目录：把 41 个命中跨模型/模型分级关键词的源文件逐条判定为 adapt 或 retain，并记录 11 处未随包分发的上游运行时引用及其替换文本，同时给出禁止出现的 provider 凭证、endpoint 与 shell 请求模式。 |
| [fs-utils.ts](../fs-utils.ts.md) | src/arsu-converter/fs-utils.ts | 转换器共用的文件系统封装：存在性判断、递归文件列举、UTF-8 读写、JSON 写入、目录树删除与流式 SHA-256 哈希，把 Node fs 调用的错误语义收敛到一处。 |
| [types.ts](../types.ts.md) | src/arsu-converter/types.ts | ARSU 转换器共享的数据契约：清单、分组转换结果、风险发现、输出文件记录、验证结果与转换结果聚合类型，并定义携带 code 与 details 的 ArsuConverterError。 |
| [types.ts](types.ts.md) | src/arsu-converter/runtime-policy/types.ts | 运行时策略层的纯类型定义：目录条目、不可用引用、checker 闭包、改写 span、适配记录与可序列化计划形态，无运行时代码。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [arsu-runtime-policy.test.ts](../../../tests/arsu-runtime-policy.test.ts.md) | tests/arsu-runtime-policy.test.ts | 运行时策略测试：对 pinned vendor/ars 构建策略计划，断言 41 个分类条目、5 个 checker 闭包、固定的两处路径改写与 11 处不可用引用替换，并确认与 anchor 替换计划无区间重叠。 |
| [check.ts](check.ts.md) | src/arsu-converter/runtime-policy/check.ts | 可独立运行的 runtime-policy 自检入口，校验上游 checkout 后构建策略计划并以 JSON 输出分类/适配/保留计数与 checker 闭包数量，失败时打印聚合错误详情。 |
| [converter.ts](../converter.ts.md) | src/arsu-converter/converter.ts | ARSU 转换的编排中枢：校验上游 checkout、先规划锚点替换与运行时策略并检查重写冲突，再逐 Skill 分组生成文件、写出契约清单/路由目录/图 profile 注册表，最后两阶段写入报告与 manifest 并执行产物校验。 |
| [manifest.ts](../manifest.ts.md) | src/arsu-converter/manifest.ts | 转换产物的清单与报告层：汇总各 Skill 分组文件、根级投影文件与风险发现，生成 conversion-manifest.json、人类可读的转换报告和逐锚点的替换前后对照报告，并提供用于幂等比较的归一化。 |
| [replace.ts](../anchors/replace.ts.md) | src/arsu-converter/anchors/replace.ts | 锚点与运行时策略的联合替换执行器：把两类重写区间按逆序合并应用以保持偏移有效，为锚点替换包裹 rs 标记、保留原有行尾风格，并回写替换后指纹与输出路径。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| buildRuntimePolicyPlan | 函数 | 27–132 | 构建完整运行时策略计划：先核对源 commit、条目去重与 41/5 数量约束，再以关键词正则双向比对目录分类与实际命中文件，按 adapt 策略生成段落级或整文件改写 span，并补充 checker 闭包与不可用引用改写，任一错误即在触碰生成产物前整体抛错。 |
| buildRuntimePolicyReport | 函数 | 172–209 | 生成 runtime-policy-report.md 审计报告：列出目录与 commit、计数、checker 闭包映射，并逐条给出 before/after SHA-256 与围栏原文，明确声明报告不是 Skill 指导。 |
| markRuntimePolicyAdapted | 函数 | 134–146 | 在改写实际落地后回填对应适配记录：标记 adapted、登记输出路径并写入 after_text 与其 SHA-256。 |
| serializableRuntimePolicyPlan | 函数 | 148–170 | 把含 span 与原文的计划裁剪为可 JSON 序列化的形态，去掉大段 before/after 正文并按 rewrite_id 排序输出。 |
