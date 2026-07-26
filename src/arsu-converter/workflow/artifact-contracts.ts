import { ARSU_ROUTING_CATALOG } from "../routing/catalog.js";

export type ArtifactValidationProfile = "text-artifact" | "binary-file-artifact";

export interface ArsuArtifactContract {
  artifact_type: string;
  title: string;
  media_kind: "text" | "binary";
  extension: string;
  validation_profile: ArtifactValidationProfile;
  required_content: string[];
}

const BINARY_ARTIFACTS: Record<string, { extension: string; title: string }> = {
  formatted_manuscript: { extension: ".docx", title: "Formatted manuscript" },
  submission_package: { extension: ".zip", title: "Submission package" },
};

const SPECIAL_ARTIFACTS = ["integrity_report", "final_integrity_report"] as const;

function title(value: string): string {
  return value.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function buildContract(artifactType: string): ArsuArtifactContract {
  const binary = BINARY_ARTIFACTS[artifactType];
  return {
    artifact_type: artifactType,
    title: binary?.title ?? title(artifactType),
    media_kind: binary ? "binary" : "text",
    extension: binary?.extension ?? ".md",
    validation_profile: binary ? "binary-file-artifact" : "text-artifact",
    required_content: binary
      ? ["The file must be a non-empty native deliverable with the declared extension."]
      : ["State the artifact purpose and scope.", "Preserve stable source, claim, and artifact identifiers where applicable.", "Record limitations and unresolved issues explicitly."],
  };
}

const artifactTypes = new Set([
  ...ARSU_ROUTING_CATALOG.skills.flatMap((skill) => skill.routes.flatMap((route) => route.primary_artifact_types)),
  ...SPECIAL_ARTIFACTS,
]);

export const ARSU_ARTIFACT_CONTRACTS: Readonly<Record<string, ArsuArtifactContract>> = Object.freeze(
  Object.fromEntries([...artifactTypes].sort().map((artifactType) => [artifactType, buildContract(artifactType)])),
);

export function getArsuArtifactContract(artifactType: string): ArsuArtifactContract {
  const contract = ARSU_ARTIFACT_CONTRACTS[artifactType];
  if (!contract) throw new Error(`Unknown ARSU artifact contract: ${artifactType}`);
  return contract;
}

export function renderArsuArtifactContract(artifactType: string): string {
  const contract = getArsuArtifactContract(artifactType);
  return [
    `# ${contract.title}`,
    "",
    `Artifact type: \`${contract.artifact_type}\``,
    `Media kind: \`${contract.media_kind}\``,
    `Expected extension: \`${contract.extension}\``,
    "",
    "## Contract",
    "",
    ...contract.required_content.map((item) => `- ${item}`),
    "",
  ].join("\n");
}
