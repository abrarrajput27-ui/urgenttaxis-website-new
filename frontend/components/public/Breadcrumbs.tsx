import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PublicBreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function PublicBreadcrumbs({ items }: PublicBreadcrumbsProps) {
  const domain = 'https://www.urgenttaxis.com';
  
  const breadcrumbListSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href ? `${domain}${item.href}` : undefined,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbListSchema) }}
      />
      <nav aria-label="Breadcrumb" className="py-3 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-xs text-slate-400 font-medium">
        <ol className="flex items-center flex-wrap gap-2">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={index} className="flex items-center gap-2">
                {index > 0 && <span className="text-slate-600">/</span>}
                {isLast || !item.href ? (
                  <span className="text-amber-400 font-semibold">{item.label}</span>
                ) : (
                  <Link href={item.href} className="hover:text-slate-200 transition-colors">
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
