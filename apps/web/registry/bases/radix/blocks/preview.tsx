"use client";

import * as React from "react";
import { useState } from "react";
import { IconPlaceholder } from "@/app/(create)/components/icon-placeholder";
import {
  Example,
  ExampleWrapper,
} from "@/registry/bases/radix/components/example";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/registry/bases/radix/ui/alert-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "@/registry/bases/radix/ui/avatar";
import { Badge } from "@/registry/bases/radix/ui/badge";
import { Button } from "@/registry/bases/radix/ui/button";
import { ButtonGroup } from "@/registry/bases/radix/ui/button-group";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/bases/radix/ui/card";
import { Checkbox } from "@/registry/bases/radix/ui/checkbox";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/registry/bases/radix/ui/combobox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/registry/bases/radix/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/bases/radix/ui/empty";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/registry/bases/radix/ui/field";
import { Input } from "@/registry/bases/radix/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/registry/bases/radix/ui/input-group";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/registry/bases/radix/ui/item";
import { Label } from "@/registry/bases/radix/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/registry/bases/radix/ui/popover";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/registry/bases/radix/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/bases/radix/ui/select";
import { Separator } from "@/registry/bases/radix/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/registry/bases/radix/ui/sheet";
import { Slider } from "@/registry/bases/radix/ui/slider";
import { Spinner } from "@/registry/bases/radix/ui/spinner";
import { Switch } from "@/registry/bases/radix/ui/switch";
import { Textarea } from "@/registry/bases/radix/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/registry/bases/radix/ui/tooltip";

export default function CoverExample() {
  return (
    <ExampleWrapper>
      <ObservabilityCard />
      <SmallFormExample />
      <FormExample />
      <FieldExamples />
      <ItemExample />
      <ButtonGroupExamples />
      <EmptyAvatarGroup />
      <InputGroupExamples />
      <SheetExample />
      <BadgeExamples />
    </ExampleWrapper>
  );
}

function FieldExamples() {
  const [gpuCount, setGpuCount] = React.useState(8);
  const [value, setValue] = useState([200, 800]);
  const handleGpuAdjustment = React.useCallback((adjustment: number) => {
    setGpuCount((prevCount) =>
      Math.max(1, Math.min(99, prevCount + adjustment))
    );
  }, []);

  const handleGpuInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number.parseInt(e.target.value, 10);
      if (!Number.isNaN(value) && value >= 1 && value <= 99) {
        setGpuCount(value);
      }
    },
    []
  );

  return (
    <Example title="Fields">
      <FieldSet className="w-full max-w-md">
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Compute Environment</FieldLegend>
            <FieldDescription>
              Select the compute environment for your cluster.
            </FieldDescription>
            <RadioGroup defaultValue="kubernetes">
              <FieldLabel htmlFor="kubernetes-r2h">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Kubernetes</FieldTitle>
                    <FieldDescription>
                      Run GPU workloads on a K8s configured cluster. This is the
                      default.
                    </FieldDescription>
                  </FieldContent>
                  <RadioGroupItem
                    aria-label="Kubernetes"
                    id="kubernetes-r2h"
                    value="kubernetes"
                  />
                </Field>
              </FieldLabel>
              <FieldLabel htmlFor="vm-z4k">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Virtual Machine</FieldTitle>
                    <FieldDescription>
                      Access a VM configured cluster to run workloads. (Coming
                      soon)
                    </FieldDescription>
                  </FieldContent>
                  <RadioGroupItem
                    aria-label="Virtual Machine"
                    id="vm-z4k"
                    value="vm"
                  />
                </Field>
              </FieldLabel>
            </RadioGroup>
          </FieldSet>
          <FieldSeparator />
          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor="number-of-gpus-f6l">
                Number of GPUs
              </FieldLabel>
              <FieldDescription>You can add more later.</FieldDescription>
            </FieldContent>
            <ButtonGroup>
              <Input
                id="number-of-gpus-f6l"
                maxLength={3}
                onChange={handleGpuInputChange}
                size={3}
                value={gpuCount}
              />
              <Button
                aria-label="Decrement"
                disabled={gpuCount <= 1}
                onClick={() => handleGpuAdjustment(-1)}
                size="icon"
                type="button"
                variant="outline"
              >
                <IconPlaceholder
                  hugeicons="MinusSignIcon"
                  lucide="MinusIcon"
                  phosphor="MinusIcon"
                  tabler="IconMinus"
                />
              </Button>
              <Button
                aria-label="Increment"
                disabled={gpuCount >= 99}
                onClick={() => handleGpuAdjustment(1)}
                size="icon"
                type="button"
                variant="outline"
              >
                <IconPlaceholder
                  hugeicons="PlusSignIcon"
                  lucide="PlusIcon"
                  phosphor="PlusIcon"
                  tabler="IconPlus"
                />
              </Button>
            </ButtonGroup>
          </Field>
          <FieldSeparator />
          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor="tinting">Wallpaper Tinting</FieldLabel>
              <FieldDescription>
                Allow the wallpaper to be tinted.
              </FieldDescription>
            </FieldContent>
            <Switch defaultChecked id="tinting" />
          </Field>
          <FieldSeparator />
          <FieldLabel htmlFor="checkbox-demo">
            <Field orientation="horizontal">
              <Checkbox defaultChecked id="checkbox-demo" />
              <FieldLabel className="line-clamp-1" htmlFor="checkbox-demo">
                I agree to the terms and conditions
              </FieldLabel>
            </Field>
          </FieldLabel>
          <FieldSeparator />
          <Field>
            <FieldTitle>Price Range</FieldTitle>
            <FieldDescription>
              Set your budget range ($
              <span className="font-medium tabular-nums">{value[0]}</span> -{" "}
              <span className="font-medium tabular-nums">{value[1]}</span>).
            </FieldDescription>
            <Slider
              aria-label="Price Range"
              className="mt-2 w-full"
              max={1000}
              min={0}
              onValueChange={(val) => setValue(val as number[])}
              step={10}
              value={value}
            />
          </Field>
          <Field orientation="horizontal">
            <Button type="submit">Submit</Button>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </Example>
  );
}

