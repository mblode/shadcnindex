"use client";

import * as React from "react";
import { IconPlaceholder } from "@/app/(create)/components/icon-placeholder";
import {
  Example,
  ExampleWrapper,
} from "@/registry/bases/radix/components/example";
import { Button } from "@/registry/bases/radix/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/registry/bases/radix/ui/command";

export default function CommandExample() {
  return (
    <ExampleWrapper>
      <CommandBasic />
      <CommandWithShortcuts />
      <CommandWithGroups />
      <CommandManyItems />
    </ExampleWrapper>
  );
}

function CommandBasic() {
  const [open, setOpen] = React.useState(false);

  return (
    <Example title="Basic">
      <div className="flex flex-col gap-4">
        <Button
          className="w-fit"
          onClick={() => setOpen(true)}
          variant="outline"
        >
          Open Menu
        </Button>
        <CommandDialog onOpenChange={setOpen} open={open}>
          <Command>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Suggestions">
                <CommandItem>Calendar</CommandItem>
                <CommandItem>Search Emoji</CommandItem>
                <CommandItem>Calculator</CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </CommandDialog>
      </div>
    </Example>
  );
}

function CommandWithShortcuts() {
  const [open, setOpen] = React.useState(false);

  return (
    <Example title="With Shortcuts">
      <div className="flex flex-col gap-4">
        <Button
          className="w-fit"
          onClick={() => setOpen(true)}
          variant="outline"
        >
          Open Menu
        </Button>
        <CommandDialog onOpenChange={setOpen} open={open}>
          <Command>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Settings">
                <CommandItem>
                  <IconPlaceholder
                    hugeicons="UserIcon"
                    lucide="UserIcon"
                    phosphor="UserIcon"
                    tabler="IconUser"
                  />
                  <span>Profile</span>
                  <CommandShortcut>⌘P</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <IconPlaceholder
                    hugeicons="CreditCardIcon"
                    lucide="CreditCardIcon"
                    phosphor="CreditCardIcon"
                    tabler="IconCreditCard"
                  />
                  <span>Billing</span>
                  <CommandShortcut>⌘B</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <IconPlaceholder
                    hugeicons="SettingsIcon"
                    lucide="SettingsIcon"
                    phosphor="GearIcon"
                    tabler="IconSettings"
                  />
                  <span>Settings</span>
                  <CommandShortcut>⌘S</CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </CommandDialog>
      </div>
    </Example>
  );
}

function CommandWithGroups() {
  const [open, setOpen] = React.useState(false);

  return (
    <Example title="With Groups">
      <div className="flex flex-col gap-4">
        <Button
          className="w-fit"
          onClick={() => setOpen(true)}
          variant="outline"
        >
          Open Menu
        </Button>
        <CommandDialog onOpenChange={setOpen} open={open}>
          <Command>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Suggestions">
                <CommandItem>
                  <IconPlaceholder
                    hugeicons="CalendarIcon"
                    lucide="CalendarIcon"
                    phosphor="CalendarBlankIcon"
                    tabler="IconCalendar"
                  />
                  <span>Calendar</span>
                </CommandItem>
                <CommandItem>
                  <IconPlaceholder
                    hugeicons="SmileIcon"
                    lucide="SmileIcon"
                    phosphor="SmileyIcon"
                    tabler="IconMoodSmile"
                  />
                  <span>Search Emoji</span>
                </CommandItem>
                <CommandItem>
                  <IconPlaceholder
                    hugeicons="CalculatorIcon"
                    lucide="CalculatorIcon"
                    phosphor="CalculatorIcon"
                    tabler="IconCalculator"
                  />
                  <span>Calculator</span>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Settings">
                <CommandItem>
                  <IconPlaceholder
                    hugeicons="UserIcon"
                    lucide="UserIcon"
                    phosphor="UserIcon"
                    tabler="IconUser"
                  />
                  <span>Profile</span>
                  <CommandShortcut>⌘P</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <IconPlaceholder
                    hugeicons="CreditCardIcon"
                    lucide="CreditCardIcon"
                    phosphor="CreditCardIcon"
                    tabler="IconCreditCard"
                  />
                  <span>Billing</span>
                  <CommandShortcut>⌘B</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <IconPlaceholder
                    hugeicons="SettingsIcon"
                    lucide="SettingsIcon"
                    phosphor="GearIcon"
                    tabler="IconSettings"
                  />
                  <span>Settings</span>
                  <CommandShortcut>⌘S</CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </CommandDialog>
      </div>
    </Example>
  );
}

