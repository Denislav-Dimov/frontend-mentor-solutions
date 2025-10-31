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
      className={`bg-white px-6 py-8 relative border-l-5 border-white rounded-md shadow-primary ${
        job.featured && 'border-l-5 border-l-primary-green-400'
      }`}
    >
      <img
        src={job.logo}
        alt={job.company}
        className="size-14 absolute -top-7"
      />

      <div className="flex items-center gap-6">
        <p className="text-primary-green-400 font-bold mt-1.5">{job.company}</p>
        <div className="flex gap-2.5">
          {job.new && (
            <p className="uppercase text-secondary-green-50 bg-primary-green-400 px-2.5 py-space-primary rounded-2xl text-base/tight font-bold grid">
              new!
            </p>
          )}
          {job.featured && (
            <p className="uppercase text-secondary-green-50 bg-secondary-gray-900 px-2.5 py-space-primary rounded-2xl text-base/tight font-bold grid">
              featured
            </p>
          )}
        </div>
      </div>

      <p className="my-2.5 font-bold text-lg">{job.position}</p>

      <div className="text-secondary-gray-400 flex items-center text-xl">
        <p>{job.postedAt}</p>
        <div className="bg-secondary-gray-400 size-1 mx-2.5 rounded-full"></div>
        <p>{job.contract}</p>
        <div className="bg-secondary-gray-400 size-1 mx-2.5 rounded-full"></div>
        <p>{job.location}</p>
      </div>

      <div className="my-3.5 bg-secondary-gray-400 w-full h-0.5 opacity-40" />

      <div className="flex flex-wrap gap-4">
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
