export function Textarea({ className = '', invalid = false, ...props }) {
  return (
    <textarea
      className={`block min-h-24 w-full rounded-lg border border-outline bg-surface-container-lowest px-3.5 py-2.5 text-sm text-on-surface shadow-sm transition-colors placeholder:text-on-surface-variant/70 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60 ${invalid ? '!border-danger focus:!border-danger focus:!ring-danger/10' : ''} ${className}`}
      {...props}
    />
  );
}
