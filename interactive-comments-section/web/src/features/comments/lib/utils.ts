import { DAY_MS, HOUR_MS, MILLISECOND, MINUTE_MS, TIME_INTERVALS } from './constants';

export function parseCreatedAt(value: string | number): number {
  if (typeof value === 'number') return value;
  if (value === 'Just now') return Date.now();
  const parts = value.split(' ');
  const amount = parseInt(parts[0], 10);
  const unit = parts[1] ?? '';
  const now = Date.now();
  if (unit.startsWith('second')) return now - amount * MILLISECOND;
  if (unit.startsWith('minute')) return now - amount * MINUTE_MS;
  if (unit.startsWith('hour')) return now - amount * HOUR_MS;
  if (unit.startsWith('day')) return now - amount * DAY_MS;
  if (unit.startsWith('week')) return now - amount * 7 * DAY_MS;
  if (unit.startsWith('month')) return now - amount * 30 * DAY_MS;
  if (unit.startsWith('year')) return now - amount * 365 * DAY_MS;
  return now;
}

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / MILLISECOND);
  for (const interval of TIME_INTERVALS) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
}
