import path from "node:path";

import { fileExists, isDirectory } from "../../utils/fs.js";

export async function discoverWorkspace(cwd: string, explicitWorkspace?: string): Promise<string | undefined> {
  if (explicitWorkspace) {
    const resolved = path.resolve(cwd, explicitWorkspace);
    return (await isDirectory(resolved)) ? resolved : undefined;
  }

  let current = path.resolve(cwd);
  while (true) {
    const candidate = path.join(current, "researchspec");
    if ((await fileExists(candidate)) && (await isDirectory(candidate))) {
      return candidate;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      return undefined;
    }
    current = parent;
  }
}
