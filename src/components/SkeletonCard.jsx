export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3 flex flex-col gap-3 overflow-hidden">
      {/* Image placeholder */}
      <div className="h-40 w-full rounded-xl bg-gray-100 skeleton-shimmer" />
      {/* Title lines */}
      <div className="h-3 w-full rounded-full bg-gray-100 skeleton-shimmer" />
      <div className="h-3 w-3/5 rounded-full bg-gray-100 skeleton-shimmer" />
      {/* Price */}
      <div className="h-4 w-2/5 rounded-full bg-gray-200 skeleton-shimmer" />
      {/* MOQ */}
      <div className="h-3 w-1/2 rounded-full bg-gray-100 skeleton-shimmer" />
      {/* Button */}
      <div className="h-8 w-full rounded-lg bg-gray-100 skeleton-shimmer mt-auto" />
    </div>
  );
}
