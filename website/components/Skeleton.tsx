/* Shape-matching loading placeholder. Use instead of spinners/blank flashes. */
export default function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-surface ${className}`} aria-hidden="true" />;
}
