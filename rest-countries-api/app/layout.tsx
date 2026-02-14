import { type Metadata } from 'next';
import { Nunito_Sans } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import Header from '@/components/Header';
import '../styles/style.css';

const nunitoSans = Nunito_Sans({
  variable: '--font-nunito-sans',
  subsets: ['latin'],
  weight: ['300', '600', '800'],
});

export const metadata: Metadata = {
  title: 'Frontend Mentor | Rest Contries Api',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${nunitoSans.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NuqsAdapter>
            <Header />

            {children}
          </NuqsAdapter>
        </ThemeProvider>
      </body>
    </html>
  );
}
