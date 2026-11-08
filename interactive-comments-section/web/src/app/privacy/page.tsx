import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { StatusBar } from '@/features/shared';
import { getCurrentUser } from '@/features/shared/api/server';

export const metadata: Metadata = {
  title: 'Privacy notice | Interactive comments section',
};

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="grid gap-2">
      <h2 id={id} className="text-grey-800 text-lg font-bold">
        {title}
      </h2>
      <p className="text-grey-500 max-w-prose leading-relaxed font-normal">{children}</p>
    </section>
  );
}

export default async function PrivacyPage() {
  const user = await getCurrentUser();

  return (
    <>
      <StatusBar user={user} />
      <main id="main" className="page">
        <div>
          <h1 className="page-title">Privacy notice</h1>
          <p className="page-subtitle">
            What this educational demo stores, where, and for how long.
          </p>
        </div>

        <div className="card grid gap-8">
          <Section id="privacy-what" title="What is stored">
            When you register, the app stores your username, email, securely hashed password,
            profile photo, comments, and votes so you can log in and take part. Passwords are
            never stored in plain text.
          </Section>

          <Section id="privacy-where" title="Where it is stored">
            The frontend is hosted on Vercel, the database on Neon Postgres, and profile photos
            in S3-compatible object storage.
          </Section>

          <Section id="privacy-retention" title="How long it is kept">
            Data is kept until you delete your account. Deleting your account from your profile
            removes your profile, comments, and votes.
          </Section>

          <Section id="privacy-choices" title="Your choices">
            You can change your username and photo, or delete your account, at any time from{' '}
            <Link href="/profile" className="link">
              your profile
            </Link>
            . You only need an account to comment, vote, and manage your profile.
          </Section>

          <Section id="privacy-contact" title="Contact">
            For questions or help deleting your data, get in touch on{' '}
            <a href="https://github.com/Denislav-Dimov" rel="noreferrer" className="link">
              GitHub
            </a>{' '}
            or{' '}
            <a
              href="https://www.frontendmentor.io/profile/Denislav-Dimov"
              rel="noreferrer"
              className="link"
            >
              Frontend Mentor
            </a>
            . This notice is for transparency only and is not legal advice.
          </Section>
        </div>
      </main>
    </>
  );
}
