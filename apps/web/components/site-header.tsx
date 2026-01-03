"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { Icons } from "@/components/icons";
import { ModeSwitcher } from "@/components/mode-switcher";
import { siteConfig } from "@/lib/config";
import { Button } from "@/registry/new-york-v4/ui/button";

export function SiteHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasSearchQuery = Boolean(searchParams.get("q")?.trim());
  const isSearchRoute = pathname === "/" || pathname?.startsWith("/search");
  const isModalSearchRoute =
    pathname?.startsWith("/components") && hasSearchQuery;
  const showSearchHeader = isSearchRoute || isModalSearchRoute;

  if (showSearchHeader) {
    return (
      <header className="flex min-h-[64px] w-full shrink-0 flex-wrap items-center justify-between border-0 border-border border-b border-solid md:flex-nowrap">
        <div className="flex w-1/3 justify-start pl-4 md:pl-6">
          <div className="flex items-center gap-3">
            <Button asChild className="h-8 gap-2 px-2" variant="ghost">
              <Link href="/">
                <Icons.logo className="size-4" />
                <span className="font-medium text-sm">{siteConfig.name}</span>
              </Link>
            </Button>
          </div>
        </div>
        <div className="order-1 flex w-full items-center justify-center border-0 border-border border-t border-solid px-4 py-3 md:order-none md:border-none md:px-5 md:py-0">
          <div className="w-full min-w-0 max-w-[520px]">
            <div className="w-full min-w-0" id="registry-search-slot" />
          </div>
        </div>
        <div className="flex min-h-[64px] w-1/3 select-none items-center justify-end gap-3 pr-4 md:pr-6">
          <ModeSwitcher />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-background">
      <div className="container-wrapper px-4">
        <div className="flex h-(--header-height) items-center justify-between">
          <Button asChild className="h-8 gap-2 px-2" variant="ghost">
            <Link href="/">
              <Icons.logo className="size-4" />
              <span className="font-medium text-sm">{siteConfig.name}</span>
            </Link>
          </Button>
          <ModeSwitcher />
        </div>
      </div>
    </header>
  );
}
