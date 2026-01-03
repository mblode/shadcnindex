import { promises as fs } from "node:fs";
import path from "node:path";

export interface RegistryIndexFile {
  path: string;
  type: string | null;
}

export interface RegistryIndexItem {
  id: string;
  registry: {
    namespace: string;
    homepage: string | null;
  };
  name: string;
  title: string | null;
  description: string | null;
  type: string | null;
  files: RegistryIndexFile[];
  tags: string[];
}

interface RegistryIndexPayload {
  count?: number;
  items?: RegistryIndexItem[];
}

let cachedIndex: RegistryIndexPayload | null = null;

export async function getLocalRegistryIndex() {
  if (cachedIndex) {
    return cachedIndex;
  }

  const indexPath = path.join(process.cwd(), "public", "registry-index.json");
  const raw = await fs.readFile(indexPath, "utf8");
  const parsed = JSON.parse(raw) as RegistryIndexPayload;

  cachedIndex = parsed;
  return parsed;
}
