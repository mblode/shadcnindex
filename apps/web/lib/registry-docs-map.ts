export interface RegistryDocsPattern {
  path: string;
  slug?: "kebab" | "lower" | "raw";
  categorySource?: "files" | "type";
  baseOverride?: string | null;
}

export const REGISTRY_DOCS_PATTERNS: Record<string, RegistryDocsPattern> = {
  "@8bitcn": {
    path: "/docs/components/:component",
    slug: "kebab",
    categorySource: "files",
    baseOverride: "https://www.8bitcn.com",
  },
  "@8starlabs-ui": {
    path: "/docs/components/:component",
    slug: "kebab",
    categorySource: "files",
  },
  "@abui": {
    path: "/components/:component",
    slug: "kebab",
    categorySource: "files",
    baseOverride: "https://www.abui.io",
  },
  "@algolia": {
    path: "/docs/components/:component",
    slug: "kebab",
    categorySource: "files",
    baseOverride: "https://www.algolia.com",
  },
  "@aliimam": {
    path: "/components/:component",
    slug: "kebab",
    categorySource: "files",
  },
  "@animbits": {
    path: "/docs/components/:component",
    slug: "kebab",
    categorySource: "files",
    baseOverride: "https://www.animbits.dev",
  },
  "@basecn": {
    path: "/docs/components/:component",
    slug: "kebab",
    categorySource: "files",
  },
  "@better-upload": {
    path: "/docs/components/:component",
    slug: "kebab",
    categorySource: "files",
  },
  "@billingsdk": {
    path: "/docs/:component",
    slug: "kebab",
    categorySource: "files",
  },
  "@bundui": {
    path: "/components/:component",
    slug: "kebab",
    categorySource: "files",
  },
  "@coss": {
    path: "/docs/components/:component",
    slug: "kebab",
    categorySource: "files",
  },
  "@cult-ui": {
    path: "/docs/components/:component",
    slug: "kebab",
    categorySource: "files",
    baseOverride: "https://www.cult-ui.com",
  },
  "@diceui": {
    path: "/docs/components/:component",
    slug: "kebab",
    categorySource: "files",
    baseOverride: "https://www.diceui.com",
  },
  "@einui": {
    path: "/docs/components/:component",
    slug: "kebab",
    categorySource: "files",
  },
  "@eldoraui": {
    path: "/docs/components/:component",
    slug: "kebab",
    categorySource: "files",
    baseOverride: "https://www.eldoraui.site",
  },
  "@fancy": {
    path: "/docs/components/:category/:component",
    slug: "kebab",
    categorySource: "files",
    baseOverride: "https://www.fancycomponents.dev",
  },
  "@gaia": {
    path: "/docs/components/:component",
    slug: "kebab",
    categorySource: "files",
  },
  "@glass-ui": {
    path: "/docs/components/:component",
    slug: "kebab",
    categorySource: "files",
  },
  "@hextaui": {
    path: "/components/:component",
    slug: "kebab",
    categorySource: "files",
    baseOverride: "https://www.hextaui.com",
  },
  "@kanpeki": {
    path: "/docs/components/:component",
    slug: "kebab",
    categorySource: "files",
  },
  "@kibo-ui": {
    path: "/components/:component",
    slug: "kebab",
    categorySource: "files",
  },
  "@kokonutui": {
    path: "/docs/components/:component",
    slug: "kebab",
    categorySource: "files",
  },
  "@lens-blocks": {
    path: "/components/:component",
    slug: "kebab",
    categorySource: "files",
  },
  "@limeplay": {
    path: "/docs/components/:component",
    slug: "kebab",
    categorySource: "files",
  },
  "@magicui": {
    path: "/docs/components/:component",
    slug: "kebab",
    categorySource: "files",
  },
  "@magicui-pro": {
    path: "/docs/:component",
    slug: "kebab",
    categorySource: "files",
  },
  "@marmelab": {
    path: "/docs/:component",
    slug: "kebab",
    categorySource: "files",
  },
  "@moleculeui": {
    path: "/docs/components/:component",
    slug: "kebab",
    categorySource: "files",
    baseOverride: "https://www.moleculeui.design",
  },
  "@motion-primitives": {
    path: "/docs/:component",
    slug: "kebab",
    categorySource: "files",
  },
  "@nativeui": {
    path: "/docs/components/:component",
    slug: "kebab",
    categorySource: "files",
    baseOverride: "https://www.nativeui.io",
  },
  "@paceui": {
    path: "/docs/components/:component",
    slug: "kebab",
    categorySource: "files",
  },
  "@phucbm": {
    path: "/docs/components/:component",
    slug: "kebab",
    categorySource: "files",
  },
  "@pixelact-ui": {
    path: "/docs/components/:component",
    slug: "kebab",
    categorySource: "files",
    baseOverride: "https://www.pixelactui.com",
  },
  "@plate": {
    path: "/docs/components/:component",
    slug: "kebab",
    categorySource: "files",
  },
  "@prompt-kit": {
    path: "/docs/:component",
    slug: "kebab",
    categorySource: "files",
    baseOverride: "https://www.prompt-kit.com",
  },
  "@pureui": {
    path: "/docs/components/:component",
    slug: "kebab",
    categorySource: "files",
  },
  "@react-bits": {
    path: "/docs/components/:component",
    slug: "kebab",
    categorySource: "files",
  },
  "@react-market": {
    path: "/docs/components/:component",
    slug: "kebab",
    categorySource: "files",
  },
  "@retroui": {
    path: "/docs/components/:component",
    slug: "kebab",
    categorySource: "files",
    baseOverride: "https://www.retroui.dev",
  },
  "@reui": {
    path: "/docs/components/:component",
    slug: "kebab",
    categorySource: "files",
  },
  "@rigidui": {
    path: "/docs/components/:component",
    slug: "kebab",
    categorySource: "files",
    baseOverride: "https://www.rigidui.com",
  },
  "@roiui": {
    path: "/docs/ui/:component",
    slug: "kebab",
    categorySource: "files",
    baseOverride: "https://www.roiui.com",
  },
  "@scrollxui": {
    path: "/docs/components/:component",
    slug: "kebab",
    categorySource: "files",
    baseOverride: "https://www.scrollxui.dev",
  },
  "@shadcn": {
    path: "/docs/components/:component",
    slug: "kebab",
    categorySource: "files",
  },
  "@shadcnblocks": {
    path: "/components/:component",
    slug: "kebab",
    categorySource: "files",
    baseOverride: "https://www.shadcnblocks.com",
  },
  "@shadcraft": {
    path: "/ui/:component",
    slug: "kebab",
    categorySource: "files",
  },
  "@shadix-ui": {
    path: "/docs/components/:component",
    slug: "kebab",
    categorySource: "files",
  },
  "@simple-ai": {
    path: "/docs/components/:component",
    slug: "kebab",
    categorySource: "files",
    baseOverride: "https://www.simple-ai.dev",
  },
  "@smoothui": {
    path: "/docs/components/:component",
    slug: "kebab",
    categorySource: "files",
  },
  "@solaceui": {
    path: "/docs/:component",
    slug: "kebab",
    categorySource: "files",
  },
  "@tailark": {
    path: "/components/:category/:component",
    slug: "kebab",
    categorySource: "files",
  },
  "@taki": {
    path: "/docs/components/:component",
    slug: "kebab",
    categorySource: "files",
  },
  "@uicapsule": {
    path: "/ui/:component",
    slug: "kebab",
    categorySource: "files",
    baseOverride: "https://www.uicapsule.com",
  },
  "@uitripled": {
    path: "/components/:component",
    slug: "kebab",
    categorySource: "files",
  },
  "@wds": {
    path: "/components/:component",
    slug: "kebab",
    categorySource: "files",
  },
};
