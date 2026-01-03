import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${baseUrl}${path}`;
}

export const focusRing = tv({
  base: "outline-none",
  variants: {
    isFocusVisible: {
      false: "outline-0",
      true: "ring-ring/50 ring-[3px] border-ring",
    },
  },
});
