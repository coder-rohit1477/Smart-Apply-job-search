export default function DashboardLoading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10">
      <div className="h-10 w-64 animate-pulse rounded-full bg-muted" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-3xl border border-border/60 bg-card/60"
          />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="h-[420px] animate-pulse rounded-3xl border border-border/60 bg-card/60" />
        <div className="h-[420px] animate-pulse rounded-3xl border border-border/60 bg-card/60" />
      </div>
    </div>
  );
}
