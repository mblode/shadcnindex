import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
import { toAbsoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  alternates: {
    canonical: toAbsoluteUrl("/"),
  },
};

export default function SearchIndexPage() {
  return null;
}
