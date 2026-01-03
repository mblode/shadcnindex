import type { Metadata } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ActiveThemeProvider } from "@/components/active-theme";
import { Analytics } from "@/components/analytics";
import { JsonLd } from "@/components/json-ld";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { ThemeProvider } from "@/components/theme-provider";
import { LayoutProvider } from "@/hooks/use-layout";
import { META_THEME_COLORS, siteConfig } from "@/lib/config";
import { fontVariables } from "@/lib/fonts";
import { getSiteUrl, toAbsoluteUrl } from "@/lib/seo";
import { cn } from "@/lib/utils";

import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const siteUrl = getSiteUrl();
const organizationId = `${siteUrl}#organization`;
const websiteId = `${siteUrl}#website`;
const sameAs = [siteConfig.links.twitter, siteConfig.links.github].filter(
  (link): link is string => Boolean(link)
);
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": organizationId,
  name: siteConfig.name,
  url: siteUrl,
  logo: toAbsoluteUrl("/android-chrome-512x512.png"),
  sameAs,
};
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": websiteId,
  name: siteConfig.name,
  url: siteUrl,
  description: siteConfig.description,
  publisher: {
    "@id": organizationId,
  },
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  metadataBase: new URL(appUrl),
  description: siteConfig.description,
  keywords: ["Next.js", "React", "Tailwind CSS", "Components", "shadcn"],
  applicationName: siteConfig.name,
  category: "Developer Tools",
  authors: [
    {
      name: "shadcn",
      url: "https://shadcn.com",
    },
  ],
  creator: "shadcn",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: appUrl,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    creator: "@shadcn",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={fontVariables}
      data-scroll-behavior="smooth"
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: needed for theme initialization before hydration
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]').setAttribute('content', '${META_THEME_COLORS.dark}')
                }
                if (localStorage.layout) {
                  document.documentElement.classList.add('layout-' + localStorage.layout)
                }
              } catch (_) {}
            `,
          }}
        />
        <meta content={META_THEME_COLORS.light} name="theme-color" />
      </head>
      <body className={cn("group/body antialiased")}>
        <JsonLd data={organizationJsonLd} />
        <JsonLd data={websiteJsonLd} />
        <ThemeProvider>
          <LayoutProvider>
            <ActiveThemeProvider>
              <NuqsAdapter>{children}</NuqsAdapter>
              <TailwindIndicator />
              <Analytics />
            </ActiveThemeProvider>
          </LayoutProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
