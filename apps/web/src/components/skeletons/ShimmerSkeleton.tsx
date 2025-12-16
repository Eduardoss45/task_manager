export function ShimmerSkeleton({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-md bg-zinc-800 ${className}`}>
      <div className="absolute inset-0 animate-[shimmer_1.5s_infinite] bg-linear-to-r from-transparent via-zinc-700/40 to-transparent" />
    </div>
  );
}
