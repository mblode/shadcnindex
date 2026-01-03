import { type Dirent, existsSync, promises as fs, statSync } from "node:fs";
import path from "node:path";
import { build, type Loader, type Plugin } from "esbuild";

export const runtime = "nodejs";

interface IndexedFile {
  content: string;
  loader: Loader;
}

const registryIndexCache = new Map<string, Promise<Map<string, IndexedFile>>>();
const REGISTRY_ALIAS_FILTER = /^@\/.+/;
const RELATIVE_IMPORT_FILTER = /^\.\.?\//;
const HTTP_IMPORT_FILTER = /^https?:\/\//;
const BARE_IMPORT_FILTER = /^[^./].*/;
const ANY_FILE_FILTER = /.*/;
const LEADING_SLASHES_REGEX = /^\/+/;
const MAX_UP_LEVELS = 12;
const DEBUG_QUERY_KEY = "debug";
const UI_ALIAS_PREFIX = "components/ui/";
const REGISTRY_UI_ALIAS_PREFIX = "registry/ui/";
const UI_REGISTRY_PATH = "registry/new-york-v4/ui";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ registry: string; component: string; path?: string[] }>;
  }
) {
  const requestUrl = new URL(request.url);
  const debugMode = requestUrl.searchParams.get(DEBUG_QUERY_KEY) === "1";
  const resolvedParams = await params;
  const registry = decodeURIComponent(resolvedParams.registry);
  const component = decodeURIComponent(resolvedParams.component);
  const pathSegments = resolvedParams.path ?? [];
  const rawPath = pathSegments.join("/");

  if (!rawPath?.endsWith(".mjs")) {
    return new Response("Not found.", { status: 404 });
  }

  const entryPath = rawPath.slice(0, -4);
  const entry = await getEntryFile(registry, component, entryPath);

  if (!entry) {
    if (debugMode) {
      const diagnostics = await getEntryDiagnostics(
        registry,
        component,
        entryPath
      );
      return new Response(JSON.stringify(diagnostics, null, 2), {
        status: 404,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store",
        },
      });
    }

    return new Response("Not found.", { status: 404 });
  }

  try {
    const result = await build({
      bundle: true,
      format: "esm",
      platform: "browser",
      target: "es2020",
      outfile: "out.js",
      write: false,
      jsx: "automatic",
      plugins: [createRegistryPlugin(entry.index, resolveAppRoot())],
      stdin: {
        contents: entry.file.content,
        loader: entry.file.loader,
        sourcefile: entry.sourcePath,
      },
    });

    const jsOutput =
      result.outputFiles.find((file) => file.path.endsWith(".js"))?.text ?? "";
    const cssOutput = result.outputFiles
      .filter((file) => file.path.endsWith(".css"))
      .map((file) => file.text)
      .join("\n");

    const output = cssOutput
      ? `${buildCssInjection(cssOutput)}\n${jsOutput}`
      : jsOutput;

    return new Response(output, {
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Build failed.";
    return new Response(message, { status: 500 });
  }
}

async function getEntryFile(
  registry: string,
  component: string,
  entryPath: string
) {
  const registryRoot = resolveRegistryRoot();
  const registryNamespace = resolveRegistryNamespace(registry, registryRoot);
  const normalizedEntry = normalizePath(entryPath);

  const index = await getRegistryFileIndex(registryNamespace, registryRoot);
  const resolvedPath = resolveFilePath(index, normalizedEntry);

  if (!resolvedPath) {
    return null;
  }

  const componentJson = await readComponentJson(
    path.join(registryRoot, registryNamespace, component, "component.json")
  );

  if (componentJson?.files?.length) {
    const componentFiles = new Set(
      componentJson.files.map((file) => normalizePath(file.path ?? ""))
    );

    if (!componentFiles.has(normalizedEntry)) {
      return null;
    }
  }

  const file = index.get(resolvedPath);
  if (!file) {
    return null;
  }

  return { file, index, sourcePath: resolvedPath };
}

function getRegistryFileIndex(registry: string, registryRoot: string) {
  const cacheKey = `${registryRoot}:${registry}`;
  const cached = registryIndexCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const buildIndex = buildRegistryIndex(registry, registryRoot);

  registryIndexCache.set(cacheKey, buildIndex);
  return buildIndex;
}

async function buildRegistryIndex(registry: string, registryRoot: string) {
  const registryPath = path.join(registryRoot, registry);
  const index = new Map<string, IndexedFile>();
  const entries = await readRegistryEntries(registryPath);

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const componentJsonPath = path.join(
      registryPath,
      entry.name,
      "component.json"
    );
    const componentJson = await readComponentJson(componentJsonPath);
    if (!componentJson) {
      continue;
    }

    addFilesToIndex(index, componentJson.files ?? []);
  }

  return index;
}

