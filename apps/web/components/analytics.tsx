"use client";

import { useEffect, useState } from "react";

import { scheduleIdleCallback } from "@/lib/idle";

type VercelAnalyticsComponent =
  typeof import("@vercel/analytics/react").Analytics;

const ANALYTICS_IDLE_TIMEOUT_MS = 1500;

export function Analytics() {
  const [AnalyticsComponent, setAnalyticsComponent] =
    useState<VercelAnalyticsComponent | null>(null);

  useEffect(() => {
    let cancelled = false;

    const cancelIdle = scheduleIdleCallback(() => {
      import("@vercel/analytics/react")
        .then((module) => {
          if (!cancelled) {
            setAnalyticsComponent(() => module.Analytics);
          }
        })
        .catch(() => undefined);
    }, ANALYTICS_IDLE_TIMEOUT_MS);

    return () => {
      cancelled = true;
      cancelIdle();
    };
  }, []);

  if (!AnalyticsComponent) {
    return null;
  }

  return <AnalyticsComponent />;
}
