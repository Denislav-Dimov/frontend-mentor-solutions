import { useState, useEffect } from 'react';
import useAuth from '../../auth/hooks/useAuth';
import { type Todo } from '../types/todo.types';
import {
  doSubscribeToTodos,
  doCreateTodo,
  doUpdateTodo,
  doDeleteTodo,
} from '../services/todo.service';

export default function useTodos() {
  const { currentUser } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function getSubscription() {
      if (!currentUser) {
        setTodos([]);
        setIsLoading(false);
        return;
      }

      const unsubscribe = doSubscribeToTodos(currentUser.uid, fetchedTodos => {
        setTodos(fetchedTodos);
        setIsLoading(false);
      });

      return unsubscribe;
    }

    const subscriptionPromise = getSubscription();

    return () => {
      setIsLoading(true);
      subscriptionPromise.then(unsubscribe => {
        if (unsubscribe) {
          unsubscribe();
        }
      });
    };
  }, [currentUser]);

  async function createTodo(content: string) {
    if (!currentUser) return;

    try {
      await doCreateTodo(content, currentUser.uid);
    } catch (err) {
      setError('Failed to add todo');
      console.error(err);
    }
  }

  async function updateTodo(todoId: string, partToUpdateFromTodo: Partial<Todo>) {
    try {
      await doUpdateTodo(todoId, partToUpdateFromTodo);
    } catch (err) {
      setError('Failed to update todo');
      console.error(err);
    }
  }

  async function deleteTodo(todoId: string) {
    try {
      await doDeleteTodo(todoId);
    } catch (err) {
      setError('Failed to delete todo');
      console.error(err);
    }
  }

  return {
    todos,
    isLoading,
    error,
    createTodo,
    updateTodo,
    deleteTodo,
  };
}
