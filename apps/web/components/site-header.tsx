import Link from "next/link";
import { Icons } from "@/components/icons";
import { siteConfig } from "@/lib/config";
import { Button } from "@/registry/new-york-v4/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background">
      <div className="container-wrapper px-6">
        <div className="flex h-(--header-height) items-center">
          <Button asChild className="h-8 gap-2 px-2" variant="ghost">
            <Link href="/search">
              <Icons.logo className="size-5" />
              <span className="font-medium text-sm">{siteConfig.name}</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
