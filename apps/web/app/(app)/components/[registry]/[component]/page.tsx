import { IconArrowUpRight } from "@tabler/icons-react";
import { notFound } from "next/navigation";

import { CodeTabs } from "@/components/code-tabs";
import { RegistryComponentSource } from "@/components/registry-component-source";
import { RegistryLivePreview } from "@/components/registry-live-preview";
import { getRegistryOutputItem } from "@/lib/registry-output";
import { Badge } from "@/registry/new-york-v4/ui/badge";
import { Card } from "@/registry/new-york-v4/ui/card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from "@/registry/new-york-v4/ui/item";
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
  const previewEntry = filesWithContent[0]?.path ?? null;
  const dependencies = componentData.dependencies ?? [];
  const cliCommand = `npx shadcn@latest add ${item.id}`;
  const importName = toPascalCase(componentData.name ?? component);
  const importPath = getImportPath(componentData.type, componentData.name);

  return (
    <div className="flex min-w-0 flex-1 flex-col text-[1.05rem] sm:text-[15px]">
      <div className="h-(--top-spacing) shrink-0" />
      <div className="mx-auto flex w-full min-w-0 max-w-2xl flex-1 flex-col gap-8 px-4 py-6 text-neutral-800 md:px-0 lg:py-8 dark:text-neutral-300">
        <header className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{item.registry.namespace}</Badge>
            {componentData.type ? (
              <Badge variant="outline">{componentData.type}</Badge>
            ) : null}
            {dependencies.map((dependency) => (
              <Badge key={dependency} variant="outline">
                {dependency}
              </Badge>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="scroll-m-20 font-semibold text-4xl tracking-tight sm:text-3xl xl:text-4xl">
              {title}
            </h1>
            {description ? (
              <p className="text-balance text-[1.05rem] text-muted-foreground sm:text-base">
                {description}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {item.registry.homepage ? (
              <Badge asChild className="rounded-full" variant="secondary">
                <a
                  href={item.registry.homepage}
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  Registry Docs <IconArrowUpRight />
                </a>
              </Badge>
            ) : null}
          </div>
        </header>

        <div className="w-full flex-1 *:data-[slot=alert]:first:mt-0">
          <section className="mt-6">
            <h2
              className="mt-2 scroll-m-28 font-heading font-medium text-xl tracking-tight"
              id="preview"
            >
              Preview
            </h2>
            <Card className="mt-6 border-border/60 bg-background/60 px-6 py-10">
              {previewEntry ? (
                <RegistryLivePreview
                  className="mx-auto max-w-xl"
                  component={component}
                  entryPath={previewEntry}
                  registry={registry}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-center">
                  <p className="font-medium text-sm">
                    Get Live preview coming soon
                  </p>
                  <p className="max-w-md text-muted-foreground text-xs">
                    We’re working on safely rendering registry components
                    inline.
                  </p>
                </div>
              )}
            </Card>
          </section>

          <section className="mt-10">
            <h2
              className="mt-2 scroll-m-28 font-heading font-medium text-xl tracking-tight"
              id="installation"
            >
              Installation
            </h2>
            <CodeTabs>
              <TabsList>
                <TabsTrigger value="cli">CLI</TabsTrigger>
                <TabsTrigger value="manual">Manual</TabsTrigger>
              </TabsList>
              <TabsContent value="cli">
                <RegistryComponentSource
                  code={cliCommand}
                  collapsible={false}
                  language="bash"
                />
              </TabsContent>
              <TabsContent value="manual">
                <div className="[&>h3]:step steps *:[h3]:first:!mt-0 mb-8 [counter-reset:step]">
                  <h3 className="mt-8 font-heading font-medium text-xl tracking-tight">
                    Copy and paste the following code into your project.
                  </h3>
                  <div className="flex flex-col gap-6">
                    {installableFiles.map((file, index) => (
                      <RegistryComponentSource
                        code={file.content ?? ""}
                        key={file.path ?? `${item.id}-${index}`}
                        title={file.path}
                      />
                    ))}
                    {installableFiles.length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        This entry ships documentation files rather than
                        installable components. Use the registry docs link above
                        for full guidance.
                      </p>
                    ) : null}
                  </div>
                  <h3 className="mt-8 font-heading font-medium text-xl tracking-tight">
                    Update the import paths to match your project setup.
                  </h3>
                </div>
              </TabsContent>
            </CodeTabs>
          </section>

          <section className="mt-10">
            <h2
              className="mt-2 scroll-m-28 font-heading font-medium text-xl tracking-tight"
              id="usage"
            >
              Usage
            </h2>
            {importPath ? (
              <RegistryComponentSource
                code={`import { ${importName} } from "${importPath}"`}
                collapsible={false}
                language="tsx"
              />
            ) : (
              <p className="mt-4 text-muted-foreground text-sm">
                Usage varies by registry entry. Refer to the registry docs or
                source files below for details.
              </p>
            )}
          </section>

          <section className="mt-10">
            <h2
              className="mt-2 scroll-m-28 font-heading font-medium text-xl tracking-tight"
              id="source-files"
            >
              Source Files
            </h2>
            {componentData.files && componentData.files.length > 0 ? (
              <ItemGroup className="mt-6 rounded-xl border">
                {componentData.files.map((file, index) => (
                  <div key={`${file.path ?? index}`}>
                    <Item className="rounded-none px-4 py-3" size="sm">
                      <ItemContent>
                        <ItemTitle className="text-sm">
                          {file.path ?? "Untitled file"}
                        </ItemTitle>
                        {file.type ? (
                          <ItemDescription>
                            {isDocFile(file) ? "documentation" : file.type}
                          </ItemDescription>
                        ) : null}
                      </ItemContent>
                    </Item>
                    {index < (componentData.files?.length ?? 0) - 1 ? (
                      <ItemSeparator />
                    ) : null}
                  </div>
                ))}
              </ItemGroup>
            ) : (
              <p className="mt-4 text-muted-foreground text-sm">
                No source files listed for this entry.
              </p>
            )}
          </section>
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
