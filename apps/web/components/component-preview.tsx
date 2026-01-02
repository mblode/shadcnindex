import Image from "next/image";

import { ComponentPreviewTabs } from "@/components/component-preview-tabs";
import { ComponentSource } from "@/components/component-source";
import { Index } from "@/registry/__index__";
import type { Style } from "@/registry/_legacy-styles";

export function ComponentPreview({
  name,
  styleName = "new-york-v4",
  type,
  className,
  align = "center",
  hideCode = false,
  chromeLessOnMobile = false,
  ...props
}: React.ComponentProps<"div"> & {
  name: string;
  styleName?: Style["name"];
  align?: "center" | "start" | "end";
  description?: string;
  hideCode?: boolean;
  type?: "block" | "component" | "example";
  chromeLessOnMobile?: boolean;
}) {
  const Component = Index[styleName]?.[name]?.component;

  if (!Component) {
    return (
      <p className="mt-6 text-muted-foreground text-sm">
        Component{" "}
        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
          {name}
        </code>{" "}
        not found in registry.
      </p>
    );
  }

  if (type === "block") {
    return (
      <div className="relative aspect-[4/2.5] w-full overflow-hidden rounded-md border md:-mx-1">
        <Image
          alt={name}
          className="absolute top-0 left-0 z-20 w-[970px] max-w-none bg-background sm:w-[1280px] md:hidden dark:hidden md:dark:hidden"
          height={900}
          src={`/r/styles/new-york-v4/${name}-light.png`}
          width={1440}
        />
        <Image
          alt={name}
          className="absolute top-0 left-0 z-20 hidden w-[970px] max-w-none bg-background sm:w-[1280px] md:hidden dark:block md:dark:hidden"
          height={900}
          src={`/r/styles/new-york-v4/${name}-dark.png`}
          width={1440}
        />
        <div className="absolute inset-0 hidden w-[1600px] bg-background md:block">
          <iframe
            className="size-full"
            src={`/view/${styleName}/${name}`}
            title={`Preview of ${name}`}
          />
        </div>
      </div>
    );
  }

  return (
    <ComponentPreviewTabs
      align={align}
      chromeLessOnMobile={chromeLessOnMobile}
      className={className}
      component={<Component />}
      hideCode={hideCode}
      source={
        <ComponentSource
          collapsible={false}
          name={name}
          styleName={styleName}
        />
      }
      {...props}
    />
  );
}
