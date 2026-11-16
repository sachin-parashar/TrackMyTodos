import {
  Check,
  CheckCheck,
  CheckCircle2,
  Clock,
  Pencil,
  RotateCcw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { KeyboardEvent, useState } from 'react';
import {
  TODO_CATEGORIES,
  TodoCategory,
  TodoFilter,
  TodoItem,
  TodoSort,
} from '../types/todo';
import { formatRelativeTime } from '../utils/todoStats';

interface TodoListSectionProps {
  todos: TodoItem[];
  totalCount: number;
  completedCount: number;
  pendingCount: number;
  filter: TodoFilter;
  onFilterChange: (filter: TodoFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: TodoSort;
  onSortChange: (sort: TodoSort) => void;
  onToggleTodo: (id: string) => void;
  onUpdateTodoTitle: (id: string, title: string) => void;
  onUpdateTodoCategory: (id: string, category: TodoCategory) => void;
  onDeleteTodo: (id: string) => void;
  onToggleAll: (markCompleted: boolean) => void;
  onClearCompleted: () => void;
  onLoadSamples: () => void;
  onFocusAddInput: () => void;
}

export function TodoListSection({
  todos,
  totalCount,
  completedCount,
  pendingCount,
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  onToggleTodo,
  onUpdateTodoTitle,
  onUpdateTodoCategory,
  onDeleteTodo,
  onToggleAll,
  onClearCompleted,
  onLoadSamples,
  onFocusAddInput,
}: TodoListSectionProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState('');

  const startEditing = (item: TodoItem) => {
    setEditingId(item.id);
    setEditingDraft(item.title);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingDraft('');
  };

  const commitEditing = (id: string) => {
    const trimmed = editingDraft.trim();
    if (trimmed) {
      onUpdateTodoTitle(id, trimmed);
    }
    setEditingId(null);
    setEditingDraft('');
  };

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>, id: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitEditing(id);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditing();
    }
  };

  const allCompleted = totalCount > 0 && pendingCount === 0;

  return (
    <section
      id="task-list"
      aria-label="Todo checklist"
      className="bg-white border border-slate-200 rounded-xl overflow-hidden"
    >
      {/* Toolbar Header */}
      <div className="p-5 border-b border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Segmented Status Filter */}
          <div
            className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg"
            role="tablist"
            aria-label="Filter tasks by completion status"
          >
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'all'}
              onClick={() => onFilterChange('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All <span className="font-mono tabular-nums ml-1 text-slate-500">{totalCount}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'pending'}
              onClick={() => onFilterChange('pending')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filter === 'pending'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending <span className="font-mono tabular-nums ml-1 text-slate-500">{pendingCount}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'completed'}
              onClick={() => onFilterChange('completed')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filter === 'completed'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Completed <span className="font-mono tabular-nums ml-1 text-slate-500">{completedCount}</span>
            </button>
          </div>

          {/* Bulk Controls */}
          {totalCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => onToggleAll(!allCompleted)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                {allCompleted ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>Mark All Pending</span>
                  </>
                ) : (
                  <>
                    <CheckCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>Check All</span>
                  </>
                )}
              </button>

              {completedCount > 0 && (
                <button
                  type="button"
                  onClick={onClearCompleted}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50/70 border border-rose-200/80 rounded-lg hover:bg-rose-100/70 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
                >
                  <Trash2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Clear Completed</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Search & Sort Row */}
        {totalCount > 0 && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search
                className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <label htmlFor="todo-search" className="sr-only">
                Search tasks
              </label>
              <input
                id="todo-search"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search tasks by title or category..."
                className="w-full pl-9 pr-9 py-2 text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Clear search query"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <label htmlFor="todo-sort" className="text-xs text-slate-500 whitespace-nowrap">
                Sort by
              </label>
              <select
                id="todo-sort"
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as TodoSort)}
                className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition-colors cursor-pointer"
              >
                <option value="newest">Newest first</option>
                <option value="status">Pending first</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* List Content or Empty States */}
      {totalCount === 0 ? (
        <div className="px-6 py-14 text-center max-w-md mx-auto">
          <h3 className="text-base font-semibold text-slate-900">
            Your todo list is empty
          </h3>
          <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
            Add your first task above, paste a multi-line checklist, or load a sample set to track real-time completion progress.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onFocusAddInput}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              Add First Task
            </button>
            <button
              type="button"
              onClick={onLoadSamples}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer whitespace-nowrap"
            >
              Load Sample List
            </button>
          </div>
        </div>
      ) : todos.length === 0 ? (
        <div className="px-6 py-12 text-center max-w-md mx-auto">
          <h3 className="text-base font-semibold text-slate-900">
            No matching tasks found
          </h3>
          <p className="text-sm text-slate-500 mt-1.5">
            {searchQuery
              ? `No tasks match "${searchQuery}" under the ${filter} view.`
              : filter === 'pending'
                ? 'Every task in your list is currently checked as completed.'
                : 'No tasks have been checked as completed yet.'}
          </p>
          <button
            type="button"
            onClick={() => {
              onFilterChange('all');
              onSearchChange('');
            }}
            className="mt-4 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer whitespace-nowrap"
          >
            Show All Tasks
          </button>
        </div>
      ) : (
        <ul className="divide-y divide-slate-200" aria-label="Tasks">
          {todos.map((item) => {
            const isEditing = editingId === item.id;

            return (
              <li
                key={item.id}
                className={`group flex items-start gap-2 px-3 sm:px-5 py-3.5 transition-colors ${
                  item.completed ? 'bg-slate-50/50' : 'bg-white hover:bg-slate-50/80'
                }`}
              >
                {/* Accessible Checkbox (44x44px hit target) */}
                <label className="relative flex items-center justify-center w-11 h-11 -my-1.5 -ml-1 shrink-0 cursor-pointer rounded-lg hover:bg-slate-100/80 transition-colors">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => onToggleTodo(item.id)}
                    aria-label={`Mark "${item.title}" as ${
                      item.completed ? 'pending' : 'completed'
                    }`}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-blue-600 peer-focus-visible:ring-offset-2 ${
                      item.completed
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white border-slate-300 group-hover:border-slate-400 text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.75]" />
                  </span>
                </label>

                {/* Title & Unboxed Inline Metadata */}
                <div className="flex-1 min-w-0 pt-0.5">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        autoFocus
                        value={editingDraft}
                        onChange={(e) => setEditingDraft(e.target.value)}
                        onKeyDown={(e) => handleEditKeyDown(e, item.id)}
                        aria-label="Edit task title"
                        className="flex-1 min-w-0 px-2.5 py-1 text-sm text-slate-900 bg-white border border-blue-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                      />
                      <button
                        type="button"
                        onClick={() => commitEditing(item.id)}
                        className="px-2.5 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 cursor-pointer whitespace-nowrap"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 cursor-pointer whitespace-nowrap"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <p
                      onDoubleClick={() => startEditing(item)}
                      className={`text-sm font-medium leading-snug break-words transition-colors ${
                        item.completed
                          ? 'text-slate-500 line-through decoration-slate-400'
                          : 'text-slate-900'
                      }`}
                    >
                      {item.title}
                    </p>
                  )}

                  {/* Zero-pill unboxed metadata with explicit status text */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                    {item.completed ? (
                      <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span>Completed</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-medium text-amber-700">
                        <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span>Pending</span>
                      </span>
                    )}

                    <span aria-hidden="true" className="text-slate-300">
                      ·
                    </span>

                    <label className="inline-flex items-center">
                      <span className="sr-only">Category for {item.title}</span>
                      <select
                        value={item.category}
                        onChange={(e) =>
                          onUpdateTodoCategory(item.id, e.target.value as TodoCategory)
                        }
                        className="bg-transparent text-xs text-slate-600 hover:text-slate-900 focus:outline-none focus:underline cursor-pointer"
                      >
                        {TODO_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </label>

                    <span aria-hidden="true" className="text-slate-300">
                      ·
                    </span>

                    <span className="font-mono tabular-nums text-[11px] text-slate-400">
                      {item.completed && item.completedAt
                        ? `Checked ${formatRelativeTime(item.completedAt)}`
                        : `Added ${formatRelativeTime(item.createdAt)}`}
                    </span>
                  </div>
                </div>

                {/* Row Actions */}
                {!isEditing && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEditing(item)}
                      aria-label={`Edit "${item.title}"`}
                      className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    >
                      <Pencil className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteTodo(item.id)}
                      aria-label={`Delete "${item.title}"`}
                      className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
