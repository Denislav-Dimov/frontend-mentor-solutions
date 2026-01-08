import { useState, useRef, useEffect } from 'react';
import moonIcon from '../assets/icon-moon.svg';
import sunIcon from '../assets/icon-sun.svg';
import { Settings, LogOut, UserX } from 'lucide-react';
import { useTheme } from '../features/theme';
import { doSignOut } from '../features/auth';
import useOutsideClick from '../hooks/useOutsideClick';

type TitleProps = {
  title: string;
  isHomePage?: boolean;
};

export default function Title({ title, isHomePage = false }: TitleProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const showDeletePopupRef = useOutsideClick(() => setShowDeletePopup(false));
  const { isDark, toggleDark } = useTheme();
  const firstButtonRef = useRef<HTMLButtonElement | null>(null);

  // for keyboard navigation
  useEffect(() => {
    if (showPopup && firstButtonRef.current) {
      firstButtonRef.current.focus();
    }
  }, [showPopup]);

  return (
    <section className="relative flex justify-between items-center gap-4">
      <h1 className="uppercase text-3xl text-light-gray-50 dark:text-dark-purple-100 font-bold tracking-[0.35em] text-shadow-md">
        {title}
      </h1>

      {showPopup && (
        <div className="absolute top-full mt-1 right-0 bg-light-gray-50 dark:bg-dark-navy-900 px-6 py-5 space-y-4 rounded-md shadow-light dark:shadow-dark animate-slide-down">
          <div className="flex items-center justify-between gap-4 text-lg">
            Theme
            <button
              ref={firstButtonRef}
              onClick={toggleDark}
              className="cursor-pointer md:hover:opacity-60 duration-300 min-w-fit"
            >
              <img
                src={isDark ? sunIcon : moonIcon}
                alt=""
                className="text-dark-navy-950 invert dark:invert-0"
              />
            </button>
          </div>
          <div className="flex items-center justify-between gap-4 text-lg">
            Sign Out
            <button
              onClick={doSignOut}
              className="cursor-pointer md:hover:opacity-60 duration-300 min-w-fit"
            >
              <LogOut strokeWidth={3} />
            </button>
          </div>
          <div className="flex items-center justify-between gap-4 text-lg">
            <p className="text-primary-red font-bold">Delete Account</p>
            <button
              onClick={() => setShowDeletePopup(true)}
              className="cursor-pointer md:hover:text-primary-red transition duration-300 min-w-fit"
            >
              <UserX strokeWidth={3} />
            </button>
          </div>
        </div>
      )}

      {showDeletePopup && (
        <section className="fixed inset-0 z-50 px-5 h-screen grid place-items-center bg-overlay-navy-900 animate-fade-in">
          <div
            ref={showDeletePopupRef}
            className="bg-light-gray-50 dark:bg-dark-navy-900 flex flex-col items-end justify-start gap-5 rounded-lg p-8 max-w-sm w-full text-center text-lg animate-slide-up"
          >
            <p>Are you sure you want to delete your account?</p>
            <div className="grid grid-cols-2 gap-4 w-full">
              <button
                onClick={() => {}}
                className="bg-light-gray-300 dark:bg-dark-navy-950 text-primary-red font-bold w-full p-2.5 rounded-lg hover:opacity-80 duration-200 cursor-pointer"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeletePopup(false)}
                className="bg-light-gray-300 dark:bg-dark-navy-950 font-bold w-full p-2.5 rounded-lg hover:opacity-80 duration-200 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </section>
      )}

      {isHomePage ? (
        <button
          onClick={() => setShowPopup(prev => !prev)}
          className="cursor-pointer md:hover:opacity-60 duration-300 min-w-fit"
        >
          <Settings className="size-8" />
        </button>
      ) : (
        <button
          onClick={toggleDark}
          className="cursor-pointer md:hover:opacity-60 duration-300 min-w-fit"
        >
          <img src={isDark ? sunIcon : moonIcon} alt="" />
        </button>
      )}
    </section>
  );
}
