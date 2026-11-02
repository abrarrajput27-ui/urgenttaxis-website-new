interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PublicBreadcrumbsProps {
  items: BreadcrumbItem[];
}

/**
 * PublicBreadcrumbs Component.
 * Phase 1 Requirement: Visible breadcrumb row ("Home / Page Name") is removed
 * from all public-facing pages, while preserving full SEO BreadcrumbList JSON-LD Schema.
 */
export default function PublicBreadcrumbs({ items }: PublicBreadcrumbsProps) {
  const domain = 'https://www.urgenttaxis.in';

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
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbListSchema) }}
    />
  );
}
