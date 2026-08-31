import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="px-4 py-16 flex flex-col items-center justify-center text-center">
      <h2 className="mb-5 text-6xl md:text-7xl font-semibold">Whoops!</h2>
      <h3 className="mb-2 text-4xl md:text-5xl font-semibold">
        Something went wrong
      </h3>
      <p className="mb-6 max-w-sm md:text-lg">
        The page you're looking for isn't found, we suggest you back to home.
      </p>
      <Link
        to={'/'}
        className="inline-block bg-primary-green-400 hover:opacity-80 duration-200 text-white text-xl px-6 pt-3 pb-2.5 rounded-md"
      >
        Back to home page
      </Link>
    </section>
  );
}
