/**
 * Base skeleton element. Use composition to build page-level skeletons.
 *
 * Usage:
 *   <Skeleton className="h-4 w-32" />
 */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`bg-gray-200 rounded animate-pulse ${className}`}
      aria-hidden="true"
    />
  );
}
