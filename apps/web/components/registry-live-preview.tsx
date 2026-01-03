"use client";

import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

interface RegistryLivePreviewProps {
  registry: string;
  component: string;
  entryPath: string;
  className?: string;
}

type PreviewStatus = "loading" | "ready" | "error";

type PreviewMessage = {
  source?: string;
  moduleUrl?: string | null;
  type?: "ready" | "error" | "height";
  message?: string;
  height?: number;
};

const DEFAULT_IFRAME_HEIGHT = 320;

export function RegistryLivePreview({
  registry,
  component,
  entryPath,
  className,
}: RegistryLivePreviewProps) {
  const [status, setStatus] = useState<PreviewStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [height, setHeight] = useState<number>(DEFAULT_IFRAME_HEIGHT);
  const previewUrl = useMemo(() => {
    const safePath = entryPath.replace(/^\//, "");
    return `/registry-preview/${encodeURIComponent(
      registry
    )}/${encodeURIComponent(component)}/${safePath}.mjs`;
  }, [registry, component, entryPath]);

  const iframeUrl = useMemo(() => {
    const params = new URLSearchParams({
      module: previewUrl,
      component,
    });
    return `/registry-preview-shell?${params.toString()}`;
  }, [component, previewUrl]);

  useEffect(() => {
    setStatus("loading");
    setError(null);
  }, [iframeUrl]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent<PreviewMessage>) => {
      const data = event.data;
      if (!data || data.source !== "registry-preview") {
        return;
      }

      if (data.moduleUrl !== previewUrl) {
        return;
      }

      if (data.type === "height" && typeof data.height === "number") {
        setHeight(Math.max(data.height, DEFAULT_IFRAME_HEIGHT));
        return;
      }

      if (data.type === "ready") {
        setStatus("ready");
        setError(null);
        return;
      }

      if (data.type === "error") {
        setStatus("error");
        setError(data.message ?? "Preview failed to load.");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [previewUrl]);

  if (status === "error" && error) {
    return (
      <div className={cn("text-muted-foreground text-sm", className)}>
        {error}
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="relative">
        {status === "loading" ? (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
            Loading preview…
          </div>
        ) : null}
        <iframe
          className="w-full rounded-md border border-border/60"
          sandbox="allow-scripts allow-same-origin"
          src={iframeUrl}
          style={{ height: `${height}px` }}
          title={`Preview of ${component}`}
        />
      </div>
    </div>
  );
}
