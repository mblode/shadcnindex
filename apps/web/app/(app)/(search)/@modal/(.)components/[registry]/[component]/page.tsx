import { RegistryComponentBackButton } from "@/components/registry-component-back-button";
import { RegistryComponentModal } from "@/components/registry-component-modal";
import { RegistryComponentPageContent } from "@/components/registry-component-page";

export const dynamic = "force-dynamic";

export default async function RegistryComponentModalPage(props: {
  params: Promise<{ registry: string; component: string }>;
  searchParams?: Promise<{ q?: string }>;
}) {
  return (
    <RegistryComponentModal>
      <RegistryComponentPageContent
        headerLeading={<RegistryComponentBackButton />}
        params={props.params}
        searchParams={props.searchParams}
        variant="modal"
      />
    </RegistryComponentModal>
  );
}
