export default function Job({ job }) {
  function Role({ content }) {
    return (
      <span className="bg-secondary-green-50 text-primary-green-400 font-bold text-lg px-2.5 py-space-primary rounded-md">
        {content}
      </span>
    );
  }

  return (
    <div
      className={`bg-white px-6 py-8 md:px-10 md:py-6 relative border-l-5 border-white rounded-md shadow-primary ${
        job.featured && 'border-l-5 border-l-primary-green-400'
      } md:flex md:items-center md:justify-between md:gap-5`}
    >
      <div className="md:flex md:items-center md:gap-5">
        <img
          src={job.logo}
          alt={job.company}
          className="size-14 md:size-20 max-md:absolute max-md:-top-7"
        />

        <div>
          <div className="flex items-center gap-6 md:gap-4">
            <p className="text-primary-green-400 font-bold mt-1.5 md:text-lg">
              {job.company}
            </p>
            <div className="flex gap-2.5">
              {job.new && (
                <p className="uppercase text-secondary-green-50 bg-primary-green-400 px-2.5 py-space-primary rounded-2xl text-base/tight md:text-sm font-bold grid">
                  new!
                </p>
              )}
              {job.featured && (
                <p className="uppercase text-secondary-green-50 bg-secondary-gray-900 px-2.5 py-space-primary rounded-2xl text-base/tight md:text-sm font-bold grid">
                  featured
                </p>
              )}
            </div>
          </div>

          <p className="my-2.5 md:my-1.5 font-bold text-lg md:text-2xl">
            {job.position}
          </p>

          <div className="text-secondary-gray-400 flex items-center text-xl">
            <p>{job.postedAt}</p>
            <div className="bg-secondary-gray-400 opacity-60 size-1 mx-2.5 md:mx-4.5 rounded-full"></div>
            <p>{job.contract}</p>
            <div className="bg-secondary-gray-400 opacity-60 size-1 mx-2.5 md:mx-4.5 rounded-full"></div>
            <p>{job.location}</p>
          </div>
        </div>
      </div>

      <div className="md:hidden my-3.5 bg-secondary-gray-400 w-full h-0.5 opacity-40" />

      <div className="flex flex-wrap gap-4 md:flex-5 md:justify-end">
        <Role content={job.role} />
        <Role content={job.level} />
        {job.languages.map((language) => (
          <Role content={language} key={language} />
        ))}
        {job.tools.map((tool) => (
          <Role content={tool} key={tool} />
        ))}
      </div>
    </div>
  );
}
