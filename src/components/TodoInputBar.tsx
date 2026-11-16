import { ListPlus, Plus } from 'lucide-react';
import { FormEvent, RefObject, useMemo, useState } from 'react';
import { TODO_CATEGORIES, TodoCategory } from '../types/todo';
import { ParsedListEntry, parseTodoListInput } from '../utils/todoStats';

interface TodoInputBarProps {
  onAddSingle: (title: string, category: TodoCategory) => void;
  onAddBatch: (entries: ParsedListEntry[], category: TodoCategory) => void;
  singleInputRef: RefObject<HTMLInputElement | null>;
}

export function TodoInputBar({
  onAddSingle,
  onAddBatch,
  singleInputRef,
}: TodoInputBarProps) {
  const [entryMode, setEntryMode] = useState<'single' | 'batch'>('single');
  const [singleTitle, setSingleTitle] = useState('');
  const [batchText, setBatchText] = useState('');
  const [category, setCategory] = useState<TodoCategory>('Planning');

  const parsedBatchEntries = useMemo(
    () => parseTodoListInput(batchText),
    [batchText]
  );

  const handleSingleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = singleTitle.trim();
    if (!trimmed) return;
    onAddSingle(trimmed, category);
    setSingleTitle('');
  };

  const handleBatchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (parsedBatchEntries.length === 0) return;
    onAddBatch(parsedBatchEntries, category);
    setBatchText('');
    setEntryMode('single');
  };

  return (
    <section
      aria-label="Add todo items"
      className="bg-white border border-slate-200 rounded-xl p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Add Todo Items
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Enter a single task or paste an entire checklist at once.
          </p>
        </div>

        <div
          className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg"
          role="tablist"
          aria-label="Task entry mode"
        >
          <button
            type="button"
            role="tab"
            aria-selected={entryMode === 'single'}
            onClick={() => setEntryMode('single')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              entryMode === 'single'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Single Item
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={entryMode === 'batch'}
            onClick={() => setEntryMode('batch')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              entryMode === 'batch'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Batch List
          </button>
        </div>
      </div>

      {entryMode === 'single' ? (
        <form
          onSubmit={handleSingleSubmit}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        >
          <label htmlFor="single-todo-input" className="sr-only">
            New todo item
          </label>
          <input
            ref={singleInputRef}
            id="single-todo-input"
            type="text"
            value={singleTitle}
            onChange={(e) => setSingleTitle(e.target.value)}
            placeholder="What needs to be completed?"
            className="flex-1 min-w-0 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition-colors"
          />

          <div className="flex items-center gap-3 shrink-0">
            <label htmlFor="single-todo-category" className="sr-only">
              Category
            </label>
            <select
              id="single-todo-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as TodoCategory)}
              className="px-3 py-2.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition-colors cursor-pointer"
            >
              {TODO_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={!singleTitle.trim()}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-45 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Add Task</span>
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleBatchSubmit} className="space-y-3">
          <div>
            <label htmlFor="batch-todo-input" className="sr-only">
              Paste multiple todo items, one per line
            </label>
            <textarea
              id="batch-todo-input"
              rows={4}
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
              placeholder={`Paste or type one task per line:\n- [ ] Finalize Q4 budget spreadsheet\n- [ ] Send client onboarding packet\n- [x] Verify staging environment health`}
              className="w-full px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition-colors resize-y leading-relaxed"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <label htmlFor="batch-todo-category" className="text-xs font-medium text-slate-600">
                Category:
              </label>
              <select
                id="batch-todo-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as TodoCategory)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition-colors cursor-pointer"
              >
                {TODO_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <span className="text-xs font-mono tabular-nums text-slate-500">
                {parsedBatchEntries.length}{' '}
                {parsedBatchEntries.length === 1 ? 'item' : 'items'} detected
              </span>
            </div>

            <button
              type="submit"
              disabled={parsedBatchEntries.length === 0}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-45 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <ListPlus className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>
                Import {parsedBatchEntries.length > 0 ? parsedBatchEntries.length : ''} Tasks
              </span>
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
