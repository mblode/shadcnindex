"use client";

import * as React from "react";
import { IconPlaceholder } from "@/app/(create)/components/icon-placeholder";
import {
  Example,
  ExampleWrapper,
} from "@/registry/bases/base/components/example";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/registry/bases/base/ui/item";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/registry/bases/base/ui/progress";
import { Slider } from "@/registry/bases/base/ui/slider";

export default function ProgressExample() {
  return (
    <ExampleWrapper>
      <ProgressValues />
      <ProgressWithLabel />
      <ProgressControlled />
      <FileUploadList />
    </ExampleWrapper>
  );
}

function ProgressValues() {
  return (
    <Example title="Progress Bar">
      <div className="flex w-full flex-col gap-4">
        <Progress value={0} />
        <Progress className="w-full" value={25} />
        <Progress value={50} />
        <Progress value={75} />
        <Progress value={100} />
      </div>
    </Example>
  );
}

function ProgressWithLabel() {
  return (
    <Example title="With Label">
      <Progress value={56}>
        <ProgressLabel>Upload progress</ProgressLabel>
        <ProgressValue />
      </Progress>
    </Example>
  );
}

function ProgressControlled() {
  const [value, setValue] = React.useState(50);

  return (
    <Example title="Controlled">
      <div className="flex w-full flex-col gap-4">
        <Progress className="w-full" value={value} />
        <Slider
          max={100}
          min={0}
          onValueChange={(value) => setValue(value as number)}
          step={1}
          value={value}
        />
      </div>
    </Example>
  );
}

function FileUploadList() {
  const files = React.useMemo(
    () => [
      {
        id: "1",
        name: "document.pdf",
        progress: 45,
        timeRemaining: "2m 30s",
      },
      {
        id: "2",
        name: "presentation.pptx",
        progress: 78,
        timeRemaining: "45s",
      },
      {
        id: "3",
        name: "spreadsheet.xlsx",
        progress: 12,
        timeRemaining: "5m 12s",
      },
      {
        id: "4",
        name: "image.jpg",
        progress: 100,
        timeRemaining: "Complete",
      },
    ],
    []
  );

  return (
    <Example title="File Upload List">
      <ItemGroup>
        {files.map((file) => (
          <Item className="px-0" key={file.id} size="xs">
            <ItemMedia variant="icon">
              <IconPlaceholder
                className="size-5"
                hugeicons="FileIcon"
                lucide="FileIcon"
                phosphor="FileIcon"
                tabler="IconFile"
              />
            </ItemMedia>
            <ItemContent className="inline-block truncate">
              <ItemTitle className="inline">{file.name}</ItemTitle>
            </ItemContent>
            <ItemContent>
              <Progress className="w-32" value={file.progress} />
            </ItemContent>
            <ItemActions className="w-16 justify-end">
              <span className="text-muted-foreground text-sm">
                {file.timeRemaining}
              </span>
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>
    </Example>
  );
}
