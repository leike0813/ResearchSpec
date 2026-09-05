# Codex Dogfooding Adapter

本文件只描述 Codex 的安装、隔离、会话和取证差异。场景、提示、断言与评分以 [`../README.md`](../README.md) 和 [`../scenarios.yaml`](../scenarios.yaml) 为准。

## 准备本地 CLI

在 ResearchSpec 仓库执行：

```bash
pnpm build
npm link
researchspec --version
```

`npm link` 只用于本机验证。源码变化后重新执行 `pnpm build`。

## 隔离 Codex 投影

Codex 的项目级 Skills 写入研究项目的 `.agents/skills/`；ResearchSpec 不生成全局 custom prompts。
研究项目与 Codex 运行时都必须隔离：

```bash
mkdir -p ~/researchspec-dogfood
cd ~/researchspec-dogfood
export CODEX_HOME="$PWD/.codex-home"
researchspec init . --tools codex --literature-adapters zotero-library
researchspec check all --strict
```

不得把临时 `CODEX_HOME` 指向日常使用的 `~/.codex`，也不得用 `--force` 处理无法确认所有权的漂移文件。

初始化后检查交付面：

```bash
find .agents/skills -mindepth 1 -maxdepth 1 -type d -printf '%f\n' | sort
researchspec list tools
researchspec status --json
```

应发现固定 surface 中的以下类别：

- 4 个 ARSU Skills：`deep-research`、`academic-paper`、`academic-paper-reviewer`、`academic-pipeline`；
- 5 个 Companion Skills：`researchspec-navigate`、`researchspec-propose`、`researchspec-decide`、`researchspec-verify`、`researchspec-cli-handbook`；
- `skills/capabilities/registry.json` 登记的全部 capability packages；
- 本次显式选择的 7 个 Zotero Adapter Skills。

不要在 adapter 中硬编码总数；以 `config.yaml` 的 Adapter selection、installation manifest 和实际
`.agents/skills/` inventory 交叉核对。未选择 Zotero 时，不应期待其 7 个 Skills。

## 启动与新会话

从设置了临时 `CODEX_HOME` 的同一终端、同一研究目录启动：

```bash
codex
```

Resume 场景必须完全退出当前 Codex 会话，再从相同目录和相同 `CODEX_HOME` 启动新会话。不得把旧聊天摘要或复制的上一轮回复提供给新会话。

Transcript 可使用 Codex 提供的会话导出能力或人工保存，但不得把观察记录写入研究 workspace。
所有 CLI JSON、相关 run/graph/node/Gate/Decision/handoff 快照和外部交付物 hash 仍按主 playbook 的证据结构保存。

## 清理

完成后退出 Codex，确认 `CODEX_HOME` 仍指向测试目录，再清理一次性研究 workspace。不要在未核对路径时执行递归删除命令。

解除本地 link：

```bash
npm unlink -g researchspec
```

如需保留复现环境，应整体归档临时 `.codex-home`、研究 workspace 和 workspace 外的 evidence directory，并记录其中可能包含的研究内容。
