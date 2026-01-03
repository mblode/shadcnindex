import path from "node:path";
import { NextResponse } from "next/server";
import type * as ts from "typescript";

import { getRegistryOutputItem } from "@/lib/registry-output";

export const runtime = "nodejs";

const CN_SNIPPET = `
import { clsx } from "https://esm.sh/clsx@2";
import { twMerge } from "https://esm.sh/tailwind-merge@3";
export const cn = (...inputs) => twMerge(clsx(inputs));
`;

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ registry: string; component: string; file: string[] }>;
  }
) {
  const { registry, component, file } = await params;
  const decodedRegistry = decodeURIComponent(registry);
  const decodedComponent = decodeURIComponent(component);
  const filePath = file.join("/");

  const item = await getRegistryOutputItem(decodedRegistry, decodedComponent);
  if (!item) {
    return new NextResponse("Not found", { status: 404 });
  }

  const targetFile = item.component.files?.find(
    (entry) => entry.path === filePath
  );

  if (!targetFile?.content) {
    return new NextResponse("File not found", { status: 404 });
  }

  const { code, usesCn, hasUnsupportedAliases } = preprocessCode(
    targetFile.content
  );

  if (hasUnsupportedAliases) {
    return new NextResponse(buildUnsupportedModule(), {
      status: 200,
      headers: {
        "content-type": "application/javascript; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  }

  const tsModule = (await import("typescript")) as typeof ts;
  const transformed = tsModule.transpileModule(code, {
    compilerOptions: {
      jsx: tsModule.JsxEmit.ReactJSX,
      jsxImportSource: "react",
      module: tsModule.ModuleKind.ESNext,
      target: tsModule.ScriptTarget.ES2022,
    },
    fileName: targetFile.path ?? "preview.tsx",
  });

  const rewritten = rewriteImports(
    `${usesCn ? CN_SNIPPET : ""}${transformed.outputText}`,
    filePath
  );

  return new NextResponse(rewritten, {
    status: 200,
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function preprocessCode(content: string) {
  const lines = content.split("\n");
  const filtered: string[] = [];
  let usesCn = false;
  let hasUnsupportedAliases = false;

  for (const line of lines) {
    if (line.includes("@/lib/utils")) {
      usesCn = true;
      continue;
    }
    if (line.includes("@/")) {
      hasUnsupportedAliases = true;
    }
    filtered.push(line);
  }

  return {
    code: filtered.join("\n"),
    usesCn,
    hasUnsupportedAliases,
  };
}

function rewriteImports(code: string, filePath: string) {
  const resolveRelative = (specifier: string) => {
    if (!specifier.startsWith(".") || specifier.endsWith(".css")) {
      return specifier;
    }

    const resolved = path.posix.resolve(
      path.posix.dirname(filePath),
      specifier
    );
    return `${resolved}.mjs`;
  };

  const toEsmSh = (specifier: string) => {
    if (
      specifier.startsWith(".") ||
      specifier.startsWith("/") ||
      specifier.startsWith("http://") ||
      specifier.startsWith("https://")
    ) {
      return specifier;
    }

    return `https://esm.sh/${specifier}`;
  };

  return code
    .replace(/from\s+["']([^"']+)["']/g, (match, spec) => {
      const rewritten = resolveRelative(spec);
      return `from "${toEsmSh(rewritten)}"`;
    })
    .replace(/import\(\s*["']([^"']+)["']\s*\)/g, (match, spec) => {
      const rewritten = resolveRelative(spec);
      return `import("${toEsmSh(rewritten)}")`;
    });
}

function buildUnsupportedModule() {
  return `
    import React from "https://esm.sh/react";
    export default function UnsupportedPreview() {
      return React.createElement(
        "div",
        { style: { color: "var(--muted-foreground)", fontSize: "0.875rem" } },
        "Preview not available for this registry entry."
      );
    }
  `;
}
