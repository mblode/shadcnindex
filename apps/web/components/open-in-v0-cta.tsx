import { cn } from "@/lib/utils";
import { Button } from "@/registry/new-york-v4/ui/button";

export function OpenInV0Cta({ className }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "group relative flex flex-col gap-2 rounded-lg bg-surface p-6 text-sm text-surface-foreground",
        className
      )}
    >
      <div className="text-balance font-semibold text-base leading-tight group-hover:underline">
        Deploy your shadcn/ui app on Vercel
      </div>
      <div className="text-muted-foreground">
        Trusted by OpenAI, Sonos, Adobe, and more.
      </div>
      <div className="text-muted-foreground">
        Vercel provides tools and infrastructure to deploy apps and features at
        scale.
      </div>
      <Button className="mt-2 w-fit" size="sm">
        Deploy Now
      </Button>
      <a
        className="absolute inset-0"
        href="https://vercel.com/new?utm_source=shadcn_site&utm_medium=web&utm_campaign=docs_cta_deploy_now_callout"
        rel="noreferrer"
        target="_blank"
      >
        <span className="sr-only">Deploy to Vercel</span>
      </a>
    </div>
  );
}
