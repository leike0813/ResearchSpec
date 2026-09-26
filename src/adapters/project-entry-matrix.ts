import { TOOLS } from "./tools.js";

export function renderProjectEntryMatrix(): string {
  return [
    "# Agent 项目入口矩阵",
    "",
    "本表由工具目录生成。规则文件路径与机制依据所列宿主文档；运行时能否主动触发仍需在真实宿主中验证。发现回退表示目前只交付现有 Navigate Skill 或命令，未推断该宿主是否支持原生项目规则。",
    "",
    "| 宿主 ID | 入口机制 | 项目路径 | 文档依据 | 限制 | 运行时验证 |",
    "| --- | --- | --- | --- | --- | --- |",
    ...TOOLS.map((tool) => {
      const entry = tool.entry;
      const mechanism = entry.mechanism === "region" ? "共享标记区域" : entry.mechanism === "file" ? "专用文件" : "显式发现回退";
      const evidence = entry.documentation ? `[官方文档](${entry.documentation})（查阅 ${entry.checked_on ?? "未记录"}）` : "未核实原生规则";
      return `| \`${tool.id}\` | ${mechanism} | ${entry.path ? `\`${entry.path}\`` : "—"} | ${evidence} | ${entry.limitation} | 未验证 |`;
    }),
    "",
  ].join("\n");
}
