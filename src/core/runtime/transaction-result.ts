import {
  CompactTransactionResultSchema,
  type CompactTransactionEffect,
  type CompactTransactionIdentity,
  type CompactTransactionResult,
} from "../contracts/runtime-protocol.js";
import {
  directedListSelector,
  directedShowSelector,
} from "../contracts/action-selector.js";

export function compactTransactionResult(input: {
  command: CompactTransactionResult["command"];
  selector: string;
  outcome: string;
  dryRun: boolean;
  identity: CompactTransactionIdentity;
  effects: CompactTransactionEffect[];
  nextSelectors?: string[];
}): CompactTransactionResult {
  return CompactTransactionResultSchema.parse({
    schema_version: "1",
    command: input.command,
    selector: input.selector,
    outcome: input.outcome,
    dry_run: input.dryRun,
    identity: input.identity,
    effects: input.effects,
    next_selectors: [...new Set([
      "status",
      directedShowSelector("workflow:current"),
      directedListSelector("history"),
      ...(input.nextSelectors ?? []),
    ])].slice(0, 20),
  });
}
