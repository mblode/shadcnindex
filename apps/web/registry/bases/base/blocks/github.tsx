"use client";

import * as React from "react";
import { IconPlaceholder } from "@/app/(create)/components/icon-placeholder";
import {
  Example,
  ExampleWrapper,
} from "@/registry/bases/base/components/example";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/registry/bases/base/ui/avatar";
import { Badge } from "@/registry/bases/base/ui/badge";
import { Button } from "@/registry/bases/base/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/bases/base/ui/card";
import { Checkbox } from "@/registry/bases/base/ui/checkbox";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/registry/bases/base/ui/combobox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/registry/bases/base/ui/command";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/registry/bases/base/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/bases/base/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/bases/base/ui/empty";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/registry/bases/base/ui/field";
import { Input } from "@/registry/bases/base/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupTextarea,
} from "@/registry/bases/base/ui/input-group";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/registry/bases/base/ui/item";
import { Kbd } from "@/registry/bases/base/ui/kbd";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/registry/bases/base/ui/native-select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/bases/base/ui/popover";
import { Separator } from "@/registry/bases/base/ui/separator";
import { Spinner } from "@/registry/bases/base/ui/spinner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/bases/base/ui/tabs";
import { Textarea } from "@/registry/bases/base/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/registry/bases/base/ui/tooltip";

export default function GithubBlock() {
  return (
    <ExampleWrapper>
      <CodespacesCard />
      <AssignIssue />
      <Navbar />
      <RepositoryToolbar />
      <Profile />
      <ContributionsActivity />
      <Contributors />
    </ExampleWrapper>
  );
}

