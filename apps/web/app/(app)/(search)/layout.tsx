import { RegistrySearch } from "@/components/registry-search";

export const dynamic = "force-static";
export const revalidate = false;

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container-wrapper flex flex-1 flex-col px-2">
      <div className="3xl:fixed:container flex flex-1 flex-col">
        <RegistrySearch />
        {children}
      </div>
    </div>
  );
}
