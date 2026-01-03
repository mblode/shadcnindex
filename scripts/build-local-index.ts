import fs from "node:fs/promises";
import path from "node:path";
import Fuse from "fuse.js";

interface BuildOptions {
  inDir: string;
  outFile: string;
  outIndexFile: string;
  limit: number | null;
  registries: string[];
}

interface CrawlSummary {
  startedAt?: string;
  finishedAt?: string;
  registryCount?: number;
  errors?: Array<{
    registry: string;
    url?: string;
    error: string;
    component?: string;
  }>;
}

interface RegistryJson {
  homepage?: string | null;
}

interface ComponentFile {
  path?: string;
  type?: string | null;
}

interface ComponentJson {
  name?: string;
  title?: string | null;
  description?: string | null;
  type?: string | null;
  files?: ComponentFile[];
}

interface IndexItem {
  id: string;
  registry: {
    namespace: string;
    homepage: string | null;
  };
  name: string;
  title: string | null;
  description: string | null;
  type: string | null;
  files: Array<{ path: string; type: string | null }>;
  tags: string[];
}

const DEFAULT_IN_DIR = "registry-output";
const DEFAULT_OUT_FILE = "apps/web/public/registry-index.json";
const DEFAULT_OUT_INDEX_FILE = "apps/web/public/registry-index.fuse.json";

function printHelp() {
  console.log(`
Usage: tsx scripts/build-local-index.ts [options]

Options:
  --in <dir>         Input crawl directory (default: ${DEFAULT_IN_DIR})
  --out <file>       Output JSON file (default: ${DEFAULT_OUT_FILE})
  --out-index <file> Output Fuse index JSON (default: ${DEFAULT_OUT_INDEX_FILE})
  --limit <n>        Limit total items (for testing)
  --registry <name>  Only include specific registry (repeatable)
  --help             Show this help
`);
}

function parseArgs(argv: string[]): BuildOptions {
  const options: BuildOptions = {
    inDir: DEFAULT_IN_DIR,
    outFile: DEFAULT_OUT_FILE,
    outIndexFile: DEFAULT_OUT_INDEX_FILE,
    limit: null,
    registries: [],
  };

  // biome-ignore lint/style/useForOf: Need index manipulation for argument parsing
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case "--in":
        options.inDir = argv[++i];
        break;
      case "--out":
        options.outFile = argv[++i];
        break;
      case "--limit":
        options.limit = Number(argv[++i]);
        break;
      case "--out-index":
        options.outIndexFile = argv[++i];
        break;
      case "--registry":
        {
          const name = argv[++i];
          if (name) {
            options.registries.push(
              ...name
                .split(",")
                .map((value) => value.trim())
                .filter(Boolean)
            );
          }
        }
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

function safeReadJson<T = unknown>(filePath: string): Promise<T> {
  return fs.readFile(filePath, "utf8").then((text) => JSON.parse(text));
}

function extractTags(
  record: Pick<IndexItem, "name" | "title" | "description" | "type" | "files">
) {
  const text = [
    record.name,
    record.title ?? "",
    record.description ?? "",
    record.type ?? "",
    ...record.files.map((file) => file.path).filter(Boolean),
  ]
    .join(" ")
    .toLowerCase();

  const keywords = [
    "accordion",
    "alert",
    "auth",
    "badge",
    "breadcrumb",
    "calendar",
    "card",
    "carousel",
    "chart",
    "checkbox",
    "command",
    "combobox",
    "date",
    "dialog",
    "drawer",
    "editor",
    "form",
    "hero",
    "input",
    "login",
    "menu",
    "modal",
    "navbar",
    "notification",
    "pricing",
    "search",
    "select",
    "sheet",
    "sidebar",
    "signup",
    "table",
    "tabs",
    "testimonial",
    "toast",
    "tooltip",
  ];

  const tags = new Set<string>();
  for (const keyword of keywords) {
    if (text.includes(keyword)) {
      tags.add(keyword);
    }
  }

  if (record.type?.includes("block")) {
    tags.add("block");
  }
  if (record.type?.includes("hook")) {
    tags.add("hook");
  }
  if (record.type?.includes("ui")) {
    tags.add("ui");
  }

  return Array.from(tags);
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Script processing multiple nested structures
async function main() {
  const options = parseArgs(process.argv.slice(2));
  const inDir = path.resolve(process.cwd(), options.inDir);
  const outFile = path.resolve(process.cwd(), options.outFile);
  const outIndexFile = path.resolve(process.cwd(), options.outIndexFile);
  const summaryPath = path.join(inDir, "crawl-summary.json");
  const summaryOutFile = path.join(path.dirname(outFile), "crawl-summary.json");

  const entries = await fs.readdir(inDir, { withFileTypes: true });
  const registryDirs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  const registryFilter =
    options.registries.length > 0 ? new Set(options.registries) : null;
  const items: IndexItem[] = [];

  for (const registryDirName of registryDirs) {
    if (registryFilter && !registryFilter.has(registryDirName)) {
      continue;
    }

    const registryDir = path.join(inDir, registryDirName);
    const registryJsonPath = path.join(registryDir, "registry.json");
    let registryJson: RegistryJson | null = null;

    try {
      registryJson = await safeReadJson<RegistryJson>(registryJsonPath);
    } catch {
      continue;
    }

    const registryMeta = {
      namespace: registryDirName,
      homepage: registryJson?.homepage ?? null,
    };

    const registryEntries = await fs.readdir(registryDir, {
      withFileTypes: true,
    });
    const componentDirs = registryEntries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    for (const componentDirName of componentDirs) {
      const componentPath = path.join(
        registryDir,
        componentDirName,
        "component.json"
      );
      let componentJson: ComponentJson;
      try {
        componentJson = await safeReadJson<ComponentJson>(componentPath);
      } catch {
        continue;
      }

      const name = componentJson.name ?? componentDirName;
      const files = Array.isArray(componentJson.files)
        ? componentJson.files
            .map((file) => ({
              path: file.path ?? "",
              type: file.type ?? null,
            }))
            .filter((file) => file.path)
        : [];

      const record: IndexItem = {
        id: `${registryDirName}/${name}`,
        registry: registryMeta,
        name,
        title: componentJson.title ?? null,
        description: componentJson.description ?? null,
        type: componentJson.type ?? null,
        files,
        tags: [],
      };

      record.tags = extractTags(record);
      items.push(record);

      if (options.limit && items.length >= options.limit) {
        break;
      }
    }

    if (options.limit && items.length >= options.limit) {
      break;
    }
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    count: items.length,
    items,
  };

  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await fs.writeFile(outFile, JSON.stringify(payload, null, 2), "utf8");
  const fuseKeys = [
    "name",
    "title",
    "description",
    "tags",
    "registry.namespace",
  ] as const;
  const fuseIndex = Fuse.createIndex(fuseKeys, items);
  await fs.mkdir(path.dirname(outIndexFile), { recursive: true });
  await fs.writeFile(outIndexFile, JSON.stringify(fuseIndex.toJSON()), "utf8");
  try {
    const summary = await safeReadJson<CrawlSummary>(summaryPath);
    await fs.writeFile(
      summaryOutFile,
      JSON.stringify(summary, null, 2),
      "utf8"
    );
  } catch {
    // No summary available; skip.
  }
  console.log(
    `Wrote ${items.length} items to ${outFile} and index to ${outIndexFile}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
