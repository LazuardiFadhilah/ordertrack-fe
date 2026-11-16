const baseVariant = {
  default: 'bg-primary text-on-primary shadow-sm hover:bg-primary-container',
  outline: 'border border-primary bg-transparent text-primary hover:bg-primary/5',
  ghost: 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
  danger: 'border border-red-300 bg-red-50 text-red-800 hover:bg-red-100',
};

const sizes = {
  default: 'min-h-11 px-4 py-2.5 text-sm',
  sm: 'min-h-9 px-3 py-1.5 text-xs',
};

export function Button({ className = '', variant = 'default', size = 'default', ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:pointer-events-none disabled:opacity-60 ${sizes[size] ?? sizes.default} ${baseVariant[variant] ?? baseVariant.default} ${className}`}
      {...props}
    />
  );
}
