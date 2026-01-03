import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { RegistrySearch } from "@/components/registry-search";
import { siteConfig } from "@/lib/config";
import { getSiteUrl, toAbsoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";
export const revalidate = false;
const siteUrl = getSiteUrl();

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is shadcn index?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "shadcn index is a search experience for shadcn registries with live previews and install-ready commands.",
      },
    },
    {
      "@type": "Question",
      name: "How do I install a component?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Open a component page and copy the CLI command like npx shadcn@latest add component-name.",
      },
    },
    {
      "@type": "Question",
      name: "Which registries are indexed?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "shadcn index aggregates multiple registries so you can search across libraries in one place.",
      },
    },
    {
      "@type": "Question",
      name: "Does shadcn index host the components?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. It indexes registry metadata and links back to the original sources.",
      },
    },
  ],
};

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  alternates: {
    canonical: toAbsoluteUrl("/"),
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteUrl,
    type: "website",
  },
  twitter: {
    title: siteConfig.name,
    description: siteConfig.description,
    card: "summary_large_image",
    creator: "@shadcn",
  },
};

export default function SearchLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={faqJsonLd} />

      <div className="size-full min-h-full">
        <main
          className="absolute top-[123px] h-[calc(100dvh-123px)] w-full flex-1 overflow-y-auto overflow-x-hidden bg-background md:top-[65px] md:h-[calc(100dvh-65px)]"
          id="domains-main-scroll"
        >
          <RegistrySearch />
          {children}
        </main>
      </div>

      {modal}
    </>
  );
}
