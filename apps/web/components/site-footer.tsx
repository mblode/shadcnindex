import { siteConfig } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="border-border/60 border-t">
      <div className="container-wrapper px-4 xl:px-6">
        <div className="flex h-(--footer-height) items-center justify-center text-muted-foreground text-xs sm:text-sm">
          <a
            className="font-medium underline underline-offset-4"
            href={siteConfig.links.github}
            rel="noreferrer noopener"
            target="_blank"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
