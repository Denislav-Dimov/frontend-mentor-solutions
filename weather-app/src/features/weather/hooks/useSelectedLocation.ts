'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import reverseGeocode from '../api/reverseGeocode';
import { DEFAULT_LOCATION } from '../constants';
import getBrowserCoordinates from '../services/getBrowserCoordinates';
import { Location } from '../types';

export function useSelectedLocation() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const { data: browserLocation, isPending } = useQuery<Location>({
    queryKey: ['browser-location'],
    queryFn: async ({ signal }) => {
      try {
        const coordinates = await getBrowserCoordinates();
        const data = await reverseGeocode({ ...coordinates, signal });

        return {
          country: data.countryName,
          city: data.city || data.locality,
          latitude: data.latitude,
          longitude: data.longitude,
        };
      } catch (error) {
        if (signal.aborted) {
          throw error;
        }

        console.error(
          'Unable to determine the current location. Using the default location.',
          error,
        );

        return DEFAULT_LOCATION;
      }
    },
    enabled: selectedLocation === null,
    networkMode: 'always',
    retry: false,
    staleTime: Infinity,
  });

  function selectLocation(nextLocation: Location) {
    setSelectedLocation(nextLocation);
  }

  return {
    location: selectedLocation ?? browserLocation ?? DEFAULT_LOCATION,
    locationLoading: selectedLocation === null && isPending,
    selectLocation,
  };
}
