import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="inline-flex rounded-full border border-border/60 bg-card px-4 py-2 text-sm text-muted-foreground">
        Route not found
      </div>
      <div className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight">Page missing</h1>
        <p className="text-base leading-7 text-muted-foreground">
          The page you requested is not part of the current Smart Apply route
          map.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Return home</Link>
      </Button>
    </div>
  );
}
