import { MILLISECOND, TIME_INTERVALS } from '../constants';

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / MILLISECOND);
  for (const interval of TIME_INTERVALS) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
}
