"use client";

import { ChevronDownIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/new-york-v4/ui/button";
import { Calendar } from "@/registry/new-york-v4/ui/calendar";
import { Input } from "@/registry/new-york-v4/ui/input";
import { Label } from "@/registry/new-york-v4/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/new-york-v4/ui/popover";

export default function Calendar26() {
  const [openFrom, setOpenFrom] = React.useState(false);
  const [openTo, setOpenTo] = React.useState(false);
  const [dateFrom, setDateFrom] = React.useState<Date | undefined>(
    new Date("2025-06-01")
  );
  const [dateTo, setDateTo] = React.useState<Date | undefined>(
    new Date("2025-06-03")
  );

  return (
    <div className="flex w-full min-w-0 max-w-64 flex-col gap-6">
      <div className="flex gap-4">
        <div className="flex flex-1 flex-col gap-3">
          <Label className="px-1" htmlFor="date-from">
            Check-in
          </Label>
          <Popover onOpenChange={setOpenFrom} open={openFrom}>
            <PopoverTrigger asChild>
              <Button
                className="w-full justify-between font-normal"
                id="date-from"
                variant="outline"
              >
                {dateFrom
                  ? dateFrom.toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "Select date"}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-auto overflow-hidden p-0"
            >
              <Calendar
                captionLayout="dropdown"
                mode="single"
                onSelect={(date) => {
                  setDateFrom(date);
                  setOpenFrom(false);
                }}
                selected={dateFrom}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-col gap-3">
          <Label className="invisible px-1" htmlFor="time-from">
            From
          </Label>
          <Input
            className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            defaultValue="10:30:00"
            id="time-from"
            step="1"
            type="time"
          />
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex flex-1 flex-col gap-3">
          <Label className="px-1" htmlFor="date-to">
            Check-out
          </Label>
          <Popover onOpenChange={setOpenTo} open={openTo}>
            <PopoverTrigger asChild>
              <Button
                className="w-full justify-between font-normal"
                id="date-to"
                variant="outline"
              >
                {dateTo
                  ? dateTo.toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "Select date"}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-auto overflow-hidden p-0"
            >
              <Calendar
                captionLayout="dropdown"
                disabled={dateFrom && { before: dateFrom }}
                mode="single"
                onSelect={(date) => {
                  setDateTo(date);
                  setOpenTo(false);
                }}
                selected={dateTo}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-col gap-3">
          <Label className="invisible px-1" htmlFor="time-to">
            To
          </Label>
          <Input
            className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            defaultValue="12:30:00"
            id="time-to"
            step="1"
            type="time"
          />
        </div>
      </div>
    </div>
  );
}
