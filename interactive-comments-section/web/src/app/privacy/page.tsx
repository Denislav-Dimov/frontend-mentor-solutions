import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="mx-auto grid max-w-2xl gap-8 p-4 md:p-10">
      <div>
        <Link href="/" className="text-sm font-bold text-purple-600 hover:underline">
          Back to comments
        </Link>
        <h1 className="text-grey-800 mt-2 text-4xl font-bold">Privacy notice</h1>
        <p className="text-grey-500 mt-2">
          Educational portfolio project. This notice explains what the live demo stores.
        </p>
      </div>

      <section className="grid gap-4 rounded-lg bg-white p-7 md:p-9">
        <h2 className="text-grey-800 text-xl font-bold">What is stored</h2>
        <p className="text-grey-500 text-sm">
          When you register, the app stores your username, email, securely hashed password,
          avatar image, comments, and votes so you can log in and participate. Passwords are
          never stored in plain text.
        </p>

        <h2 className="text-grey-800 text-xl font-bold">Where it is stored</h2>
        <p className="text-grey-500 text-sm">
          Hosting and storage are provided by Vercel for the frontend, Neon Postgres for the
          database, and S3-compatible object storage for avatars.
        </p>

        <h2 className="text-grey-800 text-xl font-bold">How long it is kept</h2>
        <p className="text-grey-500 text-sm">
          Data is kept until you delete your account. Deleting your account from the profile
          page removes your profile, comments, and reactions.
        </p>

        <h2 className="text-grey-800 text-xl font-bold">Your choices</h2>
        <p className="text-grey-500 text-sm">
          You can update your username and avatar or delete your account at any time from{' '}
          <Link href="/profile" className="font-bold text-purple-600 hover:underline">
            your profile
          </Link>
          . Logging in is only needed to comment, vote, and manage your profile.
        </p>

        <h2 className="text-grey-800 text-xl font-bold">Contact</h2>
        <p className="text-grey-500 text-sm">
          For questions or deletion help, contact via{' '}
          <a
            href="https://github.com/Denislav-Dimov"
            className="font-bold text-purple-600 hover:underline"
          >
            GitHub
          </a>{' '}
          or{' '}
          <a
            href="https://www.frontendmentor.io/profile/Denislav-Dimov"
            className="font-bold text-purple-600 hover:underline"
          >
            Frontend Mentor
          </a>
          . This notice is for transparency only and is not legal advice.
        </p>
      </section>
    </main>
  );
}
