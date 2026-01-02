"use client";

import * as React from "react";
import { IconPlaceholder } from "@/app/(create)/components/icon-placeholder";
import {
  Example,
  ExampleWrapper,
} from "@/registry/bases/radix/components/example";
import { Alert, AlertDescription } from "@/registry/bases/radix/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/registry/bases/radix/ui/alert-dialog";
import { Badge } from "@/registry/bases/radix/ui/badge";
import { Button } from "@/registry/bases/radix/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/bases/radix/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/registry/bases/radix/ui/dropdown-menu";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/registry/bases/radix/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupTextarea,
} from "@/registry/bases/radix/ui/input-group";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/registry/bases/radix/ui/item";
import { Kbd } from "@/registry/bases/radix/ui/kbd";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/bases/radix/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/registry/bases/radix/ui/tooltip";

export default function ChatGPTBlock() {
  return (
    <ExampleWrapper>
      <PromptForm />
      <ModelSelector />
      <GroupChatDialog />
      <CreateProjectForm />
    </ExampleWrapper>
  );
}

function PromptForm() {
  const [dictateEnabled, setDictateEnabled] = React.useState(false);

  return (
    <Example title="Prompt Form">
      <Field>
        <FieldLabel className="sr-only" htmlFor="prompt">
          Prompt
        </FieldLabel>
        <InputGroup>
          <InputGroupTextarea id="prompt" placeholder="Ask anything" />
          <InputGroupAddon align="block-end">
            <DropdownMenu>
              <Tooltip>
                <DropdownMenuTrigger asChild>
                  <TooltipTrigger asChild>
                    <InputGroupButton
                      className="rounded-4xl"
                      onClick={() => setDictateEnabled(!dictateEnabled)}
                      size="icon-sm"
                      variant="ghost"
                    >
                      <IconPlaceholder
                        hugeicons="PlusSignIcon"
                        lucide="PlusIcon"
                        phosphor="PlusIcon"
                        tabler="IconPlus"
                      />
                    </InputGroupButton>
                  </TooltipTrigger>
                </DropdownMenuTrigger>
                <TooltipContent>
                  Add files and more <Kbd>/</Kbd>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent
                className="w-56"
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                <DropdownMenuItem>
                  <IconPlaceholder
                    hugeicons="AttachmentIcon"
                    lucide="PaperclipIcon"
                    phosphor="PaperclipIcon"
                    tabler="IconPaperclip"
                  />
                  Add photos & files
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <IconPlaceholder
                    hugeicons="SparklesIcon"
                    lucide="SparklesIcon"
                    phosphor="SparkleIcon"
                    tabler="IconSparkles"
                  />
                  Deep research
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <IconPlaceholder
                    hugeicons="ShoppingBag01Icon"
                    lucide="ShoppingBagIcon"
                    phosphor="BagIcon"
                    tabler="IconShoppingBag"
                  />
                  Shopping research
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <IconPlaceholder
                    hugeicons="MagicWand05Icon"
                    lucide="WandIcon"
                    phosphor="MagicWandIcon"
                    tabler="IconWand"
                  />
                  Create image
                </DropdownMenuItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuItem>
                      <IconPlaceholder
                        hugeicons="Cursor01Icon"
                        lucide="MousePointerIcon"
                        phosphor="HandPointingIcon"
                        tabler="IconPointer"
                      />
                      Agent mode
                    </DropdownMenuItem>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <div className="font-medium">35 left</div>
                    <div className="text-primary-foreground/80 text-xs">
                      More available for purchase
                    </div>
                  </TooltipContent>
                </Tooltip>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <IconPlaceholder
                      hugeicons="MoreHorizontalCircle01Icon"
                      lucide="MoreHorizontalIcon"
                      phosphor="DotsThreeOutlineIcon"
                      tabler="IconDots"
                    />
                    More
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem>
                      <IconPlaceholder
                        hugeicons="Share03Icon"
                        lucide="ShareIcon"
                        phosphor="ShareIcon"
                        tabler="IconShare"
                      />
                      Add sources
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <IconPlaceholder
                        hugeicons="BookIcon"
                        lucide="BookOpenIcon"
                        phosphor="BookOpenIcon"
                        tabler="IconBook"
                      />
                      Study and learn
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <IconPlaceholder
                        hugeicons="GlobalIcon"
                        lucide="GlobeIcon"
                        phosphor="GlobeIcon"
                        tabler="IconWorld"
                      />
                      Web search
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <IconPlaceholder
                        hugeicons="PenIcon"
                        lucide="PenToolIcon"
                        phosphor="PencilIcon"
                        tabler="IconPencil"
                      />
                      Canvas
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <InputGroupButton
                  className="ml-auto rounded-4xl"
                  onClick={() => setDictateEnabled(!dictateEnabled)}
                  size="icon-sm"
                  variant="ghost"
                >
                  <IconPlaceholder
                    hugeicons="AudioWave01Icon"
                    lucide="AudioLinesIcon"
                    phosphor="MicrophoneIcon"
                    tabler="IconMicrophone"
                  />
                </InputGroupButton>
              </TooltipTrigger>
              <TooltipContent>Dictate</TooltipContent>
            </Tooltip>
            <InputGroupButton
              className="rounded-4xl"
              size="icon-sm"
              variant="default"
            >
              <IconPlaceholder
                hugeicons="ArrowUp02Icon"
                lucide="ArrowUpIcon"
                phosphor="ArrowUpIcon"
                tabler="IconArrowUp"
              />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </Field>
    </Example>
  );
}

