export default function ResumeDashboardLoading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10">
      <div className="h-40 animate-pulse rounded-[2rem] border border-border/60 bg-card/60" />
      <div className="h-[340px] animate-pulse rounded-[2rem] border border-border/60 bg-card/60" />
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="h-[420px] animate-pulse rounded-[2rem] border border-border/60 bg-card/60" />
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-[2rem] border border-border/60 bg-card/60"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
