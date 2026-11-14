const variants = {
  default: 'bg-primary text-on-primary shadow-sm hover:bg-primary-container',
  outline: 'border border-primary bg-transparent text-primary hover:bg-primary/5',
  ghost: 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
};

export function Button({ className = '', variant = 'default', ...props }) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60 ${variants[variant] ?? variants.default} ${className}`}
      {...props}
    />
  );
}
