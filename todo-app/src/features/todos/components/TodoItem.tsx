import { type Todo } from '../types/todo.types';
import checkIcon from '../../../assets/icon-check.svg';
import crossIcon from '../../../assets/icon-cross.svg';

type TodoItemProps = {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
};

export default function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <div className="group flex items-center gap-3 md:gap-6 px-5 py-4 md:px-6 md:py-5 bg-light-gray-50 dark:bg-dark-navy-900 border-b border-light-gray-300 dark:border-dark-purple-800 transition-all duration-300 first:rounded-t-md">
      <button
        onClick={() => onToggle(todo.id, !todo.completed)}
        className={`size-5 md:size-6 rounded-full border flex items-center justify-center transition-all duration-300 ${
          todo.completed
            ? 'bg-linear-to-br from-[hsl(192,100%,67%)] to-[hsl(280,87%,65%)] border-transparent'
            : 'border-light-gray-300 dark:border-dark-purple-800 hover:border-primary-blue-500 dark:hover:border-primary-blue-500'
        }`}
      >
        {todo.completed && (
          <img src={checkIcon} alt="Completed" className="size-2 md:size-3" />
        )}
      </button>

      <p
        className={`flex-1 text-xs md:text-lg cursor-pointer transition-all duration-300 pt-1 ${
          todo.completed
            ? 'text-light-gray-300 dark:text-dark-purple-700 line-through'
            : 'text-light-navy-850 dark:text-dark-purple-100'
        }`}
        onClick={() => onToggle(todo.id, !todo.completed)}
      >
        {todo.content}
      </p>

      <button
        onClick={() => onDelete(todo.id)}
        className="md:opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <img src={crossIcon} alt="" className="size-3 md:size-4 cursor-pointer" />
      </button>
    </div>
  );
}
