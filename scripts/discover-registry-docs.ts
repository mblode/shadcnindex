import fs from "node:fs/promises";
import path from "node:path";

interface DiscoverOptions {
  inventoryFile: string;
  registriesFile: string;
  outFile: string;
  mapFile: string;
  registryLimit: number | null;
  componentSample: number;
  concurrency: number;
  timeoutMs: number;
}

interface RegistryInventoryComponent {
  name: string;
  title: string | null;
  type: string | null;
  files: string[];
}

interface RegistryInventoryEntry {
  namespace: string;
  templateUrl: string | null;
  homepage: string | null;
  components: RegistryInventoryComponent[];
}

interface RegistryInventoryFile {
  registries: RegistryInventoryEntry[];
}

interface RegistryTemplateMap {
  [key: string]: string;
}

type DocsSlugFormat = "kebab" | "lower" | "raw";

type DocsCategorySource = "files" | "type";

interface DocsPattern {
  id: string;
  path: string;
  slug?: DocsSlugFormat;
  requiresCategory?: boolean;
  categorySource?: DocsCategorySource;
}

interface PatternScore {
  id: string;
  path: string;
  slug: DocsSlugFormat;
  requiresCategory: boolean;
  categorySource: DocsCategorySource;
  attempts: number;
  successes: number;
  averageScore: number;
  sampleUrls: string[];
  baseOverride: string | null;
}

interface RegistryPatternResult {
  namespace: string;
  baseUrl: string | null;
  pattern: PatternScore | null;
  scores: PatternScore[];
  issues: string[];
}

const DEFAULT_INVENTORY = "registry-docs-inventory.json";
const DEFAULT_REGISTRIES_FILE = "registries.local.json";
const DEFAULT_OUT_FILE = "registry-docs-patterns.json";
const DEFAULT_MAP_FILE = "apps/web/lib/registry-docs-map.ts";
const DEFAULT_COMPONENT_SAMPLE = 3;
const DEFAULT_CONCURRENCY = 8;
const DEFAULT_TIMEOUT_MS = 12_000;

const HTTP_URL_REGEX = /^https?:\/\//i;
const NON_ALPHANUMERIC_REGEX = /[^a-z0-9]+/g;
const TRAILING_DASH_REGEX = /^-+|-+$/g;
const PATH_SEPARATOR_REGEX = /[\\/]+/g;
const EXTENSION_REGEX = /\.[a-z0-9]+$/i;
const TRAILING_SLASHES_REGEX = /\/+$/;
const TRAILING_SLASH_REGEX = /\/$/;
const LEADING_SLASHES_REGEX = /^\/+/;
const NOT_FOUND_REGEX =
  /(404|not\s+found|page\s+not\s+found|does\s+not\s+exist|could\s+not\s+be\s+found)/i;

const CANDIDATE_PATTERNS: DocsPattern[] = [
  { id: "docs-components", path: "/docs/components/:component" },
  { id: "components", path: "/components/:component" },
  { id: "docs", path: "/docs/:component" },
  { id: "docs-component", path: "/docs/component/:component" },
  { id: "ui", path: "/ui/:component" },
  { id: "docs-ui", path: "/docs/ui/:component" },
  { id: "blocks", path: "/blocks/:component" },
  { id: "docs-blocks", path: "/docs/blocks/:component" },
  {
    id: "docs-components-category",
    path: "/docs/components/:category/:component",
    requiresCategory: true,
    categorySource: "files",
  },
  {
    id: "components-category",
    path: "/components/:category/:component",
    requiresCategory: true,
    categorySource: "files",
  },
  {
    id: "docs-category",
    path: "/docs/:category/:component",
    requiresCategory: true,
    categorySource: "files",
  },
];

const INVALID_CATEGORY_SEGMENTS = new Set([
  "registry",
  "components",
  "component",
  "blocks",
  "block",
  "ui",
  "hooks",
  "hook",
  "lib",
  "libs",
  "examples",
  "example",
  "demo",
  "demos",
  "docs",
  "doc",
  "index",
  "themes",
  "theme",
]);

const STRIPPED_PATH_SEGMENTS = new Set([
  "r",
  "registry",
  "c",
  "components",
  "component",
  "blocks",
  "block",
  "ui",
  "themes",
  "theme",
  "get",
  "hooks",
  "hook",
]);

