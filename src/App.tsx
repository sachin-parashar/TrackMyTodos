/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Plus, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ProgressAnalyticsPanel } from './components/ProgressAnalyticsPanel';
import { ProgressSummaryStrip } from './components/ProgressSummaryStrip';
import { TodoInputBar } from './components/TodoInputBar';
import { TodoListSection } from './components/TodoListSection';
import {
  TodoCategory,
  TodoFilter,
  TodoItem,
  TodoSort,
} from './types/todo';
import {
  INITIAL_SAMPLE_TODOS,
  ParsedListEntry,
  computeProgressStats,
  createTodoId,
} from './utils/todoStats';

const STORAGE_KEY = 'cadence_todos_v1';

function loadInitialTodos(): TodoItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) {
      return INITIAL_SAMPLE_TODOS;
    }
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // Ignore storage read errors
  }
  return INITIAL_SAMPLE_TODOS;
}

export default function App() {
  const [todos, setTodos] = useState<TodoItem[]>(loadInitialTodos);
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<TodoSort>('newest');
  const [recentlyCleared, setRecentlyCleared] = useState<TodoItem[] | null>(null);

  const singleInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch {
      // Ignore storage write errors
    }
  }, [todos]);

  const stats = useMemo(() => computeProgressStats(todos), [todos]);

  const filteredAndSortedTodos = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = todos.filter((item) => {
      if (filter === 'pending' && item.completed) return false;
      if (filter === 'completed' && !item.completed) return false;
      if (query) {
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCategory) return false;
      }
      return true;
    });

    const sorted = [...filtered];
    if (sortBy === 'newest') {
      sorted.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortBy === 'status') {
      sorted.sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        return b.createdAt - a.createdAt;
      });
    } else if (sortBy === 'alphabetical') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    }

    return sorted;
  }, [todos, filter, searchQuery, sortBy]);

  const focusAddInput = () => {
    singleInputRef.current?.focus();
    singleInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleAddSingle = (title: string, category: TodoCategory) => {
    const now = Date.now();
    const newItem: TodoItem = {
      id: createTodoId(),
      title,
      completed: false,
      category,
      createdAt: now,
      completedAt: null,
    };
    setTodos((prev) => [newItem, ...prev]);
    setRecentlyCleared(null);
  };

  const handleAddBatch = (entries: ParsedListEntry[], category: TodoCategory) => {
    const now = Date.now();
    const newItems: TodoItem[] = entries.map((entry, idx) => ({
      id: createTodoId(),
      title: entry.title,
      completed: entry.completed,
      category,
      createdAt: now + (entries.length - idx),
      completedAt: entry.completed ? now : null,
    }));
    setTodos((prev) => [...newItems, ...prev]);
    setRecentlyCleared(null);
  };

  const handleToggleTodo = (id: string) => {
    const now = Date.now();
    setTodos((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nextCompleted = !item.completed;
        return {
          ...item,
          completed: nextCompleted,
          completedAt: nextCompleted ? now : null,
        };
      })
    );
  };

  const handleUpdateTitle = (id: string, title: string) => {
    setTodos((prev) =>
      prev.map((item) => (item.id === id ? { ...item, title } : item))
    );
  };

  const handleUpdateCategory = (id: string, category: TodoCategory) => {
    setTodos((prev) =>
      prev.map((item) => (item.id === id ? { ...item, category } : item))
    );
  };

  const handleDeleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((item) => item.id !== id));
  };

  const handleToggleAll = (markCompleted: boolean) => {
    const now = Date.now();
    setTodos((prev) =>
      prev.map((item) => ({
        ...item,
        completed: markCompleted,
        completedAt: markCompleted ? item.completedAt ?? now : null,
      }))
    );
  };

  const handleClearCompleted = () => {
    const completedItems = todos.filter((t) => t.completed);
    if (completedItems.length === 0) return;
    setRecentlyCleared(completedItems);
    setTodos((prev) => prev.filter((t) => !t.completed));
  };

  const handleUndoClear = () => {
    if (!recentlyCleared) return;
    setTodos((prev) => [...recentlyCleared, ...prev]);
    setRecentlyCleared(null);
  };

  const handleResetSamples = () => {
    const now = Date.now();
    setTodos(
      INITIAL_SAMPLE_TODOS.map((item, idx) => ({
        ...item,
        id: createTodoId(),
        createdAt: now - idx * 60000,
        completedAt: item.completed ? now - idx * 30000 : null,
      }))
    );
    setFilter('all');
    setSearchQuery('');
    setRecentlyCleared(null);
  };

  const handleNavFilter = (nextFilter: TodoFilter, targetId: string) => {
    setFilter(nextFilter);
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar (3-zone contract) */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <a
            href="#top"
            className="text-lg font-display font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            Cadence
          </a>

          {/* Zone 2: Concise single-line navigation links */}
          <nav
            aria-label="Workspace navigation"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            <a
              href="#progress-overview"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Overview
            </a>
            <button
              type="button"
              onClick={() => handleNavFilter('all', 'task-list')}
              className={`hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filter === 'all' ? 'text-slate-900' : ''
              }`}
            >
              All Tasks
            </button>
            <button
              type="button"
              onClick={() => handleNavFilter('pending', 'task-list')}
              className={`hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filter === 'pending' ? 'text-slate-900' : ''
              }`}
            >
              Pending
            </button>
            <button
              type="button"
              onClick={() => handleNavFilter('completed', 'task-list')}
              className={`hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filter === 'completed' ? 'text-slate-900' : ''
              }`}
            >
              Completed
            </button>
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={focusAddInput}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>New Task</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main
        id="top"
        className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
      >
        {/* Page Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
              Todo Checklist &amp; Completion Tracker
            </h1>
            <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
              Check items to mark them completed, leave unchecked items pending, and follow real-time progress statistics.
            </p>
          </div>
          <div className="text-xs font-mono tabular-nums text-slate-500 whitespace-nowrap">
            {stats.completed} of {stats.total} completed ({stats.completionRate}%)
          </div>
        </div>

        {/* Real-Time KPI Summary Strip */}
        <ProgressSummaryStrip stats={stats} />

        {/* Undo Banner after clearing completed tasks */}
        {recentlyCleared && (
          <div
            role="status"
            aria-live="polite"
            className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700"
          >
            <span>
              Cleared{' '}
              <span className="font-mono tabular-nums font-medium text-slate-900">
                {recentlyCleared.length}
              </span>{' '}
              completed {recentlyCleared.length === 1 ? 'task' : 'tasks'}.
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleUndoClear}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Undo</span>
              </button>
              <button
                type="button"
                onClick={() => setRecentlyCleared(null)}
                className="text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Two-Column Interactive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-6">
            <TodoInputBar
              onAddSingle={handleAddSingle}
              onAddBatch={handleAddBatch}
              singleInputRef={singleInputRef}
            />

            <TodoListSection
              todos={filteredAndSortedTodos}
              totalCount={stats.total}
              completedCount={stats.completed}
              pendingCount={stats.pending}
              filter={filter}
              onFilterChange={setFilter}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onToggleTodo={handleToggleTodo}
              onUpdateTodoTitle={handleUpdateTitle}
              onUpdateTodoCategory={handleUpdateCategory}
              onDeleteTodo={handleDeleteTodo}
              onToggleAll={handleToggleAll}
              onClearCompleted={handleClearCompleted}
              onLoadSamples={handleResetSamples}
              onFocusAddInput={focusAddInput}
            />
          </div>

          <div className="lg:col-span-4">
            <ProgressAnalyticsPanel
              stats={stats}
              todos={todos}
              onResetSamples={handleResetSamples}
            />
          </div>
        </div>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <span>Cadence Task Tracker</span>
          <span>Changes are saved automatically in your browser.</span>
        </div>
      </footer>
    </div>
  );
}
