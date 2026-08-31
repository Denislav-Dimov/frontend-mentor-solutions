'use client';

import Image from 'next/image';
import { useId } from 'react';
import { useUnit } from '../../context/UnitContextProvider';
import { useDismissibleDropdown } from '../../hooks/useDismissibleDropdown';

const units = [
  { title: 'Temperature', metric: 'Celsius (°C)', imperial: 'Fahrenheit (°F)' },
  { title: 'Wind Speed', metric: 'km/h', imperial: 'mph' },
  { title: 'Precipitation', metric: 'Millimeters (mm)', imperial: 'Inches (in)' },
];

export function Units() {
  const { open, setOpen, containerRef } = useDismissibleDropdown();
  const dropdownId = useId();
  const { currentUnit, setUnit } = useUnit();
  const isMetric = currentUnit === 'metric';

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={dropdownId}
        onClick={() => setOpen(prev => !prev)}
        className="flex cursor-pointer items-center gap-2 rounded-lg bg-neutral-800 px-4 py-3 transition hover:bg-neutral-700"
      >
        <Image
          src="/assets/images/icon-units.svg"
          alt=""
          width={16}
          height={16}
          className="size-4"
        />
        Units
        <Image
          src="/assets/images/icon-dropdown.svg"
          alt=""
          width={13}
          height={8}
          className="size-3.5"
        />
      </button>

      <div
        id={dropdownId}
        className={`${open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'} absolute top-14 right-0 z-50 w-50 space-y-1 rounded-xl border border-neutral-600 bg-neutral-800 px-2 py-1.5 transition`}
      >
        <button
          onClick={() => setUnit(isMetric ? 'imperial' : 'metric')}
          className="w-full cursor-pointer rounded-lg px-2 py-2.5 text-left transition hover:bg-neutral-700"
        >
          {isMetric ? 'Switch to Imperial' : 'Switch to Metric'}
        </button>

        <div className="divide-y divide-neutral-600">
          {units.map(unit => (
            <div className="space-y-1" key={unit.title}>
              <p className="px-2 pt-2 text-sm text-neutral-300">{unit.title}</p>

              <div
                className={`${isMetric && 'flex items-center justify-between gap-2.5 bg-neutral-700'} w-full rounded-lg px-2 py-2.5 text-left transition`}
              >
                {unit.metric}
                {isMetric && (
                  <Image
                    src="/assets/images/icon-checkmark.svg"
                    alt=""
                    width={14}
                    height={11}
                    className="size-4"
                  />
                )}
              </div>
              <div
                className={`${!isMetric && 'flex items-center justify-between gap-2.5 bg-neutral-700'} w-full rounded-lg px-2 py-2.5 text-left transition`}
              >
                {unit.imperial}
                {!isMetric && (
                  <Image
                    src="/assets/images/icon-checkmark.svg"
                    alt=""
                    width={14}
                    height={11}
                    className="size-4"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
