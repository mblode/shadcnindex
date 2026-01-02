import Link from "next/link";
import { Suspense } from "react";
import { Icons } from "@/components/icons";
import { siteConfig } from "@/lib/config";
import { Button } from "@/registry/new-york-v4/ui/button";
import { Skeleton } from "@/registry/new-york-v4/ui/skeleton";

export function GitHubLink() {
  return (
    <Button asChild className="h-8 shadow-none" size="sm" variant="ghost">
      <Link href={siteConfig.links.github} rel="noreferrer" target="_blank">
        <Icons.gitHub />
        <Suspense fallback={<Skeleton className="h-4 w-[42px]" />}>
          <StarsCount />
        </Suspense>
      </Link>
    </Button>
  );
}

export async function StarsCount() {
  const data = await fetch("https://api.github.com/repos/shadcn-ui/ui", {
    next: { revalidate: 86_400 },
  });
  const json = await data.json();

  const formattedCount =
    json.stargazers_count >= 1000
      ? `${Math.round(json.stargazers_count / 1000)}k`
      : json.stargazers_count.toLocaleString();

  return (
    <span className="w-fit text-muted-foreground text-xs tabular-nums">
      {formattedCount}
    </span>
  );
}
