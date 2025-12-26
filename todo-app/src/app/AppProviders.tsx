import { type PropsWithChildren } from 'react';
import { AuthProvider } from '../features/auth';
import { ThemeProvider } from '../features/theme';

export default function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
