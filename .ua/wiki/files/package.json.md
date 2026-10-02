
# package.json
所属分层：[维护工具链与工程基础设施](../layers/tooling.md)  
所属目录：[.](../modules/index.md)
<!-- node: config:package.json -->

npm 包清单：声明 ESM 包、researchspec bin 入口、两个子路径导出（annotation-intake、review-workspace）、发布文件白名单（dist、skills、LICENSES、docs 等）以及约 90 条脚本，覆盖 build/test/lint、ARSU 与各 vendor 转换器的 convert/check/idempotence 及 maintenance 锚点命令。
源码：[package.json](../../../package.json)

## 依赖

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [AGPL-3.0.txt](LICENSES/AGPL-3.0.txt.md) | LICENSES/AGPL-3.0.txt | GNU Affero General Public License v3 全文（661 行），用于固定的 Zotero 适配器包：其网络服务场景的源码公开条款决定了该包不能按 MIT 或 CC 处理。 |
| [Apache-2.0.txt](LICENSES/Apache-2.0.txt.md) | LICENSES/Apache-2.0.txt | Apache License 2.0 全文（202 行），覆盖以 Apache-2.0 授权分发的生成 Skill（如 Scientific Agent Skills 资源副本），其专利授权与 NOTICE 保留要求需要逐包署名。 |
| [CC-BY-NC-4.0.txt](LICENSES/CC-BY-NC-4.0.txt.md) | LICENSES/CC-BY-NC-4.0.txt | ARSU 衍生材料的许可声明短文件：指向 CC BY-NC 4.0 完整法律文本，标注上游 ARS 版权（Copyright (c) 2026 Cheng-I Wu）与仓库地址，并说明逐字许可副本保存在 vendor/ars/LICENSE 及各 Skill 目录生成的 LICENSE 中。 |
| [CC-BY-SA-4.0.txt](LICENSES/CC-BY-SA-4.0.txt.md) | LICENSES/CC-BY-SA-4.0.txt | Education Agent Skills 域资产的许可说明：署名 Gareth Manning，允许分享与改编（含商业用途），但要求署名、相同方式共享且不得附加额外限制，并给出完整许可文本链接。 |
| [MIT.txt](LICENSES/MIT.txt.md) | LICENSES/MIT.txt | ResearchSpec 原创框架与 Companion 材料的 MIT 许可全文，版权归 ResearchSpec contributors，要求在副本中保留版权与许可声明。 |

## 配置

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [bin.ts](src/cli/bin.ts.md) | src/cli/bin.ts | CLI 可执行入口，调用 main 并把结果退出码写入 process.exitCode。 |
| [clean-output.mjs](scripts/clean-output.mjs.md) | scripts/clean-output.mjs | 构建产物清理脚本，只接受 dist 与 .test-dist 两个顶层目录名，拒绝任何其他路径后递归删除。 |
| [cli.ts](src/arsu-converter/cli.ts.md) | src/arsu-converter/cli.ts | ARSU 转换器的开发者命令行入口，提供 convert、check、idempotence 三个子命令与 --force/--dry-run/--json 选项，并显式拒绝 --source 以固定上游来源为 vendor/ars。 |
| [command-catalog.ts](src/cli/command-catalog.ts.md) | src/cli/command-catalog.ts | CLI 命令目录 SSOT：声明 16 个顶层命令与 5 个 plugin 子命令的语法、分组、工作区要求、读写影响与选项，并据此注册 Commander 命令与帮助文本。 |
| [generate-docs.mjs](scripts/generate-docs.mjs.md) | scripts/generate-docs.mjs | 文档生成入口：先断言 CLI 恰好暴露 16 个顶层命令，再从类型化目录渲染 CLI 手册、Agent 入口矩阵、website 命令页与侧边栏，支持 --check 只校验。 |