function printHelp() {
  console.log(`
Usage: tsx scripts/discover-registry-docs.ts [options]

Options:
  --inventory <file>        Registry inventory file (default: ${DEFAULT_INVENTORY})
  --registries <file>       Registry template file (default: ${DEFAULT_REGISTRIES_FILE})
  --out <file>              Output JSON file (default: ${DEFAULT_OUT_FILE})
  --map <file>              Output TS map file (default: ${DEFAULT_MAP_FILE})
  --registry-limit <n>      Limit registries (for testing)
  --component-sample <n>    Components sampled per registry (default: ${DEFAULT_COMPONENT_SAMPLE})
  --concurrency <n>         Concurrent requests (default: ${DEFAULT_CONCURRENCY})
  --timeout <ms>            Per-request timeout (default: ${DEFAULT_TIMEOUT_MS})
  --help                    Show this help
`);
}

function parseArgs(argv: string[]): DiscoverOptions {
  const options: DiscoverOptions = {
    inventoryFile: DEFAULT_INVENTORY,
    registriesFile: DEFAULT_REGISTRIES_FILE,
    outFile: DEFAULT_OUT_FILE,
    mapFile: DEFAULT_MAP_FILE,
    registryLimit: null,
    componentSample: DEFAULT_COMPONENT_SAMPLE,
    concurrency: DEFAULT_CONCURRENCY,
    timeoutMs: DEFAULT_TIMEOUT_MS,
  };

  // biome-ignore lint/style/useForOf: Need index manipulation for argument parsing
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case "--inventory":
        options.inventoryFile = argv[++i];
        break;
      case "--registries":
        options.registriesFile = argv[++i];
        break;
      case "--out":
        options.outFile = argv[++i];
        break;
      case "--map":
        options.mapFile = argv[++i];
        break;
      case "--registry-limit":
        options.registryLimit = Number(argv[++i]);
        break;
      case "--component-sample":
        options.componentSample = Number(argv[++i]);
        break;
      case "--concurrency":
        options.concurrency = Number(argv[++i]);
        break;
      case "--timeout":
        options.timeoutMs = Number(argv[++i]);
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

async function readJson<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

function isHttpUrl(value: string | null): value is string {
  return Boolean(value && HTTP_URL_REGEX.test(value));
}

function isPlaceholderHomepage(homepage: string | null, registry: string) {
  if (!homepage) {
    return true;
  }
  if (!isHttpUrl(homepage)) {
    return true;
  }
  const normalized = homepage.toLowerCase();
  if (
    normalized.includes("ui.shadcn.com") &&
    !registry.toLowerCase().includes("shadcn")
  ) {
    return true;
  }
  return false;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(NON_ALPHANUMERIC_REGEX, "-")
    .replace(TRAILING_DASH_REGEX, "");
}

function formatSlug(value: string, format: DocsSlugFormat) {
  if (format === "raw") {
    return value;
  }
  if (format === "lower") {
    return value.toLowerCase();
  }
  return slugify(value);
}

function stripExtension(segment: string) {
  return segment.replace(EXTENSION_REGEX, "");
}

function buildCategoryCandidates(
  filePath: string,
  registryNamespace: string
): string[] {
  const segments = filePath.split(PATH_SEPARATOR_REGEX).filter(Boolean);
  if (!segments.length) {
    return [];
  }

  const registrySlug = registryNamespace.startsWith("@")
    ? registryNamespace.slice(1)
    : registryNamespace;

  let startIndex = 0;
  const registryIndex = segments.indexOf("registry");
  if (registryIndex >= 0 && registryIndex + 1 < segments.length) {
    startIndex = registryIndex + 1;
  }

  if (segments[startIndex] === registrySlug) {
    startIndex += 1;
  }

  return segments.slice(startIndex).map((segment) => {
    const cleaned = stripExtension(segment).toLowerCase();
    return cleaned;
  });
}

function pickCategoryCandidate(
  candidates: string[],
  componentSlug: string
): string | null {
  const normalizedSlug = componentSlug.toLowerCase();
  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }
    if (INVALID_CATEGORY_SEGMENTS.has(candidate)) {
      continue;
    }
    if (candidate === normalizedSlug) {
      continue;
    }
    return candidate;
  }

  return null;
}

function extractCategoryFromFiles(
  files: string[],
  registryNamespace: string,
  componentSlug: string
) {
  for (const filePath of files) {
    if (!filePath) {
      continue;
    }

    const candidates = buildCategoryCandidates(filePath, registryNamespace);
    if (candidates.length === 0) {
      continue;
    }

    const match = pickCategoryCandidate(candidates, componentSlug);
    if (match) {
      return match;
    }
  }

  return null;
}

