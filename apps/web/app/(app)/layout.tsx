import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex size-full flex-col overflow-hidden" data-slot="layout">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
