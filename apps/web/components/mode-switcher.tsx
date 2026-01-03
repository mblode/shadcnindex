"use client";

import Script from "next/script";
import { useTheme } from "next-themes";
import { useCallback, useEffect } from "react";

import { useMetaColor } from "@/hooks/use-meta-color";
import { Button } from "@/registry/new-york-v4/ui/button";

export const DARK_MODE_FORWARD_TYPE = "dark-mode-forward";

export function ModeSwitcher() {
  const { setTheme, resolvedTheme } = useTheme();
  const { setMetaColor, metaColor } = useMetaColor();

  useEffect(() => {
    setMetaColor(metaColor);
  }, [metaColor, setMetaColor]);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "d" || e.key === "D") && !e.metaKey && !e.ctrlKey) {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return;
        }

        e.preventDefault();
        toggleTheme();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggleTheme]);

  return (
    <Button
      className="group/toggle extend-touch-target size-8"
      onClick={toggleTheme}
      size="icon"
      title="Toggle mode (D)"
      variant="ghost"
    >
      <svg
        aria-label="Theme mode"
        className="size-4.5"
        fill="none"
        height="24"
        role="img"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0 0h24v24H0z" fill="none" stroke="none" />
        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
        <path d="M12 3l0 18" />
        <path d="M12 9l4.65 -4.65" />
        <path d="M12 14.3l7.37 -7.37" />
        <path d="M12 19.6l8.85 -8.85" />
      </svg>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export function DarkModeScript() {
  return (
    <Script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Required for setting up dark mode listener before hydration
      dangerouslySetInnerHTML={{
        __html: `
            (function() {
              // Forward D key
              document.addEventListener('keydown', function(e) {
                if ((e.key === 'd' || e.key === 'D') && !e.metaKey && !e.ctrlKey) {
                  if (
                    (e.target instanceof HTMLElement && e.target.isContentEditable) ||
                    e.target instanceof HTMLInputElement ||
                    e.target instanceof HTMLTextAreaElement ||
                    e.target instanceof HTMLSelectElement
                  ) {
                    return;
                  }
                  e.preventDefault();
                  if (window.parent && window.parent !== window) {
                    window.parent.postMessage({
                      type: '${DARK_MODE_FORWARD_TYPE}',
                      key: e.key
                    }, '*');
                  }
                }
              });

            })();
          `,
      }}
      id="dark-mode-listener"
      strategy="beforeInteractive"
    />
  );
}
