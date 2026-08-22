'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getForecast } from '../api/getForecast';
import { Forecast, LocationCoords, Unit } from '../types';

type Options = {
  coordinates: LocationCoords;
  unit: Unit;
  enabled?: boolean;
};

export function useOpenMeteo({ coordinates, unit, enabled = true }: Options) {
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const { latitude, longitude } = coordinates;

  const loadForecast = useCallback(async () => {
    if (!enabled) {
      return;
    }

    controllerRef.current?.abort();

    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const data = await getForecast({
        latitude,
        longitude,
        unit,
        signal: controller.signal,
      });

      if (!controller.signal.aborted) {
        setError(null);
        setForecast(data);
      }
    } catch (error) {
      if (!controller.signal.aborted && error instanceof Error) {
        setError(error);
      }
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
      }
    }
  }, [enabled, latitude, longitude, unit]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadForecast();

    return () => controllerRef.current?.abort();
  }, [loadForecast]);

  function retry() {
    setError(null);
    void loadForecast();
  }

  return { forecast, error, retry };
}