function ModelSelector() {
  const [mode, setMode] = React.useState("auto");
  const [model, setModel] = React.useState("gpt-5.1");

  return (
    <Example title="Model Selector">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="gap-2" variant="ghost">
            ChatGPT 5.1
            <IconPlaceholder
              className="size-4 text-muted-foreground"
              hugeicons="ArrowDown01Icon"
              lucide="ChevronDownIcon"
              phosphor="CaretDownIcon"
              tabler="IconChevronDown"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-60">
          <DropdownMenuLabel className="font-normal text-muted-foreground text-xs">
            GPT-5.1
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup onValueChange={setMode} value={mode}>
            <DropdownMenuRadioItem value="auto">
              <Item className="p-0" size="xs">
                <ItemContent>
                  <ItemTitle>Auto</ItemTitle>
                  <ItemDescription className="text-xs">
                    Decides how long to think
                  </ItemDescription>
                </ItemContent>
              </Item>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="instant">
              <Item className="p-0" size="xs">
                <ItemContent>
                  <ItemTitle>Instant</ItemTitle>
                  <ItemDescription className="text-xs">
                    Answers right away
                  </ItemDescription>
                </ItemContent>
              </Item>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="thinking">
              <Item className="p-0" size="xs">
                <ItemContent>
                  <ItemTitle>Thinking</ItemTitle>
                  <ItemDescription className="text-xs">
                    Thinks longer for better answers
                  </ItemDescription>
                </ItemContent>
              </Item>
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span className="font-medium">Legacy models</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup onValueChange={setModel} value={model}>
                <DropdownMenuRadioItem value="gpt-4">
                  GPT-4
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="gpt-4-turbo">
                  GPT-4 Turbo
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="gpt-3.5">
                  GPT-3.5
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </Example>
  );
}

function GroupChatDialog() {
  return (
    <Example className="items-center justify-center" title="Group Chat Dialog">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>Start Group Chat</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Use ChatGPT together</AlertDialogTitle>
            <AlertDialogDescription>
              Add people to your chats to plan, share ideas, and get creative.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row items-center justify-between sm:justify-between">
            <a
              className="text-muted-foreground text-sm underline underline-offset-4 hover:text-foreground"
              href="#"
            >
              Learn more
            </a>
            <div className="flex gap-2">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Start group chat</AlertDialogAction>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Example>
  );
}

const categories = [
  {
    id: "homework",
    label: "Homework",
  },
  {
    id: "writing",
    label: "Writing",
  },
  {
    id: "health",
    label: "Health",
  },
  {
    id: "travel",
    label: "Travel",
  },
];