function ButtonGroupExamples() {
  const [label, setLabel] = React.useState("personal");

  return (
    <Example className="items-center justify-center" title="Button Group">
      <div className="flex flex-col gap-6">
        <ButtonGroup>
          <ButtonGroup className="hidden sm:flex">
            <Button aria-label="Go Back" size="icon-sm" variant="outline">
              <IconPlaceholder
                hugeicons="ArrowLeft01Icon"
                lucide="ArrowLeftIcon"
                phosphor="ArrowLeftIcon"
                tabler="IconArrowLeft"
              />
            </Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button size="sm" variant="outline">
              Archive
            </Button>
            <Button size="sm" variant="outline">
              Report
            </Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button size="sm" variant="outline">
              Snooze
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label="More Options"
                  size="icon-sm"
                  variant="outline"
                >
                  <IconPlaceholder
                    hugeicons="ArrowDown01Icon"
                    lucide="ChevronDownIcon"
                    phosphor="CaretDownIcon"
                    tabler="IconChevronDown"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <IconPlaceholder
                      hugeicons="MailValidation01Icon"
                      lucide="MailCheckIcon"
                      phosphor="EnvelopeIcon"
                      tabler="IconMailCheck"
                    />
                    Mark as Read
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <IconPlaceholder
                      hugeicons="ArchiveIcon"
                      lucide="ArchiveIcon"
                      phosphor="ArchiveIcon"
                      tabler="IconArchive"
                    />
                    Archive
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <IconPlaceholder
                      hugeicons="ClockIcon"
                      lucide="ClockIcon"
                      phosphor="ClockIcon"
                      tabler="IconClock"
                    />
                    Snooze
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <IconPlaceholder
                      hugeicons="CalendarAdd01Icon"
                      lucide="CalendarPlusIcon"
                      phosphor="CalendarPlusIcon"
                      tabler="IconCalendarPlus"
                    />
                    Add to Calendar
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <IconPlaceholder
                      hugeicons="AddToListIcon"
                      lucide="ListFilterIcon"
                      phosphor="ListPlusIcon"
                      tabler="IconFilterPlus"
                    />
                    Add to List
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <IconPlaceholder
                        hugeicons="TagIcon"
                        lucide="TagIcon"
                        phosphor="TagIcon"
                        tabler="IconTag"
                      />
                      Label As...
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuRadioGroup
                        onValueChange={setLabel}
                        value={label}
                      >
                        <DropdownMenuRadioItem value="personal">
                          Personal
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="work">
                          Work
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="other">
                          Other
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem variant="destructive">
                    <IconPlaceholder
                      hugeicons="Delete02Icon"
                      lucide="Trash2Icon"
                      phosphor="TrashIcon"
                      tabler="IconTrash"
                    />
                    Trash
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </ButtonGroup>
          <ButtonGroup className="hidden sm:flex">
            <Button aria-label="Previous" size="icon-sm" variant="outline">
              <IconPlaceholder
                hugeicons="ArrowLeft01Icon"
                lucide="ArrowLeftIcon"
                phosphor="ArrowLeftIcon"
                tabler="IconArrowLeft"
              />
            </Button>
            <Button aria-label="Next" size="icon-sm" variant="outline">
              <IconPlaceholder
                hugeicons="ArrowRight01Icon"
                lucide="ArrowRightIcon"
                phosphor="ArrowRightIcon"
                tabler="IconArrowRight"
              />
            </Button>
          </ButtonGroup>
        </ButtonGroup>
        <div className="flex gap-4">
          <ButtonGroup className="hidden sm:flex">
            <ButtonGroup>
              <Button variant="outline">1</Button>
              <Button variant="outline">2</Button>
              <Button variant="outline">3</Button>
            </ButtonGroup>
          </ButtonGroup>
          <ButtonGroup>
            <ButtonGroup>
              <Button variant="outline">Follow</Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="outline">
                    <IconPlaceholder
                      hugeicons="ArrowDown01Icon"
                      lucide="ChevronDownIcon"
                      phosphor="CaretDownIcon"
                      tabler="IconChevronDown"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <IconPlaceholder
                        hugeicons="VolumeOffIcon"
                        lucide="VolumeX"
                        phosphor="SpeakerSlashIcon"
                        tabler="IconVolume"
                      />
                      Mute Conversation
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <IconPlaceholder
                        hugeicons="Tick02Icon"
                        lucide="CheckIcon"
                        phosphor="CheckIcon"
                        tabler="IconCheck"
                      />
                      Mark as Read
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <IconPlaceholder
                        hugeicons="UserRemove01Icon"
                        lucide="UserRoundXIcon"
                        phosphor="UserMinusIcon"
                        tabler="IconUserX"
                      />
                      Block User
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Conversation</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <IconPlaceholder
                        hugeicons="Share03Icon"
                        lucide="ShareIcon"
                        phosphor="ShareIcon"
                        tabler="IconShare"
                      />
                      Share Conversation
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <IconPlaceholder
                        hugeicons="Copy01Icon"
                        lucide="CopyIcon"
                        phosphor="CopyIcon"
                        tabler="IconCopy"
                      />
                      Copy Conversation
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <IconPlaceholder
                        hugeicons="AlertCircleIcon"
                        lucide="AlertTriangleIcon"
                        phosphor="WarningIcon"
                        tabler="IconAlertTriangle"
                      />
                      Report Conversation
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem variant="destructive">
                      <IconPlaceholder
                        hugeicons="Delete02Icon"
                        lucide="TrashIcon"
                        phosphor="TrashIcon"
                        tabler="IconTrash"
                      />
                      Delete Conversation
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </ButtonGroup>
            <ButtonGroup>
              <Button variant="outline">
                <IconPlaceholder
                  hugeicons="BotIcon"
                  lucide="BotIcon"
                  phosphor="RobotIcon"
                  tabler="IconRobot"
                />{" "}
                Copilot
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    aria-label="Open Popover"
                    size="icon"
                    variant="outline"
                  >
                    <IconPlaceholder
                      hugeicons="ArrowDown01Icon"
                      lucide="ChevronDownIcon"
                      phosphor="CaretDownIcon"
                      tabler="IconChevronDown"
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-96">
                  <PopoverHeader>
                    <PopoverTitle>Agent Tasks</PopoverTitle>
                    <PopoverDescription>
                      Describe your task in natural language. Copilot will work
                      in the background and open a pull request.
                    </PopoverDescription>
                  </PopoverHeader>
                  <div className="text-sm *:[p:not(:last-child)]:mb-2">
                    <Textarea
                      className="min-h-32 resize-none"
                      placeholder="Describe your task in natural language."
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </ButtonGroup>
          </ButtonGroup>
        </div>
      </div>
    </Example>
  );
}

