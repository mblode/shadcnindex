import { Button } from "@/registry/new-york-v4/ui/button";
import { Spinner } from "@/registry/new-york-v4/ui/spinner";

export default function SpinnerButton() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Button disabled size="sm">
        <Spinner />
        Loading...
      </Button>
      <Button disabled size="sm" variant="outline">
        <Spinner />
        Please wait
      </Button>
      <Button disabled size="sm" variant="secondary">
        <Spinner />
        Processing
      </Button>
    </div>
  );
}
