'use client';

import Image from 'next/image';
import { HourlyForecast } from './HourlyForecast';
import { formatDate, formatWeekday } from '../../lib/utils';
import { WMO_WEATHER } from '../../lib/wmoWeather';
import { Forecast, Location, Unit } from '../../types';

type Props = {
  forecast: Forecast;
  location: Location;
  unit: Unit;
};

export function WeatherDashboard({ forecast, location, unit }: Props) {
  const forecastStats = [
    {
      label: 'Feels Like',
      value: `${forecast.current?.apparent_temperature}°`,
    },
    {
      label: 'Humidity',
      value: `${forecast.current?.relative_humidity_2m}%`,
    },
    {
      label: 'Wind',
      value: `${forecast.current?.wind_speed_10m} ${unit === 'metric' ? 'km/h' : 'mph'}`,
    },
    {
      label: 'Precipitation',
      value: `${forecast.current?.precipitation} ${unit === 'metric' ? 'mm' : 'in'}`,
    },
  ];

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-4 xl:flex-row xl:gap-8">
      <div className="w-full xl:w-auto xl:flex-none">
        <picture className="relative">
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
            loading="eager"
          />

          <div className="absolute top-1/2 flex w-full -translate-y-1/2 flex-wrap items-center justify-center gap-4 px-6 max-sm:text-center md:justify-between">
            <div className="space-y-3">
              <p className="text-[1.75rem] font-bold">
                {location.city}, {location.country}
              </p>
              <p className="opacity-80">{formatDate(forecast.current.time)}</p>
            </div>

            <div className="flex items-center gap-5">
              <Image
                src={WMO_WEATHER[forecast.current.weather_code].icon}
                alt={WMO_WEATHER[forecast.current.weather_code].description}
                width={320}
                height={320}
                className="size-30"
              />

              <p className="text-7xl sm:text-[6rem]">{forecast.current?.temperature_2m}°</p>
            </div>
          </div>
        </picture>

        <div className="mt-5 grid grid-cols-2 gap-6 md:mt-8 md:grid-cols-4">
          {forecastStats.map(stat => (
            <div
              key={stat.label}
              className="space-y-2 rounded-xl border border-neutral-600 bg-neutral-800 p-5"
            >
              <p className="text-neutral-200">{stat.label}</p>
              <p className="text-[2rem] font-light">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-5 md:mt-12">
          <p className="text-xl">Daily forecast</p>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-4">
            {forecast.daily.time.map((date, i) => (
              <div
                key={date}
                className="flex flex-col items-center gap-4 rounded-xl border border-neutral-600 bg-neutral-800 px-2.5 py-4"
              >
                <p className="text-center">{formatWeekday(date, 'short')}</p>
                <Image
                  src={WMO_WEATHER[forecast.daily.weather_code[i]].icon}
                  alt={WMO_WEATHER[forecast.daily.weather_code[i]].description}
                  width={320}
                  height={320}
                  className="size-12"
                />
                <div className="flex w-full justify-between text-base">
                  <span>{forecast.daily.temperature_2m_max[i]}</span>
                  <span>{forecast.daily.temperature_2m_max[i]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative w-full min-w-0 xl:flex-1">
        <HourlyForecast dailyTime={forecast.daily.time} hourly={forecast.hourly} />
      </div>
    </section>
  );
}