function InputGroupExamples() {
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [voiceEnabled, setVoiceEnabled] = React.useState(false);

  return (
    <Example title="Input Group">
      <div className="flex flex-col gap-6">
        <InputGroup>
          <InputGroupInput placeholder="Search..." />
          <InputGroupAddon>
            <IconPlaceholder
              hugeicons="Search01Icon"
              lucide="SearchIcon"
              phosphor="MagnifyingGlassIcon"
              tabler="IconSearch"
            />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">12 results</InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupInput className="!pl-1" placeholder="example.com" />
          <InputGroupAddon>
            <InputGroupText>https://</InputGroupText>
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            <Tooltip>
              <TooltipTrigger asChild>
                <InputGroupButton
                  aria-label="Info"
                  className="rounded-full"
                  size="icon-xs"
                >
                  <IconPlaceholder
                    hugeicons="AlertCircleIcon"
                    lucide="InfoIcon"
                    phosphor="InfoIcon"
                    tabler="IconInfoCircle"
                  />
                </InputGroupButton>
              </TooltipTrigger>
              <TooltipContent>This is content in a tooltip.</TooltipContent>
            </Tooltip>
          </InputGroupAddon>
        </InputGroup>
        <Field>
          <Label className="sr-only" htmlFor="input-secure-19">
            Input Secure
          </Label>
          <InputGroup>
            <InputGroupInput className="!pl-0.5" id="input-secure-19" />
            <Popover>
              <PopoverTrigger asChild>
                <InputGroupAddon>
                  <InputGroupButton
                    aria-label="Info"
                    size="icon-xs"
                    variant="secondary"
                  >
                    <IconPlaceholder
                      hugeicons="AlertCircleIcon"
                      lucide="InfoIcon"
                      phosphor="InfoIcon"
                      tabler="IconInfoCircle"
                    />
                  </InputGroupButton>
                </InputGroupAddon>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                alignOffset={10}
                className="flex flex-col gap-1 rounded-xl text-sm"
              >
                <p className="font-medium">Your connection is not secure.</p>
                <p>
                  You should not enter any sensitive information on this site.
                </p>
              </PopoverContent>
            </Popover>
            <InputGroupAddon className="!pl-1 text-muted-foreground">
              https://
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                aria-label="Favorite"
                onClick={() => setIsFavorite(!isFavorite)}
                size="icon-xs"
              >
                <IconPlaceholder
                  className="data-[favorite=true]:fill-primary data-[favorite=true]:stroke-primary"
                  data-favorite={isFavorite}
                  hugeicons="StarIcon"
                  lucide="StarIcon"
                  phosphor="StarIcon"
                  tabler="IconStar"
                />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </Field>
        <ButtonGroup className="w-full">
          <ButtonGroup>
            <Button aria-label="Add" size="icon" variant="outline">
              <IconPlaceholder
                hugeicons="PlusSignIcon"
                lucide="PlusIcon"
                phosphor="PlusIcon"
                tabler="IconPlus"
              />
            </Button>
          </ButtonGroup>
          <ButtonGroup className="flex-1">
            <InputGroup>
              <InputGroupInput
                disabled={voiceEnabled}
                placeholder={
                  voiceEnabled
                    ? "Record and send audio..."
                    : "Send a message..."
                }
              />
              <InputGroupAddon align="inline-end">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InputGroupButton
                      aria-label="Voice Mode"
                      aria-pressed={voiceEnabled}
                      className="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                      data-active={voiceEnabled}
                      onClick={() => setVoiceEnabled(!voiceEnabled)}
                      size="icon-xs"
                    >
                      <IconPlaceholder
                        hugeicons="AudioWave01Icon"
                        lucide="AudioLinesIcon"
                        phosphor="MicrophoneIcon"
                        tabler="IconWaveSine"
                      />
                    </InputGroupButton>
                  </TooltipTrigger>
                  <TooltipContent>Voice Mode</TooltipContent>
                </Tooltip>
              </InputGroupAddon>
            </InputGroup>
          </ButtonGroup>
        </ButtonGroup>
        <InputGroup>
          <InputGroupTextarea placeholder="Ask, Search or Chat..." />
          <InputGroupAddon align="block-end">
            <InputGroupButton
              aria-label="Add"
              className="rounded-full style-lyra:rounded-none"
              size="icon-xs"
              variant="outline"
            >
              <IconPlaceholder
                hugeicons="PlusSignIcon"
                lucide="PlusIcon"
                phosphor="PlusIcon"
                tabler="IconPlus"
              />
            </InputGroupButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <InputGroupButton variant="ghost">Auto</InputGroupButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="[--radius:0.95rem]"
                side="top"
              >
                <DropdownMenuItem>Auto</DropdownMenuItem>
                <DropdownMenuItem>Agent</DropdownMenuItem>
                <DropdownMenuItem>Manual</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <InputGroupText className="ml-auto">52% used</InputGroupText>
            <Separator className="!h-4" orientation="vertical" />
            <InputGroupButton
              className="rounded-full style-lyra:rounded-none"
              size="icon-xs"
              variant="default"
            >
              <IconPlaceholder
                hugeicons="ArrowUp01Icon"
                lucide="ArrowUpIcon"
                phosphor="ArrowUpIcon"
                tabler="IconArrowUp"
              />
              <span className="sr-only">Send</span>
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </Example>
  );
}