function CodespacesCard() {
  const [isCreatingCodespace, setIsCreatingCodespace] = React.useState(false);

  return (
    <Example className="min-h-[550px] lg:p-12" title="Codespaces">
      <Card className="mx-auto w-full max-w-sm" size="sm">
        <CardContent>
          <Tabs defaultValue="codespaces">
            <TabsList className="w-full">
              <TabsTrigger value="codespaces">Codespaces</TabsTrigger>
              <TabsTrigger value="local">Local</TabsTrigger>
            </TabsList>
            <TabsContent value="codespaces">
              <Item className="px-1 pt-2" size="sm">
                <ItemContent>
                  <ItemTitle>Codespaces</ItemTitle>
                  <ItemDescription>
                    Your workspaces in the cloud
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Tooltip>
                    <TooltipTrigger
                      render={<Button size="icon-sm" variant="ghost" />}
                    >
                      <IconPlaceholder
                        hugeicons="PlusSignIcon"
                        lucide="PlusIcon"
                        phosphor="PlusIcon"
                        tabler="IconPlus"
                      />
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      Create a codespace on main
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <DropdownMenuTrigger
                            render={<Button size="icon-sm" variant="ghost" />}
                          />
                        }
                      >
                        <IconPlaceholder
                          hugeicons="MoreHorizontalCircle01Icon"
                          lucide="MoreHorizontalIcon"
                          phosphor="DotsThreeOutlineIcon"
                          tabler="IconDots"
                        />
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        Codespace repository configuration
                      </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuGroup>
                        <DropdownMenuItem>
                          <IconPlaceholder
                            hugeicons="PlusSignIcon"
                            lucide="PlusIcon"
                            phosphor="PlusIcon"
                            tabler="IconPlus"
                          />
                          New with options...
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <IconPlaceholder
                            hugeicons="CubeIcon"
                            lucide="ContainerIcon"
                            phosphor="CubeIcon"
                            tabler="IconBox"
                          />
                          Configure dev container
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <IconPlaceholder
                            hugeicons="ZapIcon"
                            lucide="ZapIcon"
                            phosphor="LightningIcon"
                            tabler="IconBolt"
                          />
                          Set up prebuilds
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem>
                          <IconPlaceholder
                            hugeicons="ServerStackIcon"
                            lucide="ServerIcon"
                            phosphor="HardDrivesIcon"
                            tabler="IconServer"
                          />
                          Manage codespaces
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <IconPlaceholder
                            hugeicons="Share03Icon"
                            lucide="ShareIcon"
                            phosphor="ShareIcon"
                            tabler="IconShare2"
                          />
                          Share deep link
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <IconPlaceholder
                            hugeicons="AlertCircleIcon"
                            lucide="InfoIcon"
                            phosphor="InfoIcon"
                            tabler="IconInfoCircle"
                          />
                          What are codespaces?
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </ItemActions>
              </Item>
              <Separator className="-mx-2 my-2 w-auto!" />
              <Empty className="p-4">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <IconPlaceholder
                      hugeicons="ServerStackIcon"
                      lucide="ServerIcon"
                      phosphor="HardDrivesIcon"
                      tabler="IconServer"
                    />
                  </EmptyMedia>
                  <EmptyTitle>No codespaces</EmptyTitle>
                  <EmptyDescription>
                    You don&apos;t have any codespaces with this repository
                    checked out
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button
                    disabled={isCreatingCodespace}
                    onClick={() => {
                      setIsCreatingCodespace(true);
                      setTimeout(() => {
                        setIsCreatingCodespace(false);
                      }, 2000);
                    }}
                    size="sm"
                  >
                    {isCreatingCodespace ? (
                      <Spinner data-icon="inline-start" />
                    ) : (
                      ""
                    )}
                    Create Codespace
                  </Button>
                  <a
                    className="text-muted-foreground text-xs underline underline-offset-4"
                    href="#learn-more"
                  >
                    Learn more about codespaces
                  </a>
                </EmptyContent>
              </Empty>
              <Separator className="-mx-2 my-2 w-auto!" />
              <div className="p-1.5 text-muted-foreground text-xs">
                Codespace usage for this repository is paid for by{" "}
                <span className="font-medium">shadcn</span>.
              </div>
            </TabsContent>
            <TabsContent value="local">
              <Item className="hidden p-0" size="sm">
                <ItemContent>
                  <ItemTitle className="gap-2">
                    <IconPlaceholder
                      className="size-4"
                      hugeicons="ComputerTerminal01Icon"
                      lucide="TerminalIcon"
                      phosphor="TerminalIcon"
                      tabler="IconTerminal"
                    />
                    Clone
                  </ItemTitle>
                </ItemContent>
                <ItemActions>
                  <Tooltip>
                    <TooltipTrigger
                      render={<Button size="icon" variant="ghost" />}
                    >
                      <IconPlaceholder
                        hugeicons="AlertCircleIcon"
                        lucide="InfoIcon"
                        phosphor="InfoIcon"
                        tabler="IconInfoCircle"
                      />
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      Which remote URL should I use?
                    </TooltipContent>
                  </Tooltip>
                </ItemActions>
              </Item>
              <Tabs defaultValue="https">
                <TabsList
                  className="w-full justify-start border-b *:[button]:flex-0"
                  variant="line"
                >
                  <TabsTrigger value="https">HTTPS</TabsTrigger>
                  <TabsTrigger value="ssh">SSH</TabsTrigger>
                  <TabsTrigger value="cli">GitHub CLI</TabsTrigger>
                </TabsList>
                <div className="rounded-md border bg-muted/30 p-2">
                  <TabsContent value="https">
                    <Field className="gap-2">
                      <FieldLabel className="sr-only" htmlFor="https-url">
                        HTTPS URL
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupAddon align="inline-end">
                          <InputGroupButton size="icon-xs" variant="ghost">
                            <IconPlaceholder
                              hugeicons="Copy01Icon"
                              lucide="CopyIcon"
                              phosphor="CopyIcon"
                              tabler="IconCopy"
                            />
                          </InputGroupButton>
                        </InputGroupAddon>
                        <InputGroupInput
                          defaultValue="https://github.com/shadcn-ui/ui.git"
                          id="https-url"
                          readOnly
                        />
                      </InputGroup>
                      <FieldDescription>
                        Clone using the web URL.
                      </FieldDescription>
                    </Field>
                  </TabsContent>
                  <TabsContent value="ssh">
                    <Field className="gap-2">
                      <FieldLabel className="sr-only" htmlFor="ssh-url">
                        SSH URL
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupAddon align="inline-end">
                          <InputGroupButton size="icon-xs" variant="ghost">
                            <IconPlaceholder
                              hugeicons="Copy01Icon"
                              lucide="CopyIcon"
                              phosphor="CopyIcon"
                              tabler="IconCopy"
                            />
                          </InputGroupButton>
                        </InputGroupAddon>
                        <InputGroupInput
                          defaultValue="git@github.com:shadcn-ui/ui.git"
                          id="ssh-url"
                          readOnly
                        />
                      </InputGroup>
                      <FieldDescription>
                        Use a password-protected SSH key.
                      </FieldDescription>
                    </Field>
                  </TabsContent>
                  <TabsContent value="cli">
                    <Field className="gap-2">
                      <FieldLabel className="sr-only" htmlFor="cli-command">
                        CLI Command
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupAddon align="inline-end">
                          <InputGroupButton size="icon-xs" variant="ghost">
                            <IconPlaceholder
                              hugeicons="Copy01Icon"
                              lucide="CopyIcon"
                              phosphor="CopyIcon"
                              tabler="IconCopy"
                            />
                          </InputGroupButton>
                        </InputGroupAddon>
                        <InputGroupInput
                          defaultValue="gh repo clone shadcn-ui/ui"
                          id="cli-command"
                          readOnly
                        />
                      </InputGroup>
                      <FieldDescription>
                        Work fast with our official CLI.{" "}
                        <a href="#learn-more">Learn more</a>
                      </FieldDescription>
                    </Field>
                  </TabsContent>
                </div>
              </Tabs>
              <Separator className="-mx-2 my-2 w-auto!" />
              <div className="flex flex-col">
                <Button
                  className="justify-start gap-1.5"
                  size="sm"
                  variant="ghost"
                >
                  <IconPlaceholder
                    data-icon="inline-start"
                    hugeicons="ComputerIcon"
                    lucide="MonitorIcon"
                    phosphor="MonitorIcon"
                    tabler="IconDeviceDesktop"
                  />
                  Open with GitHub Desktop
                </Button>
                <Button
                  className="justify-start gap-1.5"
                  size="sm"
                  variant="ghost"
                >
                  <IconPlaceholder
                    data-icon="inline-start"
                    hugeicons="DownloadIcon"
                    lucide="DownloadIcon"
                    phosphor="DownloadIcon"
                    tabler="IconDownload"
                  />
                  Download ZIP
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </Example>
  );
}

