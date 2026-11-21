const tones = {
  draft: 'border-slate-200 bg-slate-50 text-slate-700 dot-slate-500',
  progress: 'border-blue-200 bg-blue-50 text-blue-700 dot-blue-500',
  waiting: 'border-amber-200 bg-amber-50 text-amber-800 dot-amber-500',
  done: 'border-emerald-200 bg-emerald-50 text-emerald-700 dot-emerald-500',
  problem: 'border-rose-200 bg-rose-50 text-rose-700 dot-rose-500',
};

const dotColors = {
  draft: 'bg-slate-400',
  progress: 'bg-blue-500',
  waiting: 'bg-amber-500',
  done: 'bg-emerald-500',
  problem: 'bg-rose-500',
};

export function StatusBadge({ label, tone = 'draft' }) {
  const activeTone = tones[tone] ? tone : 'draft';
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide ${tones[activeTone]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotColors[activeTone]}`} aria-hidden="true" />
      {label}
    </span>
  );
}
