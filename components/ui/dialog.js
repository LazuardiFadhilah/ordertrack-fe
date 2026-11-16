'use client';

import { useEffect, useId, useRef } from 'react';
import { FiX } from 'react-icons/fi';

export function Dialog({ open, onClose, title, description, children, wide = false }) {
  const ref = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className={`max-h-[calc(100vh-2rem)] w-[min(100%-1.5rem,${wide ? '56rem' : '42rem'})] overflow-y-auto rounded-xl border border-outline-variant bg-surface-container-lowest p-0 text-on-surface shadow-xl backdrop:bg-on-surface/45`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
    >
      <div className="flex items-start justify-between gap-4 border-b border-outline-variant px-5 py-4 sm:px-6">
        <div>
          <h2 id={titleId} className="font-display text-lg font-semibold tracking-tight text-on-surface">{title}</h2>
          {description && <p id={descriptionId} className="mt-1 text-sm text-on-surface-variant">{description}</p>}
        </div>
        <button
          aria-label="Tutup dialog"
          className="inline-flex min-h-9 min-w-9 shrink-0 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
          onClick={onClose}
          type="button"
        >
          <FiX aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
      <div className="px-5 py-5 sm:px-6">{children}</div>
    </dialog>
  );
}
