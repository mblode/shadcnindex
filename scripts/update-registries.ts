import fs from "node:fs/promises";
import path from "node:path";

const LOCAL_REGISTRIES_FILE = "registries.local.json";
const REMOTE_REGISTRIES_URL = "https://ui.shadcn.com/r/registries.json";

type RegistryIndex = Record<string, string>;

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

async function writeJson(filePath: string, data: unknown) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": "components-fast-registry-sync/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function mergeRegistries(local: RegistryIndex, remote: RegistryIndex) {
  const merged: RegistryIndex = { ...local };
  for (const [name, url] of Object.entries(remote)) {
    if (!(name in merged)) {
      merged[name] = url;
    }
  }
  return merged;
}

async function main() {
  const localPath = path.join(process.cwd(), LOCAL_REGISTRIES_FILE);

  const localRegistries = (await fileExists(localPath))
    ? await readJson<RegistryIndex>(localPath)
    : {};

  const remoteRegistries = (await fetchJson(
    REMOTE_REGISTRIES_URL
  )) as RegistryIndex;
  const mergedRegistries = mergeRegistries(localRegistries, remoteRegistries);

  await writeJson(localPath, mergedRegistries);

  const addedCount =
    Object.keys(mergedRegistries).length - Object.keys(localRegistries).length;
  console.log(
    `Updated ${LOCAL_REGISTRIES_FILE}: ${Object.keys(mergedRegistries).length} registries (${addedCount} added).`
  );
}

if (typeof fetch !== "function") {
  console.error("This script requires Node 18+ (global fetch).");
  process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
