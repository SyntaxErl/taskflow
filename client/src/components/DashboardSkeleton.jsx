function DashboardSkeleton() {
  return (
    <div
      className="p-6 animate-pulse"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Stat Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded w-24 mb-3" />
                <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
                <div className="h-2 bg-gray-200 rounded w-32" />
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-xl ml-4" />
            </div>
          </div>
        ))}
      </div>

      {/* Middle row skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Recent Tasks skeleton */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 py-3 border-b border-gray-50"
            >
              <div className="w-3 h-3 bg-gray-200 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded w-48 mb-1" />
                <div className="h-2 bg-gray-200 rounded w-24" />
              </div>
              <div className="h-5 bg-gray-200 rounded w-16" />
              <div className="h-5 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>

        {/* Category chart skeleton */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="h-4 bg-gray-200 rounded w-36 mb-4" />
          <div className="w-36 h-36 bg-gray-200 rounded-full mx-auto mb-4" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-200 rounded-full" />
                <div className="h-3 bg-gray-200 rounded w-16" />
              </div>
              <div className="h-3 bg-gray-200 rounded w-12" />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom row skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly chart skeleton */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
          <div className="flex items-end gap-3 h-32">
            {[60, 80, 50, 90, 70, 40, 30].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-gray-200 rounded-t-lg"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
          <div className="h-10 bg-gray-200 rounded w-20 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-32 mb-6" />
          <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
          <div className="h-6 bg-gray-200 rounded w-28 mb-1" />
          <div className="h-3 bg-gray-200 rounded w-20" />
        </div>
      </div>
    </div>
  );
}

export default DashboardSkeleton;
