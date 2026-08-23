'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getForecast } from '../api/getForecast';
import { Forecast, LocationCoords, Unit } from '../types';

type Options = {
  coordinates: LocationCoords;
  unit: Unit;
  enabled?: boolean;
};

type ForecastResult = {
  coordinatesKey: string;
  unit: Unit;
  forecast: Forecast;
};

type ForecastFailure = {
  coordinatesKey: string;
  error: Error;
};

export function useOpenMeteo({ coordinates, unit, enabled = true }: Options) {
  const [result, setResult] = useState<ForecastResult | null>(null);
  const [failure, setFailure] = useState<ForecastFailure | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const { latitude, longitude } = coordinates;
  const coordinatesKey = `${latitude}:${longitude}`;

  const loadForecast = useCallback(async () => {
    if (!enabled) {
      return;
    }

    controllerRef.current?.abort();

    const controller = new AbortController();
    controllerRef.current = controller;
    setFailure(null);

    try {
      const data = await getForecast({
        latitude,
        longitude,
        unit,
        signal: controller.signal,
      });

      if (!controller.signal.aborted) {
        setResult({ coordinatesKey, unit, forecast: data });
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        setFailure({
          coordinatesKey,
          error: error instanceof Error ? error : new Error('Failed to fetch weather data'),
        });
      }
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
      }
    }
  }, [coordinatesKey, enabled, latitude, longitude, unit]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadForecast();

    return () => controllerRef.current?.abort();
  }, [loadForecast]);

  function retry() {
    void loadForecast();
  }

  const currentResult = result?.coordinatesKey === coordinatesKey ? result : null;
  const error =
    currentResult === null && failure?.coordinatesKey === coordinatesKey ? failure.error : null;

  return {
    forecast: currentResult?.forecast ?? null,
    forecastUnit: currentResult?.unit ?? unit,
    error,
    retry,
  };
}
