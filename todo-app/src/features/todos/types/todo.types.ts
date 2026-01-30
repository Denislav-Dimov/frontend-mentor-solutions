export type Todo = {
  id: string;
  userId: string;
  content: string;
  completed: boolean;
  position: number;
};

export type FilterType = 'all' | 'active' | 'completed';
