import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import NotFound from './NotFound.jsx';

export default function JobOffer() {
  const { company, offer } = useParams();
  const [jobOffer, setJobOffer] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getJobOffer() {
      try {
        const response = await fetch('/data.json');

        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }

        const jobs = await response.json();

        const job = jobs.find(
          (job) => job.company === company && job.position === offer
        );

        setJobOffer(job);
      } catch (error) {
        console.error(error.message);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 300);
      }
    }

    getJobOffer();
  }, [company, offer]);

  if (loading) {
    return (
      <main className="my-8 px-6">
        <section className="grid grid-cols-1 md:grid-cols-2 px-4 md:px-6 py-12 gap-4 bg-white max-w-5xl mx-auto shadow-primary rounded-lg">
          <div className="max-md:flex flex-col items-center max-md:order-2 max-md:text-center md:px-14">
            <div className="mb-5 w-60 h-12 bg-neutral-200 rounded-full animate-pulse"></div>
            <div className="w-64 h-10 bg-neutral-200 rounded-full animate-pulse"></div>
            <div className="grid gap-3 my-6">
              <div className="w-24 h-8 bg-neutral-200 rounded-full animate-pulse"></div>
              <div className="w-24 h-8 bg-neutral-200 rounded-full animate-pulse"></div>
            </div>
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-36 h-8 bg-neutral-200 rounded-full animate-pulse"></div>
              <div className="w-28 h-8 bg-neutral-200 rounded-full animate-pulse"></div>
            </div>
            <div className="w-48 h-12 bg-neutral-200 rounded-full animate-pulse"></div>
          </div>
          <div className="max-md:order-1">
            <div className="grid h-full place-items-center">
              <div className="size-48 md:size-72 bg-neutral-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!jobOffer) {
    return <NotFound />;
  }

  return (
    <main className="my-8 px-6">
      <section className="grid grid-cols-1 md:grid-cols-2 px-4 md:px-6 py-12 gap-4 bg-white max-w-5xl mx-auto shadow-primary rounded-lg">
        <div className="max-md:order-2 max-md:text-center md:px-14">
          <div className="flex max-md:justify-center gap-4 mb-4">
            {jobOffer.new && (
              <p className="uppercase text-secondary-green-50 bg-primary-green-400 px-2.5 py-space-primary rounded-lg text-lg font-bold">
                new!
              </p>
            )}
            {jobOffer.featured && (
              <p className="uppercase text-secondary-green-50 bg-secondary-gray-900 px-2.5 py-space-primary rounded-lg text-lg font-bold">
                featured
              </p>
            )}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">{jobOffer.company}</h2>
          <div className="flex max-md:justify-center gap-3 items-center text-2xl/tight">
            <div className="bg-secondary-gray-400 size-2 rounded-full"></div>
            <p>{jobOffer.postedAt}</p>
          </div>
          <h3 className="text-xl md:text-2xl font-bold">{jobOffer.position}</h3>
          <div className="text-lg my-1.5">
            <p>Role: {jobOffer.role}</p>
            <p>Level: {jobOffer.level}</p>
            <p>Contract: {jobOffer.contract}</p>
            <p>Location: {jobOffer.location}</p>
          </div>
          <div className="flex items-center md:gap-3.5 max-md:flex-col">
            <p className="text-lg font-bold">Technologies: </p>
            <div className="flex gap-2.5">
              {jobOffer.languages.map((language, i) => (
                <p
                  className="bg-secondary-green-50 text-primary-green-400 font-bold px-2.5 py-space-primary rounded-md"
                  key={i}
                >
                  {language}
                </p>
              ))}
              {jobOffer.tools.map((tool, i) => (
                <p
                  className="bg-secondary-green-50 text-primary-green-400 font-bold px-2.5 py-space-primary rounded-md"
                  key={i}
                >
                  {tool}
                </p>
              ))}
            </div>
          </div>
          <Link
            to={'/'}
            className="inline-block bg-primary-green-400 hover:opacity-80 duration-200 text-white text-xl mt-4 px-6 pt-3 pb-2.5 rounded-md"
          >
            Back to home page
          </Link>
        </div>
        <div className="max-md:order-1">
          <div className="grid h-full place-items-center">
            <img
              src={jobOffer.logo}
              alt={jobOffer.company}
              className="size-48 md:size-72"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
