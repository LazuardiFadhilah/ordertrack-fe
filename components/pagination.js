'use client';

import { Button } from './ui/button.js';

export function Pagination({ page, limit, total, onPageChange, disabled = false }) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-col gap-3 border-t border-outline-variant px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-on-surface-variant">
        Menampilkan <span className="tabular font-semibold text-on-surface">{from}–{to}</span> dari{' '}
        <span className="tabular font-semibold text-on-surface">{total}</span> data
      </p>
      <div className="flex items-center gap-2">
        <Button disabled={disabled || page <= 1} onClick={() => onPageChange(page - 1)} size="sm" type="button" variant="outline">
          Sebelumnya
        </Button>
        <span className="tabular px-1 text-xs text-on-surface-variant">Halaman {page} / {totalPages}</span>
        <Button disabled={disabled || page >= totalPages} onClick={() => onPageChange(page + 1)} size="sm" type="button" variant="outline">
          Berikutnya
        </Button>
      </div>
    </div>
  );
}
