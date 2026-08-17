'use client';

import Image from 'next/image';
import { useState } from 'react';
import { DAYS_OF_THE_WEEK } from '../constants';
import { Day } from '../types';

export function HourlyForecast() {
  const [open, setOpen] = useState(false);

  const [selectedDay, setSelectedDay] = useState<Day>('Tuesday');

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="flex cursor-pointer items-center gap-2 rounded-lg bg-neutral-600 px-4 py-2 text-base"
      >
        {selectedDay}
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
        {DAYS_OF_THE_WEEK.map(day => (
          <div className="space-y-1" key={day}>
            <button
              onClick={() => setSelectedDay(day)}
              className={`${selectedDay === day ? 'bg-neutral-700' : ''} w-full cursor-pointer rounded-lg px-2 py-2.5 text-left text-base transition hover:bg-neutral-700`}
            >
              {day}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
