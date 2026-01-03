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
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden font-['Geist']">
      <JsonLd data={faqJsonLd} />
      <main
        className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto overflow-x-hidden bg-background-200"
        id="domains-main-scroll"
      >
        <div className="mx-auto flex min-h-full max-w-screen-2xl flex-col gap-6 px-4 pt-3 pb-10 sm:px-5 md:px-12 lg:px-16 xl:px-32">
          <RegistrySearch />
          {children}
        </div>
      </main>
      {modal}
    </div>
  );
}
