import type { LiteratureAdapterDefinition, LiteratureAdapterRuntime } from "./contracts.js";

export type LiteratureAdapterPlatform = LiteratureAdapterRuntime["platform"];

const PLATFORM_MAP: Readonly<Record<string, LiteratureAdapterPlatform>> = {
  "win32:x64": "win32-x64",
  "darwin:x64": "darwin-x64",
  "darwin:arm64": "darwin-arm64",
  "linux:ia32": "linux-x86",
  "linux:x64": "linux-x64",
  "linux:arm": "linux-arm",
  "linux:arm64": "linux-arm64",
};

export type LiteratureAdapterPlatformResolution =
  | { supported: true; platform: LiteratureAdapterPlatform; runtime: LiteratureAdapterRuntime }
  | { supported: false; platform: string; runtime: null };

export function normalizeLiteratureAdapterPlatform(platform = process.platform, architecture = process.arch): LiteratureAdapterPlatform | undefined {
  return PLATFORM_MAP[`${platform}:${architecture}`];
}

export function resolveLiteratureAdapterPlatform(
  adapter: LiteratureAdapterDefinition,
  platform = process.platform,
  architecture = process.arch,
): LiteratureAdapterPlatformResolution {
  const normalized = normalizeLiteratureAdapterPlatform(platform, architecture);
  if (!normalized) return { supported: false, platform: `${platform}-${architecture}`, runtime: null };
  const runtime = adapter.runtimes.find((candidate) => candidate.platform === normalized);
  return runtime
    ? { supported: true, platform: normalized, runtime }
    : { supported: false, platform: normalized, runtime: null };
}
