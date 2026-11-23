import { AUTHORED_GRAPH_PROFILES } from "../arsu-converter/workflow/graph-profiles/index.js";
import type { CapabilityGraphProfile } from "../core/contracts/capability-graph.js";

export const INTELLECTUAL_PROPERTY_DOMAIN_ID = "intellectual-property-materials";
export const CHINESE_PATENT_FILING_ID = "generation-chinese-patent-filing";

export const OPTIONAL_PATENT_PROFILE_IDS: ReadonlySet<string> = new Set([
  "patent-disclosure", "patent-application", "patent-docket", "research-to-patent",
]);

const profiles = AUTHORED_GRAPH_PROFILES.map(({ profile }) => profile);
const capabilityIds = (profile: CapabilityGraphProfile) => profile.nodes.flatMap((node) => node.capability_id ?? []);
const sharedCapabilities = new Set(profiles.filter((profile) => !OPTIONAL_PATENT_PROFILE_IDS.has(profile.profile_id)).flatMap(capabilityIds));
export const OPTIONAL_PATENT_CAPABILITY_IDS: ReadonlySet<string> = new Set(
  [CHINESE_PATENT_FILING_ID, ...profiles.filter((profile) => OPTIONAL_PATENT_PROFILE_IDS.has(profile.profile_id))
    .flatMap(capabilityIds).filter((id) => !sharedCapabilities.has(id))],
);
