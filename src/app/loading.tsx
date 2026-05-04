import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-muted/40 px-6 py-10 text-foreground">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-4 w-full max-w-3xl" />
          <Skeleton className="h-4 w-full max-w-2xl" />
        </div>

        <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`metric-${index}`}
              className="rounded-3xl border border-border bg-background p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="size-10 rounded-xl" />
              </div>
              <Skeleton className="mt-4 h-4 w-full max-w-40" />
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-border bg-background p-6 shadow-sm">
          <div className="space-y-4">
            <Skeleton className="h-5 w-40" />
            <div className="overflow-hidden rounded-2xl border border-border">
              <div className="grid grid-cols-5 gap-0 border-b border-border bg-muted/50 p-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={`head-${index}`} className="h-4 w-20" />
                ))}
              </div>
              <div className="space-y-0">
                {Array.from({ length: 5 }).map((_, rowIndex) => (
                  <div
                    key={`row-${rowIndex}`}
                    className="grid grid-cols-5 gap-4 border-b border-border p-4 last:border-b-0"
                  >
                    {Array.from({ length: 5 }).map((_, colIndex) => (
                      <Skeleton
                        key={`cell-${rowIndex}-${colIndex}`}
                        className="h-4 w-full max-w-28"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
