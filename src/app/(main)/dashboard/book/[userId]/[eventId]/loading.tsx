import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <div className="grid items-center justify-center">
      <LoaderCircle className="text-muted-foreground size-24 animate-spin" />
      <p className="text-xl text-primary-200">Loading cabin data...</p>
    </div>
  );
}
