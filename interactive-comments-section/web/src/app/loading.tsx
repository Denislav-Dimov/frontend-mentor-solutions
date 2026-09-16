function CommentCardSkeleton() {
  return (
    <article className="w-full rounded-lg bg-white p-5 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
        <div aria-hidden="true" className="hidden md:block">
          <div className="bg-grey-50 grid w-10 animate-pulse justify-items-center gap-2 rounded-xl p-2 motion-reduce:animate-none">
            <span className="bg-grey-100 h-4 w-4 rounded" />
            <span className="bg-grey-100 h-4 w-6 rounded" />
            <span className="bg-grey-100 h-4 w-4 rounded" />
          </div>
        </div>
        <div className="grid min-w-0 flex-1 gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <span
              aria-hidden="true"
              className="bg-grey-100 h-8 w-8 shrink-0 animate-pulse rounded-full motion-reduce:animate-none"
            />
            <span
              aria-hidden="true"
              className="bg-grey-100 h-4 w-28 animate-pulse rounded motion-reduce:animate-none"
            />
            <span
              aria-hidden="true"
              className="bg-grey-100 h-4 w-20 shrink-0 animate-pulse rounded motion-reduce:animate-none"
            />
          </div>
          <div aria-hidden="true" className="grid gap-2">
            <span className="bg-grey-100 h-4 w-full animate-pulse rounded motion-reduce:animate-none" />
            <span className="bg-grey-100 h-4 w-full animate-pulse rounded motion-reduce:animate-none" />
            <span className="bg-grey-100 h-4 w-2/3 animate-pulse rounded motion-reduce:animate-none" />
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="mt-4 flex items-center justify-between md:hidden">
        <span className="bg-grey-50 h-9 w-24 animate-pulse rounded-lg motion-reduce:animate-none" />
        <span className="bg-grey-100 h-4 w-20 animate-pulse rounded motion-reduce:animate-none" />
      </div>
    </article>
  );
}

export default function Loading() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto grid w-full max-w-3xl gap-8 px-4 py-6 md:gap-10 md:px-8 md:py-10">
        <section aria-label="Comments" aria-busy="true" className="grid gap-4 md:gap-6">
          <p role="status" className="sr-only">
            Loading comments…
          </p>
          <CommentCardSkeleton />
          <CommentCardSkeleton />
          <CommentCardSkeleton />
          <div
            aria-hidden="true"
            className="grid w-full grid-cols-2 items-center gap-5 rounded-lg bg-white p-5 md:flex md:items-start md:p-6"
          >
            <span className="bg-grey-100 order-2 h-8 w-8 animate-pulse rounded-full motion-reduce:animate-none md:order-1" />
            <span className="border-grey-100 bg-grey-50 order-1 col-span-2 h-24 w-full animate-pulse rounded-xl border-2 motion-reduce:animate-none md:order-2 md:flex-1" />
            <span className="bg-grey-100 order-3 h-10 w-24 animate-pulse justify-self-end rounded-[5px] motion-reduce:animate-none" />
          </div>
        </section>
      </div>
    </main>
  );
}
