"use client";

import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/registry/new-york-v4/ui/button";

export function CommandMenu({
  className,
}: React.ComponentProps<"div"> & {
  tree?: unknown;
  colors?: unknown;
  blocks?: unknown;
  navItems?: unknown;
}) {
  return (
    <Button
      className={cn("h-8 w-full justify-start text-sm", className)}
      size="sm"
      variant="outline"
    >
      <Search className="mr-2 size-4" />
      Search docs...
    </Button>
  );
}
