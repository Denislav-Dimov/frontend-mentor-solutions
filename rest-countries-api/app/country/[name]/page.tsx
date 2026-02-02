import { Suspense } from 'react';
import { CountryDetailsPage } from '@/features/country';

type CountryProps = {
  params: Promise<{ name: string }>;
};

export default async function Country({ params }: CountryProps) {
  const { name } = await params;

  return (
    <section>
      {/* TODO add skeleton loading */}
      <Suspense fallback={<p className="text-2xl text-center mt-12">Loading...</p>}>
        <CountryDetailsPage name={name} />
      </Suspense>
    </section>
  );
}
