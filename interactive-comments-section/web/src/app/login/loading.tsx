const bone = 'animate-pulse rounded motion-reduce:animate-none';

export default function Loading() {
  return (
    <>
      <div aria-hidden="true" className="border-grey-100 h-16 border-b bg-white" />
      <main id="main" className="page">
        <div aria-busy="true" className="card mx-auto grid w-full max-w-md gap-6">
          <p role="status" className="sr-only">
            Loading…
          </p>
          <div aria-hidden="true" className="grid gap-2">
            <span className={`${bone} bg-grey-100 h-8 w-40`} />
            <span className={`${bone} bg-grey-100 h-4 w-full`} />
          </div>
          <div aria-hidden="true" className="grid gap-5">
            {[0, 1].map(index => (
              <div key={index} className="grid gap-2">
                <span className={`${bone} bg-grey-100 h-4 w-28`} />
                <span className={`${bone} bg-grey-50 h-12 w-full rounded-xl`} />
              </div>
            ))}
          </div>
          <span aria-hidden="true" className={`${bone} bg-grey-100 h-12 w-full rounded-lg`} />
          <span aria-hidden="true" className={`${bone} bg-grey-100 mx-auto h-4 w-48`} />
        </div>
      </main>
    </>
  );
}
