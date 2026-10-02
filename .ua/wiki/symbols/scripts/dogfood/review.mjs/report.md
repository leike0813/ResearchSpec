
# report
<!-- node: function:scripts/dogfood/review.mjs:report -->

生成 campaign Markdown 报告，并在 init 矩阵全通过时把脱敏后的证据、评估与清单发布到 playbook 并更新 host-verification.md。
类型：函数  
复杂度：复杂  
入边数：1  
标签：reporting、evidence-publishing、redaction  
所属文件：[scripts/dogfood/review.mjs](../../../../files/scripts/dogfood/review.mjs.md)
源码：[scripts/dogfood/review.mjs:80](../../../../../../scripts/dogfood/review.mjs#L80)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [main](../../../../files/scripts/dogfood.mjs.md) | scripts/dogfood.mjs:240–326 | 按子命令分发 plan/run/serve/resume/retry/import-review/assess/report/legacy-import，并在运行前校验 schema、目录哈希与构建哈希。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [buildHash](../../../../files/scripts/dogfood/lib.mjs.md) | scripts/dogfood/lib.mjs:103–118 | 对 dist、skills、literature-adapters、review-workspace、harness 静态产物与基准等目录做确定性遍历哈希，冻结 campaign 依赖的构建内容。 |
