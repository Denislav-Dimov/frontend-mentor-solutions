const bone = 'animate-pulse rounded motion-reduce:animate-none';

function CommentCardSkeleton() {
  return (
    <div aria-hidden="true" className="card">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
        <span className={`${bone} bg-grey-50 hidden h-25 w-10 rounded-xl md:block`} />
        <div className="grid min-w-0 flex-1 gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <span className={`${bone} bg-grey-100 size-8 shrink-0 rounded-full`} />
            <span className={`${bone} bg-grey-100 h-4 w-28`} />
            <span className={`${bone} bg-grey-100 h-4 w-20 shrink-0`} />
          </div>
          <div className="grid gap-2">
            <span className={`${bone} bg-grey-100 h-4 w-full`} />
            <span className={`${bone} bg-grey-100 h-4 w-full`} />
            <span className={`${bone} bg-grey-100 h-4 w-2/3`} />
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between md:hidden">
        <span className={`${bone} bg-grey-50 h-10 w-25 rounded-xl`} />
        <span className={`${bone} bg-grey-100 h-4 w-16`} />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <>
      <div aria-hidden="true" className="border-grey-100 h-16 border-b bg-white" />
      <main id="main" aria-busy="true" className="page">
        <p role="status" className="sr-only">
          Loading comments…
        </p>
        <div className="grid gap-4 md:gap-5">
          <CommentCardSkeleton />
          <CommentCardSkeleton />
          <CommentCardSkeleton />
        </div>
        <div
          aria-hidden="true"
          className="card grid grid-cols-2 items-center gap-4 md:flex md:items-start md:gap-4"
        >
          <span className={`${bone} bg-grey-100 order-2 size-10 rounded-full md:order-1`} />
          <span
            className={`${bone} bg-grey-50 order-1 col-span-2 h-24 w-full rounded-lg md:order-2 md:flex-1`}
          />
          <span
            className={`${bone} bg-grey-100 order-3 h-12 w-26 justify-self-end rounded-lg`}
          />
        </div>
      </main>
    </>
  );
}
