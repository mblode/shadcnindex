"use client";

import * as React from "react";
import type { DateRange } from "react-day-picker";

import {
  Calendar,
  CalendarDayButton,
} from "@/registry/new-york-v4/ui/calendar";

export default function Calendar21() {
  const [range, setRange] = React.useState<DateRange | undefined>({
    from: new Date(2025, 5, 12),
    to: new Date(2025, 5, 17),
  });

  return (
    <Calendar
      captionLayout="dropdown"
      className="rounded-lg border shadow-sm [--cell-size:--spacing(11)] md:[--cell-size:--spacing(13)]"
      components={{
        DayButton: ({ children, modifiers, day, ...props }) => {
          const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;

          return (
            <CalendarDayButton day={day} modifiers={modifiers} {...props}>
              {children}
              {!modifiers.outside && <span>{isWeekend ? "$220" : "$100"}</span>}
            </CalendarDayButton>
          );
        },
      }}
      defaultMonth={range?.from}
      formatters={{
        formatMonthDropdown: (date) => {
          return date.toLocaleString("default", { month: "long" });
        },
      }}
      mode="range"
      numberOfMonths={1}
      onSelect={setRange}
      selected={range}
    />
  );
}
