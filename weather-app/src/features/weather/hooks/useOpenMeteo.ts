'use client';

import { useQuery } from '@tanstack/react-query';
import { getForecast } from '../api/getForecast';
import { Forecast, LocationCoords, Unit } from '../types';

type Options = {
  coordinates: LocationCoords;
  unit: Unit;
  enabled?: boolean;
};

type ForecastResult = {
  forecast: Forecast;
  unit: Unit;
};

export function useOpenMeteo({ coordinates, unit, enabled = true }: Options) {
  const { latitude, longitude } = coordinates;

  const { data, error, refetch } = useQuery<ForecastResult>({
    queryKey: ['weather', latitude, longitude, unit],
    queryFn: async ({ signal }) => ({
      forecast: await getForecast({ latitude, longitude, unit, signal }),
      unit,
    }),
    enabled,
    retry: false,
    placeholderData: (previousData, previousQuery) => {
      const previousQueryKey = previousQuery?.queryKey;
      const hasSameCoordinates =
        previousQueryKey?.[1] === latitude && previousQueryKey?.[2] === longitude;

      return hasSameCoordinates ? previousData : undefined;
    },
  });

  function retry() {
    void refetch();
  }

  return {
    forecast: data?.forecast ?? null,
    forecastUnit: data?.unit ?? unit,
    error: data ? null : error,
    retry,
  };
}
