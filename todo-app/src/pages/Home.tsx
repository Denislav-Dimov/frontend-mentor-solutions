import { doSignOut } from '../services/auth';

export default function Home() {
  return (
    <main>
      <div>Home</div>
      <button onClick={doSignOut}>Sign Out</button>
    </main>
  );
}
