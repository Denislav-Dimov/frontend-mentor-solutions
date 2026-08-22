'use client';

import { SearchInput } from './components/controls/SearchInput';
import { WeatherDashboard } from './components/forecast/WeatherDashboard';
import { WeatherError } from './components/states/WeatherError';
import { WeatherLoading } from './components/states/WeatherLoading';
import { useUnit } from './context/UnitContextProvider';
import { useOpenMeteo } from './hooks/useOpenMeteo';
import { useSelectedLocation } from './hooks/useSelectedLocation';

export function WeatherContent() {
  const { currentUnit } = useUnit();
  const { location, locationLoading } = useSelectedLocation();
  const { forecast, error, retry } = useOpenMeteo({
    coordinates: location,
    unit: currentUnit,
    enabled: !locationLoading,
  });

  if (forecast === null && error) {
    return <WeatherError onRetry={retry} />;
  }

  return (
    <>
      <h1 className="font-family-secondary my-12 text-center text-[3.25rem] leading-tight md:my-16">
        How’s the sky looking today?
      </h1>

      <section className="space-y-8 md:space-y-12">
        <SearchInput />

        {locationLoading || (forecast === null && error === null) ? (
          <WeatherLoading />
        ) : (
          <WeatherDashboard forecast={forecast!} location={location} unit={currentUnit} />
        )}
      </section>
    </>
  );
}
