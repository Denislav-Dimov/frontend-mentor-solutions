import { useState, useEffect } from 'react';
import Job from './components/Job.jsx';
import Filter from './components/Filter.jsx';

export default function App() {
  const [jobs, setJobs] = useState(null);
  const [filters, setFilters] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);

  function filterJobs(currentFilters) {
    if (currentFilters.length === 0) {
      setFilteredJobs([]);
      return;
    }

    const filtered = jobs.filter((job) =>
      currentFilters.every((filter) =>
        [job.role, job.level, ...job.languages, ...job.tools].includes(filter)
      )
    );

    setFilteredJobs(filtered);
  }

  function addFilter(content) {
    if (filters.some((filter) => filter === content)) return;

    const newFilters = [...filters, content];
    setFilters(newFilters);
    filterJobs(newFilters);
  }

  function removeFilter(content) {
    const newFilters = filters.filter((filter) => filter !== content);
    setFilters(newFilters);
    filterJobs(newFilters);
  }

  function clearFiltes() {
    setFilters([]);
    filterJobs([]);
  }

  useEffect(() => {
    async function getJobs() {
      try {
        const response = await fetch('/data.json');

        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }

        const data = await response.json();

        setJobs(data);
      } catch (error) {
        console.error(error.message);
      }
    }

    getJobs();
  }, []);

  return (
    <>
      <header className="bg-primary-green-400 h-[25vh] bg-[url(../../public/images/bg-header-mobile.svg)] md:bg-[url(../../public/images/bg-header-desktop.svg)] bg-no-repeat bg-cover"></header>
      <main className="relative px-6 pb-14 md:pb-16 max-w-7xl mx-auto">
        <Filter
          filters={filters}
          removeFilter={removeFilter}
          clearFiltes={clearFiltes}
          key={''}
        />
        <section className="grid gap-12">
          {jobs &&
            (filteredJobs.length > 0 ? filteredJobs : jobs).map((job) => (
              <Job key={job.id} job={job} addFilter={addFilter} />
            ))}
        </section>
      </main>
    </>
  );
}
