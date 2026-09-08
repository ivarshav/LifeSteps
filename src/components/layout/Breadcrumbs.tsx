export type Breadcrumb = {
  href?: string;
  label: string;
};

export function Breadcrumbs({ items }: { items: Breadcrumb[] }) {
  return (
    <nav
      aria-label="מסלול ניווט"
      className="flex flex-wrap items-center gap-1.5 py-4 text-sm text-[var(--gray-500)]"
    >
      {items.map((item, index) => (
        <span className="contents" key={`${item.label}-${index}`}>
          {index > 0 ? <span aria-hidden="true">›</span> : null}
          {item.href ? (
            <a className="text-[var(--gray-500)]" href={item.href}>
              {item.label}
            </a>
          ) : (
            <span aria-current="page">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
