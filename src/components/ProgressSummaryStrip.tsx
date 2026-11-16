import { CheckCircle2, CircleDashed, ListChecks } from 'lucide-react';
import { ProgressStats } from '../types/todo';

interface ProgressSummaryStripProps {
  stats: ProgressStats;
}

export function ProgressSummaryStrip({ stats }: ProgressSummaryStripProps) {
  const { total, completed, pending, completionRate } = stats;

  const progressScale = Math.max(0, Math.min(1, completionRate / 100));

  const statusText =
    total === 0
      ? 'No tasks added'
      : completed === total
        ? 'All tasks finished'
        : `${pending} ${pending === 1 ? 'task' : 'tasks'} left`;

  return (
    <section
      id="progress-overview"
      aria-label="Real-time completion statistics"
      className="bg-white border border-slate-200 rounded-xl overflow-hidden"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
        {/* Metric 1: Completion Rate */}
        <div className="p-5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-500">
              Completion Rate
            </span>
            <span className="text-xs font-mono tabular-nums text-slate-500">
              {completed}/{total}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold font-mono tabular-nums tracking-tight text-slate-900">
              {completionRate}%
            </span>
            <span className="text-xs text-slate-500">finished</span>
          </div>
          <div
            className="w-full h-2 bg-slate-100 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={completionRate}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Overall task completion percentage"
          >
            <div
              className="h-full w-full bg-emerald-600 origin-left transition-transform duration-200 ease-out"
              style={{ transform: `scaleX(${progressScale})` }}
            />
          </div>
        </div>

        {/* Metric 2: Completed (Checked) */}
        <div className="p-5 flex flex-col justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Completed</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold font-mono tabular-nums tracking-tight text-slate-900">
              {completed}
            </span>
            <span className="text-xs text-slate-500">
              checked {completed === 1 ? 'item' : 'items'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Marked as done via checkbox
          </p>
        </div>

        {/* Metric 3: Pending (Unchecked) */}
        <div className="p-5 flex flex-col justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700">
            <CircleDashed className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Pending</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold font-mono tabular-nums tracking-tight text-slate-900">
              {pending}
            </span>
            <span className="text-xs text-slate-500">
              unchecked {pending === 1 ? 'item' : 'items'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Awaiting completion check
          </p>
        </div>

        {/* Metric 4: Total Tasks */}
        <div className="p-5 flex flex-col justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <ListChecks className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Total Tasks</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold font-mono tabular-nums tracking-tight text-slate-900">
              {total}
            </span>
            <span className="text-xs text-slate-500">
              {total === 1 ? 'item' : 'items'} tracked
            </span>
          </div>
          <p className="text-xs text-slate-500">{statusText}</p>
        </div>
      </div>
    </section>
  );
}
