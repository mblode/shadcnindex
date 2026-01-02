"use client";

import { IconPlaceholder } from "@/app/(create)/components/icon-placeholder";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/registry/bases/radix/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/registry/bases/radix/ui/sidebar";

export default function SidebarInsetExample() {
  const data = {
    navMain: [
      {
        title: "Dashboard",
        url: "#",
        icon: (
          <IconPlaceholder
            hugeicons="Home01Icon"
            lucide="HomeIcon"
            phosphor="HouseIcon"
            tabler="IconHome"
          />
        ),
        isActive: true,
        items: [
          {
            title: "Overview",
            url: "#",
          },
          {
            title: "Analytics",
            url: "#",
          },
        ],
      },
      {
        title: "Analytics",
        url: "#",
        icon: (
          <IconPlaceholder
            hugeicons="ChartIcon"
            lucide="ChartLineIcon"
            phosphor="ChartLineIcon"
            tabler="IconChartLine"
          />
        ),
        items: [
          {
            title: "Reports",
            url: "#",
          },
          {
            title: "Metrics",
            url: "#",
          },
        ],
      },
      {
        title: "Orders",
        url: "#",
        icon: (
          <IconPlaceholder
            hugeicons="ShoppingBag01Icon"
            lucide="ShoppingBagIcon"
            phosphor="BagIcon"
            tabler="IconShoppingBag"
          />
        ),
        items: [
          {
            title: "All Orders",
            url: "#",
          },
          {
            title: "Pending",
            url: "#",
          },
          {
            title: "Completed",
            url: "#",
          },
        ],
      },
      {
        title: "Products",
        url: "#",
        icon: (
          <IconPlaceholder
            hugeicons="ShoppingCart01Icon"
            lucide="ShoppingCartIcon"
            phosphor="ShoppingCartIcon"
            tabler="IconShoppingCart"
          />
        ),
        items: [
          {
            title: "All Products",
            url: "#",
          },
          {
            title: "Categories",
            url: "#",
          },
        ],
      },
      {
        title: "Invoices",
        url: "#",
        icon: (
          <IconPlaceholder
            hugeicons="File01Icon"
            lucide="FileIcon"
            phosphor="FileIcon"
            tabler="IconFile"
          />
        ),
      },
      {
        title: "Customers",
        url: "#",
        icon: (
          <IconPlaceholder
            hugeicons="UserIcon"
            lucide="UserIcon"
            phosphor="UserIcon"
            tabler="IconUser"
          />
        ),
      },
      {
        title: "Settings",
        url: "#",
        icon: (
          <IconPlaceholder
            hugeicons="Settings05Icon"
            lucide="Settings2Icon"
            phosphor="GearIcon"
            tabler="IconSettings"
          />
        ),
      },
    ],
    navSecondary: [
      {
        title: "Support",
        url: "#",
        icon: (
          <IconPlaceholder
            hugeicons="ChartRingIcon"
            lucide="LifeBuoy"
            phosphor="LifebuoyIcon"
            tabler="IconLifebuoy"
          />
        ),
      },
      {
        title: "Feedback",
        url: "#",
        icon: (
          <IconPlaceholder
            hugeicons="SentIcon"
            lucide="Send"
            phosphor="PaperPlaneTiltIcon"
            tabler="IconSend"
          />
        ),
      },
    ],
  };

  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <Collapsible
                  asChild
                  defaultOpen={item.isActive}
                  key={item.title}
                >
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={item.isActive}
                      tooltip={item.title}
                    >
                      <a href={item.url}>
                        {item.icon}
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                    {item.items?.length ? (
                      <>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuAction className="data-[state=open]:rotate-90">
                            <IconPlaceholder
                              hugeicons="ArrowRight01Icon"
                              lucide="ChevronRightIcon"
                              phosphor="CaretRightIcon"
                              tabler="IconChevronRight"
                            />
                            <span className="sr-only">Toggle</span>
                          </SidebarMenuAction>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild>
                                  <a href={subItem.url}>
                                    <span>{subItem.title}</span>
                                  </a>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </>
                    ) : null}
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>
                {data.navSecondary.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild size="sm">
                      <a href={item.url}>
                        {item.icon}
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
