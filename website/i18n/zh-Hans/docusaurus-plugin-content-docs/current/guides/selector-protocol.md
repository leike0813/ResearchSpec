---
sidebar_position: 5
title: Selector 协议
description: 使用稳定 selector 定位 current ResearchSpec owner
---

# Selector 协议

先运行 `researchspec status --json` 获取精确 machine ID，再运行
`researchspec instructions <selector> --json`。

| Selector | 用途 |
| --- | --- |
| `profile:<profile-id>` | 查看 graph profile 或启动已确认的根 run |
| `run:<run-id>` | 查看 frozen graph run 或 handoff |
| `node:<run-id>/<node-id>[@round]` | 查看、启动 bound child 或推进节点 |
| `gate:<run-id>/<gate-id>[@round]` | 查看或决定 formal Gate |
| `decision:<run-id>/<decision-id>[@round]` | 查看或记录 graph Decision |
| `change:<change-id>` | 查看或决定 project change |

当多个对象可能匹配时，不能根据目录名、相似文件名或“最近一个”推断 selector。读命令不修改
workspace；mutation command 只更新所选 owning file。
