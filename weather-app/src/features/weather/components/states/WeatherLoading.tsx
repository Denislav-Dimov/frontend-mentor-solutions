import Image from 'next/image';

const weatherInfoPlaceholder = ['Feels Like', 'Humidity', 'Wind', 'Precipitation'];

export function WeatherLoading() {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-4 xl:flex-row xl:gap-8">
      <div className="w-full xl:w-200 xl:flex-none">
        <div className="flex h-71.5 w-full animate-pulse flex-col items-center justify-center rounded-[1.25rem] bg-neutral-800">
          <div className="mb-3 flex items-center justify-center gap-2">
            <div className="bg-neutral-0 size-3 animate-bounce rounded-full opacity-80 [animation-delay:0]" />
            <div className="bg-neutral-0 size-3 animate-bounce rounded-full opacity-80 [animation-delay:300ms]" />
            <div className="bg-neutral-0 size-3 animate-bounce rounded-full opacity-80 [animation-delay:600ms]" />
          </div>
          <p>Loading...</p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-6 md:mt-8 md:grid-cols-4">
          {weatherInfoPlaceholder.map(info => (
            <div
              className="animate-pulse space-y-2 rounded-xl border border-neutral-600 bg-neutral-800 p-5"
              key={info}
            >
              <p className="text-neutral-200">{info}</p>
              <p className="text-[2rem] font-light">–</p>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-5 md:mt-12">
          <p className="text-xl">Daily forecast</p>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-4">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="h-41.5 animate-pulse rounded-xl border border-neutral-600 bg-neutral-800 px-2.5 py-4"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="w-full min-w-0 animate-pulse rounded-[1.25rem] bg-neutral-800 p-6 xl:flex-1">
        <div className="relative flex items-center justify-between">
          <p className="text-lg font-medium sm:text-xl">Hourly forecast</p>
          <div className="flex animate-pulse items-center gap-2 rounded-lg bg-neutral-600 px-4 py-2 text-base">
            –
            <Image
              src="/assets/images/icon-dropdown.svg"
              alt=""
              width={13}
              height={8}
              className="size-3.5"
            />
          </div>
        </div>
        {[...Array(8)].map((_, i) => (
          <div
            className="mt-4 h-15 w-full animate-pulse rounded-lg border border-neutral-600 bg-neutral-700"
            key={i}
          />
        ))}
      </div>
    </section>
  );
}