function EmptyAvatarGroup() {
  return (
    <Example title="Empty">
      <Empty className="h-full flex-none border">
        <EmptyHeader>
          <EmptyMedia>
            <AvatarGroup className="grayscale">
              <Avatar size="lg">
                <AvatarImage
                  alt="@shadcn"
                  src="https://github.com/shadcn.png"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar size="lg">
                <AvatarImage
                  alt="@maxleiter"
                  src="https://github.com/maxleiter.png"
                />
                <AvatarFallback>LR</AvatarFallback>
              </Avatar>
              <Avatar size="lg">
                <AvatarImage
                  alt="@evilrabbit"
                  src="https://github.com/evilrabbit.png"
                />
                <AvatarFallback>ER</AvatarFallback>
              </Avatar>
            </AvatarGroup>
          </EmptyMedia>
          <EmptyTitle>No Team Members</EmptyTitle>
          <EmptyDescription>
            Invite your team to collaborate on this project.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">Show Dialog</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button>Connect Mouse</Button>
              </AlertDialogTrigger>
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogMedia>
                    <IconPlaceholder
                      hugeicons="BluetoothIcon"
                      lucide="BluetoothIcon"
                      phosphor="BluetoothIcon"
                      tabler="IconBluetooth"
                    />
                  </AlertDialogMedia>
                  <AlertDialogTitle>
                    Allow accessory to connect?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Do you want to allow the USB accessory to connect to this
                    device?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Don&apos;t allow</AlertDialogCancel>
                  <AlertDialogAction>Allow</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </EmptyContent>
      </Empty>
    </Example>
  );
}

