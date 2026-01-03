"use client";

import {
  Content as DialogContent,
  Overlay as DialogOverlay,
  Portal as DialogPortal,
  Root as DialogRoot,
} from "@radix-ui/react-dialog";
import { useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

export function RegistryComponentModal({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") ?? "";
  const [canGoBack, setCanGoBack] = useState(false);
  const backHref = searchQuery
    ? `/search?q=${encodeURIComponent(searchQuery)}`
    : "/search";

  useEffect(() => {
    setCanGoBack(window.history.length > 1);
  }, []);

  const handleBack = () => {
    if (canGoBack) {
      router.back();
      return;
    }

    router.replace(backHref);
  };

  return (
    <DialogRoot
      modal
      onOpenChange={(open) => {
        if (!open) {
          handleBack();
        }
      }}
      open
    >
      <DialogPortal>
        <DialogOverlay className="data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-40 bg-black/40 backdrop-blur-sm data-[state=closed]:animate-out data-[state=open]:animate-in" />
        <DialogContent className="data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right fixed inset-y-0 right-0 z-50 flex w-full max-w-[min(100vw,960px)] flex-col border-border/60 border-l bg-background shadow-2xl outline-none data-[state=closed]:animate-out data-[state=open]:animate-in">
          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
            {children}
          </div>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  );
}
