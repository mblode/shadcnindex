import { existsSync, promises as fs } from "node:fs";
import path from "node:path";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CodeTabs } from "@/components/code-tabs";
import { ComponentPreviewTabs } from "@/components/component-preview-tabs";
import { DocsCopyPage } from "@/components/docs-copy-page";
import { RegistryComponentSource } from "@/components/registry-component-source";
import { RegistryLivePreview } from "@/components/registry-live-preview";
import { getRegistryOutputItem } from "@/lib/registry-output";
import { absoluteUrl } from "@/lib/utils";
import { Button } from "@/registry/new-york-v4/ui/button";
import {
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/new-york-v4/ui/tabs";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: {
  params: Promise<{ registry: string; component: string }>;
}) {
  const params = await props.params;
  const registry = decodeURIComponent(params.registry);
  const component = decodeURIComponent(params.component);
  const item = await getRegistryOutputItem(registry, component);

  if (!item) {
    return {};
  }

  const title = item.component.title ?? item.component.name ?? component;
  const description =
    item.component.description ?? "Component details from the registry.";

  return {
    title,
    description,
  };
}

export default async function RegistryComponentPage(props: {
  params: Promise<{ registry: string; component: string }>;
}) {
  const params = await props.params;
  const registry = decodeURIComponent(params.registry);
  const component = decodeURIComponent(params.component);
  const item = await getRegistryOutputItem(registry, component);

  if (!item) {
    notFound();
  }

  const componentData = item.component;
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
    registry
  )}/${encodeURIComponent(component)}`;
  const neighbours = await getRegistryOutputNeighbours(registry, component);
  const copyPage = buildCopyPage({
    title,
    description,
    cliCommand,
    importName,
    importPath,
    files: installableFiles,
  });
  const headingClass =
    "[&+.steps]:!mt-0 [&+.steps>h3]:!mt-4 [&+h3]:!mt-6 [&+p]:!mt-4 mt-10 scroll-m-28 font-heading font-medium text-xl tracking-tight first:mt-0 lg:mt-16 [&+]*:[code]:text-xl";

  return (
    <div className="flex items-stretch text-[1.05rem] sm:text-[15px] xl:w-full">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="h-(--top-spacing) shrink-0" />
        <div className="mx-auto flex w-full min-w-0 max-w-2xl flex-1 flex-col gap-8 px-4 py-6 text-neutral-800 md:px-0 lg:py-8 dark:text-neutral-300">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <h1 className="scroll-m-20 font-semibold text-4xl tracking-tight sm:text-3xl xl:text-4xl">
                  {title}
                </h1>
                <div className="docs-nav fixed inset-x-0 bottom-0 isolate z-50 flex items-center gap-2 border-border/50 border-t bg-background/80 px-6 py-4 backdrop-blur-sm sm:static sm:z-0 sm:border-t-0 sm:bg-transparent sm:px-0 sm:pt-1.5 sm:backdrop-blur-none">
                  <DocsCopyPage
                    page={copyPage}
                    url={absoluteUrl(registryPath)}
                  />
                  {neighbours.previous ? (
                    <Button
                      asChild
                      className="extend-touch-target ml-auto size-8 shadow-none md:size-7"
                      size="icon"
                      variant="secondary"
                    >
                      <Link
                        href={`/components/${encodeURIComponent(
                          registry
                        )}/${encodeURIComponent(neighbours.previous)}`}
                      >
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
                  {neighbours.next ? (
                    <Button
                      asChild
                      className="extend-touch-target size-8 shadow-none md:size-7"
                      size="icon"
                      variant="secondary"
                    >
                      <Link
                        href={`/components/${encodeURIComponent(
                          registry
                        )}/${encodeURIComponent(neighbours.next)}`}
                      >
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
                </div>
              </div>
              {description ? (
                <p className="text-balance text-[1.05rem] text-muted-foreground sm:text-base">
                  {description}
                </p>
              ) : null}
            </div>
          </div>

          <div className="w-full flex-1 *:data-[slot=alert]:first:mt-0">
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
                      className="max-w-xl"
                      component={component}
                      entryPath={previewEntry}
                      registry={registry}
                    />
                  }
                  source={
                    <RegistryComponentSource
                      collapsible={false}
                      code={previewSource}
                      title={previewTitle}
                    />
                  }
                />
              ) : (
                <div className="mt-6 flex flex-col items-center gap-2 rounded-lg border border-border/60 bg-background/60 px-6 py-10 text-center">
                  <p className="text-sm font-medium">
                    Get Live preview coming soon
                  </p>
                  <p className="max-w-md text-muted-foreground text-xs">
                    We’re working on safely rendering registry components
                    inline.
                  </p>
                </div>
              )}
            </section>

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
                  className="relative [&>.steps]:mt-6 [&_h3.font-heading]:font-medium [&_h3.font-heading]:text-base *:[figure]:first:mt-0"
                  value="cli"
                >
                  <RegistryComponentSource
                    collapsible={false}
                    code={cliCommand}
                    language="bash"
                  />
                </TabsContent>
                <TabsContent
                  className="relative [&>.steps]:mt-6 [&_h3.font-heading]:font-medium [&_h3.font-heading]:text-base *:[figure]:first:mt-0"
                  value="manual"
                >
                  <div className="[&>h3]:step steps *:[h3]:first:!mt-0 mb-12 [counter-reset:step]">
                    <h3 className="mt-8 scroll-m-32 font-heading font-medium text-xl tracking-tight">
                      Copy and paste the following code into your project.
                    </h3>
                    <div className="flex flex-col gap-6">
                      {installableFiles.map((file, index) => (
                        <RegistryComponentSource
                          key={file.path ?? `${item.id}-${index}`}
                          code={file.content ?? ""}
                          title={formatFileTitle(file.path)}
                        />
                      ))}
                      {installableFiles.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                          This entry ships documentation files rather than
                          installable components. Use the registry docs link
                          above for full guidance.
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

            <section>
              <h2 className={headingClass} id="usage">
                Usage
              </h2>
              {importPath ? (
                <div className="flex flex-col gap-6">
                  <RegistryComponentSource
                    collapsible={false}
                    code={`import { ${importName} } from \"${importPath}\"`}
                    language="tsx"
                  />
                  {usageSnippet ? (
                    <RegistryComponentSource
                      collapsible={false}
                      code={usageSnippet}
                      language="tsx"
                    />
                  ) : null}
                </div>
              ) : (
                <p className="mt-4 text-muted-foreground text-sm">
                  Usage varies by registry entry. Refer to the registry docs or
                  source files below for details.
                </p>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function toPascalCase(value: string) {
  return value
    .replace(/[^a-zA-Z0-9]+/g, " ")
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

  return filePath.replace(/^src\//, "");
}

async function getRegistryOutputNeighbours(
  registry: string,
  component: string
) {
  const registryRoot = resolveRegistryRoot();
  const registryPath = path.join(registryRoot, registry);

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
      if (!file.path || !file.content) {
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