function CommandManyItems() {
  const [open, setOpen] = React.useState(false);

  return (
    <Example title="Many Groups & Items">
      <div className="flex flex-col gap-4">
        <Button
          className="w-fit"
          onClick={() => setOpen(true)}
          variant="outline"
        >
          Open Menu
        </Button>
        <CommandDialog onOpenChange={setOpen} open={open}>
          <Command>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Navigation">
                <CommandItem>
                  <IconPlaceholder
                    hugeicons="HomeIcon"
                    lucide="HomeIcon"
                    phosphor="HouseIcon"
                    tabler="IconHome"
                  />
                  <span>Home</span>
                  <CommandShortcut>⌘H</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <IconPlaceholder
                    hugeicons="InboxIcon"
                    lucide="InboxIcon"
                    phosphor="TrayIcon"
                    tabler="IconInbox"
                  />
                  <span>Inbox</span>
                  <CommandShortcut>⌘I</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <IconPlaceholder
                    hugeicons="File02Icon"
                    lucide="FileTextIcon"
                    phosphor="FileTextIcon"
                    tabler="IconFileText"
                  />
                  <span>Documents</span>
                  <CommandShortcut>⌘D</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <IconPlaceholder
                    hugeicons="FolderIcon"
                    lucide="FolderIcon"
                    phosphor="FolderIcon"
                    tabler="IconFolder"
                  />
                  <span>Folders</span>
                  <CommandShortcut>⌘F</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Actions">
                <CommandItem>
                  <IconPlaceholder
                    hugeicons="PlusSignIcon"
                    lucide="PlusIcon"
                    phosphor="PlusIcon"
                    tabler="IconPlus"
                  />
                  <span>New File</span>
                  <CommandShortcut>⌘N</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <IconPlaceholder
                    hugeicons="FolderAddIcon"
                    lucide="FolderPlusIcon"
                    phosphor="FolderPlusIcon"
                    tabler="IconFolderPlus"
                  />
                  <span>New Folder</span>
                  <CommandShortcut>⇧⌘N</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <IconPlaceholder
                    hugeicons="CopyIcon"
                    lucide="CopyIcon"
                    phosphor="CopyIcon"
                    tabler="IconCopy"
                  />
                  <span>Copy</span>
                  <CommandShortcut>⌘C</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <IconPlaceholder
                    hugeicons="ScissorIcon"
                    lucide="ScissorsIcon"
                    phosphor="ScissorsIcon"
                    tabler="IconCut"
                  />
                  <span>Cut</span>
                  <CommandShortcut>⌘X</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <IconPlaceholder
                    hugeicons="ClipboardIcon"
                    lucide="ClipboardPasteIcon"
                    phosphor="ClipboardIcon"
                    tabler="IconClipboard"
                  />
                  <span>Paste</span>
                  <CommandShortcut>⌘V</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <IconPlaceholder
                    hugeicons="DeleteIcon"
                    lucide="TrashIcon"
                    phosphor="TrashIcon"
                    tabler="IconTrash"
                  />
                  <span>Delete</span>
                  <CommandShortcut>⌫</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="View">
                <CommandItem>
                  <IconPlaceholder
                    hugeicons="GridIcon"
                    lucide="LayoutGridIcon"
                    phosphor="GridFourIcon"
                    tabler="IconLayoutGrid"
                  />
                  <span>Grid View</span>
                </CommandItem>
                <CommandItem>
                  <IconPlaceholder
                    hugeicons="Menu05Icon"
                    lucide="ListIcon"
                    phosphor="ListIcon"
                    tabler="IconList"
                  />
                  <span>List View</span>
                </CommandItem>
                <CommandItem>
                  <IconPlaceholder
                    hugeicons="ZoomInAreaIcon"
                    lucide="ZoomInIcon"
                    phosphor="MagnifyingGlassMinusIcon"
                    tabler="IconZoomIn"
                  />
                  <span>Zoom In</span>
                  <CommandShortcut>⌘+</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <IconPlaceholder
                    hugeicons="ZoomOutAreaIcon"
                    lucide="ZoomOutIcon"
                    phosphor="MagnifyingGlassPlusIcon"
                    tabler="IconZoomOut"
                  />
                  <span>Zoom Out</span>
                  <CommandShortcut>⌘-</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Account">
                <CommandItem>
                  <IconPlaceholder
                    hugeicons="UserIcon"
                    lucide="UserIcon"
                    phosphor="UserIcon"
                    tabler="IconUser"
                  />
                  <span>Profile</span>
                  <CommandShortcut>⌘P</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <IconPlaceholder
                    hugeicons="CreditCardIcon"
                    lucide="CreditCardIcon"
                    phosphor="CreditCardIcon"
                    tabler="IconCreditCard"
                  />
                  <span>Billing</span>
                  <CommandShortcut>⌘B</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <IconPlaceholder
                    hugeicons="SettingsIcon"
                    lucide="SettingsIcon"
                    phosphor="GearIcon"
                    tabler="IconSettings"
                  />
                  <span>Settings</span>
                  <CommandShortcut>⌘S</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <IconPlaceholder
                    hugeicons="NotificationIcon"
                    lucide="BellIcon"
                    phosphor="BellIcon"
                    tabler="IconBell"
                  />
                  <span>Notifications</span>
                </CommandItem>
                <CommandItem>
                  <IconPlaceholder
                    hugeicons="HelpCircleIcon"
                    lucide="HelpCircleIcon"
                    phosphor="QuestionIcon"
                    tabler="IconHelpCircle"
                  />
                  <span>Help & Support</span>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Tools">
                <CommandItem>
                  <IconPlaceholder
                    hugeicons="CalculatorIcon"
                    lucide="CalculatorIcon"
                    phosphor="CalculatorIcon"
                    tabler="IconCalculator"
                  />
                  <span>Calculator</span>
                </CommandItem>
                <CommandItem>
                  <IconPlaceholder
                    hugeicons="CalendarIcon"
                    lucide="CalendarIcon"
                    phosphor="CalendarBlankIcon"
                    tabler="IconCalendar"
                  />
                  <span>Calendar</span>
                </CommandItem>
                <CommandItem>
                  <IconPlaceholder
                    hugeicons="ImageIcon"
                    lucide="ImageIcon"
                    phosphor="ImageIcon"
                    tabler="IconPhoto"
                  />
                  <span>Image Editor</span>
                </CommandItem>
                <CommandItem>
                  <IconPlaceholder
                    hugeicons="CodeIcon"
                    lucide="CodeIcon"
                    phosphor="CodeIcon"
                    tabler="IconCode"
                  />
                  <span>Code Editor</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </CommandDialog>
      </div>
    </Example>
  );
}
