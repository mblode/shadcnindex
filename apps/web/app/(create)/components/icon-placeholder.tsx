"use client";

import { Square } from "lucide-react";

export function IconPlaceholder(
  props: React.ComponentProps<"svg"> & Record<string, string>
) {
  return <Square {...props} />;
}
