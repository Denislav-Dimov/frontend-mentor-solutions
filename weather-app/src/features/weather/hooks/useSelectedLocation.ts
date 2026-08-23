'use client';

import { useEffect, useRef, useState } from 'react';
import reverseGeocode from '../api/reverseGeocode';
import { DEFAULT_LOCATION } from '../constants';
import getBrowserCoordinates from '../services/getBrowserCoordinates';
import { Location } from '../types';

export function useSelectedLocation() {
  const [location, setLocation] = useState<Location>(DEFAULT_LOCATION);
  const [locationLoading, setLocationLoading] = useState(true);
  const hasManualSelectionRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadUserLocation() {
      try {
        const coordinates = await getBrowserCoordinates();
        const data = await reverseGeocode(coordinates);

        if (cancelled || hasManualSelectionRef.current) {
          return;
        }

        setLocation({
          country: data.countryName,
          city: data.city || data.locality,
          latitude: data.latitude,
          longitude: data.longitude,
        });
      } catch (error) {
        if (cancelled || hasManualSelectionRef.current) {
          return;
        }

        console.error('Unable to determine the current location. Using the default location.', error);
        setLocation(DEFAULT_LOCATION);
      } finally {
        if (!cancelled && !hasManualSelectionRef.current) {
          setLocationLoading(false);
        }
      }
    }

    loadUserLocation();

    return () => {
      cancelled = true;
    };
  }, []);

  function selectLocation(nextLocation: Location) {
    hasManualSelectionRef.current = true;
    setLocation(nextLocation);
    setLocationLoading(false);
  }

  return { location, locationLoading, selectLocation };
}
