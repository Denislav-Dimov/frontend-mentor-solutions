import Link from 'next/link';
import Image from 'next/image';
import GuestPrompt from './GuestPrompt';

type Props = {
  user: {
    username: string;
    avatarUrl: string;
  } | null;
};

export default function StatusBar({ user }: Props) {
  return (
    <header className="relative bg-transparent">
      <div className="sticky top-0 mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-6 md:gap-6 md:px-8">
        <nav aria-label="Account" className="flex min-w-0 items-center gap-4 md:gap-5">
          <Link href="/" className="text-sm font-bold text-purple-600 hover:underline">
            Comments
          </Link>
          {user ? (
            <Link
              href="/history"
              className="text-sm font-bold text-purple-600 hover:underline"
            >
              My activity
            </Link>
          ) : (
            <GuestPrompt action="view your activity">
              <span className="text-sm font-bold text-purple-600">My activity</span>
            </GuestPrompt>
          )}
        </nav>
        {user ? (
          <Link
            href="/profile"
            className="flex items-center gap-3 rounded-lg p-1 transition-opacity hover:opacity-70"
          >
            <span className="text-grey-800 hidden text-sm font-bold sm:inline">
              {user.username}
            </span>
            <Image
              src={user.avatarUrl}
              alt=""
              width={32}
              height={32}
              unoptimized
              className="h-8 w-8 rounded-full object-cover"
            />
          </Link>
        ) : (
          <div className="flex items-center gap-4 text-sm font-bold">
            <Link href="/login" className="text-purple-600 hover:underline">
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-[5px] bg-purple-600 px-4 py-2 text-white transition-opacity hover:opacity-50"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
