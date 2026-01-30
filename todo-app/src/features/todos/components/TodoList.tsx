import { useState } from 'react';
import { type FilterType } from '../types/todo.types';
import useTodos from '../hooks/useTodos';
import TodoItem from './TodoItem';
import FilterButton from './FilterButton';

export default function TodoList() {
  const { todos, isLoading, updateTodo, deleteTodo } = useTodos();
  const [filter, setFilter] = useState<FilterType>('all');
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeTodosCount = todos.filter(todo => !todo.completed).length;

  function handleClearCompleted() {
    const completedTodos = todos.filter(todo => todo.completed);
    completedTodos.forEach(async todo => {
      await deleteTodo(todo.id);
    });
  }

  async function handleDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault();

    if (!draggedItemId || draggedItemId === targetId) return;

    const draggedIdx = todos.findIndex(t => t.id === draggedItemId);
    const targetIdx = todos.findIndex(t => t.id === targetId);

    if (draggedIdx === -1 || targetIdx === -1) return;

    function calculateNewPosition() {
      const targetItem = todos[targetIdx];
      if (targetIdx === 0) return targetItem.position - 1024;
      if (targetIdx === todos.length - 1) return targetItem.position + 1024;

      if (draggedIdx < targetIdx) {
        const after = todos[targetIdx + 1];
        return after
          ? (targetItem.position + after.position) / 2
          : targetItem.position + 1024;
      } else {
        const before = todos[targetIdx - 1];
        return before
          ? (targetItem.position + before.position) / 2
          : targetItem.position - 1024;
      }
    }

    await updateTodo(draggedItemId, { position: calculateNewPosition() });
    setDraggedItemId(null);
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="bg-light-gray-50 dark:bg-dark-navy-900 rounded-[5px] shadow-light dark:shadow-dark overflow-hidden transition-colors duration-300">
        {isLoading ? (
          <p className="text-light-gray-600 dark:text-dark-purple-600 text-center p-3 md:p-6">
            Loading todos...
          </p>
        ) : (
          <ul>
            {filteredTodos.length === 0 && (
              <li className="p-5 md:p-6 text-center border-b border-light-gray-300 dark:border-dark-purple-800">
                <p className="text-light-gray-600 dark:text-dark-purple-600 text-xs md:text-lg">
                  No {filter !== 'all' ? filter : ''} todos found.
                </p>
              </li>
            )}

            {filteredTodos.map(todo => (
              <li
                key={todo.id}
                draggable
                onDragStart={() => setDraggedItemId(todo.id)}
                onDragOver={e => e.preventDefault()}
                onDrop={e => handleDrop(e, todo.id)}
              >
                <TodoItem
                  todo={todo}
                  onToggle={(id, completed) => updateTodo(id, { completed })}
                  onDelete={deleteTodo}
                />
              </li>
            ))}
          </ul>
        )}

        {/* desktop */}
        <div className="flex items-center justify-between px-5 py-4 md:px-6 md:py-5 text-[10px] md:text-sm text-light-gray-600 dark:text-dark-purple-600">
          <span>{activeTodosCount} items left</span>

          <div className="hidden md:flex items-center gap-4 font-bold">
            <FilterButton
              text="All"
              active={filter === 'all'}
              onClick={() => setFilter('all')}
            />
            <FilterButton
              text="Active"
              active={filter === 'active'}
              onClick={() => setFilter('active')}
            />
            <FilterButton
              text="Completed"
              active={filter === 'completed'}
              onClick={() => setFilter('completed')}
            />
          </div>

          <button
            onClick={handleClearCompleted}
            className="hover:text-light-navy-850 dark:hover:text-dark-purple-100 transition-all cursor-pointer"
          >
            Clear Completed
          </button>
        </div>
      </div>

      {/* mobile */}
      <div className="md:hidden flex items-center justify-center gap-5 bg-light-gray-50 dark:bg-dark-navy-900 rounded-[5px] px-5 py-4 shadow-light dark:shadow-dark font-bold text-sm text-light-gray-600 dark:text-dark-purple-600 transition-colors duration-300">
        <FilterButton
          text="All"
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        />
        <FilterButton
          text="Active"
          active={filter === 'active'}
          onClick={() => setFilter('active')}
        />
        <FilterButton
          text="Completed"
          active={filter === 'completed'}
          onClick={() => setFilter('completed')}
        />
      </div>

      <p className="mt-10 md:mt-12 text-center text-sm text-light-gray-600 dark:text-dark-purple-600">
        Drag and drop to reorder list
      </p>
    </div>
  );
}
