"use client";

import { formatDateRange } from "little-date";
import { PlusIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/new-york-v4/ui/button";
import { Calendar } from "@/registry/new-york-v4/ui/calendar";
import { Card, CardContent, CardFooter } from "@/registry/new-york-v4/ui/card";

const events = [
  {
    title: "Team Sync Meeting",
    from: "2025-06-12T09:00:00",
    to: "2025-06-12T10:00:00",
  },
  {
    title: "Design Review",
    from: "2025-06-12T11:30:00",
    to: "2025-06-12T12:30:00",
  },
  {
    title: "Client Presentation",
    from: "2025-06-12T14:00:00",
    to: "2025-06-12T15:00:00",
  },
];

export default function Calendar31() {
  const [date, setDate] = React.useState<Date | undefined>(
    new Date(2025, 5, 12)
  );

  return (
    <Card className="w-fit py-4">
      <CardContent className="px-4">
        <Calendar
          className="bg-transparent p-0"
          mode="single"
          onSelect={setDate}
          required
          selected={date}
        />
      </CardContent>
      <CardFooter className="!pt-4 flex flex-col items-start gap-3 border-t px-4">
        <div className="flex w-full items-center justify-between px-1">
          <div className="font-medium text-sm">
            {date?.toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
          <Button
            className="size-6"
            size="icon"
            title="Add Event"
            variant="ghost"
          >
            <PlusIcon />
            <span className="sr-only">Add Event</span>
          </Button>
        </div>
        <div className="flex w-full flex-col gap-2">
          {events.map((event) => (
            <div
              className="relative rounded-md bg-muted p-2 pl-6 text-sm after:absolute after:inset-y-2 after:left-2 after:w-1 after:rounded-full after:bg-primary/70"
              key={event.title}
            >
              <div className="font-medium">{event.title}</div>
              <div className="text-muted-foreground text-xs">
                {formatDateRange(new Date(event.from), new Date(event.to))}
              </div>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