function deriveBaseFromTemplate(template: string) {
  if (!isHttpUrl(template)) {
    return null;
  }

  const stripped = template
    .replace("{name}.json", "")
    .replace("{name}", "")
    .replace(TRAILING_SLASHES_REGEX, "");
  const normalized = `${stripped}/`;

  try {
    const url = new URL(normalized);
    const segments = url.pathname.split("/").filter(Boolean);
    const last = segments.at(-1);

    if (last && STRIPPED_PATH_SEGMENTS.has(last)) {
      segments.pop();
    }

    url.pathname = segments.length ? `/${segments.join("/")}/` : "/";
    return url.toString().replace(TRAILING_SLASH_REGEX, "");
  } catch {
    return null;
  }
}

function joinUrl(base: string, pathValue: string) {
  const trimmedBase = base.endsWith("/") ? base : `${base}/`;
  const relativePath = pathValue.replace(LEADING_SLASHES_REGEX, "");
  return new URL(relativePath, trimmedBase).toString();
}

function buildDocUrl({
  baseUrl,
  pattern,
  componentSlug,
  category,
}: {
  baseUrl: string;
  pattern: DocsPattern;
  componentSlug: string;
  category: string | null;
}) {
  let route = pattern.path;
  route = route.replace(":component", encodeURIComponent(componentSlug));

  if (route.includes(":category")) {
    if (!category) {
      return null;
    }
    route = route.replace(":category", encodeURIComponent(category));
  }

  if (HTTP_URL_REGEX.test(route)) {
    return route;
  }

  return joinUrl(baseUrl, route);
}

