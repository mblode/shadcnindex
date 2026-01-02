"use client";

import * as React from "react";

import { Calendar } from "@/registry/new-york-v4/ui/calendar";

export default function CalendarDemo() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <Calendar
      captionLayout="dropdown"
      className="rounded-md border shadow-sm"
      mode="single"
      onSelect={setDate}
      selected={date}
    />
  );
}