async function readRegistryEntries(registryPath: string): Promise<Dirent[]> {
  try {
    return await fs.readdir(registryPath, { withFileTypes: true });
  } catch {
    return [];
  }
}

async function readComponentJson(componentJsonPath: string): Promise<{
  files?: Array<{ path?: string; content?: string }>;
} | null> {
  let raw = "";
  try {
    raw = await fs.readFile(componentJsonPath, "utf8");
  } catch {
    return null;
  }

  try {
    return JSON.parse(raw) as {
      files?: Array<{ path?: string; content?: string }>;
    };
  } catch {
    return null;
  }
}

async function getEntryDiagnostics(
  registry: string,
  component: string,
  entryPath: string
) {
  const registryRoot = resolveRegistryRoot();
  const registryNamespace = resolveRegistryNamespace(registry, registryRoot);
  const normalizedEntry = normalizePath(entryPath);
  const componentJsonPath = path.join(
    registryRoot,
    registryNamespace,
    component,
    "component.json"
  );
  const componentJson = await readComponentJson(componentJsonPath);
  const componentFiles =
    componentJson?.files?.map((file) => normalizePath(file.path ?? "")) ?? [];
  const index = await getRegistryFileIndex(registryNamespace, registryRoot);
  const resolvedPath = resolveFilePath(index, normalizedEntry);

  return {
    registry,
    component,
    entryPath,
    normalizedEntry,
    registryRoot,
    registryNamespace,
    componentJsonPath,
    componentJsonFound: Boolean(componentJson),
    componentFilesCount: componentFiles.length,
    componentFilesIncludesEntry: componentFiles.includes(normalizedEntry),
    indexSize: index.size,
    resolvedPath,
    resolvedFileFound: resolvedPath ? index.has(resolvedPath) : false,
  };
}

function addFilesToIndex(
  index: Map<string, IndexedFile>,
  files: Array<{ path?: string; content?: string }>
) {
  for (const file of files) {
    if (!(file.path && file.content)) {
      continue;
    }

    const normalized = normalizePath(file.path);
    const loader = inferLoader(file.path);
    index.set(normalized, { content: file.content, loader });
  }
}

function resolveFromRegistryTargets(
  index: Map<string, IndexedFile>,
  aliasPath: string
) {
  const registryTargets = [
    normalizePath(`src/${aliasPath}`),
    normalizePath(aliasPath),
  ];

  for (const target of registryTargets) {
    const resolved = resolveFilePath(index, target);
    if (resolved) {
      return { path: resolved, namespace: "registry" };
    }
  }

  return null;
}

function resolveUiAlias(appRoot: string, aliasPath: string, prefix: string) {
  if (!aliasPath.startsWith(prefix)) {
    return null;
  }

  const uiPath = aliasPath.slice(prefix.length);
  const uiResolved = resolveLocalFilePath(
    path.join(appRoot, UI_REGISTRY_PATH, uiPath)
  );

  if (uiResolved) {
    return { path: uiResolved };
  }

  return null;
}

function createRegistryPlugin(
  index: Map<string, IndexedFile>,
  appRoot: string
): Plugin {
  return {
    name: "registry-preview",
    setup(build) {
      build.onResolve({ filter: REGISTRY_ALIAS_FILTER }, (args) => {
        const aliasPath = args.path.slice(2);

        const registryResolved = resolveFromRegistryTargets(index, aliasPath);
        if (registryResolved) {
          return registryResolved;
        }

        const localResolved = resolveLocalFilePath(
          path.join(appRoot, aliasPath)
        );
        if (localResolved) {
          return { path: localResolved };
        }

        const uiResolved =
          resolveUiAlias(appRoot, aliasPath, UI_ALIAS_PREFIX) ??
          resolveUiAlias(appRoot, aliasPath, REGISTRY_UI_ALIAS_PREFIX);

        if (uiResolved) {
          return uiResolved;
        }

        return {
          errors: [{ text: `Unable to resolve ${args.path}` }],
        };
      });

      build.onResolve({ filter: RELATIVE_IMPORT_FILTER }, (args) => {
        const importer = normalizePath(args.importer);
        if (!index.has(importer)) {
          return;
        }
        const baseDir = path.posix.dirname(importer);
        const target = normalizePath(path.posix.join(baseDir, args.path));
        const resolved = resolveFilePath(index, target);
        if (!resolved) {
          return {
            errors: [{ text: `Unable to resolve ${args.path}` }],
          };
        }
        return { path: resolved, namespace: "registry" };
      });

      build.onResolve({ filter: HTTP_IMPORT_FILTER }, (args) => {
        return { path: args.path, external: true };
      });

      build.onResolve({ filter: BARE_IMPORT_FILTER }, (args) => {
        return { path: `https://esm.sh/${args.path}`, external: true };
      });

      build.onLoad(
        { filter: ANY_FILE_FILTER, namespace: "registry" },
        (args) => {
          const normalized = normalizePath(args.path);
          const file = index.get(normalized);
          if (!file) {
            return {
              errors: [{ text: `Missing registry file: ${args.path}` }],
            };
          }
          return { contents: file.content, loader: file.loader };
        }
      );
    },
  };
}

