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
| `route:<skill-id>:<mode>` | 启动前预览 route |
| `subflow:<instance-id>` | 查看或推进一个 subflow |
| `gate:<instance-id>/<gate-id>` | 查看或决定 formal Gate |
| `decision:<instance-id>/<decision-id>` | 查看或记录 local Decision |
| `change:<change-id>` | 查看或决定 project change |
| `handoff:<instance-id>` | 查看 subflow handoff |

当多个对象可能匹配时，不能根据目录名、相似文件名或“最近一个”推断 selector。读命令不修改
workspace；mutation command 只更新所选 owning file。