function FormExample() {
  return (
    <Example title="Complex Form">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>
            All transactions are secure and encrypted
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup>
              <FieldSet>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="checkout-7j9-card-name-43j">
                      Name on Card
                    </FieldLabel>
                    <Input
                      id="checkout-7j9-card-name-43j"
                      placeholder="John Doe"
                      required
                    />
                  </Field>
                  <div className="grid grid-cols-3 gap-4">
                    <Field className="col-span-2">
                      <FieldLabel htmlFor="checkout-7j9-card-number-uw1">
                        Card Number
                      </FieldLabel>
                      <Input
                        id="checkout-7j9-card-number-uw1"
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                      <FieldDescription>
                        Enter your 16-digit number.
                      </FieldDescription>
                    </Field>
                    <Field className="col-span-1">
                      <FieldLabel htmlFor="checkout-7j9-cvv">CVV</FieldLabel>
                      <Input id="checkout-7j9-cvv" placeholder="123" required />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="checkout-7j9-exp-month-ts6">
                        Month
                      </FieldLabel>
                      <Select defaultValue="">
                        <SelectTrigger id="checkout-7j9-exp-month-ts6">
                          <SelectValue placeholder="MM" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="01">01</SelectItem>
                            <SelectItem value="02">02</SelectItem>
                            <SelectItem value="03">03</SelectItem>
                            <SelectItem value="04">04</SelectItem>
                            <SelectItem value="05">05</SelectItem>
                            <SelectItem value="06">06</SelectItem>
                            <SelectItem value="07">07</SelectItem>
                            <SelectItem value="08">08</SelectItem>
                            <SelectItem value="09">09</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="11">11</SelectItem>
                            <SelectItem value="12">12</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="checkout-7j9-exp-year-f59">
                        Year
                      </FieldLabel>
                      <Select defaultValue="">
                        <SelectTrigger id="checkout-7j9-exp-year-f59">
                          <SelectValue placeholder="YYYY" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="2024">2024</SelectItem>
                            <SelectItem value="2025">2025</SelectItem>
                            <SelectItem value="2026">2026</SelectItem>
                            <SelectItem value="2027">2027</SelectItem>
                            <SelectItem value="2028">2028</SelectItem>
                            <SelectItem value="2029">2029</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                </FieldGroup>
              </FieldSet>
              <FieldSeparator />
              <FieldSet>
                <FieldLegend>Billing Address</FieldLegend>
                <FieldDescription>
                  The billing address associated with your payment.
                </FieldDescription>
                <FieldGroup>
                  <Field orientation="horizontal">
                    <Checkbox
                      defaultChecked
                      id="checkout-7j9-same-as-shipping-wgm"
                    />
                    <FieldLabel
                      className="font-normal"
                      htmlFor="checkout-7j9-same-as-shipping-wgm"
                    >
                      Same as shipping address
                    </FieldLabel>
                  </Field>
                </FieldGroup>
              </FieldSet>
              <FieldSeparator />
              <FieldSet>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="checkout-7j9-optional-comments">
                      Comments
                    </FieldLabel>
                    <Textarea
                      id="checkout-7j9-optional-comments"
                      placeholder="Add any additional comments"
                    />
                  </Field>
                </FieldGroup>
              </FieldSet>
              <Field orientation="horizontal">
                <Button type="submit">Submit</Button>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </Example>
  );
}

