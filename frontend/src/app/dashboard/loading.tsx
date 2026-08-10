export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse p-2">
      <div className="space-y-2">
        <div className="h-7 w-40 rounded-lg bg-muted" />
        <div className="h-4 w-56 rounded-md bg-muted/60" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl border border-border/40 bg-card p-5 space-y-3">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-8 w-36 rounded bg-muted" />
          </div>
        ))}
      </div>

      <div className="h-72 rounded-2xl border border-border/40 bg-card p-6 space-y-4">
        <div className="h-6 w-32 rounded bg-muted" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 w-full rounded-xl bg-muted/50" />
          ))}
        </div>
      </div>
    </div>
  );
}
