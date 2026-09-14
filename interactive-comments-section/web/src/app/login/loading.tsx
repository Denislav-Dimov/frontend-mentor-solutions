export default function Loading() {
  return (
    <main className="mx-auto grid min-h-screen max-w-md place-items-center px-4 py-8 md:py-12">
      <div aria-busy="true" className="grid w-full gap-6 rounded-lg bg-white p-7 md:p-9">
        <p role="status" className="sr-only">
          Loading sign in…
        </p>
        <div aria-hidden="true" className="grid gap-2">
          <span className="h-4 w-28 animate-pulse rounded bg-grey-100 motion-reduce:animate-none" />
          <span className="h-8 w-44 animate-pulse rounded bg-grey-100 motion-reduce:animate-none" />
          <span className="mt-1 h-4 w-full animate-pulse rounded bg-grey-100 motion-reduce:animate-none" />
        </div>
        <div aria-hidden="true" className="grid gap-2">
          <span className="h-4 w-32 animate-pulse rounded bg-grey-100 motion-reduce:animate-none" />
          <span className="h-12 w-full animate-pulse rounded-xl bg-grey-50 motion-reduce:animate-none" />
        </div>
        <div aria-hidden="true" className="grid gap-2">
          <span className="h-4 w-20 animate-pulse rounded bg-grey-100 motion-reduce:animate-none" />
          <span className="h-12 w-full animate-pulse rounded-xl bg-grey-50 motion-reduce:animate-none" />
        </div>
        <span aria-hidden="true" className="h-12 w-full animate-pulse rounded-lg bg-grey-100 motion-reduce:animate-none" />
        <span aria-hidden="true" className="mx-auto h-4 w-48 animate-pulse rounded bg-grey-100 motion-reduce:animate-none" />
      </div>
    </main>
  );
}
