'use client';

import { SearchInput } from './components/controls/SearchInput';
import { WeatherDashboard } from './components/forecast/WeatherDashboard';
import { WeatherError } from './components/states/WeatherError';
import { WeatherLoading } from './components/states/WeatherLoading';
import { useUnit } from './context/UnitContextProvider';
import { useLocationSearch } from './hooks/useLocationSearch';
import { useOpenMeteo } from './hooks/useOpenMeteo';
import { useSelectedLocation } from './hooks/useSelectedLocation';
import type { LocationSearchResult } from './types';

export function WeatherContent() {
  const { currentUnit } = useUnit();
  const { location, locationLoading, selectLocation } = useSelectedLocation();
  const { query, state, updateQuery, search, resetSearch } = useLocationSearch();
  const { forecast, forecastUnit, error, retry } = useOpenMeteo({
    coordinates: location,
    unit: currentUnit,
    enabled: !locationLoading,
  });

  function handleLocationSelect(result: LocationSearchResult) {
    selectLocation({
      city: result.name,
      country: result.country ?? result.admin1 ?? '',
      latitude: result.latitude,
      longitude: result.longitude,
    });
    resetSearch();
  }

  if (forecast === null && error) {
    return <WeatherError onRetry={retry} />;
  }

  const weatherContent =
    locationLoading || forecast === null ? (
      <WeatherLoading />
    ) : state.status === 'empty' ? (
      <p role="status" className="mt-12 text-center text-[1.75rem] font-bold">
        No search result found!
      </p>
    ) : (
      <WeatherDashboard forecast={forecast} location={location} unit={forecastUnit} />
    );

  return (
    <>
      <h1 className="font-family-secondary my-12 text-center text-[3.25rem] leading-tight md:my-16">
        How’s the sky looking today?
      </h1>

      <section className="space-y-8 md:space-y-12">
        <SearchInput
          query={query}
          state={state}
          onQueryChange={updateQuery}
          onSubmit={search}
          onSelect={handleLocationSelect}
        />

        {weatherContent}
      </section>
    </>
  );
}
