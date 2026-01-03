import type { MetadataRoute } from "next";
import { getLocalRegistryIndex } from "@/lib/registry-local-index";
import { toRegistrySlug } from "@/lib/registry-slug";
import { getSiteUrl } from "@/lib/seo";

const STATIC_ROUTES = ["/", "/search"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const lastModified = new Date();

  const staticEntries = STATIC_ROUTES.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified,
  }));

  const registryIndex = await getLocalRegistryIndex();
  const componentEntries: MetadataRoute.Sitemap = [];

  for (const item of registryIndex.items ?? []) {
    const [namespace, component] = item.id.split("/");
    if (!(namespace && component)) {
      continue;
    }

    const registrySlug = toRegistrySlug(namespace);
    componentEntries.push({
      url: `${siteUrl}/components/${encodeURIComponent(
        registrySlug
      )}/${encodeURIComponent(component)}`,
      lastModified,
    });
  }

  return [...staticEntries, ...componentEntries];
}
