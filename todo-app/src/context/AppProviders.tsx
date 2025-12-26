import type { PropsWithChildren } from 'react';
import AuthProvider from './AuthProvider';
import ThemeProvider from './ThemeProvider';

export default function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
