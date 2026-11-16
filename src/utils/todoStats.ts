import {
  CategoryProgressStat,
  ProgressStats,
  TODO_CATEGORIES,
  TodoCategory,
  TodoItem,
} from '../types/todo';

export function computeProgressStats(todos: TodoItem[]): ProgressStats {
  const total = todos.length;
  let completed = 0;
  let lastCompletedItem: TodoItem | null = null;

  const categoryMap = new Map<TodoCategory, { total: number; completed: number }>();
  for (const cat of TODO_CATEGORIES) {
    categoryMap.set(cat, { total: 0, completed: 0 });
  }

  for (const item of todos) {
    const bucket = categoryMap.get(item.category) ?? { total: 0, completed: 0 };
    bucket.total += 1;

    if (item.completed) {
      completed += 1;
      bucket.completed += 1;
      if (
        item.completedAt !== null &&
        (lastCompletedItem === null ||
          (lastCompletedItem.completedAt ?? 0) < item.completedAt)
      ) {
        lastCompletedItem = item;
      }
    }

    categoryMap.set(item.category, bucket);
  }

  const pending = total - completed;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);
  const pendingRate = total === 0 ? 0 : 100 - completionRate;

  const categoryBreakdown: CategoryProgressStat[] = TODO_CATEGORIES.map((category) => {
    const counts = categoryMap.get(category) ?? { total: 0, completed: 0 };
    const catPending = counts.total - counts.completed;
    const percentage =
      counts.total === 0 ? 0 : Math.round((counts.completed / counts.total) * 100);
    return {
      category,
      total: counts.total,
      completed: counts.completed,
      pending: catPending,
      percentage,
    };
  });

  return {
    total,
    completed,
    pending,
    completionRate,
    pendingRate,
    categoryBreakdown,
    lastCompletedItem,
  };
}

export interface ParsedListEntry {
  title: string;
  completed: boolean;
}

export function parseTodoListInput(rawText: string): ParsedListEntry[] {
  return rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      // Support markdown checkboxes like "- [x] Task" or "[ ] Task"
      const checkedMatch = line.match(/^(?:[-*•]\s*)?\[[xX]\]\s+(.+)$/);
      if (checkedMatch) {
        return { title: checkedMatch[1].trim(), completed: true };
      }
      const uncheckedMatch = line.match(/^(?:[-*•]\s*)?\[\s?\]\s+(.+)$/);
      if (uncheckedMatch) {
        return { title: uncheckedMatch[1].trim(), completed: false };
      }
      // Strip standard bullet or numbered list prefixes
      const stripped = line.replace(/^(?:[-*•]|\d+[.)])\s+/, '').trim();
      return { title: stripped, completed: false };
    })
    .filter((entry) => entry.title.length > 0);
}

export function createTodoId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `todo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatRelativeTime(timestamp: number): string {
  const diffSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (diffSeconds < 60) return 'Just now';
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export const INITIAL_SAMPLE_TODOS: TodoItem[] = [
  {
    id: 'sample-1',
    title: 'Finalize weekly sprint priorities and assign owners',
    completed: true,
    category: 'Planning',
    createdAt: Date.now() - 1000 * 60 * 180,
    completedAt: Date.now() - 1000 * 60 * 95,
  },
  {
    id: 'sample-2',
    title: 'Review pull requests for authentication middleware',
    completed: true,
    category: 'Development',
    createdAt: Date.now() - 1000 * 60 * 150,
    completedAt: Date.now() - 1000 * 60 * 42,
  },
  {
    id: 'sample-3',
    title: 'Draft release notes for v2.4 deployment window',
    completed: false,
    category: 'Operations',
    createdAt: Date.now() - 1000 * 60 * 120,
    completedAt: null,
  },
  {
    id: 'sample-4',
    title: 'Audit database backup retention policy',
    completed: false,
    category: 'Operations',
    createdAt: Date.now() - 1000 * 60 * 90,
    completedAt: null,
  },
  {
    id: 'sample-5',
    title: 'Implement keyboard navigation on task checklist rows',
    completed: true,
    category: 'Development',
    createdAt: Date.now() - 1000 * 60 * 75,
    completedAt: Date.now() - 1000 * 60 * 18,
  },
  {
    id: 'sample-6',
    title: 'Prepare design critique slides for Thursday sync',
    completed: false,
    category: 'Planning',
    createdAt: Date.now() - 1000 * 60 * 50,
    completedAt: null,
  },
  {
    id: 'sample-7',
    title: 'Schedule annual dental checkup and renew gym pass',
    completed: false,
    category: 'Personal',
    createdAt: Date.now() - 1000 * 60 * 30,
    completedAt: null,
  },
];
