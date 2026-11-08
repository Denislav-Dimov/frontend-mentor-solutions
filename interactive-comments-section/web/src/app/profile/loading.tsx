const bone = 'animate-pulse rounded motion-reduce:animate-none';

export default function Loading() {
  return (
    <>
      <div aria-hidden="true" className="border-grey-100 h-16 border-b bg-white" />
      <main id="main" aria-busy="true" className="page">
        <p role="status" className="sr-only">
          Loading profile…
        </p>
        <div aria-hidden="true" className="grid gap-2">
          <span className={`${bone} bg-grey-100 h-9 w-48`} />
          <span className={`${bone} bg-grey-100 h-4 w-72 max-w-full`} />
        </div>
        <div aria-hidden="true" className="card grid gap-6">
          <div className="grid gap-2">
            <span className={`${bone} bg-grey-100 h-5 w-20`} />
            <span className={`${bone} bg-grey-100 h-4 w-64 max-w-full`} />
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <span className={`${bone} bg-grey-100 h-20 w-20 rounded-full`} />
            <span className="grid gap-2">
              <span className={`${bone} bg-grey-50 h-11 w-36 rounded-lg`} />
              <span className={`${bone} bg-grey-100 h-3 w-44`} />
            </span>
          </div>
          <div className="grid gap-2">
            <span className={`${bone} bg-grey-100 h-4 w-24`} />
            <span className={`${bone} bg-grey-50 h-12 w-full rounded-xl`} />
          </div>
          <span className={`${bone} bg-grey-100 h-11 w-36 rounded-lg`} />
        </div>
        {[0, 1, 2].map(index => (
          <div key={index} aria-hidden="true" className="card grid gap-3">
            <span className={`${bone} bg-grey-100 h-5 w-28`} />
            <span className={`${bone} bg-grey-100 h-4 w-full`} />
            {index !== 1 && <span className={`${bone} bg-grey-50 h-11 w-32 rounded-lg`} />}
          </div>
        ))}
      </main>
    </>
  );
}
