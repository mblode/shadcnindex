import fs from "node:fs/promises";
import path from "node:path";

interface BuildOptions {
  registriesFile: string;
  inputDir: string;
  outFile: string;
  registryLimit: number | null;
  componentLimit: number | null;
  registries: string[];
}

interface RegistryIndex {
  [key: string]: string;
}

interface RegistryJsonItemFile {
  path?: string | null;
}

interface RegistryJsonItem {
  name?: string;
  title?: string | null;
  type?: string | null;
  files?: RegistryJsonItemFile[];
}

interface RegistryJson {
  homepage?: string | null;
  items?: RegistryJsonItem[];
}

interface ComponentJsonFile {
  path?: string | null;
}

interface ComponentJson {
  name?: string;
  title?: string | null;
  type?: string | null;
  files?: ComponentJsonFile[];
}

interface InventoryComponent {
  name: string;
  title: string | null;
  type: string | null;
  files: string[];
}

interface InventoryRegistry {
  namespace: string;
  templateUrl: string | null;
  outputDir: string | null;
  hasOutput: boolean;
  hasRegistryJson: boolean;
  homepage: string | null;
  componentCount: number;
  componentsByType: Record<string, number>;
  components: InventoryComponent[];
  issues: string[];
}

interface InventorySummary {
  totalRegistries: number;
  registriesWithOutput: number;
  registriesMissingOutput: number;
  totalComponents: number;
  componentsByType: Record<string, number>;
}

interface InventoryOutput {
  generatedAt: string;
  registriesFile: string;
  outputDir: string;
  summary: InventorySummary;
  registries: InventoryRegistry[];
}

const DEFAULT_REGISTRIES_FILE = "registries.local.json";
const DEFAULT_INPUT_DIR = "registry-output";
const DEFAULT_OUT_FILE = "registry-docs-inventory.json";
const COMPONENT_TYPES = [
  "registry:ui",
  "registry:block",
  "registry:hook",
  "registry:lib",
];

function printHelp() {
  console.log(`
Usage: tsx scripts/build-registry-inventory.ts [options]

Options:
  --registries <file>    Registry index file (default: ${DEFAULT_REGISTRIES_FILE})
  --in <dir>             Registry output directory (default: ${DEFAULT_INPUT_DIR})
  --out <file>           Output JSON file (default: ${DEFAULT_OUT_FILE})
  --registry <name>      Registry namespace filter (repeatable)
  --registry-limit <n>   Limit registries (for testing)
  --component-limit <n>  Limit components per registry (for testing)
  --help                 Show this help
`);
}

function parseArgs(argv: string[]): BuildOptions {
  const options: BuildOptions = {
    registriesFile: DEFAULT_REGISTRIES_FILE,
    inputDir: DEFAULT_INPUT_DIR,
    outFile: DEFAULT_OUT_FILE,
    registryLimit: null,
    componentLimit: null,
    registries: [],
  };

  // biome-ignore lint/style/useForOf: Need index manipulation for argument parsing
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case "--registries":
        options.registriesFile = argv[++i];
        break;
      case "--in":
        options.inputDir = argv[++i];
        break;
      case "--out":
        options.outFile = argv[++i];
        break;
      case "--registry": {
        const name = argv[++i];
        if (name) {
          options.registries.push(
            ...name
              .split(",")
              .map((value) => value.trim())
              .filter(Boolean)
          );
        }
        break;
      }
      case "--registry-limit":
        options.registryLimit = Number(argv[++i]);
        break;
      case "--component-limit":
        options.componentLimit = Number(argv[++i]);
        break;
      case "--help":
        printHelp();
        process.exit(0);
        break;
      default:
        if (arg?.startsWith("-")) {
          console.warn(`Unknown option: ${arg}`);
        }
        break;
    }
  }

  return options;
}

