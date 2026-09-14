import Link from 'next/link';
import { redirect } from 'next/navigation';
import { StatusBar } from '@/features/shared';
import { getCurrentUser, getHistory } from '@/features/shared/api/server';

export default async function HistoryPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const history = await getHistory();

  return (
    <>
      <StatusBar user={user} />
      <main className="mx-auto grid max-w-3xl gap-8 px-4 py-6 md:gap-10 md:px-8 md:py-10">
        <div>
          <Link href="/" className="text-sm font-bold text-purple-600">
            Back to comments
          </Link>
          <h1 className="text-grey-800 mt-3 text-4xl font-bold">Your activity</h1>
          <p className="text-grey-500 mt-2">Comments and replies you have shared.</p>
        </div>
        <section className="grid gap-4">
          {history.length === 0 ? (
            <div className="rounded-lg bg-white p-8 text-center">No comments yet.</div>
          ) : (
            history.map(item => (
              <article key={item.id} className="rounded-lg bg-white p-6">
                <p className="text-grey-500 text-xs">
                  {item.parentId ? 'Reply' : 'Comment'} ·{' '}
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
                <p className="text-grey-800 mt-2">{item.content}</p>
              </article>
            ))
          )}
        </section>
      </main>
    </>
  );
}
