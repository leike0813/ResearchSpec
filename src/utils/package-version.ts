import { readFileSync } from "node:fs";

export function readPackageVersion(): string {
  const packageUrl = new URL("../../../package.json", import.meta.url);
  const packageJson = JSON.parse(readFileSync(packageUrl, "utf8")) as { version?: string };
  return packageJson.version ?? "0.0.0";
}
