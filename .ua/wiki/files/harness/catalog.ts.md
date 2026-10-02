
# harness/catalog.ts
所属分层：[维护工具链与工程基础设施](../../layers/tooling.md)  
所属目录：[harness](../../modules/harness.md)
<!-- node: file:harness/catalog.ts -->

维护者 dogfooding harness 的目录装载器：把 Navigate 入口、ARSU/Companion/核心能力/插件 Procedure、文献 Adapter Skill 与领域分类聚合成一个带诊断的 harness 目录，并维护每个 Skill 的文件清单与文件树。
源码：[harness/catalog.ts](../../../../harness/catalog.ts)

## 符号（10）
<!-- node: function:harness/catalog.ts:buildHarnessFileTree -->
<!-- node: function:harness/catalog.ts:finalizeFileTree -->
<!-- node: function:harness/catalog.ts:loadDomains -->
<!-- node: function:harness/catalog.ts:loadHarnessCatalog -->
<!-- node: function:harness/catalog.ts:loadLiteratureAdapters -->
<!-- node: function:harness/catalog.ts:loadNavigate -->
<!-- node: function:harness/catalog.ts:loadProcedures -->
<!-- node: function:harness/catalog.ts:metadataFor -->
<!-- node: function:harness/catalog.ts:readHarnessFile -->
<!-- node: function:harness/catalog.ts:validateHarnessSkillRoot -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| buildHarnessFileTree | 函数 | 405–430 | 中等 | harness、data-transform、tree、serialization | 0 | 将扁平的 Skill 文件清单折叠为目录与文件节点组成的树形结构，供 harness 前端渲染文件浏览视图。 |
| finalizeFileTree | 函数 | 432–443 | 简单 | harness、data-transform、normalization | 0 | 对文件树做收尾处理，统一节点顺序与元数据，使返回的树结构保持确定性输出。 |
| loadDomains | 函数 | 323–361 | 中等 | harness、domains、registry、taxonomy | 1 | 装配来源中立的领域目录，解析每个领域的直接与递归 Procedure 归属并标记其是否可用。 |
| loadHarnessCatalog | 函数 | 139–177 | 中等 | harness、entry-point、catalog、aggregation | 1 | 从仓库根目录装载完整 harness 目录，串联入口、Procedure、文献 Adapter 与领域加载，并按 ID 排序输出统计摘要、诊断与文件来源映射。 |
| loadLiteratureAdapters | 函数 | 179–226 | 中等 | harness、literature-adapter、loading、error-handling | 1 | 遍历文献 Adapter 目录，把每个已选 Adapter 的 Skill 包读成 visible-entry 记录并登记磁盘文件来源，读取失败时降级为诊断信息。 |
| loadNavigate | 函数 | 298–321 | 简单 | harness、navigate、rendering、visible-entry | 1 | 把渲染后的 Navigate 入口登记为唯一的 visible-entry Skill，其文件内容来自 Companion 渲染结果而非磁盘。 |
| loadProcedures | 函数 | 249–296 | 中等 | harness、procedures、loading、registry | 1 | 从 Procedure 目录读取所有隐藏 Procedure，区分 ARSU、Companion、核心能力与插件四类族并展开其包内文件清单。 |
| metadataFor | 函数 | 445–454 | 简单 | harness、mime、utility、metadata | 0 | 按扩展名与 MIME 表为单个文件生成 harness 元数据，区分 markdown、文本、图片与二进制四类。 |
| readHarnessFile | 函数 | 228–243 | 简单 | harness、io、validation、security | 1 | 按 Skill ID 与相对路径读取 harness 目录中的文件内容，先校验 Skill 根路径合法性再区分磁盘与虚拟来源返回字节。 |
| validateHarnessSkillRoot | 函数 | 245–247 | 简单 | validation、harness、security | 0 | 校验 Skill 根路径格式合法，是 harness 读取任意 Skill 目录文件前的入口门禁。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [assembler.ts](../src/plugins/assembler.ts.md) | src/plugins/assembler.ts | 中央插件注册表装配器：读取领域目录与 ANZSRC 2020 分类快照，合并 vendor-bundles 下的各 vendor bundle，校验后原子写出 registry.json。 |
| [catalog.ts](../src/literature-adapters/catalog.ts.md) | src/literature-adapters/catalog.ts | 文献 Adapter 的安装 SSOT：声明 zotero-library Adapter 及其七个文献 Skill 的角色、可见性、能力与权限边界，并提供目录查询与工作区选择表达式解析。 |
| [catalog.ts](../src/procedures/catalog.ts.md) | src/procedures/catalog.ts | 运行时派生的 Procedure 目录：合并 ARSU 路由、Companion 工作流、核心能力与插件扩展，产出可检索、可渐进披露的过程卡片集合。 |
| [converter.ts](../src/arsu-converter/converter.ts.md) | src/arsu-converter/converter.ts | ARSU 转换的编排中枢：校验上游 checkout、先规划锚点替换与运行时策略并检查重写冲突，再逐 Skill 分组生成文件、写出契约清单/路由目录/图 profile 注册表，最后两阶段写入报告与 manifest 并执行产物校验。 |
| [index.ts](../src/adapters/companion/index.ts.md) | src/adapters/companion/index.ts | Companion 适配层的 barrel 入口，汇总四个 Companion 工作流意图与两个 Skill 渲染函数供上层直接引用。 |
| [licensing.ts](../src/licensing.ts.md) | src/licensing.ts | 提供项目版权声明与 MIT 许可证正文的单一来源，供各 Skill 包在渲染 LICENSE 文件时引用。 |
| [registry.ts](../src/plugins/registry.ts.md) | src/plugins/registry.ts | 插件注册表的加载与校验入口：解析域分类、vendor 定义与插件清单，收集每个 Skill 的文件哈希，并检测 Skill 硬依赖环。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [server.ts](server.ts.md) | harness/server.ts | 只读的本地 Node HTTP 服务，把 harness 目录以 JSON API 与 Markdown 预览形式提供给浏览器，并附带严格的安全响应头。 |
| [skill-harness.test.ts](../tests/skill-harness.test.ts.md) | tests/skill-harness.test.ts | Skill harness 端到端测试：校验可见入口与隐藏 Procedure 的分离、目录诊断、文件树结构、路径越界防护以及只读 HTTP 服务的响应。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| buildHarnessFileTree | 函数 | 405–430 | 将扁平的 Skill 文件清单折叠为目录与文件节点组成的树形结构，供 harness 前端渲染文件浏览视图。 |
| loadHarnessCatalog | 函数 | 139–177 | 从仓库根目录装载完整 harness 目录，串联入口、Procedure、文献 Adapter 与领域加载，并按 ID 排序输出统计摘要、诊断与文件来源映射。 |
| readHarnessFile | 函数 | 228–243 | 按 Skill ID 与相对路径读取 harness 目录中的文件内容，先校验 Skill 根路径合法性再区分磁盘与虚拟来源返回字节。 |
| validateHarnessSkillRoot | 函数 | 245–247 | 校验 Skill 根路径格式合法，是 harness 读取任意 Skill 目录文件前的入口门禁。 |
