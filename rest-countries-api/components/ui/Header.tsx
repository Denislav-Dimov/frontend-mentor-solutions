import Link from 'next/link';
import ButtonTheme from './ThemeButton';

export default function Header() {
  return (
    <header className="bg-white dark:bg-dark-blue-900 shadow">
      <section className="max-w-7xl mx-auto px-5 py-8 flex items-center justify-between">
        <h1 className="md:text-2xl font-bold">
          <Link href='/'>Where in the world?</Link>
        </h1>
        <ButtonTheme />
      </section>
    </header>
  );
}
