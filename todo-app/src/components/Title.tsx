import moonIcon from '../assets/icon-moon.svg';
// import sunIcon from '../assets/icon-sun.svg';

type TitleProps = {
  title: string;
};

export default function Title({ title }: TitleProps) {
  return (
    <section className="flex justify-between items-center gap-4">
      <h1 className="uppercase text-3xl text-light-gray-300 font-bold tracking-[0.35em] text-shadow-md">
        {title}
      </h1>

      <button>
        <img src={moonIcon} alt="" />
      </button>
    </section>
  );
}
