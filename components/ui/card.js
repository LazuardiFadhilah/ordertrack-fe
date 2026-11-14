export function Card({ as: Component = 'div', className = '', ...props }) {
  return <Component className={`rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm ${className}`} {...props} />;
}

export function CardHeader({ className = '', ...props }) {
  return <div className={`border-b border-outline-variant px-5 py-4 sm:px-6 ${className}`} {...props} />;
}

export function CardContent({ className = '', ...props }) {
  return <div className={`px-5 py-6 sm:px-6 ${className}`} {...props} />;
}
