const tones = {
  draft: 'border-[#CBD5E1] bg-[#F1F5F9] text-[#475569]',
  progress: 'border-[#93C5FD] bg-[#EFF6FF] text-[#1D4ED8]',
  waiting: 'border-[#FCD34D] bg-[#FFFBEB] text-[#B45309]',
  done: 'border-[#6EE7B7] bg-[#ECFDF5] text-[#047857]',
  problem: 'border-[#FCA5A5] bg-[#FEF2F2] text-[#B91C1C]',
};

export function StatusBadge({ label, tone = 'draft' }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] ${tones[tone] ?? tones.draft}`}>
      {label}
    </span>
  );
}
