import { existsSync, promises as fs } from "node:fs";
import path from "node:path";

interface RegistryDirectoryEntry {
  name: string;
  homepage?: string | null;
  url?: string | null;
  description?: string | null;
  logo?: string | null;
}

export interface RegistryDirectoryMeta {
  title: string;
  description: string | null;
  logo: string | null;
  homepage: string | null;
}

const DIRECTORY_CANDIDATES = [
  path.join(process.cwd(), "apps", "web", "data", "registry-directory.json"),
  path.join(process.cwd(), "data", "registry-directory.json"),
  path.join(process.cwd(), "registry-directory.json"),
  path.resolve(
    process.cwd(),
    "..",
    "shadcn-ui",
    "apps",
    "v4",
    "registry",
    "directory.json"
  ),
];

let cachedDirectoryMap: Record<string, RegistryDirectoryMeta> | null = null;

function resolveRegistryDirectoryPath() {
  for (const candidate of DIRECTORY_CANDIDATES) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

async function readDirectoryEntries() {
  const directoryPath = resolveRegistryDirectoryPath();
  if (!directoryPath) {
    return [];
  }

  const raw = await fs.readFile(directoryPath, "utf8");
  const parsed = JSON.parse(raw) as RegistryDirectoryEntry[];
  return Array.isArray(parsed) ? parsed : [];
}

function toRegistryTitle(name: string) {
  return name.startsWith("@") ? name.slice(1) : name;
}

export async function getRegistryDirectoryMap() {
  if (cachedDirectoryMap) {
    return cachedDirectoryMap;
  }

  const entries = await readDirectoryEntries();
  const map: Record<string, RegistryDirectoryMeta> = {};

  for (const entry of entries) {
    if (!entry?.name) {
      continue;
    }

    const title = toRegistryTitle(entry.name);
    const meta: RegistryDirectoryMeta = {
      title,
      description: entry.description ?? null,
      logo: entry.logo ?? null,
      homepage: entry.homepage ?? null,
    };

    map[entry.name] = meta;
    const slug = toRegistryTitle(entry.name);
    if (!map[slug]) {
      map[slug] = meta;
    }
  }

  cachedDirectoryMap = map;
  return map;
}
