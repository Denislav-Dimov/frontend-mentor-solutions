import BackButton from '@/components/BackButton';

export default function NotFound() {
  return (
    <section className="grid place-items-center mt-48 mb-16">
      <div className="grid place-items-center gap-3">
        <h2 className="text-4xl font-bold">Not Found</h2>
        <p className="font-light">Could not find requested resource</p>
        <BackButton />
      </div>
    </section>
  );
}
