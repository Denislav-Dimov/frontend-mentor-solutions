import { AuthForm } from '@/features/auth';

export default function RegisterPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-md place-items-center px-4 py-8 md:py-12">
      <AuthForm mode="register" />
    </main>
  );
}
