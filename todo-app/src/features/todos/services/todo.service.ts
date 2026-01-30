import { db } from '../../../config/firebase';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  limit,
} from 'firebase/firestore';
import { type Todo } from '../types/todo.types';

const COLLECTION_NAME = 'todos';

export function doSubscribeToTodos(userId: string, callback: (todos: Todo[]) => void) {
  const todosRef = collection(db, COLLECTION_NAME);
  const q = query(todosRef, where('userId', '==', userId), orderBy('position', 'asc'));

  return onSnapshot(q, snapshot => {
    const todos = snapshot.docs.map(
      (doc): Todo => ({
        id: doc.id,
        content: doc.data().content,
        completed: doc.data().completed,
        userId: doc.data().userId,
        position: doc.data().position,
      }),
    );

    callback(todos);
  });
}

export async function doCreateTodo(content: string, userId: string) {
  const todosRef = collection(db, COLLECTION_NAME);
  const q = query(
    todosRef,
    where('userId', '==', userId),
    orderBy('position', 'asc'),
    limit(1),
  );
  const querySnapshot = await getDocs(q);

  let nextPosition = 1024; // default starting position

  if (!querySnapshot.empty) {
    const firstTodo = querySnapshot.docs[0].data();
    nextPosition = firstTodo.position - 1024;
  }

  await addDoc(todosRef, {
    content,
    completed: false,
    userId,
    position: nextPosition,
  });
}

export async function doUpdateTodo(todoId: string, partToUpdateFromTodo: Partial<Todo>) {
  const todoRef = doc(db, COLLECTION_NAME, todoId);
  await updateDoc(todoRef, partToUpdateFromTodo);
}

export async function doDeleteTodo(todoId: string) {
  const todoRef = doc(db, COLLECTION_NAME, todoId);
  await deleteDoc(todoRef);
}
