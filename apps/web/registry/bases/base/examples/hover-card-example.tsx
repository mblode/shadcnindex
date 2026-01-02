import {
  Example,
  ExampleWrapper,
} from "@/registry/bases/base/components/example";
import { Button } from "@/registry/bases/base/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/bases/base/ui/dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/registry/bases/base/ui/hover-card";

export default function HoverCardExample() {
  return (
    <ExampleWrapper>
      <HoverCardSides />
      <HoverCardInDialog />
    </ExampleWrapper>
  );
}

const HOVER_CARD_SIDES = ["top", "right", "bottom", "left"] as const;

function HoverCardSides() {
  return (
    <Example title="Sides">
      <div className="flex flex-wrap items-center justify-center gap-4">
        {HOVER_CARD_SIDES.map((side) => (
          <HoverCard key={side}>
            <HoverCardTrigger
              closeDelay={100}
              delay={100}
              render={<Button className="capitalize" variant="outline" />}
            >
              {side}
            </HoverCardTrigger>
            <HoverCardContent side={side}>
              <div className="flex flex-col style-lyra:gap-1 style-maia:gap-2 style-mira:gap-1 style-nova:gap-1.5 style-vega:gap-2">
                <h4 className="font-medium">Hover Card</h4>
                <p>
                  This hover card appears on the {side} side of the trigger.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        ))}
      </div>
    </Example>
  );
}

function HoverCardInDialog() {
  return (
    <Example title="In Dialog">
      <Dialog>
        <DialogTrigger render={<Button variant="outline" />}>
          Open Dialog
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hover Card Example</DialogTitle>
            <DialogDescription>
              Hover over the button below to see the hover card.
            </DialogDescription>
          </DialogHeader>
          <HoverCard>
            <HoverCardTrigger
              closeDelay={100}
              delay={100}
              render={<Button className="w-fit" variant="outline" />}
            >
              Hover me
            </HoverCardTrigger>
            <HoverCardContent>
              <div className="flex flex-col style-lyra:gap-1 style-maia:gap-2 style-mira:gap-1 style-nova:gap-1.5 style-vega:gap-2">
                <h4 className="font-medium">Hover Card</h4>
                <p>
                  This hover card appears inside a dialog. Hover over the button
                  to see it.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </DialogContent>
      </Dialog>
    </Example>
  );
}
