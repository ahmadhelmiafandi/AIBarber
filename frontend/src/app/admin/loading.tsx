export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse p-2">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-lg bg-muted" />
          <div className="h-4 w-64 rounded-md bg-muted/60" />
        </div>
        <div className="h-10 w-32 rounded-xl bg-muted" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl border border-border/40 bg-card p-5 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-10 w-10 rounded-xl bg-muted" />
              <div className="h-4 w-12 rounded bg-muted/60" />
            </div>
            <div className="h-6 w-24 rounded bg-muted" />
            <div className="h-3 w-32 rounded bg-muted/60" />
          </div>
        ))}
      </div>

      <div className="h-80 rounded-2xl border border-border/40 bg-card p-6 space-y-4">
        <div className="h-6 w-40 rounded bg-muted" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 w-full rounded-xl bg-muted/50" />
          ))}
        </div>
      </div>
    </div>
  );
}
