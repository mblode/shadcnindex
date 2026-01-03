import { existsSync, promises as fs } from "node:fs";
import path from "node:path";

export interface RegistryOutputFile {
  path?: string;
  type?: string | null;
  content?: string | null;
  target?: string | null;
}

export interface RegistryOutputComponent {
  name?: string;
  title?: string | null;
  description?: string | null;
  type?: string | null;
  dependencies?: string[];
  files?: RegistryOutputFile[];
}

export interface RegistryOutputMeta {
  homepage?: string | null;
}

export interface RegistryOutputItem {
  id: string;
  registry: {
    namespace: string;
    homepage: string | null;
  };
  component: RegistryOutputComponent;
}

const REGISTRY_ROOT = resolveRegistryRoot();

function resolveRegistryRoot() {
  const cwd = process.cwd();
  const candidates = [
    path.join(cwd, "registry-output"),
    path.join(cwd, "..", "registry-output"),
    path.join(cwd, "..", "..", "registry-output"),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return candidates[0];
}

async function readJson<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

export async function getRegistryOutputItem(
  registry: string,
  component: string
): Promise<RegistryOutputItem | null> {
  const registryPath = path.join(REGISTRY_ROOT, registry);
  const componentPath = path.join(registryPath, component, "component.json");

  let componentJson: RegistryOutputComponent;
  try {
    componentJson = await readJson<RegistryOutputComponent>(componentPath);
  } catch {
    return null;
  }

  let registryJson: RegistryOutputMeta | null = null;
  try {
    registryJson = await readJson<RegistryOutputMeta>(
      path.join(registryPath, "registry.json")
    );
  } catch {
    registryJson = null;
  }

  const name = componentJson.name ?? component;

  return {
    id: `${registry}/${name}`,
    registry: {
      namespace: registry,
      homepage: registryJson?.homepage ?? null,
    },
    component: componentJson,
  };
}
