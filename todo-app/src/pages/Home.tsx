import Title from '../components/Title';
import { TodoInput, TodoList } from '../features/todos';

export default function Home() {
  return (
    <main className="w-full max-w-[540px] py-12">
      <Title title="todo" isHomePage={true} />

      <section className="mt-10">
        <TodoInput />
        <TodoList />
      </section>
    </main>
  );
}
