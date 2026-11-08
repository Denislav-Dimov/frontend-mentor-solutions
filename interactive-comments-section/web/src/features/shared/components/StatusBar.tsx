import Link from 'next/link';
import Image from 'next/image';
import GuestPrompt from './GuestPrompt';
import NavLink from './NavLink';

type Props = {
  user: {
    username: string;
    avatarUrl: string;
  } | null;
};

const navItemClass = 'inline-block py-2 text-sm font-medium';

export default function StatusBar({ user }: Props) {
  return (
    <header className="border-grey-100 border-b bg-white">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-3 md:px-8">
        <nav aria-label="Main">
          <ul className="flex items-center gap-5 md:gap-6">
            <li>
              <NavLink href="/" className={navItemClass}>
                Comments
              </NavLink>
            </li>
            <li>
              {user ? (
                <NavLink href="/history" className={navItemClass}>
                  My activity
                </NavLink>
              ) : (
                <GuestPrompt
                  action="view your activity"
                  className={`${navItemClass} text-grey-500 hover:text-grey-800 transition-colors`}
                >
                  My activity
                </GuestPrompt>
              )}
            </li>
          </ul>
        </nav>

        {user ? (
          <NavLink
            href="/profile"
            className="hover:bg-grey-50 -mr-2 flex items-center gap-3 rounded-lg py-1 pr-2 pl-3"
          >
            <span className="text-grey-800 sr-only text-sm font-medium sm:not-sr-only">
              {user.username}
            </span>
            <Image
              src={user.avatarUrl}
              alt=""
              width={32}
              height={32}
              unoptimized
              className="size-8 rounded-full object-cover"
            />
          </NavLink>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/login" className="link text-sm">
              Log in
            </Link>
            <Link href="/register" className="button-primary px-4 py-1.5 text-sm">
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
