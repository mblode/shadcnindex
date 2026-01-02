import fs from "node:fs/promises";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

interface CrawlOptions {
  outDir: string;
  registries: string[];
  registryLimit: number | null;
  componentLimit: number | null;
  concurrency: number;
  timeoutMs: number;
  pauseMs: number;
  skipExisting: boolean;
}

interface CrawlError {
  registry: string;
  url: string;
  error: string;
  component?: string;
}

type RegistryIndex = Record<string, string>;

interface RegistryItem {
  name?: string;
  [key: string]: unknown;
}

interface RegistryJson {
  items?: RegistryItem[];
  [key: string]: unknown;
}

const REGISTRY_INDEX_URL = "https://ui.shadcn.com/r/registries.json";
const DEFAULT_OUT_DIR = "registry-output";
const DEFAULT_CONCURRENCY = 8;
const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_REGISTRY_PAUSE_MS = 150;

function printHelp() {
  console.log(`
Usage: tsx scripts/crawl-registries.ts [options]

Options:
  --out <dir>               Output directory (default: ${DEFAULT_OUT_DIR})
  --registry <name>         Registry name to crawl (repeatable)
  --registry-limit <n>      Limit number of registries (for testing)
  --component-limit <n>     Limit components per registry (for testing)
  --concurrency <n>         Max concurrent component fetches (default: ${DEFAULT_CONCURRENCY})
  --timeout <ms>            Per-request timeout in ms (default: ${DEFAULT_TIMEOUT_MS})
  --pause <ms>              Pause between registries (default: ${DEFAULT_REGISTRY_PAUSE_MS})
  --skip-existing           Skip components that already have component.json
  --help                    Show this help
`);
}

function parseArgs(argv: string[]): CrawlOptions {
  const options: CrawlOptions = {
    outDir: DEFAULT_OUT_DIR,
    registries: [],
    registryLimit: null,
    componentLimit: null,
    concurrency: DEFAULT_CONCURRENCY,
    timeoutMs: DEFAULT_TIMEOUT_MS,
    pauseMs: DEFAULT_REGISTRY_PAUSE_MS,
    skipExisting: false,
  };

  // biome-ignore lint/style/useForOf: Need index manipulation for argument parsing
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case "--out":
        options.outDir = argv[++i];
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
      case "--registry-limit":
        options.registryLimit = Number(argv[++i]);
        break;
      case "--component-limit":
        options.componentLimit = Number(argv[++i]);
        break;
      case "--concurrency":
        options.concurrency = Number(argv[++i]);
        break;
      case "--timeout":
        options.timeoutMs = Number(argv[++i]);
        break;
      case "--pause":
        options.pauseMs = Number(argv[++i]);
        break;
      case "--skip-existing":
        options.skipExisting = true;
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

function safeSegment(value: string) {
  return value.replace(/[\\/]/g, "__");
}

function createLimiter(concurrency: number) {
  let active = 0;
  const queue: Array<{
    task: () => Promise<unknown>;
    resolve: (value: unknown) => void;
    reject: (error: unknown) => void;
  }> = [];

  const next = () => {
    if (active >= concurrency || queue.length === 0) {
      return;
    }
    const item = queue.shift();
    if (!item) {
      return;
    }
    const { task, resolve, reject } = item;
    active += 1;
    Promise.resolve()
      .then(task)
      .then((result) => resolve(result))
      .catch(reject)
      .finally(() => {
        active -= 1;
        next();
      });
  };

  return (task: () => Promise<unknown>) =>
    new Promise((resolve, reject) => {
      queue.push({ task, resolve, reject });
      next();
    });
}

async function fetchJson(url: string, timeoutMs: number): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        accept: "application/json",
        "user-agent": "components-fast-crawler/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (error) {
      const snippet = text.slice(0, 200).replace(/\s+/g, " ");
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Invalid JSON. ${message}. Snippet: ${snippet}`);
    }
  } finally {
    clearTimeout(timeout);
  }
}

async function writeJson(filePath: string, data: unknown) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function crawlRegistry({
  registryName,
  template,
  outDir,
  componentLimit,
  concurrency,
  timeoutMs,
  skipExisting,
  errors,
}: {
  registryName: string;
  template: string;
  outDir: string;
  componentLimit: number | null;
  concurrency: number;
  timeoutMs: number;
  skipExisting: boolean;
  errors: CrawlError[];
}) {
  const registryDir = path.join(outDir, safeSegment(registryName));
  await fs.mkdir(registryDir, { recursive: true });

  const registryUrl = template.replace("{name}", "registry");
  let registryJson: RegistryJson;

  try {
    registryJson = (await fetchJson(registryUrl, timeoutMs)) as RegistryJson;
    await writeJson(path.join(registryDir, "registry.json"), registryJson);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push({ registry: registryName, url: registryUrl, error: message });
    await writeJson(path.join(registryDir, "registry.error.json"), {
      registry: registryName,
      url: registryUrl,
      error: message,
      fetchedAt: new Date().toISOString(),
    });
    return;
  }

  const items = Array.isArray(registryJson.items) ? registryJson.items : [];
  const limitedItems = componentLimit ? items.slice(0, componentLimit) : items;
  const limiter = createLimiter(concurrency);

  const componentTasks = limitedItems.map((item) =>
    limiter(async () => {
      if (!item?.name) {
        return;
      }
      const componentName = String(item.name);
      const componentDir = path.join(registryDir, safeSegment(componentName));
      const componentJsonPath = path.join(componentDir, "component.json");

      if (skipExisting && (await fileExists(componentJsonPath))) {
        return;
      }

      const componentUrl = template.replace("{name}", componentName);
      try {
        const componentJson = await fetchJson(componentUrl, timeoutMs);
        await writeJson(componentJsonPath, componentJson);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        errors.push({
          registry: registryName,
          component: componentName,
          url: componentUrl,
          error: message,
        });
        await writeJson(path.join(componentDir, "component.error.json"), {
          registry: registryName,
          component: componentName,
          url: componentUrl,
          error: message,
          item,
          fetchedAt: new Date().toISOString(),
        });
      }
    })
  );

  await Promise.all(componentTasks);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  const outDir = path.resolve(process.cwd(), options.outDir);
  await fs.mkdir(outDir, { recursive: true });

  const registryIndex = (await fetchJson(
    REGISTRY_INDEX_URL,
    options.timeoutMs
  )) as RegistryIndex;
  await writeJson(path.join(outDir, "registries.json"), registryIndex);

  let registryEntries = Object.entries(registryIndex);
  if (options.registries.length > 0) {
    const registrySet = new Set(options.registries);
    registryEntries = registryEntries.filter(([name]) => registrySet.has(name));
  }
  if (options.registryLimit) {
    registryEntries = registryEntries.slice(0, options.registryLimit);
  }

  const errors: CrawlError[] = [];
  const startedAt = new Date().toISOString();

  for (const [registryName, template] of registryEntries) {
    await crawlRegistry({
      registryName,
      template,
      outDir,
      componentLimit: options.componentLimit,
      concurrency: options.concurrency,
      timeoutMs: options.timeoutMs,
      skipExisting: options.skipExisting,
      errors,
    });

    if (options.pauseMs > 0) {
      await delay(options.pauseMs);
    }
  }

  await writeJson(path.join(outDir, "crawl-summary.json"), {
    startedAt,
    finishedAt: new Date().toISOString(),
    registryCount: registryEntries.length,
    errors,
  });
}

if (typeof fetch !== "function") {
  console.error("This script requires Node 18+ (global fetch).");
  process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
