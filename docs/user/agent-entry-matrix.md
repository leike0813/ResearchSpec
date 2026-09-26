# Agent 项目入口矩阵

本表由工具目录生成。规则文件路径与机制依据所列宿主文档；运行时能否主动触发仍需在真实宿主中验证。发现回退表示目前只交付现有 Navigate Skill 或命令，未推断该宿主是否支持原生项目规则。

| 宿主 ID | 入口机制 | 项目路径 | 文档依据 | 限制 | 运行时验证 |
| --- | --- | --- | --- | --- | --- |
| `amazon-q` | 显式发现回退 | — | 未核实原生规则 | Project-rule support has not been reviewed; use the delivered Navigate Skill or command through host discovery. | 未验证 |
| `antigravity` | 显式发现回退 | — | 未核实原生规则 | Project-rule support has not been reviewed; use the delivered Navigate Skill or command through host discovery. | 未验证 |
| `auggie` | 显式发现回退 | — | 未核实原生规则 | Project-rule support has not been reviewed; use the delivered Navigate Skill or command through host discovery. | 未验证 |
| `bob` | 显式发现回退 | — | 未核实原生规则 | Project-rule support has not been reviewed; use the delivered Navigate Skill or command through host discovery. | 未验证 |
| `claude` | 专用文件 | `.claude/rules/researchspec.md` | [官方文档](https://code.claude.com/docs/en/memory)（查阅 2026-09-26） | Project rules can be disabled by host settings. | 未验证 |
| `cline` | 显式发现回退 | — | 未核实原生规则 | Project-rule support has not been reviewed; use the delivered Navigate Skill or command through host discovery. | 未验证 |
| `codeartsagent` | 显式发现回退 | — | 未核实原生规则 | Project-rule support has not been reviewed; use the delivered Navigate Skill or command through host discovery. | 未验证 |
| `codex` | 共享标记区域 | `AGENTS.md` | [官方文档](https://learn.chatgpt.com/docs/agent-configuration/agents-md)（查阅 2026-09-26） | A nonempty root AGENTS.override.md can shadow AGENTS.md. | 未验证 |
| `devin` | 显式发现回退 | — | 未核实原生规则 | Project-rule support has not been reviewed; use the delivered Navigate Skill or command through host discovery. | 未验证 |
| `forgecode` | 显式发现回退 | — | 未核实原生规则 | Project-rule support has not been reviewed; use the delivered Navigate Skill or command through host discovery. | 未验证 |
| `codebuddy` | 显式发现回退 | — | 未核实原生规则 | Project-rule support has not been reviewed; use the delivered Navigate Skill or command through host discovery. | 未验证 |
| `continue` | 显式发现回退 | — | 未核实原生规则 | Project-rule support has not been reviewed; use the delivered Navigate Skill or command through host discovery. | 未验证 |
| `costrict` | 显式发现回退 | — | 未核实原生规则 | Project-rule support has not been reviewed; use the delivered Navigate Skill or command through host discovery. | 未验证 |
| `crush` | 显式发现回退 | — | 未核实原生规则 | Project-rule support has not been reviewed; use the delivered Navigate Skill or command through host discovery. | 未验证 |
| `cursor` | 专用文件 | `.cursor/rules/researchspec.mdc` | [官方文档](https://cursor.com/docs/rules)（查阅 2026-09-26） | Always Apply configures rule inclusion; actual invocation still needs host verification. | 未验证 |
| `factory` | 显式发现回退 | — | 未核实原生规则 | Project-rule support has not been reviewed; use the delivered Navigate Skill or command through host discovery. | 未验证 |
| `gemini` | 共享标记区域 | `GEMINI.md` | [官方文档](https://geminicli.com/docs/cli/gemini-md/)（查阅 2026-09-26） | Host settings can change context-file discovery. | 未验证 |
| `github-copilot` | 共享标记区域 | `.github/copilot-instructions.md` | [官方文档](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions)（查阅 2026-09-26） | File-pattern rules alone cannot guarantee context before a file is opened. | 未验证 |
| `hermes` | 显式发现回退 | — | 未核实原生规则 | Project-rule support has not been reviewed; use the delivered Navigate Skill or command through host discovery. | 未验证 |
| `iflow` | 显式发现回退 | — | 未核实原生规则 | Project-rule support has not been reviewed; use the delivered Navigate Skill or command through host discovery. | 未验证 |
| `junie` | 显式发现回退 | — | 未核实原生规则 | Project-rule support has not been reviewed; use the delivered Navigate Skill or command through host discovery. | 未验证 |
| `kilocode` | 显式发现回退 | — | 未核实原生规则 | Project-rule support has not been reviewed; use the delivered Navigate Skill or command through host discovery. | 未验证 |
| `kimi` | 显式发现回退 | — | 未核实原生规则 | Project-rule support has not been reviewed; use the delivered Navigate Skill or command through host discovery. | 未验证 |
| `kiro` | 显式发现回退 | — | 未核实原生规则 | Project-rule support has not been reviewed; use the delivered Navigate Skill or command through host discovery. | 未验证 |
| `lingma` | 显式发现回退 | — | 未核实原生规则 | Project-rule support has not been reviewed; use the delivered Navigate Skill or command through host discovery. | 未验证 |
| `vibe` | 显式发现回退 | — | 未核实原生规则 | Project-rule support has not been reviewed; use the delivered Navigate Skill or command through host discovery. | 未验证 |
| `oh-my-pi` | 显式发现回退 | — | 未核实原生规则 | Project-rule support has not been reviewed; use the delivered Navigate Skill or command through host discovery. | 未验证 |
| `opencode` | 共享标记区域 | `AGENTS.md` | [官方文档](https://opencode.ai/docs/rules/)（查阅 2026-09-26） | Creating AGENTS.md can suppress an existing CLAUDE.md fallback. | 未验证 |
| `pi` | 显式发现回退 | — | 未核实原生规则 | Project-rule support has not been reviewed; use the delivered Navigate Skill or command through host discovery. | 未验证 |
| `qoder` | 显式发现回退 | — | 未核实原生规则 | Project-rule support has not been reviewed; use the delivered Navigate Skill or command through host discovery. | 未验证 |
| `qwen` | 显式发现回退 | — | 未核实原生规则 | Project-rule support has not been reviewed; use the delivered Navigate Skill or command through host discovery. | 未验证 |
| `rovodev` | 显式发现回退 | — | 未核实原生规则 | Project-rule support has not been reviewed; use the delivered Navigate Skill or command through host discovery. | 未验证 |
| `roocode` | 显式发现回退 | — | 未核实原生规则 | Project-rule support has not been reviewed; use the delivered Navigate Skill or command through host discovery. | 未验证 |
| `trae` | 显式发现回退 | — | 未核实原生规则 | Project-rule support has not been reviewed; use the delivered Navigate Skill or command through host discovery. | 未验证 |
| `zcode` | 显式发现回退 | — | 未核实原生规则 | Project-rule support has not been reviewed; use the delivered Navigate Skill or command through host discovery. | 未验证 |
| `agents` | 显式发现回退 | — | 未核实原生规则 | Project-rule support has not been reviewed; use the delivered Navigate Skill or command through host discovery. | 未验证 |
