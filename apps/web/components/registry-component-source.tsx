import type * as React from "react";
import { CodeCollapsibleWrapper } from "@/components/code-collapsible-wrapper";
import { CopyButton } from "@/components/copy-button";
import { getIconForLanguageExtension } from "@/components/icons";
import { highlightCode } from "@/lib/highlight-code";
import { cn } from "@/lib/utils";

export async function RegistryComponentSource({
  code,
  title,
  language,
  collapsible = true,
  className,
}: React.ComponentProps<"div"> & {
  code: string;
  title?: string;
  language?: string;
  collapsible?: boolean;
}) {
  if (!code) {
    return null;
  }

  const lang = language ?? title?.split(".").pop() ?? "tsx";
  const highlightedCode = await highlightCode(code, lang);

  if (!collapsible) {
    return (
      <div className={cn("relative", className)}>
        <RegistryComponentCode
          code={code}
          highlightedCode={highlightedCode}
          language={lang}
          title={title}
        />
      </div>
    );
  }

  return (
    <CodeCollapsibleWrapper className={className}>
      <RegistryComponentCode
        code={code}
        highlightedCode={highlightedCode}
        language={lang}
        title={title}
      />
    </CodeCollapsibleWrapper>
  );
}

function RegistryComponentCode({
  code,
  highlightedCode,
  language,
  title,
}: {
  code: string;
  highlightedCode: string;
  language: string;
  title: string | undefined;
}) {
  return (
    <figure className="[&>pre]:max-h-96" data-rehype-pretty-code-figure="">
      {title && (
        <figcaption
          className="flex items-center gap-2 text-code-foreground [&_svg]:size-4 [&_svg]:text-code-foreground [&_svg]:opacity-70"
          data-language={language}
          data-rehype-pretty-code-title=""
        >
          {getIconForLanguageExtension(language)}
          {title}
        </figcaption>
      )}
      <CopyButton value={code} />
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: needed for syntax highlighting */}
      <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
    </figure>
  );
}
