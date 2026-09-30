# 实施验证

验证日期：2026-09-30。环境：Linux、Node v24.12.0、项目已安装的 pnpm/TypeScript/ESLint；Python 使用 `uv run --project="$HOME/.ar" --locked -- python`。浏览器为 Playwright 管理的 Chromium，通过 `file://` 打开生产准备件，没有启动开发服务。

## 页面设计复核与修正

首次生产页被用户拒绝：主栏使用通用字段表格，预览替换了 #14 已批准的案例，因此先前功能验证不能证明设计验收通过。任务 7.3 继续未勾选。

生产模板现复用原型样式与 B 台账结构：左侧按审稿人分组的整卡目录、四个编号阶段与阅读引导、中间分阶段核心内容、右侧「当前意见与稿件」和「我的反馈」。完整表格、文档、日志与补材放在展开区域；意见来源、所有稿件位置及独立反馈仍保留。预览数据恢复城市绿地与睡眠原案：3 份英文意见、6 threads、5 atomic items、6 处稿件、6 plans、3 logs、6 replies；A-02 为执行焦点，策略交接缺材，第二轮交接已补材。中文业务说明与英文材料分别沿用原型语言。

修正后再次从真实 SQLite 经生产准备 API 生成四阶段 HTML，实际浏览器检查无 pageerror：点选 R1-01 的不同片段分别定位 A-01/A-02；关联跳转、调整建议恢复、筛选保留反馈、独立焦点请求、round seen 与两次完整导出可用。390px 页面没有横向溢出。实际下载 `/tmp/rm-redesign-{coverage,strategy,round}-result.json` 与 `/tmp/rm-redesign-round-result2.json` 均对照独立留存快照通过 `validateRevisionMasterResult`；没有自动确认。

最终补验：1440、780、390px 页面均无横向溢出；键盘 Enter 可激活关联条目，展开的修订事项目录切换后保持展开。核心建议输入直接保存并可刷新恢复。`/tmp/rm-redesign-confirm-result.json` 的覆盖确认包含全部 18 个目标；添加文本批注后确认撤回，`/tmp/rm-redesign-anchor-result.json` 校验通过。通过真实准备 API 生成的独立长稿样例有 250 章、213391 字符、500 区块；第 200 章显示两块，反馈输入后的正文 DOM mutation 为 0。

第二轮实际下载 `/tmp/rm-redesign-round-final-result.json`，在只复制该任务 12 份已捕获源文件与数据库的 `/tmp/rm-redesign-round-accept-QP74ck` 中核对，包内接收工具返回 seen 已记录且 `semantic:false`，没有执行语义写入或正式确认。此复核与前面的参数化语义写入闭环分别验证结果交回和正式权威边界。

## 首次功能验证记录

`pnpm dev:review-workspace --no-open` 从 schema 初始化的任务 SQLite 和实际源稿调用 `prepareRevisionMasterReview`，生成四份生产 HTML 和独立留存快照。入口为 `.harness-dist/review-workspace/revision-master-{coverage,board,strategy,round}.html`；通用 v2 固定样例仍同时生成。

- 四阶段直接打开；覆盖/board/strategy 显式确认导出，round 仅导出 seen。空反馈导出没有确认。所有浏览器导出通过 `validateRevisionMasterResult` 对照各自留存件验证。
- A-01 同时来自 R-01/R-02，R-01 同时映射 A-01/A-02；实际操作双向关联跳转。A-02 缺材可浏览，A-03 未定位时显示限制并可进入完整文档目录。审稿人/搜索筛选保留反馈；覆盖确认成员保持完整集合。
- A-02 对象批注与独立 A-01 策略确认并存；A-01 文本选区批注使其自身确认保持 pending。共享 thread、整体请求及显式依赖闭包按其影响范围阻断确认，由契约与接收端回归用例验证。
- 选区、区块和对象批注、焦点请求、草稿恢复、多次完整导出验证；浏览其他对象仍显示 A-01 执行焦点。注释保留稳定 feedback 身份，结果有独立 result 身份。
- 实际修改前后摘要有可靠配对并标出变化；日志前后原文无配对时分别保留并提示限制；thread 回复、文件状态、缺材和待正式确认信息可查看。
- 1400×1000、780×844、390×844 三种窗口检查；后两者页面宽度与窗口相等。Tab 从搜索进入审稿人筛选，Enter 激活意见并聚焦对象标题。
- 长稿追加 250 个章节，每章 40 句，目录共有 254 项。进入第 200 项仅显示当前两个区块，批注输入后仍是两个区块；相关片段显示 7 块，不铺开整稿。覆盖原文只投影当前选中的来源文档。
- 注入 `</script><script>…`、HTML 事件属性未执行；`$&`、前后替换符等正文由回归测试验证嵌入后逐值一致。纯文本及无扩展名冻结附件可从目录读取。
- 注入 localStorage 保存故障后，页面显示恢复限制且仍可下载 seen 结果；新浏览器不共用草稿，新快照独立。

## 浏览器结果接收闭环

浏览器实际下载 `/tmp/rm-final-strategy.json`，在复制的任务目录 `/tmp/revision-master-browser-accept-oBImEp` 对照独立 `reviews/<workspace_id>/workspace.json` 验证。Agent 提供参数化回调执行 `recipe_stage5_confirm_strategy`，与成功 receipt 共用一个 SQLite 事务；回调只更新任务语义表和 resume。

第一次接收返回 `applied`，A-01 的 `user_strategy_confirmed=yes`；同一反馈再次接收返回 `already_applied`，没有重复写入。随后运行包内 `scripts/gate_and_render_workspace.py`，退出 0 并生成 19 份 Markdown。夹具刻意保留缺材和未完稿，返回 `issues_found`；这证明视图反映实际语义，不能据此声称任务或正式关口完成。机器证据保存在 `/tmp/rm-browser-accept-evidence.json`。

包内集成测试另外覆盖真实 `workspace_db` 初始化、coverage/board/strategy 参数化语义修改、下游确认重审与独立确认保留、真实修改日志接收、故障回滚、范围漂移、重复/改动/删除、多浏览器分歧、pending/conflict 在新投影保留。新增参数化中断用例分别模拟稿件或日志已落盘但 receipt 缺失：旧 round 基线报告 changed，accept 保持 pending 且不调用写入回调，实际稿件/日志保留；新快照继续携带未处理反馈，旧结果不能换用新留存件。runtime 整文件 12/12 通过。物理稿件编辑不由 SQLite 事务覆盖，实际效果核对仍归 Agent。

页面没有 Gate/Decision 写入口；准备/检查的前后数据库和稿件字节比较、缺表/字段、只读数据库与越界/错上下文由 runtime 测试验证。接收工具没有 graph 文件写入路径。

## 最终检查与人工验收

最终检查全部通过：`pnpm build`、`pnpm check`、`pnpm lint`；`UV_CACHE_DIR=/tmp/researchspec-uv-cache pnpm test` 为 412/412；`node scripts/verify-package.mjs` 验证安装包（5633 文件）；`node scripts/generate-docs.mjs --check`、OpenSpec strict、whitespace 和 `git diff --check`。revision-master 与 ARSU 的 artifacts/records/baseline/check 已更新；重复 author 后两套 check 仍 OK，证明生成字节一致；paper-humanizer check 保持 OK。提取索引及上游正文保持不变；生成 schema/YAML/Jinja 仅剥离说明头，原有 whitespace 例外按上游正文 hash 同步。

任务 7.3 要求“生产页经用户复核后才标记完成”。上述自动浏览器操作已完成，人工复核仍待用户实际打开准备件后给出结论；该任务保持未勾选。
