'use client';

import { useState, useEffect, PropsWithChildren, createContext, useContext } from 'react';
import { Unit, Location } from '../types';
import { DEFAULT_LOCATION, DEFAULT_UNIT, UNITS_LC_KEY } from '../constants';
import reverseGeocode from '../api/reverseGeocode';
import getBrowserCoordinates from '../services/getBrowserCoordinates';

type ContextType = {
  currentUnit: Unit;
  setUnit: (unit: Unit) => void;
  location: Location;
  locationLoading: boolean;
};

export const WeatherContext = createContext<ContextType | undefined>(undefined);

export function WeatherProvider({ children }: PropsWithChildren) {
  const [currentUnit, setCurrentUnit] = useState<Unit>(DEFAULT_UNIT);
  const [location, setLocation] = useState<Location>(DEFAULT_LOCATION);
  const [locationLoading, setLocationLoading] = useState(true);

  function setUnit(unit: Unit) {
    if (currentUnit === unit) {
      return;
    }

    localStorage.setItem(UNITS_LC_KEY, unit);

    setCurrentUnit(unit);
  }

  useEffect(() => {
    const storedUnit = localStorage.getItem(UNITS_LC_KEY);

    if (storedUnit === 'metric' || storedUnit === 'imperial') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentUnit(storedUnit);
    }
  }, []);

  useEffect(() => {
    async function loadUserLocation() {
      setLocationLoading(true);

      try {
        const coords = await getBrowserCoordinates();
        const data = await reverseGeocode(coords);

        const userLocation: Location = {
          country: data.countryName ?? data.locality,
          city: data.city,
          latitude: data.latitude,
          longitude: data.longitude,
        };

        setLocation(userLocation);
      } catch (err) {
        console.error(err);
      } finally {
        setLocationLoading(false);
      }
    }

    loadUserLocation();
  }, []);

  return (
    <WeatherContext.Provider value={{ currentUnit, setUnit, location, locationLoading }}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const context = useContext(WeatherContext);

  if (!context) {
    throw new Error('useWeather must be within a WeatherProvider');
  }

  return context;
}
