/** Shimmer skeleton loader for song cards */
export function SongCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse">
      <div className="aspect-square rounded-xl bg-white/[0.06]" />
      <div className="space-y-2 px-0.5">
        <div className="h-3 bg-white/[0.08] rounded-full w-4/5" />
        <div className="h-2.5 bg-white/[0.05] rounded-full w-3/5" />
        <div className="h-2 bg-white/[0.04] rounded-full w-1/4 mt-1" />
      </div>
    </div>
  );
}

/** Shimmer skeleton loader for song rows */
export function SongRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 rounded-xl animate-pulse">
      <div className="w-6 h-3 bg-white/[0.06] rounded" />
      <div className="w-10 h-10 rounded-lg bg-white/[0.08] flex-shrink-0" />
      <div className="flex-1 space-y-1.5 min-w-0">
        <div className="h-3 bg-white/[0.08] rounded-full w-3/4" />
        <div className="h-2.5 bg-white/[0.05] rounded-full w-1/2" />
      </div>
      <div className="hidden md:block h-2.5 bg-white/[0.05] rounded-full w-28" />
      <div className="h-2.5 bg-white/[0.05] rounded-full w-10" />
    </div>
  );
}

/** Shimmer skeleton loader for album cards */
export function AlbumCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse">
      <div className="aspect-square rounded-2xl bg-white/[0.06]" />
      <div className="space-y-2 px-0.5">
        <div className="h-3.5 bg-white/[0.08] rounded-full w-3/4" />
        <div className="h-2.5 bg-white/[0.05] rounded-full w-1/2" />
        <div className="flex gap-1.5 mt-1">
          <div className="h-4 w-12 bg-white/[0.05] rounded-full" />
          <div className="h-4 w-16 bg-white/[0.05] rounded-full" />
        </div>
      </div>
    </div>
  );
}
