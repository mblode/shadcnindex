"use client";

import { CalendarPlusIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/new-york-v4/ui/button";
import { Calendar } from "@/registry/new-york-v4/ui/calendar";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/registry/new-york-v4/ui/drawer";
import { Label } from "@/registry/new-york-v4/ui/label";

export default function Calendar32() {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(undefined);

  return (
    <div className="flex flex-col gap-3">
      <Label className="px-1" htmlFor="date">
        Date of birth
      </Label>
      <Drawer onOpenChange={setOpen} open={open}>
        <DrawerTrigger asChild>
          <Button
            className="w-48 justify-between font-normal"
            id="date"
            variant="outline"
          >
            {date ? date.toLocaleDateString() : "Select date"}
            <CalendarPlusIcon />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="w-auto overflow-hidden p-0">
          <DrawerHeader className="sr-only">
            <DrawerTitle>Select date</DrawerTitle>
            <DrawerDescription>Set your date of birth</DrawerDescription>
          </DrawerHeader>
          <Calendar
            captionLayout="dropdown"
            className="mx-auto [--cell-size:clamp(0px,calc(100vw/7.5),52px)]"
            mode="single"
            onSelect={(date) => {
              setDate(date);
              setOpen(false);
            }}
            selected={date}
          />
        </DrawerContent>
      </Drawer>
      <div className="px-1 text-muted-foreground text-sm">
        This example works best on mobile.
      </div>
    </div>
  );
}
