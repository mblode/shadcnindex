import { IconPlaceholder } from "@/app/(create)/components/icon-placeholder";
import {
  Example,
  ExampleWrapper,
} from "@/registry/bases/base/components/example";
import { Input } from "@/registry/bases/base/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/bases/base/ui/select";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/registry/bases/base/ui/toggle-group";

export default function ToggleGroupExample() {
  return (
    <ExampleWrapper>
      <ToggleGroupBasic />
      <ToggleGroupOutline />
      <ToggleGroupOutlineWithIcons />
      <ToggleGroupSizes />
      <ToggleGroupSpacing />
      <ToggleGroupWithIcons />
      <ToggleGroupFilter />
      <ToggleGroupDateRange />
      <ToggleGroupSort />
      <ToggleGroupWithInputAndSelect />
      <ToggleGroupVertical />
      <ToggleGroupVerticalOutline />
      <ToggleGroupVerticalOutlineWithIcons />
      <ToggleGroupVerticalWithSpacing />
    </ExampleWrapper>
  );
}

function ToggleGroupBasic() {
  return (
    <Example title="Basic">
      <ToggleGroup multiple spacing={1}>
        <ToggleGroupItem aria-label="Toggle bold" value="bold">
          <IconPlaceholder
            hugeicons="TextBoldIcon"
            lucide="BoldIcon"
            phosphor="TextBIcon"
            tabler="IconBold"
          />
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Toggle italic" value="italic">
          <IconPlaceholder
            hugeicons="TextItalicIcon"
            lucide="ItalicIcon"
            phosphor="TextItalicIcon"
            tabler="IconItalic"
          />
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Toggle underline" value="underline">
          <IconPlaceholder
            hugeicons="TextUnderlineIcon"
            lucide="UnderlineIcon"
            phosphor="TextUnderlineIcon"
            tabler="IconUnderline"
          />
        </ToggleGroupItem>
      </ToggleGroup>
    </Example>
  );
}

function ToggleGroupOutline() {
  return (
    <Example title="Outline">
      <ToggleGroup defaultValue={["all"]} variant="outline">
        <ToggleGroupItem aria-label="Toggle all" value="all">
          All
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Toggle missed" value="missed">
          Missed
        </ToggleGroupItem>
      </ToggleGroup>
    </Example>
  );
}

function ToggleGroupOutlineWithIcons() {
  return (
    <Example title="Outline With Icons">
      <ToggleGroup multiple size="sm" variant="outline">
        <ToggleGroupItem aria-label="Toggle bold" value="bold">
          <IconPlaceholder
            hugeicons="TextBoldIcon"
            lucide="BoldIcon"
            phosphor="TextBIcon"
            tabler="IconBold"
          />
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Toggle italic" value="italic">
          <IconPlaceholder
            hugeicons="TextItalicIcon"
            lucide="ItalicIcon"
            phosphor="TextItalicIcon"
            tabler="IconItalic"
          />
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Toggle underline" value="underline">
          <IconPlaceholder
            hugeicons="TextUnderlineIcon"
            lucide="UnderlineIcon"
            phosphor="TextUnderlineIcon"
            tabler="IconUnderline"
          />
        </ToggleGroupItem>
      </ToggleGroup>
    </Example>
  );
}

function ToggleGroupSizes() {
  return (
    <Example title="Sizes">
      <div className="flex flex-col gap-4">
        <ToggleGroup defaultValue={["top"]} size="sm" variant="outline">
          <ToggleGroupItem aria-label="Toggle top" value="top">
            Top
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle bottom" value="bottom">
            Bottom
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle left" value="left">
            Left
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle right" value="right">
            Right
          </ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup defaultValue={["top"]} variant="outline">
          <ToggleGroupItem aria-label="Toggle top" value="top">
            Top
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle bottom" value="bottom">
            Bottom
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle left" value="left">
            Left
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle right" value="right">
            Right
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </Example>
  );
}

function ToggleGroupSpacing() {
  return (
    <Example title="With Spacing">
      <ToggleGroup
        defaultValue={["top"]}
        size="sm"
        spacing={2}
        variant="outline"
      >
        <ToggleGroupItem aria-label="Toggle top" value="top">
          Top
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Toggle bottom" value="bottom">
          Bottom
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Toggle left" value="left">
          Left
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Toggle right" value="right">
          Right
        </ToggleGroupItem>
      </ToggleGroup>
    </Example>
  );
}

function ToggleGroupWithIcons() {
  return (
    <Example title="With Icons">
      <ToggleGroup multiple size="sm" spacing={2} variant="outline">
        <ToggleGroupItem
          aria-label="Toggle star"
          className="aria-pressed:bg-transparent aria-pressed:*:[svg]:fill-foreground aria-pressed:*:[svg]:stroke-foreground"
          value="star"
        >
          <IconPlaceholder
            hugeicons="StarIcon"
            lucide="StarIcon"
            phosphor="StarIcon"
            tabler="IconStar"
          />
          Star
        </ToggleGroupItem>
        <ToggleGroupItem
          aria-label="Toggle heart"
          className="aria-pressed:bg-transparent aria-pressed:*:[svg]:fill-foreground aria-pressed:*:[svg]:stroke-foreground"
          value="heart"
        >
          <IconPlaceholder
            hugeicons="FavouriteIcon"
            lucide="HeartIcon"
            phosphor="HeartIcon"
            tabler="IconHeart"
          />
          Heart
        </ToggleGroupItem>
        <ToggleGroupItem
          aria-label="Toggle bookmark"
          className="aria-pressed:bg-transparent aria-pressed:*:[svg]:fill-foreground aria-pressed:*:[svg]:stroke-foreground"
          value="bookmark"
        >
          <IconPlaceholder
            hugeicons="BookmarkIcon"
            lucide="BookmarkIcon"
            phosphor="BookmarkIcon"
            tabler="IconBookmark"
          />
          Bookmark
        </ToggleGroupItem>
      </ToggleGroup>
    </Example>
  );
}

