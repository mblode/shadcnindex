"use client";

import * as React from "react";

import { Calendar } from "@/registry/new-york-v4/ui/calendar";

export default function Calendar18() {
  const [date, setDate] = React.useState<Date | undefined>(
    new Date(2025, 5, 12)
  );

  return (
    <Calendar
      buttonVariant="ghost"
      className="rounded-lg border [--cell-size:--spacing(11)] md:[--cell-size:--spacing(12)]"
      mode="single"
      onSelect={setDate}
      selected={date}
    />
  );
}
