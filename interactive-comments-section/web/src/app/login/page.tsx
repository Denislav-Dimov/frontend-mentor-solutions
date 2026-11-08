import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AuthForm, getSafeReturnTo } from '@/features/auth';
import { StatusBar } from '@/features/shared';
import { getCurrentUser } from '@/features/shared/api/server';

export const metadata: Metadata = {
  title: 'Log in | Interactive comments section',
};

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  const [user, params] = await Promise.all([getCurrentUser(), searchParams]);
  if (user) {
    redirect('/');
  }

  return (
    <>
      <StatusBar user={null} />
      <main id="main" className="page">
        <div className="card mx-auto w-full max-w-md">
          <AuthForm mode="login" returnTo={getSafeReturnTo(params.returnTo)} />
        </div>
      </main>
    </>
  );
}
