"use client";

import { type ComponentProps, useMemo } from "react";

import { useConfig } from "@/hooks/use-config";
import { Tabs } from "@/registry/new-york-v4/ui/tabs";

export function CodeTabs({ children }: ComponentProps<typeof Tabs>) {
  const [config, setConfig] = useConfig();

  const installationType = useMemo(() => {
    return config.installationType || "cli";
  }, [config]);

  return (
    <Tabs
      className="relative mt-6 w-full"
      onValueChange={(value) =>
        setConfig({ ...config, installationType: value as "cli" | "manual" })
      }
      value={installationType}
    >
      {children}
    </Tabs>
  );
}
