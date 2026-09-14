export default function Loading() {
  return (
    <main className="mx-auto grid max-w-2xl gap-8 p-4 md:p-10">
      <div aria-busy="true" className="grid gap-8">
        <p role="status" className="sr-only">
          Loading profile…
        </p>
        <div aria-hidden="true" className="grid gap-2">
          <span className="h-4 w-32 animate-pulse rounded bg-grey-100 motion-reduce:animate-none" />
          <span className="mt-2 h-10 w-56 animate-pulse rounded bg-grey-100 motion-reduce:animate-none" />
          <span className="mt-2 h-4 w-80 max-w-full animate-pulse rounded bg-grey-100 motion-reduce:animate-none" />
        </div>
        <div aria-hidden="true" className="grid gap-7 rounded-lg bg-white p-7 md:p-9">
          <div className="flex items-center gap-4">
            <span className="h-16 w-16 animate-pulse rounded-full bg-grey-100 motion-reduce:animate-none" />
            <span className="grid gap-2">
              <span className="h-4 w-28 animate-pulse rounded bg-grey-100 motion-reduce:animate-none" />
              <span className="h-9 w-56 max-w-full animate-pulse rounded-lg bg-grey-50 motion-reduce:animate-none" />
            </span>
          </div>
          <div className="grid gap-2">
            <span className="h-4 w-28 animate-pulse rounded bg-grey-100 motion-reduce:animate-none" />
            <span className="h-12 w-full animate-pulse rounded-xl bg-grey-50 motion-reduce:animate-none" />
          </div>
          <span className="h-11 w-32 animate-pulse rounded-lg bg-grey-100 motion-reduce:animate-none" />
        </div>
        <span aria-hidden="true" className="h-11 w-full animate-pulse rounded-lg bg-white motion-reduce:animate-none" />
        <div aria-hidden="true" className="grid gap-2 rounded-lg bg-white p-6">
          <span className="h-5 w-36 animate-pulse rounded bg-grey-100 motion-reduce:animate-none" />
          <span className="mt-1 h-4 w-full animate-pulse rounded bg-grey-100 motion-reduce:animate-none" />
          <span className="mt-5 h-12 w-44 animate-pulse rounded-lg bg-grey-100 motion-reduce:animate-none" />
        </div>
      </div>
    </main>
  );
}
