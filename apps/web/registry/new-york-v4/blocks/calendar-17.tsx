"use client";

import * as React from "react";

import { Calendar } from "@/registry/new-york-v4/ui/calendar";
import { Card, CardContent, CardFooter } from "@/registry/new-york-v4/ui/card";
import { Input } from "@/registry/new-york-v4/ui/input";
import { Label } from "@/registry/new-york-v4/ui/label";

export default function Calendar17() {
  const [date, setDate] = React.useState<Date | undefined>(
    new Date(2025, 5, 12)
  );

  return (
    <Card className="w-fit py-4">
      <CardContent className="px-4">
        <Calendar
          className="bg-transparent p-0 [--cell-size:--spacing(10.5)]"
          mode="single"
          onSelect={setDate}
          selected={date}
        />
      </CardContent>
      <CardFooter className="!pt-4 flex gap-2 border-t px-4 *:[div]:w-full">
        <div>
          <Label className="sr-only" htmlFor="time-from">
            Start Time
          </Label>
          <Input
            className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            defaultValue="10:30:00"
            id="time-from"
            step="1"
            type="time"
          />
        </div>
        <span>-</span>
        <div>
          <Label className="sr-only" htmlFor="time-to">
            End Time
          </Label>
          <Input
            className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            defaultValue="12:30:00"
            id="time-to"
            step="1"
            type="time"
          />
        </div>
      </CardFooter>
    </Card>
  );
}
