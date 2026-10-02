
# tests/helpers/cli.ts
所属分层：[测试与验收夹具层](../../../layers/tests.md)  
所属目录：[tests/helpers](../../../modules/tests/helpers.md)
<!-- node: file:tests/helpers/cli.ts -->

CLI 测试夹具：用 spawnSync 运行编译产物、解析 envelope 响应，并创建与清理临时项目目录。
源码：[tests/helpers/cli.ts](../../../../../tests/helpers/cli.ts)

## 符号（2）
<!-- node: function:tests/helpers/cli.ts:parseEnvelope -->
<!-- node: function:tests/helpers/cli.ts:runCli -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| parseEnvelope | 函数 | 33–35 | 简单 | test、cli、helper、parsing | 0 | 把 CLI 标准输出解析为统一响应 envelope 结构。 |
| runCli | 函数 | 28–31 | 简单 | test、cli、helper | 0 | 以给定参数、工作目录和环境同步执行编译后的 CLI，返回退出码与标准输出。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [adapters.test.ts](../adapters.test.ts.md) | tests/adapters.test.ts | 验证 36 个工具与 28 个命令包装器的注册表完整性、每工具路径约定、Companion 四个自包含 Skill 的渲染，以及 Navigate 单一入口在各交付模式下的投影。 |
| [education-agent-skills-audit.test.ts](../education-agent-skills-audit.test.ts.md) | tests/education-agent-skills-audit.test.ts | 锁定 Education Agent Skills 的干净快照身份，校验 241 个跟踪文件清点、frontmatter 解析、证据与许可及关系 schema 的未决状态，以及由 JSON 确定性派生的审计报告。 |
| [education-agent-skills-evidence.test.ts](../education-agent-skills-evidence.test.ts.md) | tests/education-agent-skills-evidence.test.ts | 证据映射契约测试：断言 872 条声明与 165 个 Skill 的覆盖、审计哈希绑定、存在性分布、scholar 发现结果，以及 JSON/报告的确定性渲染与 CLI check 退出码。 |
| [education-agent-skills-extensions.test.ts](../education-agent-skills-extensions.test.ts.md) | tests/education-agent-skills-extensions.test.ts | 校验 Education Agent Skills 扩展注册表与域分配的完整性，并让代表性扩展 profile 跑通图引擎。 |
| [graph-cli-main.test.ts](../graph-cli-main.test.ts.md) | tests/graph-cli-main.test.ts | 端到端验证编译后 CLI 的 init 与 update 行为、schema 2 拒绝 schema 1、handoff 消费、工具选择要求，以及 doctor 的只读入口诊断。 |
| [graph-cli-static.test.ts](../graph-cli-static.test.ts.md) | tests/graph-cli-static.test.ts | 静态断言 CLI 仍暴露全部 16 个公开命令，并校验 help 目标解析不被裁剪。 |
| [graph-context-cli.test.ts](../graph-context-cli.test.ts.md) | tests/graph-context-cli.test.ts | 覆盖 graph list 与 show、procedure 的全局发现与工作区激活、instructions 的有界契约、游标稳定性、插件安装确认、propose/decide/archive 变更流程以及 pack 与 handoff 输出。 |
| [graph-security.test.ts](../graph-security.test.ts.md) | tests/graph-security.test.ts | 验证安全边界：非法项目路径与符号链接组件被拒绝，无效安装清单在任何读取前阻断全部投影写操作，符号链接父目录下的投影不改动目标。 |
| [literature-adapters.test.ts](../literature-adapters.test.ts.md) | tests/literature-adapters.test.ts | 验证 Zotero 目录的发布集与运行组件绑定、适配器表达式与平台规范化的精确行为，以及未选适配器零交付、选定运行时的降级投影策略。 |
| [manuscript-annotation.test.ts](../manuscript-annotation.test.ts.md) | tests/manuscript-annotation.test.ts | 修订补丁与批注来源的端到端测试：补丁应用、过期哈希与不完整映射的失败路径、QMD 围栏保持、独立 helper 的原子输出与来源边界校验。 |
| [plugin-extensions.test.ts](../plugin-extensions.test.ts.md) | tests/plugin-extensions.test.ts | 校验插件扩展注册表全量加载、各 vendor 扩展 profile 跑通图引擎、脚本校验型能力在 advance 中执行，以及 plugin show 暴露的扩展计数。 |
| [quarto-delivery.test.ts](../quarto-delivery.test.ts.md) | tests/quarto-delivery.test.ts | 验证 Quarto 探测的可用/不可用/未知三态、单文件渲染默认不执行命令，以及执行同意、既有目标与渲染失败时的 fail-closed 行为。 |
| [scientific-agent-skills-extensions.test.ts](../scientific-agent-skills-extensions.test.ts.md) | tests/scientific-agent-skills-extensions.test.ts | 校验 Scientific Agent Skills 扩展注册表与域分配的完整性，并让代表性扩展 profile 跑通图引擎。 |
| [skill-harness.test.ts](../skill-harness.test.ts.md) | tests/skill-harness.test.ts | Skill harness 端到端测试：校验可见入口与隐藏 Procedure 的分离、目录诊断、文件树结构、路径越界防护以及只读 HTTP 服务的响应。 |
| [tooluniverse-extensions.test.ts](../tooluniverse-extensions.test.ts.md) | tests/tooluniverse-extensions.test.ts | 校验 ToolUniverse 扩展注册表与三十个域分配的完整性，并让代表性扩展 profile 跑通图引擎。 |
| [write-plan.test.ts](../write-plan.test.ts.md) | tests/write-plan.test.ts | 验证 write-plan 的核心不变量：计划后目标被改动即拒绝、用户所有权文件受保护、漂移跳过、符号链接与文件模式处理，以及执行失败后的回滚一致性。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| parseEnvelope | 函数 | 33–35 | 把 CLI 标准输出解析为统一响应 envelope 结构。 |
| runCli | 函数 | 28–31 | 以给定参数、工作目录和环境同步执行编译后的 CLI，返回退出码与标准输出。 |
