
# resolveSelection
<!-- node: function:scripts/dogfood/lib.mjs:resolveSelection -->

把 CLI 参数、配置与场景目录解析为冻结选择：拒绝多宿主旧用法，校验行为宿主、适配器、模型、场景、验收人与各类并发/超时边界。
类型：函数  
复杂度：复杂  
入边数：1  
标签：validation、configuration、policy  
所属文件：[scripts/dogfood/lib.mjs](../../../../files/scripts/dogfood/lib.mjs.md)
源码：[scripts/dogfood/lib.mjs:119](../../../../../../scripts/dogfood/lib.mjs#L119)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [dogfood.mjs](../../../../files/scripts/dogfood.mjs.md) | scripts/dogfood.mjs:— | 维护者 dogfooding campaign 的协调器 CLI：按 plan/run/resume/retry/assess/serve/import-review/report/legacy-import 分发子命令，负责冻结场景目录与构建哈希、预检 bwrap 与宿主二进制、经 Orca 终端派发行为与验收 worker、并维护 campaign 锁与并发队列。 |

## 调用

该符号没有记录对外调用。