function scoreDocResponse({
  status,
  body,
  contentType,
  componentSlug,
  componentTitle,
}: {
  status: number;
  body: string;
  contentType: string | null;
  componentSlug: string;
  componentTitle: string | null;
}) {
  let score = 0;

  if (status >= 200 && status < 400) {
    score += 2;
  }

  if (contentType?.includes("text/html")) {
    score += 1;
  }

  const lowerBody = body.toLowerCase();
  if (lowerBody.includes(componentSlug.toLowerCase())) {
    score += 2;
  }

  if (componentTitle && lowerBody.includes(componentTitle.toLowerCase())) {
    score += 1;
  }

  if (NOT_FOUND_REGEX.test(lowerBody)) {
    score -= 3;
  }

  return score;
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

async function fetchWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent": "registry-docs-discovery/1.0",
        accept:
          "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
      },
    });

    const contentType = response.headers.get("content-type");
    const body = await response.text();

    return {
      status: response.status,
      url: response.url,
      contentType,
      body,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function normalizePatterns(patterns: DocsPattern[]): DocsPattern[] {
  return patterns.map((pattern) => ({
    ...pattern,
    slug: pattern.slug ?? "kebab",
    requiresCategory: pattern.requiresCategory ?? false,
    categorySource: pattern.categorySource ?? "files",
  }));
}

function selectSampleComponents(
  components: RegistryInventoryComponent[],
  registryNamespace: string,
  sampleSize: number
) {
  const filtered = components.filter((component) => {
    const name = component.name.toLowerCase();
    if (
      name.includes("demo") ||
      name.includes("example") ||
      name.includes("preview") ||
      name.includes("sample") ||
      name.includes("story")
    ) {
      return false;
    }

    if (component.type?.includes("example")) {
      return false;
    }

    return true;
  });

  const withCategory: RegistryInventoryComponent[] = [];
  const withoutCategory: RegistryInventoryComponent[] = [];

  const pool = filtered.length > 0 ? filtered : components;

  if (pool.length <= sampleSize) {
    return pool;
  }

  for (const component of pool) {
    const slug = slugify(component.name);
    const category = extractCategoryFromFiles(
      component.files,
      registryNamespace,
      slug
    );

    if (category) {
      withCategory.push(component);
    } else {
      withoutCategory.push(component);
    }
  }

  const selected: RegistryInventoryComponent[] = [];

  for (const component of withCategory) {
    if (selected.length >= sampleSize) {
      break;
    }
    selected.push(component);
  }

  for (const component of withoutCategory) {
    if (selected.length >= sampleSize) {
      break;
    }
    selected.push(component);
  }

  return selected;
}

function resolveRegistryBaseUrl(
  registry: RegistryInventoryEntry,
  registryTemplates: RegistryTemplateMap
) {
  const templateUrl =
    registry.templateUrl ?? registryTemplates[registry.namespace];
  const hasHomepage = !isPlaceholderHomepage(
    registry.homepage,
    registry.namespace
  );

  if (hasHomepage) {
    return registry.homepage ?? null;
  }

  if (templateUrl) {
    return deriveBaseFromTemplate(templateUrl);
  }

  return null;
}

function createScoreMap(patterns: DocsPattern[]) {
  const scoreMap = new Map<string, PatternScore>();

  for (const pattern of patterns) {
    scoreMap.set(pattern.id, {
      id: pattern.id,
      path: pattern.path,
      slug: pattern.slug ?? "kebab",
      requiresCategory: pattern.requiresCategory ?? false,
      categorySource: pattern.categorySource ?? "files",
      attempts: 0,
      successes: 0,
      averageScore: 0,
      sampleUrls: [],
      baseOverride: null,
    });
  }

  return scoreMap;
}

function createRegistryResult(
  registry: RegistryInventoryEntry,
  baseUrl: string | null,
  scoreMap: Map<string, PatternScore>,
  issues: string[]
): RegistryPatternResult {
  return {
    namespace: registry.namespace,
    baseUrl,
    pattern: null,
    scores: Array.from(scoreMap.values()),
    issues,
  };
}

function recordScore(
  scoreEntry: PatternScore,
  score: number,
  responseUrl: string | null,
  requestedUrl: string,
  sampleLimit: number
) {
  scoreEntry.attempts += 1;
  if (score >= 2) {
    scoreEntry.successes += 1;
  }
  scoreEntry.averageScore += score;

  if (scoreEntry.sampleUrls.length < sampleLimit) {
    scoreEntry.sampleUrls.push(responseUrl || requestedUrl);
  }

  if (
    responseUrl &&
    isHttpUrl(responseUrl) &&
    responseUrl !== requestedUrl &&
    !scoreEntry.baseOverride
  ) {
    try {
      const resolved = new URL(responseUrl);
      const requested = new URL(requestedUrl);
      if (resolved.origin !== requested.origin) {
        scoreEntry.baseOverride = resolved.origin;
      }
    } catch {
      scoreEntry.baseOverride = null;
    }
  }
}

function recordFailure(
  scoreEntry: PatternScore,
  issues: string[],
  error: unknown
) {
  scoreEntry.attempts += 1;
  const message = error instanceof Error ? error.message : String(error);
  if (!issues.includes(message)) {
    issues.push(message);
  }
}

async function runPatternCheck({
  url,
  scoreEntry,
  componentTitle,
  componentSlug,
  timeoutMs,
  sampleLimit,
  issues,
}: {
  url: string;
  scoreEntry: PatternScore;
  componentTitle: string | null;
  componentSlug: string;
  timeoutMs: number;
  sampleLimit: number;
  issues: string[];
}) {
  try {
    const response = await fetchWithTimeout(url, timeoutMs);
    const score = scoreDocResponse({
      status: response.status,
      body: response.body,
      contentType: response.contentType,
      componentSlug,
      componentTitle,
    });
    recordScore(scoreEntry, score, response.url, url, sampleLimit);
  } catch (error) {
    recordFailure(scoreEntry, issues, error);
  }
}

function enqueuePatternChecks({
  baseUrl,
  component,
  componentSlug,
  category,
  patterns,
  scoreMap,
  limiter,
  tasks,
  timeoutMs,
  sampleLimit,
  issues,
}: {
  baseUrl: string;
  component: RegistryInventoryComponent;
  componentSlug: string;
  category: string | null;
  patterns: DocsPattern[];
  scoreMap: Map<string, PatternScore>;
  limiter: ReturnType<typeof createLimiter>;
  tasks: Promise<void>[];
  timeoutMs: number;
  sampleLimit: number;
  issues: string[];
}) {
  for (const pattern of patterns) {
    if (pattern.requiresCategory && !category) {
      continue;
    }

    const formattedSlug = formatSlug(componentSlug, pattern.slug ?? "kebab");
    const url = buildDocUrl({
      baseUrl,
      pattern,
      componentSlug: formattedSlug,
      category,
    });

    if (!url) {
      continue;
    }

    const scoreEntry = scoreMap.get(pattern.id);
    if (!scoreEntry) {
      continue;
    }

    tasks.push(
      limiter(() =>
        runPatternCheck({
          url,
          scoreEntry,
          componentTitle: component.title,
          componentSlug: formattedSlug,
          timeoutMs,
          sampleLimit,
          issues,
        })
      ) as Promise<void>
    );
  }
}

function finalizeRegistryResults(results: RegistryPatternResult[]) {
  for (const registryResult of results) {
    const scoreEntries = Array.from(registryResult.scores).map((entry) => ({
      ...entry,
      averageScore:
        entry.attempts > 0 ? entry.averageScore / entry.attempts : 0,
    }));

    scoreEntries.sort((a, b) => {
      if (b.successes !== a.successes) {
        return b.successes - a.successes;
      }
      return b.averageScore - a.averageScore;
    });

    const best = scoreEntries.find(
      (entry) => entry.successes >= Math.max(1, Math.ceil(entry.attempts / 2))
    );

    registryResult.scores = scoreEntries;
    registryResult.pattern = best ?? null;
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const inventoryPath = path.resolve(process.cwd(), options.inventoryFile);
  const registriesPath = path.resolve(process.cwd(), options.registriesFile);
  const outPath = path.resolve(process.cwd(), options.outFile);
  const mapPath = path.resolve(process.cwd(), options.mapFile);

  const inventory = await readJson<RegistryInventoryFile>(inventoryPath);
  const registryTemplates = await readJson<RegistryTemplateMap>(registriesPath);

  const patterns = normalizePatterns(CANDIDATE_PATTERNS);
  const limiter = createLimiter(options.concurrency);

  const results: RegistryPatternResult[] = [];
  const tasks: Promise<void>[] = [];

  const registries = inventory.registries.slice(
    0,
    options.registryLimit ?? inventory.registries.length
  );

  for (const registry of registries) {
    const issues: string[] = [];
    const baseUrl = resolveRegistryBaseUrl(registry, registryTemplates);

    if (!baseUrl) {
      issues.push("Missing base URL for docs discovery.");
    }

    const sampleComponents = selectSampleComponents(
      registry.components,
      registry.namespace,
      options.componentSample
    );

    const scoreMap = createScoreMap(patterns);
    const registryResult = createRegistryResult(
      registry,
      baseUrl,
      scoreMap,
      issues
    );

    results.push(registryResult);

    if (!baseUrl) {
      continue;
    }

    for (const component of sampleComponents) {
      const componentSlug = slugify(component.name);
      const category = extractCategoryFromFiles(
        component.files,
        registry.namespace,
        componentSlug
      );

      enqueuePatternChecks({
        baseUrl,
        component,
        componentSlug,
        category,
        patterns,
        scoreMap,
        limiter,
        tasks,
        timeoutMs: options.timeoutMs,
        sampleLimit: options.componentSample,
        issues,
      });
    }
  }

  await Promise.all(tasks);

  finalizeRegistryResults(results);

  const output = {
    generatedAt: new Date().toISOString(),
    inventoryFile: path.relative(process.cwd(), inventoryPath),
    registriesFile: path.relative(process.cwd(), registriesPath),
    patterns: patterns.map((pattern) => ({
      id: pattern.id,
      path: pattern.path,
      slug: pattern.slug ?? "kebab",
      requiresCategory: pattern.requiresCategory ?? false,
      categorySource: pattern.categorySource ?? "files",
    })),
    results,
  };

  await fs.writeFile(outPath, JSON.stringify(output, null, 2));

  const mapEntries = results
    .filter((entry) => entry.pattern)
    .map((entry) => {
      const pattern = entry.pattern;
      return {
        namespace: entry.namespace,
        path: pattern?.path ?? "",
        slug: pattern?.slug ?? "kebab",
        categorySource: pattern?.categorySource ?? "files",
        baseOverride: pattern?.baseOverride ?? null,
      };
    });

  const mapLines = [
    "export interface RegistryDocsPattern {",
    "  path: string;",
    '  slug?: "kebab" | "lower" | "raw";',
    '  categorySource?: "files" | "type";',
    "  baseOverride?: string | null;",
    "}",
    "",
    "export const REGISTRY_DOCS_PATTERNS: Record<string, RegistryDocsPattern> = {",
  ];

  for (const entry of mapEntries) {
    const baseOverride = entry.baseOverride
      ? `, baseOverride: "${entry.baseOverride}"`
      : "";
    mapLines.push(
      `  "${entry.namespace}": { path: "${entry.path}", slug: "${entry.slug}", categorySource: "${entry.categorySource}"${baseOverride} },`
    );
  }

  mapLines.push("};", "");

  await fs.writeFile(mapPath, `${mapLines.join("\n")}\n`);

  console.log(
    `Docs discovery completed for ${results.length} registries. Output: ${path.relative(
      process.cwd(),
      outPath
    )}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
