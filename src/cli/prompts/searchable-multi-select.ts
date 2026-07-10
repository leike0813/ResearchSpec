// Adapted from OpenSpec 1.5.0 (MIT), src/prompts/searchable-multi-select.ts.
import {
  createPrompt, isBackspaceKey, isDownKey, isEnterKey, isUpKey, useKeypress,
  useMemo, usePrefix, useState,
} from "@inquirer/core";
import chalk from "chalk";

export interface SearchableChoice {
  name: string;
  value: string;
  configured?: boolean;
  detected?: boolean;
  preSelected?: boolean;
}

interface Config { message: string; choices: SearchableChoice[]; pageSize?: number }

const prompt = createPrompt((config: Config, done: (value: string[]) => void): string => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>(() => config.choices.filter((choice) => choice.preSelected).map((choice) => choice.value));
  const [cursor, setCursor] = useState(0);
  const [status, setStatus] = useState<"idle" | "done">("idle");
  const prefix = usePrefix({ status });
  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return term ? config.choices.filter((choice) => choice.name.toLowerCase().includes(term) || choice.value.includes(term)) : config.choices;
  }, [search, config.choices]);
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  useKeypress((key) => {
    if (status === "done") return;
    if (isEnterKey(key)) { setStatus("done"); done(selected); return; }
    if (key.name === "space") {
      const choice = filtered[cursor];
      if (choice) setSelected(selectedSet.has(choice.value) ? selected.filter((value) => value !== choice.value) : [...selected, choice.value]);
      return;
    }
    if (isBackspaceKey(key)) { setSearch(search.slice(0, -1)); setCursor(0); return; }
    if (isUpKey(key)) { setCursor(Math.max(0, cursor - 1)); return; }
    if (isDownKey(key)) { setCursor(Math.min(filtered.length - 1, cursor + 1)); return; }
    if (key.name && key.name.length === 1 && !key.ctrl) { setSearch(search + key.name); setCursor(0); }
  });

  if (status === "done") return `${prefix} ${chalk.bold(config.message)} ${chalk.cyan(selected.join(", ") || "(none)")}`;
  const pageSize = config.pageSize ?? 15;
  const start = Math.max(0, Math.min(cursor - Math.floor(pageSize / 2), filtered.length - pageSize));
  const lines = [
    `${prefix} ${chalk.bold(config.message)}`,
    `  Search: ${chalk.yellow("[")}${search || chalk.dim("type to filter")}${chalk.yellow("]")}`,
    `  ${chalk.cyan("↑↓")} navigate • ${chalk.cyan("Space")} toggle • ${chalk.cyan("Enter")} confirm`,
  ];
  for (const [index, choice] of filtered.slice(start, start + pageSize).entries()) {
    const active = start + index === cursor;
    const chosen = selectedSet.has(choice.value);
    const label = chosen ? "selected" : choice.configured ? "configured" : choice.detected ? "detected" : "";
    lines.push(`  ${active ? chalk.cyan("›") : " "} ${chosen ? chalk.green("◉") : chalk.dim("○")} ${active ? chalk.cyan(choice.name) : choice.name}${label ? chalk.dim(` (${label})`) : ""}`);
  }
  if (!filtered.length) lines.push(chalk.yellow("  No matches"));
  return lines.join("\n");
});

export async function searchableMultiSelect(config: Config): Promise<string[]> { return prompt(config); }
