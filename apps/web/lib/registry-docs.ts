import fs from "node:fs";
import path from "node:path";

import type { RegistryDocsPattern } from "@/lib/registry-docs-map";
import { REGISTRY_DOCS_PATTERNS } from "@/lib/registry-docs-map";

interface RegistryDocsContext {
  registryNamespace: string;
  registryHomepage: string | null;
  componentSlug: string;
  componentType: string | null;
  componentFiles: string[];
  shouldUseHomepage: boolean;
}

const HTTP_URL_REGEX = /^https?:\/\//i;
const NON_ALPHANUMERIC_REGEX = /[^a-z0-9]+/g;
const TRAILING_DASH_REGEX = /^-+|-+$/g;
const PATH_SEPARATOR_REGEX = /[\\/]+/g;
const EXTENSION_REGEX = /\.[a-z0-9]+$/i;
const TRAILING_SLASHES_REGEX = /\/+$/;
const TRAILING_SLASH_REGEX = /\/$/;
const LEADING_SLASHES_REGEX = /^\/+/;

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

let registryTemplatesCache: Record<string, string> | null = null;

function resolveRegistriesFile() {
  const cwd = process.cwd();
  const candidates = [
    path.join(cwd, "registries.local.json"),
    path.join(cwd, "..", "registries.local.json"),
    path.join(cwd, "..", "..", "registries.local.json"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return candidates[0];
}

function loadRegistryTemplates() {
  if (registryTemplatesCache) {
    return registryTemplatesCache;
  }

  const registriesFile = resolveRegistriesFile();
  try {
    const raw = fs.readFileSync(registriesFile, "utf8");
    registryTemplatesCache = JSON.parse(raw) as Record<string, string>;
  } catch {
    registryTemplatesCache = {};
  }

  return registryTemplatesCache;
}

function isHttpUrl(value: string | null): value is string {
  return Boolean(value && HTTP_URL_REGEX.test(value));
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(NON_ALPHANUMERIC_REGEX, "-")
    .replace(TRAILING_DASH_REGEX, "");
}

function formatSlug(value: string, format: RegistryDocsPattern["slug"]) {
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

function resolveBaseUrl({
  registryNamespace,
  registryHomepage,
  shouldUseHomepage,
}: {
  registryNamespace: string;
  registryHomepage: string | null;
  shouldUseHomepage: boolean;
}) {
  if (shouldUseHomepage && isHttpUrl(registryHomepage)) {
    return registryHomepage;
  }

  const templates = loadRegistryTemplates();
  const template = templates[registryNamespace];
  if (template) {
    return deriveBaseFromTemplate(template);
  }

  return null;
}

function buildDocUrl({
  baseUrl,
  pattern,
  componentSlug,
  category,
}: {
  baseUrl: string;
  pattern: RegistryDocsPattern;
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

function buildDocsUrlFromPattern(
  pattern: RegistryDocsPattern,
  context: RegistryDocsContext
) {
  const baseUrl = pattern.baseOverride
    ? pattern.baseOverride
    : resolveBaseUrl({
        registryNamespace: context.registryNamespace,
        registryHomepage: context.registryHomepage,
        shouldUseHomepage: context.shouldUseHomepage,
      });

  if (!baseUrl) {
    return null;
  }

  const formattedSlug = formatSlug(
    context.componentSlug,
    pattern.slug ?? "kebab"
  );

  let category: string | null = null;
  if (pattern.path.includes(":category")) {
    if (pattern.categorySource === "type") {
      category = context.componentType ? slugify(context.componentType) : null;
    } else {
      category = extractCategoryFromFiles(
        context.componentFiles,
        context.registryNamespace,
        formattedSlug
      );
    }
  }

  return buildDocUrl({
    baseUrl,
    pattern,
    componentSlug: formattedSlug,
    category,
  });
}

export function resolveRegistryComponentDocsUrl(context: RegistryDocsContext) {
  const registryPattern = REGISTRY_DOCS_PATTERNS[context.registryNamespace];
  if (registryPattern) {
    const resolved = buildDocsUrlFromPattern(registryPattern, context);
    if (resolved) {
      return resolved;
    }
  }

  return null;
}
