"use client";

import type { ComponentType } from "react";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

interface RegistryLivePreviewProps {
  registry: string;
  component: string;
  entryPath: string;
  className?: string;
}

export function RegistryLivePreview({
  registry,
  component,
  entryPath,
  className,
}: RegistryLivePreviewProps) {
  const [Preview, setPreview] = useState<ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const previewUrl = useMemo(() => {
    const safePath = entryPath.replace(/^\//, "");
    return `/registry-preview/${encodeURIComponent(
      registry
    )}/${encodeURIComponent(component)}/${safePath}.mjs`;
  }, [registry, component, entryPath]);

  useEffect(() => {
    let active = true;
    setError(null);
    setPreview(null);

    const load = async () => {
      try {
        // biome-ignore lint/suspicious/noExplicitAny: dynamic module shape varies by registry
        const module = (await import(
          /* webpackIgnore: true */ previewUrl
        )) as any;
        if (!active) {
          return;
        }
        const pascalName = toPascalCase(component);
        const candidate =
          module?.default ??
          module?.[pascalName] ??
          Object.values(module).find((value) => typeof value === "function");

        if (typeof candidate === "function") {
          setPreview(() => candidate as ComponentType);
          return;
        }
        setError("Preview not available.");
      } catch (err) {
        if (!active) {
          return;
        }
        setError(
          err instanceof Error ? err.message : "Preview failed to load."
        );
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [component, previewUrl]);

  if (error) {
    return (
      <div className={cn("text-muted-foreground text-sm", className)}>
        {error}
      </div>
    );
  }

  if (!Preview) {
    return (
      <div className={cn("text-muted-foreground text-sm", className)}>
        Loading preview…
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <Preview />
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
