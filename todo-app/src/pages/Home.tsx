import { useRef } from 'react';
import Title from '../components/Title';
import checkIcon from '../assets/icon-check.svg';

export default function Home() {
  const todoRef = useRef<HTMLInputElement>(null);

  function handleAddTodo() {
    if (!todoRef.current) return;

    const todoValue = todoRef.current.value.trim();

    if (!todoValue) return;

    todoRef.current.value = '';
  }

  return (
    <main className="w-full max-w-lg">
      <Title title="todo" isHomePage={true} />

      <section>
        <button
          onClick={handleAddTodo}
          className="bg-gradiant-primary size-6 rounded-full grid place-items-center cursor-pointer transition-all"
        >
          <img src={checkIcon} alt="" />
        </button>

        <input type="text" ref={todoRef} />
      </section>

      <section></section>
    </main>
  );
}
