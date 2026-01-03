"use client";

import { useSearchParams } from "next/navigation";
import type { ComponentType, ReactNode } from "react";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type PreviewStatus = "loading" | "ready" | "error";

interface PreviewMessage {
  source: "registry-preview";
  moduleUrl: string;
  type: "ready" | "error";
  message?: string;
}

interface ReactDomRoot {
  render: (node: ReactNode) => void;
  unmount: () => void;
}

interface ReactModule {
  createElement: typeof import("react").createElement;
}

interface ReactDomClientModule {
  createRoot: (container: Element | DocumentFragment) => ReactDomRoot;
}

const REACT_URL = "https://esm.sh/react";
const REACT_DOM_URL = "https://esm.sh/react-dom/client";
const DEFAULT_PADDING = 24;
const IFRAME_RESIZER_LICENSE = "GPLv3";
const NON_ALPHANUMERIC_REGEX = /[^a-zA-Z0-9]+/g;
const LEADING_SLASH_REGEX = /^\/+/;

interface IframeResizerConfig {
  license: string;
}

function RegistryPreviewShellContent() {
  const searchParams = useSearchParams();
  const registry = searchParams.get("registry") ?? "";
  const componentParam = searchParams.get("component") ?? "";
  const componentName = componentParam || "Component";
  const entryPath = searchParams.get("entry") ?? "";
  const moduleUrl = useMemo(() => {
    if (!(registry && componentParam && entryPath)) {
      return "";
    }
    return buildModuleUrl(registry, componentParam, entryPath);
  }, [componentParam, entryPath, registry]);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const reactRootRef = useRef<ReactDomRoot | null>(null);
  const [status, setStatus] = useState<PreviewStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    (window as Window & { iframeResizer?: IframeResizerConfig }).iframeResizer =
      {
        license: IFRAME_RESIZER_LICENSE,
      };

    import("@iframe-resizer/child").catch(() => undefined);
  }, []);

  const padding = useMemo(() => {
    const value = Number.parseInt(searchParams.get("padding") ?? "", 10);
    if (Number.isNaN(value)) {
      return DEFAULT_PADDING;
    }
    return Math.min(Math.max(value, 0), 96);
  }, [searchParams]);

  useEffect(() => {
    if (!moduleUrl) {
      setStatus("error");
      setError("Missing preview module.");
      return;
    }

    const root = rootRef.current;
    if (!root) {
      return;
    }

    let cancelled = false;
    reactRootRef.current?.unmount();
    reactRootRef.current = null;
    setStatus("loading");
    setError(null);

    const postMessage = (
      payload: Omit<PreviewMessage, "source" | "moduleUrl">
    ) => {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(
          {
            source: "registry-preview",
            moduleUrl,
            ...payload,
          } satisfies PreviewMessage,
          "*"
        );
      }
    };

    const load = async () => {
      try {
        const [reactModule, reactDomModule, registryModule] = await Promise.all(
          [
            import(/* webpackIgnore: true */ REACT_URL) as Promise<ReactModule>,
            import(
              /* webpackIgnore: true */ REACT_DOM_URL
            ) as Promise<ReactDomClientModule>,
            import(/* webpackIgnore: true */ moduleUrl) as Promise<
              Record<string, unknown>
            >,
          ]
        );

        if (cancelled) {
          return;
        }

        const previewComponent = resolvePreviewComponent(
          registryModule,
          componentName
        );

        if (!previewComponent) {
          throw new Error("Preview not available.");
        }

        reactRootRef.current?.unmount();
        const reactRoot = reactDomModule.createRoot(root);
        reactRootRef.current = reactRoot;
        reactRoot.render(reactModule.createElement(previewComponent));

        setStatus("ready");
        postMessage({ type: "ready" });
      } catch (err) {
        if (cancelled) {
          return;
        }
        const message =
          err instanceof Error ? err.message : "Preview failed to load.";
        setStatus("error");
        setError(message);
        postMessage({ type: "error", message });
      }
    };

    load();

    return () => {
      cancelled = true;
      reactRootRef.current?.unmount();
      reactRootRef.current = null;
    };
  }, [componentName, moduleUrl]);

  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className={cn("theme-container w-full")} style={{ padding }}>
        {status === "error" && error ? (
          <p className="text-muted-foreground text-sm">{error}</p>
        ) : null}
        <div ref={rootRef} />
      </div>
    </div>
  );
}

function resolvePreviewComponent(
  module: Record<string, unknown>,
  componentName: string
) {
  const defaultExport = module.default;
  if (typeof defaultExport === "function") {
    return defaultExport as ComponentType;
  }

  const pascalName = toPascalCase(componentName);
  const namedExport = module[pascalName];
  if (typeof namedExport === "function") {
    return namedExport as ComponentType;
  }

  const candidates = Object.values(module).filter(
    (value) => typeof value === "function"
  );

  if (candidates.length === 1) {
    return candidates[0] as ComponentType;
  }

  return null;
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

function buildModuleUrl(
  registry: string,
  component: string,
  entryPath: string
) {
  const encodedEntry = entryPath
    .replace(LEADING_SLASH_REGEX, "")
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `/registry-preview/${encodeURIComponent(
    registry
  )}/${encodeURIComponent(component)}/${encodedEntry}.mjs`;
}

export default function RegistryPreviewShell() {
  return (
    <Suspense fallback={<div className="min-h-svh bg-background" />}>
      <RegistryPreviewShellContent />
    </Suspense>
  );
}
