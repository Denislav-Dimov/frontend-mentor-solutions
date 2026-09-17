import type { Metadata } from 'next';
import { Rubik } from 'next/font/google';
import { ToastProvider } from '@/features/shared';
import './globals.css';

const RubikFont = Rubik({
  variable: '--font-rubik',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'Frontend Mentor | Interactive comments section',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${RubikFont.variable} h-full antialiased`}>
      <body className="font-sans">
        <ToastProvider>{children}</ToastProvider>
        <footer className="mx-auto w-full max-w-3xl px-4 pb-8 md:px-8">
          <p className="text-grey-500 text-center text-xs">
            Educational demo project.{' '}
            <a href="/privacy" className="font-bold text-purple-600 hover:underline">
              Privacy notice
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
