import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ProfileForm } from '@/features/profile';
import { StatusBar } from '@/features/shared';
import { getCurrentUser } from '@/features/shared/api/server';

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <>
      <StatusBar user={user} />

      <main className="mx-auto grid max-w-2xl gap-8 p-4 md:p-10">
        <div>
          <Link href="/history" className="text-sm font-bold text-purple-600">
            View comment history
          </Link>
          <h1 className="text-grey-800 mt-2 text-4xl font-bold">Your profile</h1>
          <p className="text-grey-500 mt-2">
            Manage your public profile and account preferences.
          </p>
        </div>

        <ProfileForm user={user} />

        <section
          aria-labelledby="profile-data-notice"
          className="rounded-lg bg-white p-7 md:p-9"
        >
          <h2 id="profile-data-notice" className="text-grey-800 font-bold">
            Your data
          </h2>
          <p className="text-grey-500 mt-1 text-sm">
            Educational demo. Your username, email, hashed password, avatar,
            comments, and votes are stored to run your account and are kept until
            you delete your account above. See the{' '}
            <Link href="/privacy" className="font-bold text-purple-600 hover:underline">
              privacy notice
            </Link>{' '}
            for details.
          </p>
        </section>
      </main>
    </>
  );
}
