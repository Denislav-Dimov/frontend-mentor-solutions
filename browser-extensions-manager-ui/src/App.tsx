import { useState } from 'react';
import Header from './components/Header';
import Extension from './components/Extension';
import data from './data/data.json';

type Filter = 'all' | 'active' | 'inactive';

export default function App() {
  const [filter, setFilter] = useState<Filter>('all');
  const [extensions, setExtensions] = useState(data);

  const filteredExtensions = extensions.filter(extension => {
    if (filter === 'active') return extension.isActive;
    if (filter === 'inactive') return !extension.isActive;
    return true; // 'all'
  });

  function removeExtension(name: string) {
    setExtensions(prevExt => prevExt.filter(ext => ext.name !== name));
  }

  function toggleExtension(name: string) {
    setExtensions(prevExt => {
      return prevExt.map(ext =>
        ext.name === name ? { ...ext, isActive: !ext.isActive } : ext
      );
    });
  }

  return (
    <main className="p-4 md:py-12 max-w-7xl mx-auto">
      <Header />
      <section className="mt-8 md:mt-16 mb-6 md:mb-8 space-y-3 flex max-md:flex-col items-center justify-center md:justify-between">
        <h1 className="max-md:text-center font-bold text-3xl mb-4 md:mb-0">
          Extensions List
        </h1>
        <div className="flex gap-3 text-lg font-semibold">
          <button
            className={`btn ${
              filter === 'all' &&
              'bg-red-700 dark:bg-red-500 border-red-700 dark:border-red-500 text-neutral-0 font-semibold dark:text-neutral-900'
            }`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`btn ${
              filter === 'active' &&
              'bg-red-700 dark:bg-red-500 border-red-700 dark:border-red-500 text-neutral-0 font-semibold dark:text-neutral-900'
            }`}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button
            className={`btn ${
              filter === 'inactive' &&
              'bg-red-700 dark:bg-red-500 border-red-700 dark:border-red-500 text-neutral-0 font-semibold dark:text-neutral-900'
            }`}
            onClick={() => setFilter('inactive')}
          >
            Inactive
          </button>
        </div>
      </section>
      {filteredExtensions.length > 0 ? (
        <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filteredExtensions.map(extension => (
            <Extension
              key={extension.name + filter}
              {...extension}
              removeExtension={removeExtension}
              toggleExtension={toggleExtension}
            />
          ))}
        </section>
      ) : (
        <h2 className="animate-fade-in text-3xl text-center font-semibold mt-12">
          No extensions
        </h2>
      )}
    </main>
  );
}
