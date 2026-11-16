'use client';

import { FiAlertCircle, FiInbox } from 'react-icons/fi';
import { Button } from './ui/button.js';

export function LoadingState({ label = 'Memuat data…' }) {
  return (
    <div aria-live="polite" className="space-y-3 p-5 sm:p-6" role="status">
      <p className="eyebrow text-primary">{label}</p>
      <div className="space-y-2">
        <div className="h-9 w-full animate-pulse rounded-md bg-surface-container" />
        <div className="h-9 w-full animate-pulse rounded-md bg-surface-container" />
        <div className="h-9 w-3/4 animate-pulse rounded-md bg-surface-container" />
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between" role="alert">
      <div className="flex items-start gap-3">
        <FiAlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
        <div>
          <p className="text-sm font-semibold text-on-surface">Data gagal dimuat</p>
          <p className="mt-1 text-sm text-on-surface-variant">{message}</p>
        </div>
      </div>
      {onRetry && (
        <Button onClick={onRetry} size="sm" type="button" variant="outline">
          Coba lagi
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <FiInbox aria-hidden="true" className="h-8 w-8 text-on-surface-variant" />
      <p className="mt-3 text-sm font-semibold text-on-surface">{title}</p>
      {description && <p className="mt-1 max-w-md text-sm text-on-surface-variant">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Field({ label, htmlFor, error, hint, className = '', children }) {
  return (
    <div className={className}>
      <label className="ledger-label block" htmlFor={htmlFor}>{label}</label>
      <div className="mt-1.5">{children}</div>
      {hint && !error && <p className="mt-1.5 text-xs text-on-surface-variant">{hint}</p>}
      {error && <p className="mt-1.5 text-sm text-red-800" id={`${htmlFor}-error`} role="alert">{error}</p>}
    </div>
  );
}
