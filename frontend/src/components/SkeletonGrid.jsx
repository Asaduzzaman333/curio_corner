export default function SkeletonGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-[28px] bg-vellum p-4 shadow-soft dark:bg-white/5">
          <div className="aspect-[4/5] rounded-[22px] bg-ink/10 dark:bg-white/10" />
          <div className="mt-5 h-4 w-2/3 rounded bg-ink/10 dark:bg-white/10" />
          <div className="mt-3 h-3 w-full rounded bg-ink/10 dark:bg-white/10" />
        </div>
      ))}
    </div>
  );
}
