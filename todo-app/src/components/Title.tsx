import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FirebaseError } from 'firebase/app';
import moonIcon from '../assets/icon-moon.svg';
import sunIcon from '../assets/icon-sun.svg';
import { Settings, LogOut, UserX } from 'lucide-react';
import { useTheme } from '../features/theme';
import { useAuth, doDeleteUser, doSignOut, doSignInWithGoogle } from '../features/auth';
import useOutsideClick from '../hooks/useOutsideClick';

type TitleProps = {
  title: string;
  isHomePage?: boolean;
};

export default function Title({ title, isHomePage = false }: TitleProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const showDeletePopupRef = useOutsideClick(() => setShowDeletePopup(false));
  const [isDeleting, setIsDeleting] = useState(false);
  const { isDark, toggleDark } = useTheme();
  const { currentUser } = useAuth();
  const firstButtonRef = useRef<HTMLButtonElement | null>(null);
  const navigate = useNavigate();

  // for keyboard navigation
  useEffect(() => {
    if (showPopup && firstButtonRef.current) {
      firstButtonRef.current.focus();
    }
  }, [showPopup]);

  async function handleDeleteUser() {
    if (!currentUser || isDeleting) return;

    setIsDeleting(true);

    try {
      await doDeleteUser(currentUser);
    } catch (error) {
      console.log(error);

      if (error instanceof FirebaseError) {
        if (error.code === 'auth/requires-recent-login') {
          if (currentUser.providerData && currentUser.providerData.length > 0) {
            const signInMethod = currentUser.providerData[0].providerId;

            if (signInMethod === 'password') {
              navigate('/reauthenticate');
            }

            if (signInMethod === 'google.com') {
              await doSignInWithGoogle();
              await doDeleteUser(currentUser);
            }
          }
        }
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section className="relative flex justify-between items-center gap-4">
      <h1 className="uppercase text-3xl text-light-gray-50 dark:text-dark-purple-100 font-bold tracking-[0.35em] text-shadow-md break-all">
        {title}
      </h1>

      {showPopup && (
        <div className="absolute z-50 top-full w-60 mt-1 right-0 bg-light-gray-50 dark:bg-dark-navy-900 px-6 py-5 space-y-4 rounded-md shadow-light dark:shadow-dark animate-slide-down">
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
          <p className="text-light-navy-850/60 dark:text-dark-purple-100/60 italic wrap-break-word">
            {currentUser?.email}
          </p>
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
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="bg-light-gray-300 dark:bg-dark-navy-950 text-primary-red font-bold w-full p-2.5 rounded-lg hover:opacity-80 duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeletePopup(false)}
                className="bg-light-gray-300 dark:bg-dark-navy-950 font-bold w-full p-2.5 rounded-lg hover:opacity-80 duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
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
          className="cursor-pointer md:hover:opacity-60 duration-300 min-w-fit text-light-gray-50"
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
