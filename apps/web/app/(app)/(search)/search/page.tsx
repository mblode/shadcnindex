import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
import { toAbsoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: `Search - ${siteConfig.name}`,
  description: siteConfig.description,
  alternates: {
    canonical: toAbsoluteUrl("/search"),
  },
};

export default function SearchPage() {
  return null;
}
