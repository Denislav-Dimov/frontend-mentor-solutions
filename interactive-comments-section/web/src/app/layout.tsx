import type { Metadata } from 'next';
import Link from 'next/link';
import { Rubik } from 'next/font/google';
import { ToastProvider } from '@/features/shared';
import './globals.css';

const rubik = Rubik({
  variable: '--font-rubik',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'Frontend Mentor | Interactive comments section',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={rubik.variable}>
      <body className="flex min-h-dvh flex-col font-sans">
        <a
          href="#main"
          className="button-primary fixed top-3 left-3 z-70 translate-y-[-200%] focus:translate-y-0"
        >
          Skip to content
        </a>
        <ToastProvider>
          <div className="flex flex-1 flex-col">{children}</div>
        </ToastProvider>
        <footer className="mx-auto w-full max-w-3xl px-4 py-8 md:px-8">
          <p className="text-grey-500 text-center text-xs">
            Educational demo project.{' '}
            <Link href="/privacy" className="link">
              Privacy notice
            </Link>
          </p>
        </footer>
      </body>
    </html>
  );
}
