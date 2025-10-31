import { useState, useEffect } from 'react';
import Job from './components/Job.jsx';

export default function App() {
  const [jobs, setJobs] = useState(null);

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

  useEffect(() => {
    getJobs();
  }, []);

  return (
    <>
      <header className="bg-primary-green-400 h-[25vh] bg-[url(../../public/images/bg-header-mobile.svg)] md:bg-[url(../../public/images/bg-header-desktop.svg)] bg-no-repeat bg-cover"></header>
      <main className="grid gap-12 px-6 py-10">
        {jobs && jobs.map((job) => <Job job={job} key={job.id} />)}
      </main>
    </>
  );
}
