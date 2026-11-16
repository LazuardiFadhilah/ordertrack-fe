export function Select({ className = '', invalid = false, children, ...props }) {
  return (
    <select
      className={`block min-h-11 w-full rounded-lg border border-outline bg-surface-container-lowest px-3 py-2.5 text-sm text-on-surface shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60 ${invalid ? '!border-danger focus:!border-danger' : ''} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
