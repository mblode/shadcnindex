import { existsSync, promises as fs } from "node:fs";
import path from "node:path";
import {
  IconArrowLeft,
  IconArrowRight,
  IconArrowUpRight,
} from "@tabler/icons-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { CodeTabs } from "@/components/code-tabs";
import { ComponentPreviewTabs } from "@/components/component-preview-tabs";
import { DocsCopyPage } from "@/components/docs-copy-page";
import { JsonLd } from "@/components/json-ld";
import { RegistryComponentSource } from "@/components/registry-component-source";
import { RegistryLivePreview } from "@/components/registry-live-preview";
import { siteConfig } from "@/lib/config";
import {
  getRegistryDirectoryMap,
  type RegistryDirectoryMeta,
} from "@/lib/registry-directory";
import { getLocalRegistryIndex } from "@/lib/registry-local-index";
import {
  getRegistryOutputItem,
  type RegistryOutputComponent,
  type RegistryOutputDocLink,
  type RegistryOutputItem,
  type RegistryOutputRegistryItem,
  resolveRegistryNamespace,
} from "@/lib/registry-output";
import { toRegistrySlug } from "@/lib/registry-slug";
import { toRegistryTypeLabel } from "@/lib/registry-type";
import { getSiteUrl, toAbsoluteUrl } from "@/lib/seo";
import { Badge } from "@/registry/new-york-v4/ui/badge";
import { Button } from "@/registry/new-york-v4/ui/button";
import { ItemMedia } from "@/registry/new-york-v4/ui/item";
import {
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/new-york-v4/ui/tabs";

const NON_ALPHANUMERIC_REGEX = /[^a-zA-Z0-9]+/g;
const SRC_PREFIX_REGEX = /^src\//;
const TRAILING_SLASH_REGEX = /\/$/;
const _COMPONENTS_PATH_REGEX = /\/(components|docs\/components)$/;
const HTTP_URL_REGEX = /^https?:\/\//i;

export type RegistryComponentViewVariant = "page" | "modal";

export async function RegistryComponentPageContent(props: {
  params: Promise<{ registry: string; component: string }>;
  variant?: RegistryComponentViewVariant;
  searchParams?: Promise<{ q?: string }>;
  headerLeading?: ReactNode;
}) {
  const params = await props.params;
  const variant = props.variant ?? "page";
  const searchParams = await props.searchParams;
  const registry = decodeURIComponent(params.registry);
  const component = decodeURIComponent(params.component);
  const item = await getRegistryOutputItem(registry, component);

  if (!item) {
    notFound();
  }

  const localIndex = await getLocalRegistryIndex();
  const indexItem = localIndex.items?.find((entry) => entry.id === item.id);
  const tags = indexItem?.tags ?? [];
  const registryNamespace = toRegistrySlug(item.registry.namespace);
  const registryDirectory = await getRegistryDirectoryMap();
  const registryMeta =
    registryDirectory[item.registry.namespace] ??
    registryDirectory[registryNamespace] ??
    null;
  const typeLabel = toRegistryTypeLabel(
    item.component.type ?? item.registryItem?.type ?? null
  );
  const pageData = buildRegistryComponentPageData(item, component);
  const neighbours = await getRegistryOutputNeighbours(registry, component);
  const searchQuery =
    variant === "modal" && typeof searchParams?.q === "string"
      ? searchParams.q
      : "";
  const navigation = buildRegistryNavigationLinks(
    neighbours,
    pageData.registrySlug,
    searchQuery
  );
  const links = buildRegistryComponentLinks({
    component: pageData.componentData,
    componentSlug: pageData.componentSlug,
    registry: item.registry,
    registryItem: item.registryItem,
  });
  const pageUrl = toAbsoluteUrl(pageData.registryPath);
  const siteUrl = getSiteUrl();
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: siteConfig.name,
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: item.registry.namespace,
        item: `${siteUrl}/search?q=${encodeURIComponent(
          item.registry.namespace
        )}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: pageData.title,
        item: pageUrl,
      },
    ],
  };
  const headingClass =
    "font-heading [&+]*:[code]:text-xl mt-10 scroll-m-28 text-xl font-medium tracking-tight lg:mt-16 [&+.steps]:!mt-0 [&+.steps>h3]:!mt-4 [&+h3]:!mt-6 [&+p]:!mt-4";
  const isModal = variant === "modal";
  const outerClassName = isModal
    ? "flex w-full flex-col text-[1.05rem] sm:text-[15px]"
    : "flex items-stretch text-[1.05rem] sm:text-[15px] xl:w-full";
  const contentClassName = isModal
    ? "mx-auto flex w-full min-w-0 max-w-3xl flex-1 flex-col gap-8 px-0 pb-0 text-neutral-800 dark:text-neutral-300"
    : "mx-auto flex w-full min-w-0 max-w-2xl flex-1 flex-col gap-8 px-4 py-6 text-neutral-800 md:px-0 lg:py-8 dark:text-neutral-300";

  return (
    <div className={outerClassName}>
      {variant === "page" ? <JsonLd data={breadcrumbJsonLd} /> : null}
      <div className="flex min-w-0 flex-1 flex-col">
        {isModal ? null : <div className="h-(--top-spacing) shrink-0" />}
        <div className={contentClassName}>
          <RegistryComponentHeader
            copyPage={pageData.copyPage}
            description={pageData.description}
            headerLeading={props.headerLeading}
            links={links}
            navigation={navigation}
            pageUrl={pageUrl}
            registryMeta={registryMeta}
            registryNamespace={registryNamespace}
            tags={tags}
            title={pageData.title}
            type={typeLabel}
            variant={variant}
          />

          <div className="w-full flex-1 *:data-[slot=alert]:first:mt-0">
            <RegistryComponentPreviewSection
              component={component}
              headingClass={headingClass}
              previewEntry={pageData.previewEntry}
              previewSource={pageData.previewSource}
              previewTitle={pageData.previewTitle}
              registrySlug={pageData.registrySlug}
            />
            <RegistryComponentInstallationSection
              cliCommand={pageData.cliCommand}
              headingClass={headingClass}
              installableFiles={pageData.installableFiles}
              itemId={item.id}
            />
            <RegistryComponentUsageSection
              headingClass={headingClass}
              importName={pageData.importName}
              importPath={pageData.importPath}
              usageSnippet={pageData.usageSnippet}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function buildRegistryComponentPageData(
  item: RegistryOutputItem,
  component: string
) {
  const componentData = item.component;
  const registrySlug = toRegistrySlug(item.registry.namespace);
  const title = componentData.title ?? componentData.name ?? component;
  const description = componentData.description ?? "";
  const filesWithContent =
    componentData.files?.filter((file) => file.content) ?? [];
  const installableFiles = filesWithContent.filter((file) => !isDocFile(file));
  const previewFile = installableFiles[0] ?? filesWithContent[0] ?? null;
  const previewEntry = previewFile?.path ?? null;
  const previewSource = previewFile?.content ?? null;
  const previewTitle = formatFileTitle(previewEntry);
  const cliCommand = `npx shadcn@latest add ${item.id}`;
  const importName = toPascalCase(componentData.name ?? component);
  const importPath = getImportPath(componentData.type, componentData.name);
  const usageSnippet = getUsageSnippet(componentData.type, importName);
  const registryPath = `/components/${encodeURIComponent(
    registrySlug
  )}/${encodeURIComponent(component)}`;
  const copyPage = buildCopyPage({
    title,
    description,
    cliCommand,
    importName,
    importPath,
    files: installableFiles,
  });

  return {
    cliCommand,
    componentData,
    componentSlug: componentData.name ?? component,
    copyPage,
    description,
    importName,
    importPath,
    installableFiles,
    previewEntry,
    previewSource,
    previewTitle,
    registryPath,
    registrySlug,
    title,
    usageSnippet,
  };
}

interface RegistryNavigationLinks {
  previousHref: string | null;
  nextHref: string | null;
}

function buildRegistryNavigationLinks(
  neighbours: { previous: string | null; next: string | null },
  registrySlug: string,
  searchQuery: string
): RegistryNavigationLinks {
  const querySuffix = searchQuery
    ? `?${new URLSearchParams({ q: searchQuery }).toString()}`
    : "";

  return {
    previousHref: neighbours.previous
      ? `/components/${encodeURIComponent(
          registrySlug
        )}/${encodeURIComponent(neighbours.previous)}${querySuffix}`
      : null,
    nextHref: neighbours.next
      ? `/components/${encodeURIComponent(
          registrySlug
        )}/${encodeURIComponent(neighbours.next)}${querySuffix}`
      : null,
  };
}

function RegistryComponentHeader({
  title,
  description,
  copyPage,
  headerLeading,
  navigation,
  links,
  pageUrl,
  registryMeta,
  registryNamespace,
  tags: _tags,
  type,
  variant,
}: {
  title: string;
  description: string;
  copyPage: string;
  headerLeading?: ReactNode;
  navigation: RegistryNavigationLinks;
  links: RegistryComponentLinks | null;
  pageUrl: string;
  registryMeta: RegistryDirectoryMeta | null;
  registryNamespace: string;
  tags: string[];
  type: string | null;
  variant: RegistryComponentViewVariant;
}) {
  const navClassName =
    variant === "modal"
      ? "docs-nav flex items-center gap-2 pt-1"
      : "docs-nav fixed inset-x-0 bottom-0 isolate z-50 flex items-center gap-2 border-border/50 border-t bg-background/80 px-6 py-4 backdrop-blur-sm sm:static sm:z-0 sm:border-t-0 sm:bg-transparent sm:px-0 sm:pt-1.5 sm:backdrop-blur-none";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2">
            {headerLeading ? (
              <div className="shrink-0">{headerLeading}</div>
            ) : null}
            <h1 className="scroll-m-20 font-semibold text-4xl tracking-tight sm:text-3xl xl:text-4xl">
              {title}
            </h1>
          </div>
          <div className={navClassName}>
            <DocsCopyPage page={copyPage} url={pageUrl} />
            <RegistryComponentNav navigation={navigation} />
          </div>
        </div>
        {description ? (
          <p className="text-balance text-[1.05rem] text-muted-foreground sm:text-base">
            {description}
          </p>
        ) : null}

        <RegistryComponentLinksList
          links={links}
          registryMeta={registryMeta}
          registryNamespace={registryNamespace}
          type={type}
        />
      </div>
    </div>
  );
}

function RegistryComponentNav({
  navigation,
}: {
  navigation: RegistryNavigationLinks;
}) {
  return (
    <>
      {navigation.previousHref ? (
        <Button
          asChild
          className="extend-touch-target ml-auto size-8 shadow-none md:size-7"
          size="icon"
          variant="secondary"
        >
          <Link href={navigation.previousHref}>
            <IconArrowLeft />
            <span className="sr-only">Previous</span>
          </Link>
        </Button>
      ) : (
        <Button
          className="extend-touch-target ml-auto size-8 shadow-none md:size-7"
          disabled
          size="icon"
          variant="secondary"
        >
          <IconArrowLeft />
          <span className="sr-only">Previous</span>
        </Button>
      )}
      {navigation.nextHref ? (
        <Button
          asChild
          className="extend-touch-target size-8 shadow-none md:size-7"
          size="icon"
          variant="secondary"
        >
          <Link href={navigation.nextHref}>
            <span className="sr-only">Next</span>
            <IconArrowRight />
          </Link>
        </Button>
      ) : (
        <Button
          className="extend-touch-target size-8 shadow-none md:size-7"
          disabled
          size="icon"
          variant="secondary"
        >
          <span className="sr-only">Next</span>
          <IconArrowRight />
        </Button>
      )}
    </>
  );
}

function RegistryComponentLinksList({
  links,
  type,
  registryNamespace,
  registryMeta,
}: {
  links: RegistryComponentLinks | null;
  type: string | null;
  registryNamespace: string;
  registryMeta: RegistryDirectoryMeta | null;
}) {
  if (!links) {
    return null;
  }

  const registryTitle = registryMeta?.title ?? registryNamespace;
  const registryDescription = registryMeta?.description ?? null;
  const registryTooltip = registryDescription
    ? `${registryTitle} — ${registryDescription}`
    : registryTitle;
  const registryLogoMarkup = registryMeta?.logo ?? null;
  const registryLogo =
    typeof registryLogoMarkup === "string" ? registryLogoMarkup.trim() : "";
  const shouldRenderLogo =
    registryLogo.startsWith("<svg") && registryLogo.includes("</svg>");

  return (
    <div className="flex items-center gap-2 pt-4">
      {links.doc ? (
        <Badge asChild className="rounded-full" variant="secondary">
          <a href={links.doc} rel="noreferrer noopener" target="_blank">
            Docs <IconArrowUpRight />
          </a>
        </Badge>
      ) : null}
      {links.api ? (
        <Badge asChild className="rounded-full" variant="secondary">
          <a href={links.api} rel="noreferrer noopener" target="_blank">
            API Reference <IconArrowUpRight />
          </a>
        </Badge>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Badge title={registryTooltip} variant="secondary">
          {shouldRenderLogo ? (
            <ItemMedia
              aria-hidden="true"
              className="size-3 bg-transparent grayscale [&_svg]:size-3 [&_svg]:fill-foreground"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: SVGs are sourced from a trusted registry directory file.
              dangerouslySetInnerHTML={{ __html: registryLogo }}
              variant="default"
            />
          ) : null}
          <span>{registryNamespace}</span>
        </Badge>
        {type ? <Badge variant="outline">{type}</Badge> : null}
      </div>
    </div>
  );
}

function RegistryComponentPreviewSection({
  component,
  headingClass,
  previewEntry,
  previewSource,
  previewTitle,
  registrySlug,
}: {
  component: string;
  headingClass: string;
  previewEntry: string | null;
  previewSource: string | null;
  previewTitle: string | undefined;
  registrySlug: string;
}) {
  return (
    <section>
      <h2 className={headingClass} id="preview">
        Preview
      </h2>
      {previewEntry && previewSource ? (
        <ComponentPreviewTabs
          align="start"
          className="mt-6"
          component={
            <RegistryLivePreview
              component={component}
              entryPath={previewEntry}
              registry={registrySlug}
            />
          }
          source={
            <RegistryComponentSource
              code={previewSource}
              collapsible={false}
              title={previewTitle}
            />
          }
        />
      ) : (
        <div className="mt-6 flex flex-col items-center gap-2 rounded-lg border border-border/60 bg-background/60 px-6 py-10 text-center">
          <p className="font-medium text-sm">Get Live preview coming soon</p>
          <p className="max-w-md text-muted-foreground text-xs">
            We're working on safely rendering registry components inline.
          </p>
        </div>
      )}
    </section>
  );
}

function RegistryComponentInstallationSection({
  headingClass,
  cliCommand,
  installableFiles,
  itemId,
}: {
  headingClass: string;
  cliCommand: string;
  installableFiles: Array<{ path?: string; content?: string | null }>;
  itemId: string;
}) {
  return (
    <section>
      <h2 className={headingClass} id="installation">
        Installation
      </h2>
      <CodeTabs>
        <TabsList className="justify-start gap-4 rounded-none bg-transparent px-0">
          <TabsTrigger
            className="rounded-none border-0 border-transparent border-b-2 bg-transparent px-0 pb-3 text-base text-muted-foreground hover:text-primary data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none dark:data-[state=active]:border-primary dark:data-[state=active]:bg-transparent"
            value="cli"
          >
            CLI
          </TabsTrigger>
          <TabsTrigger
            className="rounded-none border-0 border-transparent border-b-2 bg-transparent px-0 pb-3 text-base text-muted-foreground hover:text-primary data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none dark:data-[state=active]:border-primary dark:data-[state=active]:bg-transparent"
            value="manual"
          >
            Manual
          </TabsTrigger>
        </TabsList>
        <TabsContent
          className="relative [&>.steps]:mt-6 [&_[data-rehype-pretty-code-figure]]:mt-0 [&_h3.font-heading]:font-medium [&_h3.font-heading]:text-base"
          value="cli"
        >
          <RegistryComponentSource
            code={cliCommand}
            collapsible={false}
            language="bash"
          />
        </TabsContent>
        <TabsContent
          className="relative [&>.steps]:mt-6 [&_[data-rehype-pretty-code-figure]]:mt-0 [&_h3.font-heading]:font-medium [&_h3.font-heading]:text-base"
          value="manual"
        >
          <div className="[&>h3]:step steps *:[h3]:first:!mt-0 mb-12 [counter-reset:step]">
            <h3 className="mt-8 scroll-m-32 font-heading font-medium text-xl tracking-tight">
              Copy and paste the following code into your project.
            </h3>
            <div className="flex flex-col gap-6">
              {installableFiles.map((file, index) => (
                <RegistryComponentSource
                  code={file.content ?? ""}
                  key={file.path ?? `${itemId}-${index}`}
                  title={formatFileTitle(file.path)}
                />
              ))}
              {installableFiles.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  This entry ships documentation files rather than installable
                  components. Use the registry docs link above for full
                  guidance.
                </p>
              ) : null}
            </div>
            <h3 className="mt-8 scroll-m-32 font-heading font-medium text-xl tracking-tight">
              Update the import paths to match your project setup.
            </h3>
          </div>
        </TabsContent>
      </CodeTabs>
    </section>
  );
}

function RegistryComponentUsageSection({
  headingClass,
  importName,
  importPath,
  usageSnippet,
}: {
  headingClass: string;
  importName: string;
  importPath: string | null;
  usageSnippet: string | null;
}) {
  return (
    <section>
      <h2 className={headingClass} id="usage">
        Usage
      </h2>
      {importPath ? (
        <div className="mt-6 flex flex-col gap-6 [&_[data-rehype-pretty-code-figure]]:mt-0">
          <RegistryComponentSource
            code={`import { ${importName} } from "${importPath}"`}
            collapsible={false}
            language="tsx"
          />
          {usageSnippet ? (
            <RegistryComponentSource
              code={usageSnippet}
              collapsible={false}
              language="tsx"
            />
          ) : null}
        </div>
      ) : (
        <p className="mt-4 text-muted-foreground text-sm">
          Usage varies by registry entry. Refer to the registry docs or source
          files below for details.
        </p>
      )}
    </section>
  );
}

function toPascalCase(value: string) {
  return value
    .replace(NON_ALPHANUMERIC_REGEX, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
    .join("");
}

function isDocFile(file: { path?: string; type?: string | null }) {
  const filePath = file.path ?? "";
  return (
    filePath.endsWith(".mdx") ||
    filePath.endsWith(".md") ||
    file.type?.includes("file") ||
    file.type?.includes("page")
  );
}

function getImportPath(type: string | null | undefined, name: string | null) {
  if (!name) {
    return null;
  }

  if (type?.includes("file") || type?.includes("page")) {
    return null;
  }

  if (type?.includes("ui")) {
    return `@/components/ui/${name}`;
  }
  if (type?.includes("hook")) {
    return `@/hooks/${name}`;
  }
  if (type?.includes("lib")) {
    return `@/lib/${name}`;
  }

  return `@/components/${name}`;
}

function getUsageSnippet(type: string | null | undefined, importName: string) {
  if (type?.includes("file") || type?.includes("page")) {
    return null;
  }

  if (type?.includes("hook")) {
    return `const value = ${importName}()`;
  }

  if (type?.includes("lib")) {
    return `${importName}()`;
  }

  return `<${importName} />`;
}

function formatFileTitle(filePath: string | undefined | null) {
  if (!filePath) {
    return undefined;
  }

  return filePath.replace(SRC_PREFIX_REGEX, "");
}

async function getRegistryOutputNeighbours(
  registry: string,
  component: string
) {
  const registryRoot = resolveRegistryRoot();
  const registryNamespace = resolveRegistryNamespace(registry);
  const registryPath = path.join(registryRoot, registryNamespace);

  let entries: string[] = [];
  try {
    const dirEntries = await fs.readdir(registryPath, {
      withFileTypes: true,
    });
    entries = dirEntries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b));
  } catch {
    return { previous: null, next: null };
  }

  const index = entries.indexOf(component);
  if (index === -1) {
    return { previous: null, next: null };
  }

  return {
    previous: entries[index - 1] ?? null,
    next: entries[index + 1] ?? null,
  };
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

function buildCopyPage({
  title,
  description,
  cliCommand,
  importName,
  importPath,
  files,
}: {
  title: string;
  description: string;
  cliCommand: string;
  importName: string;
  importPath: string | null;
  files: Array<{ path?: string; content?: string | null }>;
}) {
  const lines = [`# ${title}`];

  if (description) {
    lines.push("", description);
  }

  lines.push("", "## Installation", "", "```bash", cliCommand, "```");

  if (files.length) {
    lines.push("", "### Manual");
    for (const file of files) {
      if (!(file.path && file.content)) {
        continue;
      }
      const title = formatFileTitle(file.path) ?? file.path;
      lines.push("", `#### ${title}`, "", "```tsx", file.content, "```");
    }
  }

  if (importPath) {
    lines.push(
      "",
      "## Usage",
      "",
      "```tsx",
      `import { ${importName} } from "${importPath}"`,
      "```"
    );
  }

  return lines.join("\n");
}

interface RegistryComponentLinks {
  doc?: string;
  api?: string;
}

function buildRegistryComponentLinks({
  registry,
  registryItem,
  component,
  componentSlug: _componentSlug,
}: {
  registry: { namespace: string; homepage: string | null };
  registryItem: RegistryOutputRegistryItem | null;
  component: RegistryOutputComponent;
  componentSlug: string;
}): RegistryComponentLinks | null {
  const links: string[] = [];
  const registryHomepage = registry.homepage;
  const shouldUseHomepage = !isPlaceholderHomepage(
    registryHomepage,
    registry.namespace
  );

  addDocLinks(links, component.meta?.docs, registryHomepage, shouldUseHomepage);
  addDocLinks(
    links,
    registryItem?.meta?.docs,
    registryHomepage,
    shouldUseHomepage
  );
  addDocLinks(links, registryItem?.docs, registryHomepage, shouldUseHomepage);
  addDocLinks(links, component.docs, registryHomepage, shouldUseHomepage);

  if (registryItem?.homepage) {
    const homepageLink = normalizeDocRoute(
      registryItem.homepage,
      registryHomepage,
      shouldUseHomepage
    );
    if (homepageLink) {
      links.push(homepageLink);
    }
  }

  const uniqueLinks = Array.from(new Set(links));
  let doc = uniqueLinks[0];
  let api = uniqueLinks[1];

  if (!doc && registryHomepage && shouldUseHomepage) {
    doc = buildRegistryComponentFallbackLink(registryHomepage);
  }

  if (doc && api && doc === api) {
    api = undefined;
  }

  if (!(doc || api)) {
    return null;
  }

  if (!doc && api) {
    return { doc: api };
  }

  return { doc, api };
}

function addDocLinks(
  destination: string[],
  value: unknown,
  registryHomepage: string | null,
  shouldUseHomepage: boolean
) {
  if (!value) {
    return;
  }

  if (typeof value === "string") {
    const normalized = normalizeDocRoute(
      value,
      registryHomepage,
      shouldUseHomepage
    );
    if (normalized) {
      destination.push(normalized);
    }
    return;
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      const route = getDocRoute(entry);
      if (!route) {
        continue;
      }
      const normalized = normalizeDocRoute(
        route,
        registryHomepage,
        shouldUseHomepage
      );
      if (normalized) {
        destination.push(normalized);
      }
    }
  }
}

