import Title from '../components/Title';

export default function Home() {
  return (
    <main className="w-full max-w-lg">
      <Title title="todo" isHomePage={true} />
    </main>
  );
}
