export function StockDeepDiveSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center mb-6">
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
          </div>

          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <div className="h-12 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
            </div>

            <div className="text-right space-y-2">
              <div className="h-12 w-40 bg-gray-200 rounded animate-pulse ml-auto" />
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse ml-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation Skeleton */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 w-24 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border p-8">
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-6" />
              <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-6 w-full bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border p-8">
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-6" />
              <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
