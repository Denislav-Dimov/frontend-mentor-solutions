import Image from 'next/image';
import { UnitProvider, Units, WeatherContent } from '@/features/weather';

export default function HomePage() {
  return (
    <UnitProvider>
      <main className="mx-auto max-w-7xl p-4 md:p-6 lg:p-12">
        <header className="relative flex justify-between text-base">
          <Image
            src="/assets/images/logo.svg"
            alt="Weather Logo"
            width={200}
            height={40}
            loading="eager"
            className="size-auto max-w-32 sm:max-w-full"
          />
          <Units />
        </header>

        <WeatherContent />
      </main>
    </UnitProvider>
  );
}
