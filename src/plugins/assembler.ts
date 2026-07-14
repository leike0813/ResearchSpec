import { mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import { z } from "zod";

import {
  DomainDefinitionSchema,
  DomainTaxonomySchema,
  type PluginRegistry,
  validatePluginRegistry,
  VendorDefinitionSchema,
} from "./registry.js";
import { anzsrcGroupDomainId, loadAnzsrcSnapshot } from "./taxonomy.js";

const DomainCatalogSchema = z.strictObject({
  schema_version: z.literal("1"),
  taxonomy: DomainTaxonomySchema,
  domains: z.array(DomainDefinitionSchema).length(218),
});

const VendorBundleSchema = z.strictObject({
  schema_version: z.literal("1"),
  vendor: VendorDefinitionSchema,
});

const TOOL_DOMAIN_IDS = new Set([
  "computational-modeling-and-simulation",
  "experimental-design-and-data-analysis",
  "laboratory-automation-and-informatics",
  "research-computing-infrastructure",
  "scientific-visualization-and-communication",
]);

export interface AssemblePluginRegistryOptions {
  repoRoot: string;
  pluginRoot: string;
  write?: boolean;
}

export async function assemblePluginRegistry(options: AssemblePluginRegistryOptions): Promise<PluginRegistry> {
  const catalogPath = path.join(options.repoRoot, "src/plugins/domain-catalog.json");
  const taxonomyPath = path.join(options.repoRoot, "src/plugins/taxonomy/anzsrc-for-2020.json");
  const catalog = DomainCatalogSchema.parse(JSON.parse(await readFile(catalogPath, "utf8")) as unknown);
  const taxonomy = await loadAnzsrcSnapshot(taxonomyPath);
  validateCatalog(catalog, taxonomy.groups);

  const bundleRoot = path.join(options.pluginRoot, "vendor-bundles");
  const bundleNames = (await readdir(bundleRoot)).filter((name) => name.endsWith(".json")).sort(compareText);
  const vendors = [];
  for (const name of bundleNames) {
    const bundle = VendorBundleSchema.parse(JSON.parse(await readFile(path.join(bundleRoot, name), "utf8")) as unknown);
    if (name !== `${bundle.vendor.vendor_id}.json`) throw new Error(`Vendor bundle filename does not match vendor ID: ${name}`);
    vendors.push(bundle.vendor);
  }
  if (!vendors.length) throw new Error("Central plugin assembly requires at least one vendor bundle.");

  const registry: PluginRegistry = {
    schema_version: "1",
    domain_taxonomy: catalog.taxonomy,
    vendors,
    domains: catalog.domains,
  };
  await validatePluginRegistry(registry, options.pluginRoot);
  if (options.write !== false) await writeRegistryAtomically(path.join(options.pluginRoot, "registry.json"), registry);
  return registry;
}

function validateCatalog(catalog: z.infer<typeof DomainCatalogSchema>, groups: readonly { code: string; title: string }[]): void {
  const expectedGroups = new Map(groups.map((group) => [group.code, group]));
  const domainIds = new Set<string>();
  const disciplineCodes = new Set<string>();
  const toolIds = new Set<string>();
  for (const domain of catalog.domains) {
    if (domainIds.has(domain.domain_id)) throw new Error(`Domain catalog repeats domain ID ${domain.domain_id}.`);
    domainIds.add(domain.domain_id);
    if (domain.domain_type === "discipline") {
      const group = expectedGroups.get(domain.anzsrc_group_code);
      if (!group || group.title !== domain.title || anzsrcGroupDomainId(group.title) !== domain.domain_id) {
        throw new Error(`Discipline domain ${domain.domain_id} does not match ANZSRC Group ${domain.anzsrc_group_code}.`);
      }
      disciplineCodes.add(domain.anzsrc_group_code);
    } else {
      toolIds.add(domain.domain_id);
    }
  }
  if (disciplineCodes.size !== 213 || [...expectedGroups.keys()].some((code) => !disciplineCodes.has(code))) {
    throw new Error("Domain catalog must contain every ANZSRC Group exactly once.");
  }
  if (toolIds.size !== TOOL_DOMAIN_IDS.size || [...TOOL_DOMAIN_IDS].some((id) => !toolIds.has(id))) {
    throw new Error("Domain catalog must contain exactly the five ResearchSpec tool domains.");
  }
}

async function writeRegistryAtomically(registryPath: string, registry: PluginRegistry): Promise<void> {
  await mkdir(path.dirname(registryPath), { recursive: true });
  const temporary = `${registryPath}.tmp`;
  await writeFile(temporary, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
  await rename(temporary, registryPath);
}

function compareText(left: string, right: string): number {
  return left.localeCompare(right);
}
