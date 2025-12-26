import moonIcon from '../assets/icon-moon.svg';
import sunIcon from '../assets/icon-sun.svg';
import { useTheme } from '../features/theme';

type TitleProps = {
  title: string;
};

export default function Title({ title }: TitleProps) {
  const { isDark, toggleDark } = useTheme();

  return (
    <section className="flex justify-between items-center gap-4">
      <h1 className="uppercase text-3xl text-light-gray-50 dark:text-dark-purple-100 font-bold tracking-[0.35em] text-shadow-md">
        {title}
      </h1>

      <button
        onClick={toggleDark}
        className="cursor-pointer md:hover:opacity-60 duration-300 min-w-fit"
      >
        <img src={isDark ? sunIcon : moonIcon} alt="" />
      </button>
    </section>
  );
}
