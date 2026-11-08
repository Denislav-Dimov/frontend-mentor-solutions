import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AccountSection, DeleteAccountSection, ProfileDetails } from '@/features/profile';
import { StatusBar } from '@/features/shared';
import { getCurrentUser } from '@/features/shared/api/server';

export const metadata: Metadata = {
  title: 'Your profile | Interactive comments section',
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login?returnTo=/profile');
  }

  return (
    <>
      <StatusBar user={user} />
      <main id="main" className="page">
        <div>
          <h1 className="page-title">Your profile</h1>
          <p className="page-subtitle">Manage how you appear and how you sign in.</p>
        </div>

        <ProfileDetails user={user} />
        <AccountSection />

        <section aria-labelledby="your-data-heading" className="card grid gap-1">
          <h2 id="your-data-heading" className="text-grey-800 text-lg font-bold">
            Your data
          </h2>
          <p className="text-grey-500 text-sm">
            Your username, email, hashed password, photo, comments, and votes are stored to run
            your account and kept until you delete it. Read the{' '}
            <Link href="/privacy" className="link">
              privacy notice
            </Link>{' '}
            for details.
          </p>
        </section>

        <DeleteAccountSection />
      </main>
    </>
  );
}
