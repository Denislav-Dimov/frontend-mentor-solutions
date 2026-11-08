const bone = 'animate-pulse rounded motion-reduce:animate-none';

export default function Loading() {
  return (
    <>
      <div aria-hidden="true" className="border-grey-100 h-16 border-b bg-white" />
      <main id="main" aria-busy="true" className="page">
        <p role="status" className="sr-only">
          Loading activity…
        </p>
        <div aria-hidden="true" className="grid gap-2">
          <span className={`${bone} bg-grey-100 h-9 w-52`} />
          <span className={`${bone} bg-grey-100 h-4 w-80 max-w-full`} />
        </div>
        <div aria-hidden="true" className="grid gap-4">
          {[0, 1, 2].map(index => (
            <div key={index} className="card grid gap-3">
              <span className="flex items-center gap-3">
                <span className={`${bone} bg-grey-100 h-5 w-16 rounded-md`} />
                <span className={`${bone} bg-grey-100 h-4 w-24`} />
              </span>
              <span className={`${bone} bg-grey-100 h-4 w-full`} />
              <span className={`${bone} bg-grey-100 h-4 w-3/4`} />
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