function resolveFilePath(index: Map<string, IndexedFile>, rawPath: string) {
  const normalized = normalizePath(rawPath);
  if (index.has(normalized)) {
    return normalized;
  }

  const extensions = [".tsx", ".ts", ".jsx", ".js"];
  for (const ext of extensions) {
    const candidate = `${normalized}${ext}`;
    if (index.has(candidate)) {
      return candidate;
    }
  }

  for (const ext of extensions) {
    const candidate = `${normalized}/index${ext}`;
    if (index.has(candidate)) {
      return candidate;
    }
  }

  return null;
}

function inferLoader(filePath: string): Loader {
  if (filePath.endsWith(".module.css")) {
    return "local-css";
  }

  const extension = path.extname(filePath);

  switch (extension) {
    case ".css":
      return "css";
    case ".ts":
      return "ts";
    case ".tsx":
      return "tsx";
    case ".jsx":
      return "jsx";
    default:
      return "js";
  }
}

function buildCssInjection(cssText: string) {
  const serializedCss = JSON.stringify(cssText);
  return `(() => { if (typeof document === "undefined") return; const style = document.createElement("style"); style.setAttribute("data-registry-preview", ""); style.textContent = ${serializedCss}; document.head.appendChild(style); })();`;
}

function resolveLocalFilePath(filePath: string) {
  const normalized = path.normalize(filePath);
  const extensions = [".tsx", ".ts", ".jsx", ".js", ".mjs", ".cjs", ".css"];

  const directCandidate = resolveExistingFile(normalized);
  if (directCandidate) {
    return directCandidate;
  }

  if (!path.extname(normalized)) {
    for (const ext of extensions) {
      const candidate = resolveExistingFile(`${normalized}${ext}`);
      if (candidate) {
        return candidate;
      }
    }
  }

  for (const ext of extensions) {
    const candidate = resolveExistingFile(path.join(normalized, `index${ext}`));
    if (candidate) {
      return candidate;
    }
  }

  return null;
}

function resolveExistingFile(filePath: string) {
  if (!existsSync(filePath)) {
    return null;
  }

  try {
    return statSync(filePath).isFile() ? filePath : null;
  } catch {
    return null;
  }
}

function resolveRegistryRoot() {
  const cwd = process.cwd();
  const found = findUpwards(cwd, (dir) =>
    existsSync(path.join(dir, "registry-output"))
  );

  if (found) {
    return path.join(found, "registry-output");
  }

  return path.join(cwd, "registry-output");
}

function resolveAppRoot() {
  const cwd = process.cwd();
  const direct = findUpwards(cwd, (dir) => existsSync(path.join(dir, "app")));
  if (direct) {
    return direct;
  }

  const workspaceRoot = findUpwards(cwd, (dir) =>
    existsSync(path.join(dir, "apps", "web", "app"))
  );

  if (workspaceRoot) {
    return path.join(workspaceRoot, "apps", "web");
  }

  return cwd;
}

function resolveRegistryNamespace(
  registry: string,
  registryRoot: string
): string {
  if (registry.startsWith("@")) {
    return registry;
  }

  const atNamespace = `@${registry}`;
  if (existsSync(path.join(registryRoot, atNamespace))) {
    return atNamespace;
  }

  return registry;
}

function normalizePath(filePath: string) {
  const normalized = filePath
    .replaceAll("\\", "/")
    .replace(LEADING_SLASHES_REGEX, "");
  return path.posix.normalize(normalized).replace(LEADING_SLASHES_REGEX, "");
}

function findUpwards(startDir: string, predicate: (dir: string) => boolean) {
  let current = path.resolve(startDir);

  for (let depth = 0; depth <= MAX_UP_LEVELS; depth += 1) {
    if (predicate(current)) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }

  return null;
}
