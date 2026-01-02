"use client";

import { toast } from "sonner";

import {
  Example,
  ExampleWrapper,
} from "@/registry/bases/base/components/example";
import { Button } from "@/registry/bases/base/ui/button";

export default function SonnerExample() {
  return (
    <ExampleWrapper>
      <SonnerBasic />
      <SonnerWithDescription />
    </ExampleWrapper>
  );
}

function SonnerBasic() {
  return (
    <Example className="items-center justify-center" title="Basic">
      <Button
        className="w-fit"
        onClick={() => toast("Event has been created")}
        variant="outline"
      >
        Show Toast
      </Button>
    </Example>
  );
}

function SonnerWithDescription() {
  return (
    <Example className="items-center justify-center" title="With Description">
      <Button
        className="w-fit"
        onClick={() =>
          toast("Event has been created", {
            description: "Monday, January 3rd at 6:00pm",
          })
        }
        variant="outline"
      >
        Show Toast
      </Button>
    </Example>
  );
}
