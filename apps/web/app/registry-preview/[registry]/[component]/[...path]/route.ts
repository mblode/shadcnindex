import { type Dirent, existsSync, promises as fs } from "node:fs";
import path from "node:path";
import { build, type Loader, type Plugin } from "esbuild";

export const runtime = "nodejs";

type IndexedFile = {
  content: string;
  loader: Loader;
};

const registryIndexCache = new Map<string, Promise<Map<string, IndexedFile>>>();

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: { registry: string; component: string; path?: string[] };
  }
) {
  const registry = decodeURIComponent(params.registry);
  const component = decodeURIComponent(params.component);
  const pathSegments = params.path ?? [];
  const rawPath = pathSegments.join("/");

  if (!rawPath || !rawPath.endsWith(".mjs")) {
    return new Response("Not found.", { status: 404 });
  }

  const entryPath = rawPath.slice(0, -4);
  const entry = await getEntryFile(registry, component, entryPath);

  if (!entry) {
    return new Response("Not found.", { status: 404 });
  }

  try {
    const result = await build({
      bundle: true,
      format: "esm",
      platform: "browser",
      target: "es2020",
      write: false,
      jsx: "automatic",
      plugins: [createRegistryPlugin(entry.index)],
      stdin: {
        contents: entry.file.content,
        loader: entry.file.loader,
        sourcefile: entry.sourcePath,
      },
    });

    const output = result.outputFiles[0]?.text ?? "";

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
  const componentPath = path.join(registryRoot, registry, component);
  const componentJsonPath = path.join(componentPath, "component.json");

  let componentJson: { files?: Array<{ path?: string }> };
  try {
    const raw = await fs.readFile(componentJsonPath, "utf8");
    componentJson = JSON.parse(raw) as { files?: Array<{ path?: string }> };
  } catch {
    return null;
  }

  const normalizedEntry = normalizePath(entryPath);
  const componentFiles = new Set(
    componentJson.files?.map((file) => normalizePath(file.path ?? "")) ?? []
  );

  if (!componentFiles.has(normalizedEntry)) {
    return null;
  }

  const index = await getRegistryFileIndex(registry);
  const resolvedPath = resolveFilePath(index, normalizedEntry);

  if (!resolvedPath) {
    return null;
  }

  const file = index.get(resolvedPath);
  if (!file) {
    return null;
  }

  return { file, index, sourcePath: resolvedPath };
}

async function getRegistryFileIndex(registry: string) {
  const cached = registryIndexCache.get(registry);
  if (cached) {
    return cached;
  }

  const buildIndex = (async () => {
    const registryRoot = resolveRegistryRoot();
    const registryPath = path.join(registryRoot, registry);
    const index = new Map<string, IndexedFile>();

    let entries: Dirent[] = [];
    try {
      entries = await fs.readdir(registryPath, { withFileTypes: true });
    } catch {
      return index;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const componentJsonPath = path.join(
        registryPath,
        entry.name,
        "component.json"
      );
      let raw = "";
      try {
        raw = await fs.readFile(componentJsonPath, "utf8");
      } catch {
        continue;
      }

      let componentJson: { files?: Array<{ path?: string; content?: string }> };
      try {
        componentJson = JSON.parse(raw) as {
          files?: Array<{ path?: string; content?: string }>;
        };
      } catch {
        continue;
      }

      for (const file of componentJson.files ?? []) {
        if (!file.path || !file.content) {
          continue;
        }

        const normalized = normalizePath(file.path);
        const loader = inferLoader(file.path);
        index.set(normalized, { content: file.content, loader });
      }
    }

    return index;
  })();

  registryIndexCache.set(registry, buildIndex);
  return buildIndex;
}

function createRegistryPlugin(index: Map<string, IndexedFile>): Plugin {
  return {
    name: "registry-preview",
    setup(build) {
      build.onResolve({ filter: /^@\/.+/ }, (args) => {
        const target = normalizePath(`src/${args.path.slice(2)}`);
        const resolved = resolveFilePath(index, target);
        if (!resolved) {
          return {
            errors: [{ text: `Unable to resolve ${args.path}` }],
          };
        }
        return { path: resolved, namespace: "registry" };
      });

      build.onResolve({ filter: /^\.\.?\// }, (args) => {
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

      build.onResolve({ filter: /^https?:\/\// }, (args) => {
        return { path: args.path, external: true };
      });

      build.onResolve({ filter: /^[^./].*/ }, (args) => {
        return { path: `https://esm.sh/${args.path}`, external: true };
      });

      build.onLoad({ filter: /.*/, namespace: "registry" }, (args) => {
        const normalized = normalizePath(args.path);
        const file = index.get(normalized);
        if (!file) {
          return {
            errors: [{ text: `Missing registry file: ${args.path}` }],
          };
        }
        return { contents: file.content, loader: file.loader };
      });
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
  const extension = path.extname(filePath);

  switch (extension) {
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

function normalizePath(filePath: string) {
  return filePath.replaceAll("\\", "/").replace(/^\/+/, "");
}
