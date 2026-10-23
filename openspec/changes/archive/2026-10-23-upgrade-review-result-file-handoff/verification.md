# 验证记录

日期：2026-10-23。Change：`upgrade-review-result-file-handoff`。

## 交付

- `src/review-workspace/session.ts`：两协议共用的环回接收服务、原契约校验、受限输出、完整历史、原子当前文件、幂等重试、保留端口和可取消等待。内部提交回执与完整历史分开保存，重试已完成的旧提交不替换当前结果。
- `session-cli.ts` 与模块出口：安装包内 Node 启动工具，输出 ready/saved 事件；`instructions.ts` 返回实际存在的启动入口。未增加 ResearchSpec 顶层命令。
- 两套生产 HTML：会话提交与备用下载分开，失败保留草稿与待重试结果；取消选区隐藏工具，工具的指针及键盘激活保留有效锚点。
- Node/Chrome 测试和 CI：覆盖接收、并发、拒绝非法请求、磁盘失败、端口恢复、等待与 Node 入口。Linux CI 要求实际 Chrome 验收，其他环境缺浏览器时明确跳过。
- Navigate、五份 Procedure 源文档、用户/开发者指南与 AGENTS：同步固定结果路径、独立历史校验、可选等待和语义/正式确认边界。
- capability 包、manifest/registry 和三个维护锚点：通过既有作者生成器与维护命令同步。两份 intake/analysis 的生成 SKILL 仅对齐生成器空白；上游、extraction、ARS 38 包、graph profile 和旧 v1 页面无改动。

## 实际验证

| 验证 | 结果 |
|---|---|
| `UV_CACHE_DIR=/tmp/researchspec-uv-cache pnpm test` | 598/598 通过，零失败、跳过或取消；日志 `/tmp/researchspec-review-tests.log` |
| 最终接收与浏览器聚焦测试 | 11/11 通过，含全量测试后补充的 Node CLI 启动/通知/退出验证 |
| `node review-workspace/index.check.mjs` | 契约与真实 Chrome 导入、选择取消、重新批注通过 |
| `pnpm check`、`pnpm lint`、新增文件最终 focused eslint | 通过 |
| `pnpm whitespace:check`、`git diff --check` | 通过 |
| own-vendor 重复 authoring | 九包和 registry 字节一致；摘要 `2f3eafafab41ed3a75b35c1844d92b9a7812e42d547ea8e0c9b23c7d841835af` |
| capability parity | 65/65 operational，低覆盖、缺失输出/知识和流程权威保留告警均为空 |
| 两个 own-vendor 与当前 ARSU 锚点 `check` | 全部 OK |
| ARSU converter `check` / `idempotence` | 通过 |
| `pnpm release:verify` | 安装包验证通过，6663 个文件；新 API 可导入且 Node 入口已打包；日志 `/tmp/researchspec-review-package.log` |
| `openspec validate upgrade-review-result-file-handoff --strict --no-interactive` | 通过 |

真实浏览器检查禁用了下载 API 和 localStorage 写入：两页仍能提交；模拟首次提交失败后重试成功，固定结果和一份完整历史可由原校验器读取。检查同时覆盖取消选区、Escape、重新选择以及键盘聚焦时的批注激活。

首次检查暴露修订页 Escape 的异步选区恢复问题与旧探针的批注干扰；前者通过清除实际浏览器选区修复，后者将新行为移入独立探针。生成前的包字节检查失败已通过重新生成消除。最终均通过。

## 限制

未操作 Orca 的嵌入式浏览器。已使用本机真实 Chrome 验证无下载的生产页面路径；浏览器仍需能访问 Agent 主机的本地服务。等待通知限当前服务生命周期，重启后旧结果直接读取保留文件。浏览器本地草稿不做服务端同步。

未执行网站构建、模型调用、上游工具运行或全局安装。未提交代码，未同步主规格或归档 change。