function RepositoryToolbar() {
  const [selectedBranch, setSelectedBranch] = React.useState("main");
  return (
    <Example title="Repository Toolbar">
      <div className="flex items-center gap-2">
        <InputGroup>
          <InputGroupInput placeholder="Go to file" />
          <InputGroupAddon align="inline-start">
            <InputGroupButton size="icon-xs" variant="ghost">
              <IconPlaceholder
                hugeicons="SearchIcon"
                lucide="SearchIcon"
                phosphor="MagnifyingGlassIcon"
                tabler="IconSearch"
              />
            </InputGroupButton>
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            <Kbd>t</Kbd>
          </InputGroupAddon>
        </InputGroup>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>
            Add File
            <IconPlaceholder
              data-icon="inline-end"
              hugeicons="ArrowDown01Icon"
              lucide="ChevronDownIcon"
              phosphor="CaretDownIcon"
              tabler="IconChevronDown"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <IconPlaceholder
                  hugeicons="PlusSignIcon"
                  lucide="PlusIcon"
                  phosphor="PlusIcon"
                  tabler="IconPlus"
                />
                Create new file
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconPlaceholder
                  hugeicons="Upload01Icon"
                  lucide="UploadIcon"
                  phosphor="UploadIcon"
                  tabler="IconUpload"
                />
                Upload files
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <Popover>
          <Tooltip>
            <TooltipTrigger
              render={
                <PopoverTrigger
                  render={<Button size="icon" variant="outline" />}
                />
              }
            >
              <IconPlaceholder
                hugeicons="AiCloud01Icon"
                lucide="CloudCogIcon"
                phosphor="CloudArrowUpIcon"
                tabler="IconCloudCog"
              />
            </TooltipTrigger>
            <TooltipContent>New Agent Task</TooltipContent>
          </Tooltip>
          <PopoverContent align="end" className="w-96" side="bottom">
            <Field>
              <FieldLabel htmlFor="new-agent-task">New Agent Task</FieldLabel>
              <InputGroup>
                <InputGroupTextarea placeholder="Describe your task in natural language." />
                <InputGroupAddon align="block-end">
                  <Popover>
                    <Tooltip>
                      <PopoverTrigger
                        render={
                          <TooltipTrigger
                            render={
                              <InputGroupButton
                                size="icon-sm"
                                variant="outline"
                              />
                            }
                          />
                        }
                      >
                        <IconPlaceholder
                          hugeicons="GitBranchIcon"
                          lucide="GitBranchIcon"
                          phosphor="GitBranchIcon"
                          tabler="IconGitBranch"
                        />
                      </PopoverTrigger>
                      <TooltipContent>Select a branch</TooltipContent>
                    </Tooltip>
                    <PopoverContent align="start" className="p-1" side="bottom">
                      <Field>
                        <FieldLabel className="sr-only" htmlFor="select-branch">
                          Select a Branch
                        </FieldLabel>
                        <Command>
                          <CommandInput
                            id="select-branch"
                            placeholder="Find a branch"
                          />
                          <CommandEmpty>No branches found</CommandEmpty>
                          <CommandList>
                            <CommandGroup>
                              {[
                                "main",
                                "develop",
                                "feature/123",
                                "feature/user-authentication",
                                "feature/dashboard-redesign",
                                "bugfix/login-error",
                                "hotfix/security-patch",
                                "release/v2.0.0",
                                "feature/api-integration",
                                "bugfix/memory-leak",
                                "feature/dark-mode",
                                "feature/responsive-design",
                                "bugfix/typo-fix",
                                "feature/search-functionality",
                                "release/v1.9.0",
                                "feature/notifications",
                                "bugfix/cache-issue",
                                "feature/payment-gateway",
                                "hotfix/critical-bug",
                                "feature/admin-panel",
                                "bugfix/validation-error",
                                "feature/analytics",
                                "release/v2.1.0",
                              ].map((branch) => (
                                <CommandItem
                                  data-checked={selectedBranch === branch}
                                  key={branch}
                                  onSelect={() => setSelectedBranch(branch)}
                                  value={branch}
                                >
                                  {branch}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </Field>
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <Tooltip>
                      <PopoverTrigger
                        render={
                          <TooltipTrigger
                            render={
                              <InputGroupButton
                                size="icon-sm"
                                variant="outline"
                              />
                            }
                          />
                        }
                      >
                        <IconPlaceholder
                          hugeicons="RoboticIcon"
                          lucide="BotIcon"
                          phosphor="RobotIcon"
                          tabler="IconRobot"
                        />
                      </PopoverTrigger>
                      <TooltipContent>Select Agent</TooltipContent>
                    </Tooltip>
                    <PopoverContent align="start" side="bottom">
                      <Empty className="gap-4 p-0">
                        <EmptyHeader>
                          <EmptyTitle className="text-sm">
                            This repository has no custom agents
                          </EmptyTitle>
                          <EmptyDescription className="text-xs">
                            Custom agents are reusable instructions and tools in
                            your repository.
                          </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                          <Button size="sm" variant="outline">
                            Create Custom Agent
                          </Button>
                        </EmptyContent>
                      </Empty>
                    </PopoverContent>
                  </Popover>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <InputGroupButton
                          className="ml-auto"
                          size="icon-sm"
                          variant="ghost"
                        />
                      }
                    >
                      <IconPlaceholder
                        hugeicons="SentIcon"
                        lucide="SendIcon"
                        phosphor="PaperPlaneTiltIcon"
                        tabler="IconSend"
                      />
                    </TooltipTrigger>
                    <TooltipContent className="flex items-center gap-2 pr-2">
                      Start Task <Kbd>⏎</Kbd>
                    </TooltipContent>
                  </Tooltip>
                </InputGroupAddon>
              </InputGroup>
            </Field>
          </PopoverContent>
        </Popover>
      </div>
    </Example>
  );
}

function Navbar() {
  return (
    <Example title="Account Menu">
      <header className="flex h-14 w-full items-center gap-2">
        <Drawer direction="left">
          <DrawerTrigger asChild>
            <Button size="icon" variant="outline">
              <IconPlaceholder
                hugeicons="Menu09Icon"
                lucide="MenuIcon"
                phosphor="ListIcon"
                tabler="IconMenu"
              />
              <span className="sr-only">Open menu</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-w-72">
            <DrawerHeader className="flex flex-row items-center justify-between px-5 pb-0">
              <DrawerTitle>Menu</DrawerTitle>
              <DrawerClose asChild>
                <Button size="icon-sm" variant="ghost">
                  <IconPlaceholder
                    hugeicons="Cancel01Icon"
                    lucide="XIcon"
                    phosphor="XIcon"
                    tabler="IconX"
                  />
                  <span className="sr-only">Close</span>
                </Button>
              </DrawerClose>
            </DrawerHeader>
            <div className="p-2">
              <ItemGroup className="gap-px">
                <Item render={<a href="#" />} size="xs">
                  <ItemMedia variant="icon">
                    <IconPlaceholder
                      hugeicons="HomeIcon"
                      lucide="HomeIcon"
                      phosphor="HouseIcon"
                      tabler="IconHome"
                    />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>Home</ItemTitle>
                  </ItemContent>
                </Item>
                <Item render={<a href="#" />} size="xs">
                  <ItemMedia variant="icon">
                    <IconPlaceholder
                      hugeicons="CircleIcon"
                      lucide="CircleIcon"
                      phosphor="CircleIcon"
                      tabler="IconCircle"
                    />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>Issues</ItemTitle>
                  </ItemContent>
                </Item>
                <Item render={<a href="#" />} size="xs">
                  <ItemMedia variant="icon">
                    <IconPlaceholder
                      hugeicons="GitBranchIcon"
                      lucide="GitBranchIcon"
                      phosphor="GitBranchIcon"
                      tabler="IconGitBranch"
                    />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>Pull requests</ItemTitle>
                  </ItemContent>
                </Item>
                <Item render={<a href="#" />} size="xs">
                  <ItemMedia variant="icon">
                    <IconPlaceholder
                      hugeicons="GridIcon"
                      lucide="LayoutGridIcon"
                      phosphor="GridFourIcon"
                      tabler="IconLayoutGrid"
                    />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>Projects</ItemTitle>
                  </ItemContent>
                </Item>
                <Item render={<a href="#" />} size="xs">
                  <ItemMedia variant="icon">
                    <IconPlaceholder
                      hugeicons="MailIcon"
                      lucide="MailIcon"
                      phosphor="EnvelopeIcon"
                      tabler="IconMail"
                    />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>Discussions</ItemTitle>
                  </ItemContent>
                </Item>
                <Item render={<a href="#" />} size="xs">
                  <ItemMedia variant="icon">
                    <IconPlaceholder
                      hugeicons="ServerStackIcon"
                      lucide="ServerIcon"
                      phosphor="HardDrivesIcon"
                      tabler="IconServer"
                    />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>Codespaces</ItemTitle>
                  </ItemContent>
                </Item>
                <Item render={<a href="#" />} size="xs">
                  <ItemMedia variant="icon">
                    <IconPlaceholder
                      hugeicons="RoboticIcon"
                      lucide="BotIcon"
                      phosphor="RobotIcon"
                      tabler="IconRobot"
                    />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>Copilot</ItemTitle>
                  </ItemContent>
                </Item>
                <Item render={<a href="#" />} size="xs">
                  <ItemMedia variant="icon">
                    <IconPlaceholder
                      hugeicons="SparklesIcon"
                      lucide="SparklesIcon"
                      phosphor="SparkleIcon"
                      tabler="IconSparkles"
                    />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>Spark</ItemTitle>
                  </ItemContent>
                </Item>
                <ItemSeparator />
                <Item render={<a href="#" />} size="xs">
                  <ItemMedia variant="icon">
                    <IconPlaceholder
                      hugeicons="SearchIcon"
                      lucide="SearchIcon"
                      phosphor="MagnifyingGlassIcon"
                      tabler="IconSearch"
                    />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>Explore</ItemTitle>
                  </ItemContent>
                </Item>
                <Item render={<a href="#" />} size="xs">
                  <ItemMedia variant="icon">
                    <IconPlaceholder
                      hugeicons="ShoppingBasket01Icon"
                      lucide="ShoppingBagIcon"
                      phosphor="BagIcon"
                      tabler="IconShoppingBag"
                    />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>Marketplace</ItemTitle>
                  </ItemContent>
                </Item>
                <Item render={<a href="#" />} size="xs">
                  <ItemMedia variant="icon">
                    <IconPlaceholder
                      hugeicons="LinkIcon"
                      lucide="LinkIcon"
                      phosphor="LinkIcon"
                      tabler="IconLink"
                    />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>MCP registry</ItemTitle>
                  </ItemContent>
                </Item>
              </ItemGroup>
            </div>
          </DrawerContent>
        </Drawer>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                className="ml-auto rounded-full"
                size="icon"
                variant="ghost"
              />
            }
          >
            <Avatar>
              <AvatarImage alt="shadcn" src="https://github.com/shadcn.png" />
              <AvatarFallback>SC</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <Item className="px-2 py-1 pb-0.5" size="sm">
                  <ItemMedia>
                    <Avatar>
                      <AvatarImage
                        alt="shadcn"
                        src="https://github.com/shadcn.png"
                      />
                      <AvatarFallback>SC</AvatarFallback>
                    </Avatar>
                  </ItemMedia>
                  <ItemContent className="gap-0">
                    <ItemTitle className="text-foreground text-sm">
                      shadcn
                    </ItemTitle>
                    <ItemDescription className="text-xs">
                      shadcn@example.com
                    </ItemDescription>
                  </ItemContent>
                </Item>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <IconPlaceholder
                  hugeicons="SmileIcon"
                  lucide="SmileIcon"
                  phosphor="SmileyIcon"
                  tabler="IconMoodSmile"
                />
                Set status
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconPlaceholder
                  hugeicons="AlertCircleIcon"
                  lucide="CircleAlertIcon"
                  phosphor="WarningCircleIcon"
                  tabler="IconExclamationCircle"
                />
                Single sign-on
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <IconPlaceholder
                  hugeicons="UserIcon"
                  lucide="UserIcon"
                  phosphor="UserIcon"
                  tabler="IconUser"
                />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconPlaceholder
                  hugeicons="FolderIcon"
                  lucide="FolderIcon"
                  phosphor="FolderIcon"
                  tabler="IconFolder"
                />
                Repositories
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconPlaceholder
                  hugeicons="StarIcon"
                  lucide="StarIcon"
                  phosphor="StarIcon"
                  tabler="IconStar"
                />
                Stars
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconPlaceholder
                  hugeicons="CodeIcon"
                  lucide="CodeIcon"
                  phosphor="CodeIcon"
                  tabler="IconCode"
                />
                Gists
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconPlaceholder
                  hugeicons="FolderIcon"
                  lucide="FolderIcon"
                  phosphor="FolderIcon"
                  tabler="IconFolder"
                />
                Organizations
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconPlaceholder
                  hugeicons="ServerStackIcon"
                  lucide="ServerIcon"
                  phosphor="HardDrivesIcon"
                  tabler="IconServer"
                />
                Enterprises
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconPlaceholder
                  hugeicons="FavouriteIcon"
                  lucide="HeartIcon"
                  phosphor="HeartIcon"
                  tabler="IconHeart"
                />
                Sponsors
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <IconPlaceholder
                  hugeicons="SettingsIcon"
                  lucide="SettingsIcon"
                  phosphor="GearIcon"
                  tabler="IconSettings"
                />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconPlaceholder
                  hugeicons="RoboticIcon"
                  lucide="BotIcon"
                  phosphor="RobotIcon"
                  tabler="IconRobot"
                />
                Copilot settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconPlaceholder
                  hugeicons="SparklesIcon"
                  lucide="SparklesIcon"
                  phosphor="SparkleIcon"
                  tabler="IconSparkles"
                />
                Feature preview
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconPlaceholder
                  hugeicons="ComputerIcon"
                  lucide="MonitorIcon"
                  phosphor="MonitorIcon"
                  tabler="IconDeviceDesktop"
                />
                Appearance
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconPlaceholder
                  hugeicons="UserIcon"
                  lucide="UserIcon"
                  phosphor="UserIcon"
                  tabler="IconUser"
                />
                Accessibility
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconPlaceholder
                  hugeicons="ArrowUpIcon"
                  lucide="ArrowUpIcon"
                  phosphor="ArrowUpIcon"
                  tabler="IconArrowUp"
                />
                Upgrade
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <IconPlaceholder
                  hugeicons="LogoutIcon"
                  lucide="LogOutIcon"
                  phosphor="SignOutIcon"
                  tabler="IconLogout"
                />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
    </Example>
  );
}

const usernames = [
  "shadcn",
  "vercel",
  "nextjs",
  "tailwindlabs",
  "typescript-lang",
  "eslint",
  "prettier",
  "babel",
  "webpack",
  "rollup",
  "parcel",
  "vite",
  "react",
  "vue",
  "angular",
  "solid",
];

function Contributors() {
  return (
    <Example className="items-center lg:p-16" title="Contributors">
      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle>
            Contributors <Badge variant="secondary">312</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {usernames.map((username) => (
              <Avatar key={username}>
                <AvatarImage
                  alt={username}
                  src={`https://github.com/${username}.png`}
                />
                <AvatarFallback>{username.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <a className="text-sm underline underline-offset-4" href="#">
            + 810 contributors
          </a>
        </CardFooter>
      </Card>
    </Example>
  );
}

function Profile() {
  return (
    <Example className="items-center justify-center" title="Profile">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your profile information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="profile">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input id="name" placeholder="shadcn" />
                <FieldDescription>
                  Your name may appear around GitHub where you contribute or are
                  mentioned. You can remove it at any time.
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Public Email</FieldLabel>
                <NativeSelect id="email">
                  <NativeSelectOption value="m@shadcn.com">
                    m@shadcn.com
                  </NativeSelectOption>
                  <NativeSelectOption value="m@gmail.com">
                    m@gmail.com
                  </NativeSelectOption>
                </NativeSelect>
                <FieldDescription>
                  You can manage verified email addresses in your{" "}
                  <a href="#email-settings">email settings</a>.
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="bio">Bio</FieldLabel>
                <Textarea
                  id="bio"
                  placeholder="Tell us a little bit about yourself"
                />
                <FieldDescription>
                  You can <span>@mention</span> other users and organizations to
                  link to them.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Button form="profile">Save Profile</Button>
        </CardFooter>
      </Card>
    </Example>
  );
}

function ContributionsActivity() {
  return (
    <Example className="justify-center" title="Contributions Activity">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle>Contributions & Activity</CardTitle>
          <CardDescription>
            Manage your contributions and activity visibility.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="contributions-activity">
            <FieldGroup>
              <FieldSet>
                <FieldLegend className="sr-only">
                  Contributions & activity
                </FieldLegend>
                <FieldGroup className="gap-3">
                  <Field orientation="horizontal">
                    <Checkbox id="private-profile" />
                    <FieldContent>
                      <FieldLabel
                        className="font-normal"
                        htmlFor="private-profile"
                      >
                        Make profile private and hide activity
                      </FieldLabel>
                      <FieldDescription>
                        Enabling this will hide your contributions and activity
                        from your GitHub profile and from social features like
                        followers, stars, feeds, leaderboards and releases.
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                  <Field orientation="horizontal">
                    <Checkbox defaultChecked id="private-contributions" />
                    <FieldContent>
                      <FieldLabel
                        className="font-normal"
                        htmlFor="private-contributions"
                      >
                        Include private contributions on my profile
                      </FieldLabel>
                      <FieldDescription>
                        Your contribution graph, achievements, and activity
                        overview will show your private contributions without
                        revealing any repository or organization information.{" "}
                        <a href="#read-more">Read more</a>.
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                </FieldGroup>
              </FieldSet>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Button form="contributions-activity">Save Changes</Button>
        </CardFooter>
      </Card>
    </Example>
  );
}

const users = [
  "shadcn",
  "maxleiter",
  "evilrabbit",
  "pranathip",
  "jorgezreik",
  "shuding",
  "rauchg",
];

function AssignIssue() {
  const anchor = useComboboxAnchor();

  return (
    <Example className="items-center justify-center" title="User Select">
      <Card className="w-full max-w-sm" size="sm">
        <CardHeader className="border-b">
          <CardTitle className="text-sm">Assign Issue</CardTitle>
          <CardDescription className="text-sm">
            Select users to assign to this issue.
          </CardDescription>
          <CardAction>
            <Tooltip>
              <TooltipTrigger
                render={<Button size="icon-xs" variant="outline" />}
              >
                <IconPlaceholder
                  hugeicons="PlusSignIcon"
                  lucide="PlusIcon"
                  phosphor="PlusIcon"
                  tabler="IconPlus"
                />
              </TooltipTrigger>
              <TooltipContent>Add user</TooltipContent>
            </Tooltip>
          </CardAction>
        </CardHeader>
        <CardContent>
          <Combobox
            autoHighlight
            defaultValue={[users[0]]}
            items={users}
            multiple
          >
            <ComboboxChips ref={anchor}>
              <ComboboxValue>
                {(values) => (
                  <>
                    {values.map((username: string) => (
                      <ComboboxChip key={username}>
                        <Avatar className="size-4">
                          <AvatarImage
                            alt={username}
                            src={`https://github.com/${username}.png`}
                          />
                          <AvatarFallback>{username.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {username}
                      </ComboboxChip>
                    ))}
                    <ComboboxChipsInput
                      placeholder={
                        values.length > 0 ? undefined : "Select a item..."
                      }
                    />
                  </>
                )}
              </ComboboxValue>
            </ComboboxChips>
            <ComboboxContent anchor={anchor}>
              <ComboboxEmpty>No users found.</ComboboxEmpty>
              <ComboboxList>
                {(username) => (
                  <ComboboxItem key={username} value={username}>
                    <Avatar className="size-5">
                      <AvatarImage
                        alt={username}
                        src={`https://github.com/${username}.png`}
                      />
                      <AvatarFallback>{username.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {username}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </CardContent>
      </Card>
    </Example>
  );
}
