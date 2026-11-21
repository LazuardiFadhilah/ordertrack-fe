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
      className={`whitespace-nowrap border-b border-outline-variant/60 bg-surface-container-low px-5 py-3.5 text-xs font-semibold tracking-wider text-on-surface-variant uppercase ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

export function Td({ children, className = '', ...props }) {
  return <td className={`border-b border-outline-variant/40 px-5 py-4 align-middle text-sm text-on-surface ${className}`} {...props}>{children}</td>;
}

export function Tr({ children, className = '', ...props }) {
  return <tr className={`transition-colors hover:bg-surface-container-low/80 ${className}`} {...props}>{children}</tr>;
}
