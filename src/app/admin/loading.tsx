export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-48 bg-gray-200 dark:bg-zinc-700 rounded-md animate-pulse mb-2"></div>
        <div className="h-5 w-80 bg-gray-200 dark:bg-zinc-700 rounded-md animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-zinc-800 p-6 rounded-lg border border-gray-200 dark:border-zinc-700 shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="h-5 w-24 bg-gray-200 dark:bg-zinc-700 rounded-md animate-pulse mb-3"></div>
                <div className="h-8 w-16 bg-gray-200 dark:bg-zinc-700 rounded-md animate-pulse"></div>
              </div>
              <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-zinc-700 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 shadow-sm p-6">
          <div className="h-7 w-40 bg-gray-200 dark:bg-zinc-700 rounded-md animate-pulse mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-4 gap-4">
                <div className="h-6 w-full bg-gray-200 dark:bg-zinc-700 rounded-md animate-pulse"></div>
                <div className="h-6 w-full bg-gray-200 dark:bg-zinc-700 rounded-md animate-pulse"></div>
                <div className="h-6 w-full bg-gray-200 dark:bg-zinc-700 rounded-md animate-pulse"></div>
                <div className="h-6 w-full bg-gray-200 dark:bg-zinc-700 rounded-md animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 shadow-sm p-6">
          <div className="h-7 w-32 bg-gray-200 dark:bg-zinc-700 rounded-md animate-pulse mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="p-3 bg-gray-50 dark:bg-zinc-700/50 rounded-md"
              >
                <div className="h-5 w-40 bg-gray-200 dark:bg-zinc-700 rounded-md animate-pulse mb-2"></div>
                <div className="h-4 w-24 bg-gray-200 dark:bg-zinc-700 rounded-md animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
