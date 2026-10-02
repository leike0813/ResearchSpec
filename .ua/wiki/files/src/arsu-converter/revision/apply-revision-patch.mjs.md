
# src/arsu-converter/revision/apply-revision-patch.mjs
所属分层：[ARSU 转换与 Skill 生成层](../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/revision](../../../../modules/src/arsu-converter/revision.md)
<!-- node: file:src/arsu-converter/revision/apply-revision-patch.mjs -->

独立修订补丁应用器：校验补丁与授权上下文、检查标注块锚点与映射，在全部前置条件通过后原子生成修订稿与处理报告。
源码：[src/arsu-converter/revision/apply-revision-patch.mjs](../../../../../../src/arsu-converter/revision/apply-revision-patch.mjs)

## 符号（9）
<!-- node: function:src/arsu-converter/revision/apply-revision-patch.mjs:applyRevisionPatch -->
<!-- node: function:src/arsu-converter/revision/apply-revision-patch.mjs:atomicCreate -->
<!-- node: function:src/arsu-converter/revision/apply-revision-patch.mjs:parseAnchoredBlocks -->
<!-- node: function:src/arsu-converter/revision/apply-revision-patch.mjs:parseArguments -->
<!-- node: function:src/arsu-converter/revision/apply-revision-patch.mjs:splitMarkdownBlocks -->
<!-- node: function:src/arsu-converter/revision/apply-revision-patch.mjs:standaloneBlockMarkers -->
<!-- node: function:src/arsu-converter/revision/apply-revision-patch.mjs:validateClaimStrengthChanges -->
<!-- node: function:src/arsu-converter/revision/apply-revision-patch.mjs:validateMapping -->
<!-- node: function:src/arsu-converter/revision/apply-revision-patch.mjs:validatePatch -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| applyRevisionPatch | 函数 | 60–114 | 复杂 | revision、patch、apply、核心流程 | 0 | 补丁应用主流程：先跑预检，再逐个定位并替换标注块，最后汇总摘要与统计信息。 |
| atomicCreate | 函数 | 239–260 | 简单 | atomic-write、filesystem、revision、安全 | 0 | 用硬链接加原子创建的方式写出修订稿与报告，保证目标已存在时失败而不覆盖。 |
| parseAnchoredBlocks | 函数 | 262–276 | 简单 | markdown、anchor、parse、revision | 0 | 按锚点标记切分 Markdown 中可修订的块，返回块 ID、范围与原文。 |
| parseArguments | 函数 | 225–237 | 简单 | cli、argument-parsing、路径解析 | 0 | 解析 --base/--patch/--output/--report 四个必需参数并解析为绝对路径。 |
| splitMarkdownBlocks | 函数 | 310–328 | 简单 | markdown、parse、block、解析 | 0 | 把 Markdown 正文切分为标题块，保留前言与 frontmatter 的位置语义。 |
| standaloneBlockMarkers | 函数 | 278–308 | 中等 | markdown、marker、fence、解析 | 0 | 识别可独立替换的块标记组合，处理围栏代码块和标题层级避免误切分。 |
| validateClaimStrengthChanges | 函数 | 158–189 | 中等 | validation、authorization、claim-strength、安全 | 0 | 校验 claim strength 变更：必须由授权上下文明确批准，否则以诊断项拒绝整份补丁。 |
| validateMapping | 函数 | 191–223 | 中等 | validation、mapping、anchor、修订 | 0 | 校验标注映射引用的块 ID、锚点与目标确实存在于基线文本中。 |
| validatePatch | 函数 | 116–156 | 中等 | validation、revision、patch、schema | 0 | 校验补丁结构：拒绝未知键、重复路径和缺失授权字段，保证补丁是封闭契约。 |
