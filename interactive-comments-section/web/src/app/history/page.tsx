import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { RelativeTime } from '@/features/history';
import { StatusBar } from '@/features/shared';
import { getCurrentUser, getHistory } from '@/features/shared/api/server';

export const metadata: Metadata = {
  title: 'Your activity | Interactive comments section',
};

export default async function HistoryPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login?returnTo=/history');
  }

  const history = await getHistory();

  return (
    <>
      <StatusBar user={user} />
      <main id="main" className="page">
        <div>
          <h1 className="page-title">Your activity</h1>
          <p className="page-subtitle">Every comment and reply you’ve posted.</p>
        </div>

        {history.length === 0 ? (
          <section className="card grid justify-items-center gap-4 text-center">
            <div className="grid gap-1">
              <h2 className="text-grey-800 text-lg font-bold">Nothing here yet</h2>
              <p className="text-grey-500 text-sm">
                Comments and replies you post will show up here.
              </p>
            </div>
            <Link href="/" className="button-primary">
              Join the conversation
            </Link>
          </section>
        ) : (
          <ul aria-label="Your comments and replies" className="grid gap-4">
            {history.map(item => (
              <li key={item.id}>
                <article className="card grid gap-3">
                  <p className="flex flex-wrap items-center gap-3 text-sm">
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                        item.parentId
                          ? 'bg-grey-100 text-grey-800'
                          : 'bg-purple-600 text-white'
                      }`}
                    >
                      {item.parentId ? 'Reply' : 'Comment'}
                    </span>
                    <span className="text-grey-500">
                      <RelativeTime dateTime={item.createdAt} />
                    </span>
                  </p>
                  <p className="text-grey-800 font-normal break-words whitespace-pre-wrap">
                    {item.content}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
