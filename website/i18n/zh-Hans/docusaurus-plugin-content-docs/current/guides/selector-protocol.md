---
sidebar_position: 5
title: Selector 协议
description: 用稳定 selector 定位 Procedure、profile、run、node 和 change
---

# Selector 协议

先用 `researchspec status --json` 获取精确 machine ID，再用 `researchspec instructions <selector> --json` 查看该对象的动作契约。

## `show` 支持的 selector

`researchspec show <selector>` 精确查看一个对象：

| Selector | 对象 |
| --- | --- |
| `procedure:<procedure-id>` | Procedure 卡片 |
| `profile:<profile-id>` | Graph profile |
| `run:<run-id>` | Frozen graph run |
| `node:<run-id>/<node-id>[@round]` | Node instance |
| `change:<change-id>` | Project change |

`show` 不接受 stable spec、tool、Gate 或 Decision selector。

## `instructions` selector

支持 `procedure:<id>`、`profile:<id>`、`run:<id>`、`node:<run>/<node>[@round]`、`gate:<run>/<gate>[@round]`、`decision:<run>/<decision>[@round]` 和 `change:<id>`。

Stable spec 和 tool 有自己的检查 selector，例如 `spec:project`、`spec:sources`、`spec:claims`、`spec:manuscript` 和 `tool:<tool-id>`，供 `list`、`check` 等检查命令使用，不属于 `show`。

`handoff` 接受 `run:<run-id>`。多个对象可能匹配时，不要根据目录名、相似文件名或最新时间推断 selector。读取命令不修改项目文件；mutation command 会校验所选 owner 的语义输入。
