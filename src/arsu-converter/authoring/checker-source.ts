import type { CapabilityAuthoringSource } from "./author.js";

/** Each executable shares generation and validation code with its report tool. */
export function checkerSource(check: string, module: string, entrypoint: string, validatorId: string): Pick<CapabilityAuthoringSource, "script_validator" | "package_assets"> {
  return {
    script_validator: {
      validator_id: validatorId,
      entrypoint_path: `validators/${entrypoint}.py`,
      source_path: "src/arsu-converter/authoring/checkers/runner.py",
      args_template: [check, "{outputs_json}"],
    },
    package_assets: [{
      source_path: `src/arsu-converter/authoring/checkers/${module}.py`,
      output_path: `validators/${module}.py`,
    }],
  };
}
