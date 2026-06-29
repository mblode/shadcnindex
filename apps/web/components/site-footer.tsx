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
          <span className="inline-flex items-center gap-1.5">
            Crafted by{" "}
            <a
              className="inline-flex items-center gap-1.5 font-medium underline underline-offset-4"
              href="https://matthewblode.com"
              rel="author"
            >
              {/* biome-ignore lint/performance/noImgElement: small external avatar, next/image not warranted */}
              <img
                alt="Matthew Blode"
                className="rounded-full"
                height={20}
                src="https://matthewblode.com/avatar-sm.png"
                width={20}
              />
              Matthew Blode
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
