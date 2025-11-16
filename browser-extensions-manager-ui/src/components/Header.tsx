import useTheme from '../hooks/useTheme';

const path = {
  themeIconLight: '/images/icon-moon.svg',
  themeIconDark: '/images/icon-sun.svg',
  logoLight: '/images/logo-light.svg',
  logoDark: '/images/logo-dark.svg',
};

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-between w-full bg-neutral-0 dark:bg-neutral-800 shadow-md py-2 px-3 rounded-2xl">
      <img
        src={`${theme === 'dark' ? path.logoDark : path.logoLight}`}
        alt="extensions logo"
      />
      <button
        onClick={toggleTheme}
        className="bg-neutral-100 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 outline-2 outline-transparent outline-offset-2 focus-visible:outline-red-400 duration-200 rounded-xl p-3.5 cursor-pointer"
      >
        <img
          src={`${theme === 'dark' ? path.themeIconDark : path.themeIconLight}`}
          alt=""
        />
      </button>
    </header>
  );
}
