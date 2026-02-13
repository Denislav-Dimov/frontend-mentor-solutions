import Link from 'next/link';
import { MoveLeft } from 'lucide-react';

export default function BackButton() {
  return (
    <Link
      href="/"
      className="flex items-center gap-3 bg-white dark:bg-dark-blue-900 px-8 py-2 rounded-lg shadow-md shadow-light-grey-950/20"
    >
      <MoveLeft className="size-5 text-light-grey-950 dark:text-white min-w-fit" />
      <span className="text-light-grey-400 dark:text-white">Back</span>
    </Link>
  );
}