const frameworks = [
  "Next.js",
  "SvelteKit",
  "Nuxt.js",
  "Remix",
  "Astro",
] as const;

function SmallFormExample() {
  const [notifications, setNotifications] = React.useState({
    email: true,
    sms: false,
    push: true,
  });
  const [theme, setTheme] = React.useState("light");

  return (
    <Example title="Form">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Please fill in your details below</CardDescription>
          <CardAction>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost">
                  <IconPlaceholder
                    hugeicons="MoreVerticalCircle01Icon"
                    lucide="MoreVerticalIcon"
                    phosphor="DotsThreeVerticalIcon"
                    tabler="IconDotsVertical"
                  />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="style-lyra:w-48 style-maia:w-56 style-mira:w-48 style-nova:w-48 style-vega:w-56"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel>File</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <IconPlaceholder
                      hugeicons="FileIcon"
                      lucide="FileIcon"
                      phosphor="FileIcon"
                      tabler="IconFile"
                    />
                    New File
                    <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <IconPlaceholder
                      hugeicons="FolderIcon"
                      lucide="FolderIcon"
                      phosphor="FolderIcon"
                      tabler="IconFolder"
                    />
                    New Folder
                    <DropdownMenuShortcut>⇧⌘N</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <IconPlaceholder
                        hugeicons="FolderOpenIcon"
                        lucide="FolderOpenIcon"
                        phosphor="FolderOpenIcon"
                        tabler="IconFolderOpen"
                      />
                      Open Recent
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Recent Projects</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <IconPlaceholder
                              hugeicons="CodeIcon"
                              lucide="FileCodeIcon"
                              phosphor="CodeIcon"
                              tabler="IconFileCode"
                            />
                            Project Alpha
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <IconPlaceholder
                              hugeicons="CodeIcon"
                              lucide="FileCodeIcon"
                              phosphor="CodeIcon"
                              tabler="IconFileCode"
                            />
                            Project Beta
                          </DropdownMenuItem>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <IconPlaceholder
                                hugeicons="MoreHorizontalCircle01Icon"
                                lucide="MoreHorizontalIcon"
                                phosphor="DotsThreeOutlineIcon"
                                tabler="IconDots"
                              />
                              More Projects
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                              <DropdownMenuSubContent>
                                <DropdownMenuItem>
                                  <IconPlaceholder
                                    hugeicons="CodeIcon"
                                    lucide="FileCodeIcon"
                                    phosphor="CodeIcon"
                                    tabler="IconFileCode"
                                  />
                                  Project Gamma
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <IconPlaceholder
                                    hugeicons="CodeIcon"
                                    lucide="FileCodeIcon"
                                    phosphor="CodeIcon"
                                    tabler="IconFileCode"
                                  />
                                  Project Delta
                                </DropdownMenuItem>
                              </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                          </DropdownMenuSub>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem>
                            <IconPlaceholder
                              hugeicons="SearchIcon"
                              lucide="FolderSearchIcon"
                              phosphor="MagnifyingGlassIcon"
                              tabler="IconFolderSearch"
                            />
                            Browse...
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <IconPlaceholder
                      hugeicons="FloppyDiskIcon"
                      lucide="SaveIcon"
                      phosphor="FloppyDiskIcon"
                      tabler="IconDeviceFloppy"
                    />
                    Save
                    <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <IconPlaceholder
                      hugeicons="DownloadIcon"
                      lucide="DownloadIcon"
                      phosphor="DownloadIcon"
                      tabler="IconDownload"
                    />
                    Export
                    <DropdownMenuShortcut>⇧⌘E</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel>View</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    checked={notifications.email}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        email: checked === true,
                      })
                    }
                  >
                    <IconPlaceholder
                      hugeicons="EyeIcon"
                      lucide="EyeIcon"
                      phosphor="EyeIcon"
                      tabler="IconEye"
                    />
                    Show Sidebar
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={notifications.sms}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        sms: checked === true,
                      })
                    }
                  >
                    <IconPlaceholder
                      hugeicons="LayoutIcon"
                      lucide="LayoutIcon"
                      phosphor="LayoutIcon"
                      tabler="IconLayout"
                    />
                    Show Status Bar
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <IconPlaceholder
                        hugeicons="PaintBoardIcon"
                        lucide="PaletteIcon"
                        phosphor="PaletteIcon"
                        tabler="IconPalette"
                      />
                      Theme
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                          <DropdownMenuRadioGroup
                            onValueChange={setTheme}
                            value={theme}
                          >
                            <DropdownMenuRadioItem value="light">
                              <IconPlaceholder
                                hugeicons="SunIcon"
                                lucide="SunIcon"
                                phosphor="SunIcon"
                                tabler="IconSun"
                              />
                              Light
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="dark">
                              <IconPlaceholder
                                hugeicons="MoonIcon"
                                lucide="MoonIcon"
                                phosphor="MoonIcon"
                                tabler="IconMoon"
                              />
                              Dark
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="system">
                              <IconPlaceholder
                                hugeicons="ComputerIcon"
                                lucide="MonitorIcon"
                                phosphor="MonitorIcon"
                                tabler="IconDeviceDesktop"
                              />
                              System
                            </DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                        </DropdownMenuGroup>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <IconPlaceholder
                      hugeicons="HelpCircleIcon"
                      lucide="HelpCircleIcon"
                      phosphor="QuestionIcon"
                      tabler="IconHelpCircle"
                    />
                    Help & Support
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <IconPlaceholder
                      hugeicons="File01Icon"
                      lucide="FileTextIcon"
                      phosphor="FileTextIcon"
                      tabler="IconFileText"
                    />
                    Documentation
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem variant="destructive">
                    <IconPlaceholder
                      hugeicons="LogoutIcon"
                      lucide="LogOutIcon"
                      phosphor="SignOutIcon"
                      tabler="IconLogout"
                    />
                    Sign Out
                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="small-form-name">Name</FieldLabel>
                  <Input
                    id="small-form-name"
                    placeholder="Enter your name"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="small-form-role">Role</FieldLabel>
                  <Select defaultValue="">
                    <SelectTrigger id="small-form-role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="developer">Developer</SelectItem>
                        <SelectItem value="designer">Designer</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="small-form-framework">
                  Framework
                </FieldLabel>
                <Combobox items={frameworks}>
                  <ComboboxInput
                    id="small-form-framework"
                    placeholder="Select a framework"
                    required
                  />
                  <ComboboxContent>
                    <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
                    <ComboboxList>
                      {(item) => (
                        <ComboboxItem key={item} value={item}>
                          {item}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </Field>
              <Field>
                <FieldLabel htmlFor="small-form-comments">Comments</FieldLabel>
                <Textarea
                  id="small-form-comments"
                  placeholder="Add any additional comments"
                />
              </Field>
              <Field orientation="horizontal">
                <Button type="submit">Submit</Button>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </Example>
  );
}