function getDocRoute(value: unknown): string | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const route = (value as RegistryOutputDocLink).route;
  if (typeof route !== "string" || !route.trim()) {
    return null;
  }

  return route.trim();
}

function normalizeDocRoute(
  route: string,
  registryHomepage: string | null,
  shouldUseHomepage: boolean
): string | null {
  const trimmed = route.trim();
  if (!trimmed) {
    return null;
  }

  if (isHttpUrl(trimmed)) {
    return trimmed;
  }

  if (!(registryHomepage && shouldUseHomepage)) {
    return null;
  }

  try {
    return new URL(trimmed, registryHomepage).toString();
  } catch {
    return null;
  }
}

function buildRegistryComponentFallbackLink(
  registryHomepage: string
): string | null {
  if (!isHttpUrl(registryHomepage)) {
    return null;
  }

  const base = registryHomepage.replace(TRAILING_SLASH_REGEX, "");

  return base;
}

function isHttpUrl(value: string) {
  return HTTP_URL_REGEX.test(value);
}

function isPlaceholderHomepage(
  homepage: string | null,
  registryNamespace: string
) {
  if (!homepage) {
    return true;
  }

  const normalized = homepage.toLowerCase();
  if (!isHttpUrl(homepage)) {
    return true;
  }

  if (
    normalized.includes("ui.shadcn.com") &&
    !registryNamespace.toLowerCase().includes("shadcn")
  ) {
    return true;
  }

  return false;
}
