"use client";

import { IconArrowLeft } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/registry/new-york-v4/ui/button";

export function RegistryComponentBackButton() {
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
    <Button
      aria-label="Back to results"
      onClick={handleBack}
      size="icon-sm"
      type="button"
      variant="ghost"
    >
      <IconArrowLeft className="size-4" />
    </Button>
  );
}
