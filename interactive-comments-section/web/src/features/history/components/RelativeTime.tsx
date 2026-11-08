'use client';

import { useSyncExternalStore } from 'react';

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['week', 604_800],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
];

const serverFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeZone: 'UTC',
});

let clientNow: number | null = null;
const subscribe = () => () => {};
const getClientNow = () => (clientNow ??= Date.now());
const getServerNow = () => null;

function formatRelative(date: Date, now: number) {
  const seconds = Math.round((date.getTime() - now) / 1000);
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return formatter.format(Math.round(seconds / size), unit);
  }
  return 'just now';
}

export default function RelativeTime({ dateTime }: { dateTime: string }) {
  const now = useSyncExternalStore(subscribe, getClientNow, getServerNow);
  const date = new Date(dateTime);

  if (now === null) {
    return <time dateTime={dateTime}>{serverFormatter.format(date)}</time>;
  }

  return (
    <time
      dateTime={dateTime}
      title={date.toLocaleString('en', { dateStyle: 'long', timeStyle: 'short' })}
    >
      {formatRelative(date, now)}
    </time>
  );
}