function ToggleGroupFilter() {
  return (
    <Example title="Filter">
      <ToggleGroup defaultValue={["all"]} size="sm" variant="outline">
        <ToggleGroupItem aria-label="All" value="all">
          All
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Active" value="active">
          Active
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Completed" value="completed">
          Completed
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Archived" value="archived">
          Archived
        </ToggleGroupItem>
      </ToggleGroup>
    </Example>
  );
}

function ToggleGroupDateRange() {
  return (
    <Example title="Date Range">
      <ToggleGroup
        defaultValue={["today"]}
        size="sm"
        spacing={2}
        variant="outline"
      >
        <ToggleGroupItem aria-label="Today" value="today">
          Today
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="This Week" value="week">
          This Week
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="This Month" value="month">
          This Month
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="This Year" value="year">
          This Year
        </ToggleGroupItem>
      </ToggleGroup>
    </Example>
  );
}

function ToggleGroupSort() {
  return (
    <Example title="Sort">
      <ToggleGroup defaultValue={["newest"]} size="sm" variant="outline">
        <ToggleGroupItem aria-label="Newest" value="newest">
          <IconPlaceholder
            hugeicons="ArrowDownIcon"
            lucide="ArrowDownIcon"
            phosphor="ArrowDownIcon"
            tabler="IconArrowDown"
          />
          Newest
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Oldest" value="oldest">
          <IconPlaceholder
            hugeicons="ArrowUpIcon"
            lucide="ArrowUpIcon"
            phosphor="ArrowUpIcon"
            tabler="IconArrowUp"
          />
          Oldest
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Popular" value="popular">
          <IconPlaceholder
            hugeicons="TradeUpIcon"
            lucide="TrendingUpIcon"
            phosphor="TrendUpIcon"
            tabler="IconTrendingUp"
          />
          Popular
        </ToggleGroupItem>
      </ToggleGroup>
    </Example>
  );
}

function ToggleGroupWithInputAndSelect() {
  const items = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Archived", value: "archived" },
  ];
  return (
    <Example title="With Input and Select">
      <div className="flex items-center gap-2">
        <Input className="flex-1" placeholder="Search..." type="search" />
        <Select defaultValue={items[0]} items={items}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {items.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <ToggleGroup defaultValue={["grid"]} variant="outline">
          <ToggleGroupItem aria-label="Grid view" value="grid">
            Grid
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="List view" value="list">
            List
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </Example>
  );
}

function ToggleGroupVertical() {
  return (
    <Example title="Vertical">
      <ToggleGroup multiple orientation="vertical" spacing={1}>
        <ToggleGroupItem aria-label="Toggle bold" value="bold">
          <IconPlaceholder
            hugeicons="TextBoldIcon"
            lucide="BoldIcon"
            phosphor="TextBIcon"
            tabler="IconBold"
          />
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Toggle italic" value="italic">
          <IconPlaceholder
            hugeicons="TextItalicIcon"
            lucide="ItalicIcon"
            phosphor="TextItalicIcon"
            tabler="IconItalic"
          />
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Toggle underline" value="underline">
          <IconPlaceholder
            hugeicons="TextUnderlineIcon"
            lucide="UnderlineIcon"
            phosphor="TextUnderlineIcon"
            tabler="IconUnderline"
          />
        </ToggleGroupItem>
      </ToggleGroup>
    </Example>
  );
}

function ToggleGroupVerticalOutline() {
  return (
    <Example title="Vertical Outline">
      <ToggleGroup
        defaultValue={["all"]}
        orientation="vertical"
        size="sm"
        variant="outline"
      >
        <ToggleGroupItem aria-label="Toggle all" value="all">
          All
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Toggle active" value="active">
          Active
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Toggle completed" value="completed">
          Completed
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Toggle archived" value="archived">
          Archived
        </ToggleGroupItem>
      </ToggleGroup>
    </Example>
  );
}

function ToggleGroupVerticalOutlineWithIcons() {
  return (
    <Example title="Vertical Outline With Icons">
      <ToggleGroup multiple orientation="vertical" size="sm" variant="outline">
        <ToggleGroupItem aria-label="Toggle bold" value="bold">
          <IconPlaceholder
            hugeicons="TextBoldIcon"
            lucide="BoldIcon"
            phosphor="TextBIcon"
            tabler="IconBold"
          />
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Toggle italic" value="italic">
          <IconPlaceholder
            hugeicons="TextItalicIcon"
            lucide="ItalicIcon"
            phosphor="TextItalicIcon"
            tabler="IconItalic"
          />
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Toggle underline" value="underline">
          <IconPlaceholder
            hugeicons="TextUnderlineIcon"
            lucide="UnderlineIcon"
            phosphor="TextUnderlineIcon"
            tabler="IconUnderline"
          />
        </ToggleGroupItem>
      </ToggleGroup>
    </Example>
  );
}

function ToggleGroupVerticalWithSpacing() {
  return (
    <Example title="Vertical With Spacing">
      <ToggleGroup
        defaultValue={["top"]}
        orientation="vertical"
        size="sm"
        spacing={1}
        variant="outline"
      >
        <ToggleGroupItem aria-label="Toggle top" value="top">
          Top
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Toggle bottom" value="bottom">
          Bottom
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Toggle left" value="left">
          Left
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Toggle right" value="right">
          Right
        </ToggleGroupItem>
      </ToggleGroup>
    </Example>
  );
}
