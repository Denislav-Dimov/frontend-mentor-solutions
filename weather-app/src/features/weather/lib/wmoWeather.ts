import { WmoWeatherCode } from '../types';

type WeatherCondition = {
  description: string;
  icon: string;
};

export const WMO_WEATHER: Record<WmoWeatherCode, WeatherCondition> = {
  0: { description: 'Clear sky', icon: '/assets/images/icon-sunny.webp' },
  1: { description: 'Mainly clear', icon: '/assets/images/icon-sunny.webp' },
  2: { description: 'Partly cloudy', icon: '/assets/images/icon-partly-cloudy.webp' },
  3: { description: 'Overcast', icon: '/assets/images/icon-overcast.webp' },
  45: { description: 'Fog', icon: '/assets/images/icon-fog.webp' },
  48: { description: 'Depositing rime fog', icon: '/assets/images/icon-fog.webp' },
  51: { description: 'Light drizzle', icon: '/assets/images/icon-drizzle.webp' },
  53: { description: 'Moderate drizzle', icon: '/assets/images/icon-drizzle.webp' },
  55: { description: 'Dense drizzle', icon: '/assets/images/icon-drizzle.webp' },
  56: { description: 'Light freezing drizzle', icon: '/assets/images/icon-drizzle.webp' },
  57: { description: 'Dense freezing drizzle', icon: '/assets/images/icon-drizzle.webp' },
  61: { description: 'Slight rain', icon: '/assets/images/icon-rain.webp' },
  63: { description: 'Moderate rain', icon: '/assets/images/icon-rain.webp' },
  65: { description: 'Heavy rain', icon: '/assets/images/icon-rain.webp' },
  66: { description: 'Light freezing rain', icon: '/assets/images/icon-rain.webp' },
  67: { description: 'Heavy freezing rain', icon: '/assets/images/icon-rain.webp' },
  71: { description: 'Slight snowfall', icon: '/assets/images/icon-snow.webp' },
  73: { description: 'Moderate snowfall', icon: '/assets/images/icon-snow.webp' },
  75: { description: 'Heavy snowfall', icon: '/assets/images/icon-snow.webp' },
  77: { description: 'Snow grains', icon: '/assets/images/icon-snow.webp' },
  80: { description: 'Slight rain showers', icon: '/assets/images/icon-rain.webp' },
  81: { description: 'Moderate rain showers', icon: '/assets/images/icon-rain.webp' },
  82: { description: 'Violent rain showers', icon: '/assets/images/icon-rain.webp' },
  85: { description: 'Slight snow showers', icon: '/assets/images/icon-snow.webp' },
  86: { description: 'Heavy snow showers', icon: '/assets/images/icon-snow.webp' },
  95: { description: 'Slight or moderate thunderstorm', icon: '/assets/images/icon-storm.webp' },
  96: { description: 'Thunderstorm with slight hail', icon: '/assets/images/icon-storm.webp' },
  99: { description: 'Thunderstorm with heavy hail', icon: '/assets/images/icon-storm.webp' },
};
