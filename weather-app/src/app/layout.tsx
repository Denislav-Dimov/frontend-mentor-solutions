import type { Metadata } from 'next';
import { DM_Sans, Bricolage_Grotesque } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['300', '500', '600', '600', '700'],
});

const bricolageGrotesque = Bricolage_Grotesque({
  variable: '--font-bricolage-grotesque',
  subsets: ['latin'],
  weight: ['700'],
});

export const metadata: Metadata = {
  title: 'Frontend Mentor | Weather app',
  description: 'Frontend Mentor Weather App Challenge Solution',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${bricolageGrotesque.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
