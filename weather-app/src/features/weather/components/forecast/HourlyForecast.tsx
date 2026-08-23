'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Forecast } from '../../types';
import { formatHour, formatWeekday } from '../../lib/utils';
import { WMO_WEATHER } from '../../lib/wmoWeather';

type Props = {
  dailyTime: Forecast['daily']['time'];
  hourly: Forecast['hourly'];
};

export function HourlyForecast({ dailyTime, hourly }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dailyTime[0]);
  const activeDate = dailyTime.includes(selectedDate) ? selectedDate : dailyTime[0];

  return (
    <div className="flex w-full flex-col rounded-[1.25rem] bg-neutral-800 p-6 xl:absolute xl:inset-0">
      <div className="relative flex flex-none items-center justify-between">
        <p className="text-lg font-medium sm:text-xl">Hourly forecast</p>

        <button
          onClick={() => setOpen(!open)}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-neutral-600 px-4 py-2 text-base"
        >
          {formatWeekday(activeDate, 'long')}
          <Image
            src="/assets/images/icon-dropdown.svg"
            alt=""
            width={13}
            height={8}
            className="size-3.5"
          />
        </button>

        <div
          className={`${open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'} absolute top-14 right-0 w-full max-w-50 space-y-1 rounded-xl border border-neutral-600 bg-neutral-800 p-2 transition`}
        >
          {dailyTime.map(date => (
            <div className="space-y-1" key={date}>
              <button
                onClick={() => {
                  setSelectedDate(date);
                  setOpen(false);
                }}
                className={`${activeDate === date ? 'bg-neutral-700' : ''} w-full cursor-pointer rounded-lg px-2 py-2.5 text-left text-base transition hover:bg-neutral-700`}
              >
                {formatWeekday(date, 'long')}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="weather-scrollbar mt-4 -mr-5 h-152 space-y-4 overflow-y-auto pr-4 md:pr-3 xl:h-auto xl:min-h-0 xl:flex-1">
        {hourly.time.map((hour, i) => {
          if (!hour.startsWith(activeDate)) {
            return null;
          }

          return (
            <div
              className="flex items-center justify-between gap-2 rounded-lg bg-neutral-700 px-4 py-2.5"
              key={hour}
            >
              <div className="flex items-center gap-2 text-xl">
                <Image
                  src={WMO_WEATHER[hourly.weather_code[i]].icon}
                  alt={WMO_WEATHER[hourly.weather_code[i]].description}
                  width={320}
                  height={320}
                  className="size-10"
                />
                {formatHour(hour)}
              </div>
              {`${hourly.temperature_2m[i]}°`}
            </div>
          );
        })}
      </div>
    </div>
  );
}