function CreateProjectForm() {
  const [projectName, setProjectName] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(
    categories[0].id
  );
  const [memorySetting, setMemorySetting] = React.useState<
    "default" | "project-only"
  >("default");
  const [selectedColor, setSelectedColor] = React.useState<string | null>(
    "var(--foreground)"
  );

  return (
    <Example className="items-center justify-center" title="Create Project">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create Project</CardTitle>
          <CardDescription>
            Start a new project to keep chats, files, and custom instructions in
            one place.
          </CardDescription>
          <CardAction>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost">
                  <IconPlaceholder
                    hugeicons="Settings01Icon"
                    lucide="SettingsIcon"
                    phosphor="GearIcon"
                    tabler="IconSettings"
                  />
                  <span className="sr-only">Memory</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuRadioGroup
                  onValueChange={(value) => {
                    setMemorySetting(value as "default" | "project-only");
                  }}
                  value={memorySetting}
                >
                  <DropdownMenuRadioItem value="default">
                    <Item size="xs">
                      <ItemContent>
                        <ItemTitle>Default</ItemTitle>
                        <ItemDescription className="text-xs">
                          Project can access memories from outside chats, and
                          vice versa.
                        </ItemDescription>
                      </ItemContent>
                    </Item>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="project-only">
                    <Item size="xs">
                      <ItemContent>
                        <ItemTitle>Project Only</ItemTitle>
                        <ItemDescription className="text-xs">
                          Project can only access its own memories. Its memories
                          are hidden from outside chats.
                        </ItemDescription>
                      </ItemContent>
                    </Item>
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>
                  Note that this setting can&apos;t be changed later.
                </DropdownMenuLabel>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel className="sr-only" htmlFor="project-name">
                Project Name
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="project-name"
                  onChange={(e) => {
                    setProjectName(e.target.value);
                  }}
                  placeholder="Copenhagen Trip"
                  value={projectName}
                />
                <InputGroupAddon>
                  <Popover>
                    <PopoverTrigger asChild>
                      <InputGroupButton size="icon-xs" variant="ghost">
                        <IconPlaceholder
                          className="text-(--color)"
                          hugeicons="FolderIcon"
                          lucide="FolderIcon"
                          phosphor="FolderIcon"
                          style={
                            { "--color": selectedColor } as React.CSSProperties
                          }
                          tabler="IconFolder"
                        />
                      </InputGroupButton>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-60 p-3">
                      <div className="flex flex-wrap gap-2">
                        {[
                          "var(--foreground)",
                          "#fa423e",
                          "#f59e0b",
                          "#8b5cf6",
                          "#ec4899",
                          "#10b981",
                          "#6366f1",
                          "#14b8a6",
                          "#f97316",
                          "#fbbc04",
                        ].map((color) => (
                          <Button
                            className="rounded-full p-1"
                            data-checked={selectedColor === color}
                            key={color}
                            onClick={() => {
                              setSelectedColor(color);
                            }}
                            size="icon"
                            style={{ "--color": color } as React.CSSProperties}
                            variant="ghost"
                          >
                            <span className="size-5 rounded-full bg-(--color) ring-2 ring-transparent ring-offset-(--color) ring-offset-2 group-data-[checked=true]/button:ring-(--color) group-data-[checked=true]/button:ring-offset-background" />
                            <span className="sr-only">{color}</span>
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </InputGroupAddon>
              </InputGroup>
              <FieldDescription className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge
                    asChild
                    data-checked={selectedCategory === category.id}
                    key={category.id}
                    variant={
                      selectedCategory === category.id ? "default" : "outline"
                    }
                  >
                    <button
                      onClick={() => {
                        setSelectedCategory(
                          selectedCategory === category.id ? null : category.id
                        );
                      }}
                    >
                      <IconPlaceholder
                        className="hidden group-data-[checked=true]/badge:inline"
                        data-icon="inline-start"
                        hugeicons="CheckmarkCircle02Icon"
                        lucide="CircleCheckIcon"
                        phosphor="CheckCircleIcon"
                        tabler="IconCircleCheck"
                      />
                      {category.label}
                    </button>
                  </Badge>
                ))}
              </FieldDescription>
            </Field>
            <Field>
              <Alert className="bg-muted">
                <IconPlaceholder
                  hugeicons="BulbIcon"
                  lucide="LightbulbIcon"
                  phosphor="LightbulbIcon"
                  tabler="IconBulb"
                />
                <AlertDescription className="text-xs">
                  Projects keep chats, files, and custom instructions in one
                  place. Use them for ongoing work, or just to keep things tidy.
                </AlertDescription>
              </Alert>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>
    </Example>
  );
}
