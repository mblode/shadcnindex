import { IconPlaceholder } from "@/app/(create)/components/icon-placeholder";
import {
  Example,
  ExampleWrapper,
} from "@/registry/bases/base/components/example";
import { Button } from "@/registry/bases/base/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/registry/bases/base/ui/input-group";
import { Kbd, KbdGroup } from "@/registry/bases/base/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/registry/bases/base/ui/tooltip";

export default function KbdExample() {
  return (
    <ExampleWrapper>
      <KbdBasic />
      <KbdModifierKeys />
      <KbdGroupExample />
      <KbdArrowKeys />
      <KbdWithIcons />
      <KbdWithIconsAndText />
      <KbdInInputGroup />
      <KbdInTooltip />
      <KbdWithSamp />
    </ExampleWrapper>
  );
}

function KbdBasic() {
  return (
    <Example title="Basic">
      <div className="flex items-center gap-2">
        <Kbd>Ctrl</Kbd>
        <Kbd>⌘K</Kbd>
        <Kbd>Ctrl + B</Kbd>
      </div>
    </Example>
  );
}

function KbdModifierKeys() {
  return (
    <Example title="Modifier Keys">
      <div className="flex items-center gap-2">
        <Kbd>⌘</Kbd>
        <Kbd>C</Kbd>
      </div>
    </Example>
  );
}

function KbdGroupExample() {
  return (
    <Example title="KbdGroup">
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <Kbd>Shift</Kbd>
        <Kbd>P</Kbd>
      </KbdGroup>
    </Example>
  );
}

function KbdArrowKeys() {
  return (
    <Example title="Arrow Keys">
      <div className="flex items-center gap-2">
        <Kbd>↑</Kbd>
        <Kbd>↓</Kbd>
        <Kbd>←</Kbd>
        <Kbd>→</Kbd>
      </div>
    </Example>
  );
}

function KbdWithIcons() {
  return (
    <Example title="With Icons">
      <KbdGroup>
        <Kbd>
          <IconPlaceholder
            hugeicons="DashedLineCircleIcon"
            lucide="CircleDashedIcon"
            phosphor="CircleDashedIcon"
            tabler="IconCircleDashed"
          />
        </Kbd>
        <Kbd>
          <IconPlaceholder
            hugeicons="ArrowLeft01Icon"
            lucide="ArrowLeftIcon"
            phosphor="ArrowLeftIcon"
            tabler="IconArrowLeft"
          />
        </Kbd>
        <Kbd>
          <IconPlaceholder
            hugeicons="ArrowRight01Icon"
            lucide="ArrowRightIcon"
            phosphor="ArrowRightIcon"
            tabler="IconArrowRight"
          />
        </Kbd>
      </KbdGroup>
    </Example>
  );
}

function KbdWithIconsAndText() {
  return (
    <Example title="With Icons and Text">
      <KbdGroup>
        <Kbd>
          <IconPlaceholder
            hugeicons="ArrowLeft01Icon"
            lucide="ArrowLeftIcon"
            phosphor="ArrowLeftIcon"
            tabler="IconArrowLeft"
          />
          Left
        </Kbd>
        <Kbd>
          <IconPlaceholder
            hugeicons="DashedLineCircleIcon"
            lucide="CircleDashedIcon"
            phosphor="CircleDashedIcon"
            tabler="IconCircleDashed"
          />
          Voice Enabled
        </Kbd>
      </KbdGroup>
    </Example>
  );
}

function KbdInInputGroup() {
  return (
    <Example title="InputGroup">
      <InputGroup>
        <InputGroupInput />
        <InputGroupAddon>
          <Kbd>Space</Kbd>
        </InputGroupAddon>
      </InputGroup>
    </Example>
  );
}

function KbdInTooltip() {
  return (
    <Example title="Tooltip">
      <Tooltip>
        <TooltipTrigger render={<Button size="icon-sm" variant="outline" />}>
          <IconPlaceholder
            hugeicons="FloppyDiskIcon"
            lucide="SaveIcon"
            phosphor="FloppyDiskIcon"
            tabler="IconDeviceFloppy"
          />
        </TooltipTrigger>
        <TooltipContent className="pr-1.5">
          <div className="flex items-center gap-2">
            Save Changes <Kbd>S</Kbd>
          </div>
        </TooltipContent>
      </Tooltip>
    </Example>
  );
}

function KbdWithSamp() {
  return (
    <Example title="With samp">
      <Kbd>
        <samp>File</samp>
      </Kbd>
    </Example>
  );
}
