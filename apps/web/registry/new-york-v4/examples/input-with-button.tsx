import { Button } from "@/registry/new-york-v4/ui/button";
import { Input } from "@/registry/new-york-v4/ui/input";

export default function InputWithButton() {
  return (
    <div className="flex w-full max-w-sm items-center gap-2">
      <Input placeholder="Email" type="email" />
      <Button type="submit" variant="outline">
        Subscribe
      </Button>
    </div>
  );
}
