function HistoryItemSkeleton() {
  return (
    <article aria-hidden="true" className="grid gap-2 rounded-lg bg-white p-6">
      <span className="h-3 w-36 animate-pulse rounded bg-grey-100 motion-reduce:animate-none" />
      <span className="mt-2 h-4 w-full animate-pulse rounded bg-grey-100 motion-reduce:animate-none" />
      <span className="h-4 w-3/4 animate-pulse rounded bg-grey-100 motion-reduce:animate-none" />
    </article>
  );
}

export default function Loading() {
  return (
    <main className="mx-auto grid max-w-3xl gap-8 px-4 py-6 md:gap-10 md:px-8 md:py-10">
      <div aria-busy="true" className="grid gap-8">
        <p role="status" className="sr-only">
          Loading activity…
        </p>
        <div aria-hidden="true" className="grid gap-2">
          <span className="h-4 w-32 animate-pulse rounded bg-grey-100 motion-reduce:animate-none" />
          <span className="mt-3 h-10 w-64 max-w-full animate-pulse rounded bg-grey-100 motion-reduce:animate-none" />
          <span className="mt-2 h-4 w-72 max-w-full animate-pulse rounded bg-grey-100 motion-reduce:animate-none" />
        </div>
        <section aria-label="Activity" className="grid gap-4">
          <HistoryItemSkeleton />
          <HistoryItemSkeleton />
          <HistoryItemSkeleton />
        </section>
      </div>
    </main>
  );
}