function ObservabilityCard() {
  return (
    <Example className="items-center justify-center" title="Card">
      <Card className="relative w-full max-w-sm overflow-hidden pt-0">
        <div className="absolute inset-0 z-30 aspect-video bg-primary opacity-50 mix-blend-color" />
        <img
          alt="Photo by mymind on Unsplash"
          className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale"
          src="https://images.unsplash.com/photo-1604076850742-4c7221f3101b?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          title="Photo by mymind on Unsplash"
        />
        <CardHeader>
          <CardTitle>Observability Plus is replacing Monitoring</CardTitle>
          <CardDescription>
            Switch to the improved way to explore your data, with natural
            language. Monitoring will no longer be available on the Pro plan in
            November, 2025
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button>
            Create Query{" "}
            <IconPlaceholder
              data-icon="inline-end"
              hugeicons="PlusSignIcon"
              lucide="PlusIcon"
              phosphor="PlusIcon"
              tabler="IconPlus"
            />
          </Button>
          <Badge className="ml-auto" variant="secondary">
            Warning
          </Badge>
        </CardFooter>
      </Card>
    </Example>
  );
}

function _FieldSlider() {
  const [value, setValue] = useState([200, 800]);
  return (
    <Example title="Field Slider">
      <div className="w-full max-w-md">
        <Field>
          <FieldTitle>Price Range</FieldTitle>
          <FieldDescription>
            Set your budget range ($
            <span className="font-medium tabular-nums">{value[0]}</span> -{" "}
            <span className="font-medium tabular-nums">{value[1]}</span>).
          </FieldDescription>
          <Slider
            aria-label="Price Range"
            className="mt-2 w-full"
            max={1000}
            min={0}
            onValueChange={setValue}
            step={10}
            value={value}
          />
        </Field>
      </div>
    </Example>
  );
}