async function fileExists(filePath: string): Promise<boolean> {
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

function normalizeTemplateRegistryMap(value: unknown): RegistryIndex {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as RegistryIndex;
}

function normalizeRegistryItems(value: unknown): RegistryJsonItem[] {
  if (Array.isArray(value)) {
    return value as RegistryJsonItem[];
  }
  return [];
}

function normalizeFiles(files?: Array<{ path?: string | null }>): string[] {
  if (!files) {
    return [];
  }
  return files
    .map((file) => file.path ?? "")
    .filter((filePath) => Boolean(filePath));
}

function buildComponentsFromRegistryJson(
  registryJson: RegistryJson,
  componentLimit: number | null
): InventoryComponent[] {
  const items = normalizeRegistryItems(registryJson.items);
  const output: InventoryComponent[] = [];

  for (const item of items) {
    if (componentLimit !== null && output.length >= componentLimit) {
      break;
    }
    if (!item.name) {
      continue;
    }
    output.push({
      name: item.name,
      title: item.title ?? null,
      type: item.type ?? null,
      files: normalizeFiles(item.files),
    });
  }

  return output;
}

async function buildComponentsFromComponentDirs(
  registryDir: string,
  componentLimit: number | null
): Promise<{ components: InventoryComponent[]; issues: string[] }> {
  const entries = await fs.readdir(registryDir, { withFileTypes: true });
  const components: InventoryComponent[] = [];
  const issues: string[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    if (componentLimit !== null && components.length >= componentLimit) {
      break;
    }

    const componentDir = path.join(registryDir, entry.name);
    const componentJsonPath = path.join(componentDir, "component.json");

    if (!(await fileExists(componentJsonPath))) {
      continue;
    }

    try {
      const componentJson = await readJson<ComponentJson>(componentJsonPath);
      components.push({
        name: componentJson.name ?? entry.name,
        title: componentJson.title ?? null,
        type: componentJson.type ?? null,
        files: normalizeFiles(componentJson.files),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      issues.push(`Failed to parse ${entry.name}/component.json: ${message}`);
    }
  }

  return { components, issues };
}

function tallyTypes(components: InventoryComponent[]): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const type of COMPONENT_TYPES) {
    counts[type] = 0;
  }

  for (const component of components) {
    if (!component.type) {
      counts.unknown = (counts.unknown ?? 0) + 1;
      continue;
    }
    counts[component.type] = (counts[component.type] ?? 0) + 1;
  }

  return counts;
}

function mergeCounts(
  base: Record<string, number>,
  incoming: Record<string, number>
) {
  for (const [key, value] of Object.entries(incoming)) {
    base[key] = (base[key] ?? 0) + value;
  }
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: inventory aggregation
async function main() {
  const options = parseArgs(process.argv.slice(2));
  const registriesPath = path.resolve(process.cwd(), options.registriesFile);
  const outputDir = path.resolve(process.cwd(), options.inputDir);
  const outFile = path.resolve(process.cwd(), options.outFile);

  const registriesRaw = await readJson<unknown>(registriesPath);
  const registryTemplates = normalizeTemplateRegistryMap(registriesRaw);
  const registryNames = Object.keys(registryTemplates);

  const outputEntries = await fs.readdir(outputDir, { withFileTypes: true });
  const outputRegistries = outputEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  const registryFilter =
    options.registries.length > 0 ? new Set(options.registries) : null;

  const orderedRegistries = Array.from(
    new Set([...registryNames, ...outputRegistries])
  );

  const registries: InventoryRegistry[] = [];

  for (const registry of orderedRegistries) {
    if (registryFilter && !registryFilter.has(registry)) {
      continue;
    }

    if (
      options.registryLimit !== null &&
      registries.length >= options.registryLimit
    ) {
      break;
    }

    const registryOutputDir = path.join(outputDir, registry);
    const hasOutput = await fileExists(registryOutputDir);
    const registryJsonPath = path.join(registryOutputDir, "registry.json");
    const hasRegistryJson = hasOutput && (await fileExists(registryJsonPath));

    const issues: string[] = [];
    let registryJson: RegistryJson | null = null;

    if (hasRegistryJson) {
      try {
        registryJson = await readJson<RegistryJson>(registryJsonPath);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        issues.push(`Failed to parse registry.json: ${message}`);
      }
    }

    let components: InventoryComponent[] = [];
    if (registryJson?.items?.length) {
      components = buildComponentsFromRegistryJson(
        registryJson,
        options.componentLimit
      );
    } else if (hasOutput) {
      const fallback = await buildComponentsFromComponentDirs(
        registryOutputDir,
        options.componentLimit
      );
      components = fallback.components;
      issues.push(...fallback.issues);
    }

    const componentsByType = tallyTypes(components);

    registries.push({
      namespace: registry,
      templateUrl: registryTemplates[registry] ?? null,
      outputDir: hasOutput
        ? path.relative(process.cwd(), registryOutputDir)
        : null,
      hasOutput,
      hasRegistryJson,
      homepage: registryJson?.homepage ?? null,
      componentCount: components.length,
      componentsByType,
      components,
      issues,
    });
  }

  const summary: InventorySummary = {
    totalRegistries: registries.length,
    registriesWithOutput: registries.filter((entry) => entry.hasOutput).length,
    registriesMissingOutput: registries.filter((entry) => !entry.hasOutput)
      .length,
    totalComponents: registries.reduce(
      (total, registry) => total + registry.componentCount,
      0
    ),
    componentsByType: {},
  };

  for (const registry of registries) {
    mergeCounts(summary.componentsByType, registry.componentsByType);
  }

  const output: InventoryOutput = {
    generatedAt: new Date().toISOString(),
    registriesFile: path.relative(process.cwd(), registriesPath),
    outputDir: path.relative(process.cwd(), outputDir),
    summary,
    registries,
  };

  await fs.writeFile(outFile, JSON.stringify(output, null, 2));

  console.log(
    `Inventory written to ${path.relative(process.cwd(), outFile)} (registries: ${summary.totalRegistries}, components: ${summary.totalComponents}).`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
