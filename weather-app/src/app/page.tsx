import { Units, SearchInput, WeatherDashboard } from '@/features/weather';
import Image from 'next/image';

export default function HomePage() {
  return (
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

      <h1 className="font-family-secondary my-12 text-center text-[3.25rem] leading-tight md:my-16">
        How’s the sky looking today?
      </h1>

      <section className="space-y-8 md:space-y-12">
        <SearchInput />
        <WeatherDashboard />
      </section>
    </main>
  );
}
