'use client';

import Image from 'next/image';
import { useWeather } from '../context/WeatherContextProvider';
import { HourlyForecast } from './HourlyForecast';
import { temp1, temp2, temp3 } from './TEMP';

export function WeatherDashboard() {
  const { location, locationLoading, currentUnit } = useWeather();

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-4 xl:flex-row xl:gap-8">
      <div className="w-full xl:w-auto xl:flex-none">
        <picture>
          <source
            media="(min-width: 48rem)"
            srcSet="/assets/images/bg-today-large.svg"
            width={800}
            height={300}
          />

          <Image
            src="/assets/images/bg-today-small.svg"
            alt=""
            width={350}
            height={300}
            className="h-auto w-full xl:w-auto"
          />
        </picture>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-8 md:grid-cols-4">
          {temp2.map(temp => (
            <div
              className="space-y-6 rounded-3xl border border-neutral-600 bg-neutral-800 p-5 text-[2rem] md:gap-5"
              key={temp.info}
            >
              <p className="text-lg text-neutral-200">{temp.info}</p>
              {temp.value}
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-5 md:mt-12">
          <p className="text-xl">Daily forecast</p>
          <div className="flex flex-wrap gap-4">
            {temp3.map(temp => (
              <div
                key={temp.day}
                className="flex flex-1 flex-col items-center gap-4 rounded-xl border border-neutral-600 bg-neutral-800 px-2.5 py-4"
              >
                <p className="text-center">{temp.day}</p>
                <Image
                  src={temp.icon}
                  alt={temp.icon}
                  width={320}
                  height={320}
                  className="size-12"
                />
                <div className="flex w-full justify-between text-base">
                  <span>{temp.idk1}</span>
                  <span>{temp.idk2}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full min-w-0 rounded-[1.25rem] bg-neutral-800 p-6 xl:flex-1">
        <div className="relative flex items-center justify-between">
          <p className="text-lg font-medium sm:text-xl">Hourly forecast</p>
          <HourlyForecast />
        </div>
        {temp1.map(temp => (
          <div
            className="mt-4 flex items-center justify-between gap-2 rounded-lg bg-neutral-700 px-4 py-2.5"
            key={temp.time}
          >
            <div className="flex items-center gap-2 text-xl">
              <Image
                src={temp.icon}
                alt={temp.icon}
                width={320}
                height={320}
                className="size-10"
              />
              {temp.time}
            </div>
            {temp.temperature}
          </div>
        ))}
      </div>
    </section>
  );
}
