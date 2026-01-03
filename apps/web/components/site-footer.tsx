"use client";

import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();
  const isSearchRoute = pathname?.startsWith("/search");

  if (isSearchRoute) {
    return null;
  }

  return (
    <footer className="border-border/60 border-t">
      <div className="container-wrapper px-4 xl:px-6">
        <div className="flex h-(--footer-height) items-center justify-center text-muted-foreground text-xs sm:text-sm">
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
