'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentProps } from 'react';

type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: string };

export default function NavLink({ href, className = '', ...props }: Props) {
  const pathname = usePathname();
  const isCurrent = pathname === href;

  return (
    <Link
      href={href}
      aria-current={isCurrent ? 'page' : undefined}
      className={`text-grey-500 hover:text-grey-800 transition-colors aria-[current=page]:text-purple-600 ${className}`}
      {...props}
    />
  );
}