function ItemExample() {
  return (
    <Example title="Item">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Item variant="outline">
          <ItemContent>
            <ItemTitle>Two-factor authentication</ItemTitle>
            <ItemDescription className="text-pretty xl:hidden 2xl:block">
              Verify via email or phone number.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button size="sm" variant="secondary">
              Enable
            </Button>
          </ItemActions>
        </Item>
        <Item asChild size="sm" variant="outline">
          <a href="#">
            <ItemMedia variant="icon">
              <IconPlaceholder
                hugeicons="ShoppingBasket01Icon"
                lucide="ShoppingBagIcon"
                phosphor="BagIcon"
                tabler="IconShoppingBag"
              />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Your order has been shipped.</ItemTitle>
            </ItemContent>
          </a>
        </Item>
      </div>
    </Example>
  );
}

function BadgeExamples() {
  return (
    <Example className="items-center justify-center" title="Badge">
      <div className="flex items-center justify-center gap-2">
        <Badge>
          <Spinner data-icon="inline-start" />
          Syncing
        </Badge>
        <Badge variant="secondary">
          <Spinner data-icon="inline-start" />
          Updating
        </Badge>
        <Badge variant="outline">
          <Spinner data-icon="inline-start" />
          Loading
        </Badge>
        <Badge className="hidden sm:flex" variant="link">
          <Spinner data-icon="inline-start" />
          Link
        </Badge>
      </div>
    </Example>
  );
}

function _EmptyWithSpinner() {
  return (
    <Example title="Empty with Spinner">
      <Empty className="w-full border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Spinner />
          </EmptyMedia>
          <EmptyTitle>Processing your request</EmptyTitle>
          <EmptyDescription>
            Please wait while we process your request. Do not refresh the page.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <Button size="sm">Submit</Button>
            <Button size="sm" variant="outline">
              Cancel
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </Example>
  );
}

const SHEET_SIDES = ["top", "right", "bottom", "left"] as const;

function SheetExample() {
  return (
    <Example title="Sheet">
      <div className="flex gap-2">
        {SHEET_SIDES.map((side) => (
          <Sheet key={side}>
            <SheetTrigger asChild>
              <Button className="flex-1 capitalize" variant="secondary">
                {side}
              </Button>
            </SheetTrigger>
            <SheetContent
              className="data-[side=bottom]:max-h-[50vh] data-[side=top]:max-h-[50vh]"
              side={side}
            >
              <SheetHeader>
                <SheetTitle>Edit profile</SheetTitle>
                <SheetDescription>
                  Make changes to your profile here. Click save when you&apos;re
                  done.
                </SheetDescription>
              </SheetHeader>
              <div className="overflow-y-auto px-4 text-sm">
                {Array.from({ length: 10 }).map((_, index) => (
                  <p
                    className="mb-4 style-lyra:mb-2 leading-normal style-lyra:leading-relaxed"
                    key={index}
                  >
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    Duis aute irure dolor in reprehenderit in voluptate velit
                    esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
                    occaecat cupidatat non proident, sunt in culpa qui officia
                    deserunt mollit anim id est laborum.
                  </p>
                ))}
              </div>
              <SheetFooter>
                <Button type="submit">Save changes</Button>
                <SheetClose asChild>
                  <Button variant="outline">Cancel</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        ))}
      </div>
    </Example>
  );
}
