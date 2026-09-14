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
      </main>
    </>
  );
}
