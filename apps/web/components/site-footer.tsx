"use client";

import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();
  const isSearchRoute = pathname !== "/" && pathname !== "";

  if (isSearchRoute) {
    return null;
  }

  return (
    <footer className="fixed inset-x-0 bottom-0 border-border/60 border-t">
      <div className="container-wrapper px-4 xl:px-6">
        <div className="flex h-16 items-center justify-center text-muted-foreground text-xs sm:text-sm">
          <span>
            Built by{" "}
            <a
              className="font-medium underline underline-offset-4"
              href="https://matthewblode.com"
              rel="noreferrer noopener"
              target="_blank"
            >
              Matthew Blode
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
