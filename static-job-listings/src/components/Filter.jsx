export default function Filter({ filters, removeFilter, clearFiltes }) {
  function Role({ content }) {
    return (
      <div className="flex rounded-md overflow-hidden">
        <div className="bg-secondary-green-50 text-primary-green-400 font-bold text-lg px-2.5 py-space-primary">
          {content}
        </div>
        <button
          onClick={() => removeFilter(content)}
          className="p-2 bg-primary-green-400 text-secondary-green-50 hover:bg-secondary-gray-900 duration-200 cursor-pointer"
        >
          <img src="../../images/icon-remove.svg" alt="" />
        </button>
      </div>
    );
  }

  if (filters.length == 0) {
    return <div className="mb-14 md:mb-16"></div>;
  }

  return (
    <div className="bg-white relative -top-8 md:-top-10 mb-5 flex justify-between gap-5 w-full max-w-7xl mx-auto p-6 md:px-12 rounded-md shadow-primary">
      <div className="flex flex-wrap gap-4">
        {filters.map((filter, index) => (
          <Role key={index} content={filter} />
        ))}
      </div>
      <button
        onClick={() => clearFiltes()}
        className="text-secondary-gray-400 text-lg font-bold mr-1.5 hover:text-primary-green-400 hover:underline duration-200 cursor-pointer"
      >
        Clear
      </button>
    </div>
  );
}
