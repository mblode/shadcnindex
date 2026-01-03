"use client";

import iframeResize from "@iframe-resizer/parent";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface RegistryLivePreviewProps {
  registry: string;
  component: string;
  entryPath: string;
  className?: string;
}

type PreviewStatus = "loading" | "ready" | "error";

interface PreviewMessage {
  source?: string;
  moduleUrl?: string | null;
  type?: "ready" | "error";
  message?: string;
}

const DEFAULT_IFRAME_HEIGHT = 320;
const LEADING_SLASH_REGEX = /^\/+/;

type IframeWithResizer = HTMLIFrameElement & {
  iFrameResizer?: {
    disconnect: () => void;
  };
};

export function RegistryLivePreview({
  registry,
  component,
  entryPath,
  className,
}: RegistryLivePreviewProps) {
  const [status, setStatus] = useState<PreviewStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<IframeWithResizer | null>(null);
  const normalizedEntry = useMemo(
    () => entryPath.replace(LEADING_SLASH_REGEX, ""),
    [entryPath]
  );
  const moduleUrl = useMemo(
    () => buildModuleUrl(registry, component, normalizedEntry),
    [component, normalizedEntry, registry]
  );
  const iframeUrl = useMemo(() => {
    const params = new URLSearchParams({
      registry,
      component,
      entry: normalizedEntry,
    });
    return `/registry-preview-shell?${params.toString()}`;
  }, [component, normalizedEntry, registry]);

  useEffect(() => {
    setStatus("loading");
    setError(null);
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) {
      return;
    }

    const origin = window.location.origin;
    iframeResize(
      {
        checkOrigin: [origin],
        license: "GPLv3",
        log: false,
        scrolling: false,
        warningTimeout: 0,
      },
      iframe
    );

    return () => iframe.iFrameResizer?.disconnect();
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent<PreviewMessage>) => {
      const data = event.data;
      if (!data || data.source !== "registry-preview") {
        return;
      }

      if (!data.moduleUrl || data.moduleUrl !== moduleUrl) {
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
  }, [moduleUrl]);

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
          className="w-full rounded-t-lg"
          ref={iframeRef}
          sandbox="allow-scripts allow-same-origin"
          scrolling="no"
          src={iframeUrl}
          style={{ minHeight: `${DEFAULT_IFRAME_HEIGHT}px` }}
          title={`Preview of ${component}`}
        />
      </div>
    </div>
  );
}

function buildModuleUrl(
  registry: string,
  component: string,
  entryPath: string
) {
  const encodedEntry = entryPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `/registry-preview/${encodeURIComponent(
    registry
  )}/${encodeURIComponent(component)}/${encodedEntry}.mjs`;
}
