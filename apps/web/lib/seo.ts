import { siteConfig } from "@/lib/config";

const TRAILING_SLASH_REGEX = /\/$/;

export function getSiteUrl() {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  const baseUrl = envUrl?.trim() ? envUrl : siteConfig.url;
  return baseUrl.replace(TRAILING_SLASH_REGEX, "");
}

export function toAbsoluteUrl(path: string) {
  const baseUrl = getSiteUrl();
  if (!path.startsWith("/")) {
    return `${baseUrl}/${path}`;
  }
  return `${baseUrl}${path}`;
}
