import { Check, Copy, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { ProgressStats, TodoItem } from '../types/todo';
import { formatRelativeTime } from '../utils/todoStats';

interface ProgressAnalyticsPanelProps {
  stats: ProgressStats;
  todos: TodoItem[];
  onResetSamples: () => void;
}

export function ProgressAnalyticsPanel({
  stats,
  todos,
  onResetSamples,
}: ProgressAnalyticsPanelProps) {
  const [copied, setCopied] = useState(false);

  const {
    total,
    completed,
    pending,
    completionRate,
    pendingRate,
    categoryBreakdown,
    lastCompletedItem,
  } = stats;

  // SVG Ring Gauge geometry
  const size = 136;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (completionRate / 100) * circumference;

  const handleCopyMarkdown = async () => {
    if (todos.length === 0) return;
    const markdown = todos
      .map(
        (t) =>
          `- [${t.completed ? 'x' : ' '}] ${t.title} (${t.category})`
      )
      .join('\n');
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback ignored if clipboard blocked
    }
  };

  return (
    <aside
      id="progress-breakdown"
      aria-label="Real-time progress statistics"
      className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 lg:sticky lg:top-6"
    >
      <div>
        <h2 className="text-base font-semibold text-slate-900">
          Progress Statistics
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Updates immediately as tasks are checked or unchecked.
        </p>
      </div>

      {/* Circular Completion Gauge */}
      <div className="flex items-center gap-6 py-2">
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="-rotate-90"
            role="img"
            aria-label={`Completion gauge: ${completionRate}% finished`}
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth={strokeWidth}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#16A34A"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-[stroke-dashoffset] duration-300 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-semibold font-mono tabular-nums text-slate-900">
              {completionRate}%
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              Finished
            </span>
          </div>
        </div>

        <dl className="flex-1 space-y-2.5 text-sm">
          <div className="flex items-center justify-between gap-2">
            <dt className="text-slate-600">Completed</dt>
            <dd className="font-mono tabular-nums font-medium text-emerald-700">
              {completed}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="text-slate-600">Pending</dt>
            <dd className="font-mono tabular-nums font-medium text-amber-700">
              {pending}
            </dd>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <dt className="text-slate-900 font-medium">Total Tasks</dt>
            <dd className="font-mono tabular-nums font-semibold text-slate-900">
              {total}
            </dd>
          </div>
        </dl>
      </div>

      {/* Status Distribution Bar */}
      <div className="pt-5 border-t border-slate-200 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-700">Status Split</span>
          <span className="font-mono tabular-nums text-slate-500">
            {completionRate}% / {pendingRate}%
          </span>
        </div>

        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
          {total > 0 && (
            <>
              <div
                className="h-full bg-emerald-600 transition-all duration-200 ease-out"
                style={{ width: `${completionRate}%` }}
              />
              <div
                className="h-full bg-amber-400/80 transition-all duration-200 ease-out"
                style={{ width: `${pendingRate}%` }}
              />
            </>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
          <span>
            <span className="font-medium text-emerald-700">Checked</span> ·{' '}
            <span className="font-mono tabular-nums">{completed}</span>
          </span>
          <span>
            <span className="font-medium text-amber-700">Unchecked</span> ·{' '}
            <span className="font-mono tabular-nums">{pending}</span>
          </span>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="pt-5 border-t border-slate-200 space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-700">
            Completion by Category
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            Done / Total
          </span>
        </div>

        <div className="space-y-3">
          {categoryBreakdown.map((cat) => {
            const scale = cat.total === 0 ? 0 : cat.percentage / 100;
            return (
              <div key={cat.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">
                    {cat.category}
                  </span>
                  <span className="font-mono tabular-nums text-slate-500">
                    {cat.completed}/{cat.total} · {cat.percentage}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full w-full origin-left transition-transform duration-200 ease-out ${
                      cat.total > 0 && cat.completed === cat.total
                        ? 'bg-emerald-600'
                        : 'bg-blue-600'
                    }`}
                    style={{ transform: `scaleX(${scale})` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Last Completed Milestone */}
      <div className="pt-5 border-t border-slate-200 space-y-1.5">
        <span className="text-xs font-medium text-slate-500">
          Latest Finished Item
        </span>
        {lastCompletedItem ? (
          <p className="text-xs text-slate-800 leading-relaxed">
            <span className="font-medium">{lastCompletedItem.title}</span>
            {lastCompletedItem.completedAt && (
              <span className="text-slate-400 font-mono tabular-nums ml-1.5">
                ({formatRelativeTime(lastCompletedItem.completedAt)})
              </span>
            )}
          </p>
        ) : (
          <p className="text-xs text-slate-400">
            Check any task box to record your progress.
          </p>
        )}
      </div>

      {/* Checklist Utilities */}
      <div className="pt-5 border-t border-slate-200 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleCopyMarkdown}
          disabled={todos.length === 0}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-45 disabled:cursor-not-allowed transition-colors whitespace-nowrap cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>Copied Markdown</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Copy Checklist</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onResetSamples}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap cursor-pointer"
          title="Restore default sample tasks"
        >
          <RotateCcw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Reset Demo</span>
        </button>
      </div>
    </aside>
  );
}
