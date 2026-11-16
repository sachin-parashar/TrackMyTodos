export type TodoCategory = 'Planning' | 'Development' | 'Operations' | 'Personal';

export type TodoFilter = 'all' | 'pending' | 'completed';

export type TodoSort = 'newest' | 'status' | 'alphabetical';

export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  category: TodoCategory;
  createdAt: number;
  completedAt: number | null;
}

export interface CategoryProgressStat {
  category: TodoCategory;
  total: number;
  completed: number;
  pending: number;
  percentage: number;
}

export interface ProgressStats {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
  pendingRate: number;
  categoryBreakdown: CategoryProgressStat[];
  lastCompletedItem: TodoItem | null;
}

export const TODO_CATEGORIES: TodoCategory[] = [
  'Planning',
  'Development',
  'Operations',
  'Personal',
];
