import { Unit } from '../types';

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date.slice(0, 10)}T00:00:00Z`));
}

export function formatWeekday(date: string, format: 'long' | 'short') {
  return new Intl.DateTimeFormat('en-US', {
    weekday: format,
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}

export function formatHour(time: string) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    hour12: true,
    timeZone: 'UTC',
  }).format(new Date(`${time}Z`));
}

export function getQueryParamsFromUnit(unit: Unit) {
  return unit === 'imperial'
    ? '&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch'
    : '';
}
