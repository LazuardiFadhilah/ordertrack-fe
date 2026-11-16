export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-7 flex flex-col gap-4 border-b border-outline-variant/80 pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow text-primary">{eyebrow}</p>}
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em] text-on-surface sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
