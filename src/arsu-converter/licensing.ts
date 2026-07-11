import path from "node:path";

import { readUtf8, sha256File, writeUtf8 } from "./fs-utils.js";
import type { CopiedFile } from "./types.js";

export const ARSU_LICENSE_FILENAME = "LICENSE";
export const ARSU_NOTICE_FILENAME = "NOTICE.md";

export async function emitArsuSkillLicensing(
  sourceRoot: string,
  groupRoot: string,
  groupName: string,
): Promise<CopiedFile[]> {
  const upstreamLicense = await readUtf8(path.join(sourceRoot, "LICENSE"));
  if (!upstreamLicense.includes("Attribution-NonCommercial 4.0 International") || !upstreamLicense.includes("Copyright (c) 2026 Cheng-I Wu")) {
    throw new Error("Upstream LICENSE must contain the Cheng-I Wu CC BY-NC 4.0 grant.");
  }

  const licensePath = path.join(groupRoot, ARSU_LICENSE_FILENAME);
  const noticePath = path.join(groupRoot, ARSU_NOTICE_FILENAME);
  await writeUtf8(licensePath, upstreamLicense);
  await writeUtf8(noticePath, renderArsuSkillNotice(groupName));

  return [
    {
      group: groupName,
      source_path: "LICENSE",
      output_path: `${groupName}/${ARSU_LICENSE_FILENAME}`,
      transform_rule: "upstream_cc_by_nc_license_copy",
      sha256: await sha256File(licensePath),
    },
    {
      group: groupName,
      source_path: "generated:arsu-attribution",
      output_path: `${groupName}/${ARSU_NOTICE_FILENAME}`,
      transform_rule: "researchspec_arsu_attribution_notice",
      sha256: await sha256File(noticePath),
    },
  ];
}

export function renderArsuSkillNotice(groupName: string): string {
  return `# ARSU Attribution Notice

The \`${groupName}\` Skill tree is adapted by ResearchSpec from Academic Research Skills (ARS), copyright 2026 Cheng-I Wu.

- Upstream repository: https://github.com/Imbad0202/academic-research-skills
- ResearchSpec vendored source: \`vendor/ars\`
- License: Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)
- License URL: https://creativecommons.org/licenses/by-nc/4.0/

ResearchSpec conversion adapts paths, routing descriptions, contract preflight guidance, and runtime-control instructions. Those adaptations do not remove the upstream attribution or noncommercial restriction. See the adjacent \`LICENSE\` file for the complete license terms.
`;
}
