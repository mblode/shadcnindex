"use client";

import * as React from "react";

import { Button } from "@/registry/new-york-v4/ui/button";
import { Calendar } from "@/registry/new-york-v4/ui/calendar";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/new-york-v4/ui/card";

export default function Calendar10() {
  const [date, setDate] = React.useState<Date | undefined>(
    new Date(2025, 5, 12)
  );
  const [month, setMonth] = React.useState<Date | undefined>(new Date());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointment</CardTitle>
        <CardDescription>Find a date</CardDescription>
        <CardAction>
          <Button
            onClick={() => {
              setMonth(new Date());
              setDate(new Date());
            }}
            size="sm"
            variant="outline"
          >
            Today
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Calendar
          className="bg-transparent p-0"
          mode="single"
          month={month}
          onMonthChange={setMonth}
          onSelect={setDate}
          selected={date}
        />
      </CardContent>
    </Card>
  );
}
