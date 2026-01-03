"use client";

import type { ComponentType, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

type PreviewStatus = "loading" | "ready" | "error";

type PreviewMessage = {
  source: "registry-preview";
  moduleUrl: string;
  type: "ready" | "error" | "height";
  message?: string;
  height?: number;
};

type ReactDomRoot = {
  render: (node: ReactNode) => void;
  unmount: () => void;
};

type ReactModule = {
  createElement: typeof import("react").createElement;
};

type ReactDomClientModule = {
  createRoot: (container: Element | DocumentFragment) => ReactDomRoot;
};

const REACT_URL = "https://esm.sh/react";
const REACT_DOM_URL = "https://esm.sh/react-dom/client";
const DEFAULT_PADDING = 24;

export default function RegistryPreviewShell() {
  const searchParams = useSearchParams();
  const moduleUrl = useMemo(() => {
    const value = searchParams.get("module") ?? "";
    if (!value.startsWith("/registry-preview/")) {
      return "";
    }
    return value;
  }, [searchParams]);
  const componentName = searchParams.get("component") ?? "Component";
  const rootRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const reactRootRef = useRef<ReactDomRoot | null>(null);
  const [status, setStatus] = useState<PreviewStatus>("loading");
  const [error, setError] = useState<string | null>(null);

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
        const [reactModule, reactDomModule, registryModule] =
          await Promise.all([
            import(/* webpackIgnore: true */ REACT_URL) as Promise<ReactModule>,
            import(
              /* webpackIgnore: true */ REACT_DOM_URL
            ) as Promise<ReactDomClientModule>,
            import(/* webpackIgnore: true */ moduleUrl) as Promise<
              Record<string, unknown>
            >,
          ]);

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

  useEffect(() => {
    if (!moduleUrl) {
      return;
    }

    const target = wrapperRef.current;
    if (!target) {
      return;
    }

    const postHeight = () => {
      const height = Math.ceil(target.getBoundingClientRect().height);
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(
          {
            source: "registry-preview",
            moduleUrl,
            type: "height",
            height,
          } satisfies PreviewMessage,
          "*"
        );
      }
    };

    const observer = new ResizeObserver(() => {
      postHeight();
    });
    observer.observe(target);
    postHeight();

    return () => observer.disconnect();
  }, [moduleUrl, status, padding]);

  return (
    <div className="min-h-svh bg-background text-foreground">
      <div
        className={cn("theme-container w-full")}
        ref={wrapperRef}
        style={{ padding }}
      >
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
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
    .join("");
}
