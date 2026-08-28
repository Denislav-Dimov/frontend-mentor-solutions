export default function Loading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 place-items-center gap-8 md:gap-16">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="max-w-70 w-full rounded-md overflow-hidden bg-white dark:bg-dark-blue-900 shadow animate-pulse"
        >
          <div className="w-full h-44 bg-light-grey-400/20 dark:bg-dark-blue-950/50" />

          <div className="p-7 space-y-3">
            <div className="h-6 w-3/4 bg-light-grey-400/20 dark:bg-dark-blue-950/50 rounded" />

            <div className="space-y-2 pt-2">
              <div className="h-4 w-1/2 bg-light-grey-400/20 dark:bg-dark-blue-950/50 rounded" />
              <div className="h-4 w-2/3 bg-light-grey-400/20 dark:bg-dark-blue-950/50 rounded" />
              <div className="h-4 w-1/3 bg-light-grey-400/20 dark:bg-dark-blue-950/50 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
