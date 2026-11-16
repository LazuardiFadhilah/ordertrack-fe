export function TableScroll({ children, className = '' }) {
  return <div className={`w-full overflow-x-auto ${className}`}>{children}</div>;
}

export function Table({ children, className = '' }) {
  return <table className={`w-full min-w-[46rem] border-collapse text-left text-sm ${className}`}>{children}</table>;
}

export function Th({ children, className = '', ...props }) {
  return (
    <th
      scope="col"
      className={`whitespace-nowrap border-b border-outline-variant bg-surface-container-low px-4 py-3 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-on-surface-variant ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

export function Td({ children, className = '', ...props }) {
  return <td className={`border-b border-outline-variant px-4 py-3 align-top text-sm text-on-surface ${className}`} {...props}>{children}</td>;
}

export function Tr({ children, className = '', ...props }) {
  return <tr className={`transition-colors hover:bg-surface-container-low/60 ${className}`} {...props}>{children}</tr>;
}
