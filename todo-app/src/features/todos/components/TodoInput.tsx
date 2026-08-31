import { useRef } from 'react';
import useTodos from '../hooks/useTodos';

export default function TodoInput() {
  const todoRef = useRef<HTMLInputElement>(null);
  const { createTodo } = useTodos();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!todoRef.current) return;

    const todoValue = todoRef.current.value.trim();

    if (!todoValue) return;
    
    todoRef.current.value = '';

    await createTodo(todoValue);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-light-gray-50 dark:bg-dark-navy-900 rounded-md flex items-center gap-6 px-6 py-4 shadow-light dark:shadow-dark mb-4 md:mb-6"
    >
      <button
        type="submit"
        className="size-5 md:size-6 rounded-full border border-light-gray-300 dark:border-dark-purple-800 cursor-pointer"
      ></button>

      <input
        type="text"
        ref={todoRef}
        placeholder="Create a new todo..."
        className="w-full border-none outline-none text-xs md:text-base text-light-navy-850 dark:text-dark-purple-100 placeholder:text-light-gray-600 dark:placeholder:text-dark-purple-600 pt-1 caret-primary-blue-500"
      />
    </form>
  );
}
