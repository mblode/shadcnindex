import { RegistryComponentPageContent } from "@/components/registry-component-page";
import { getRegistryOutputItem } from "@/lib/registry-output";
import { toRegistrySlug } from "@/lib/registry-slug";
import { toAbsoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: {
  params: Promise<{ registry: string; component: string }>;
}) {
  const params = await props.params;
  const registry = decodeURIComponent(params.registry);
  const component = decodeURIComponent(params.component);
  const item = await getRegistryOutputItem(registry, component);

  if (!item) {
    return {};
  }

  const title = item.component.title ?? item.component.name ?? component;
  const description =
    item.component.description ?? "Component details from the registry.";
  const registrySlug = toRegistrySlug(registry);
  const canonicalPath = `/components/${encodeURIComponent(
    registrySlug
  )}/${encodeURIComponent(component)}`;
  const ogImageUrl = toAbsoluteUrl(
    `/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(
      description
    )}`
  );

  return {
    title,
    description,
    alternates: {
      canonical: toAbsoluteUrl(canonicalPath),
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: toAbsoluteUrl(canonicalPath),
      images: [
        {
          url: ogImageUrl,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          alt: title,
        },
      ],
      creator: "@shadcn",
    },
  };
}

export default async function RegistryComponentPage(props: {
  params: Promise<{ registry: string; component: string }>;
}) {
  return <RegistryComponentPageContent params={props.params} />;
}
