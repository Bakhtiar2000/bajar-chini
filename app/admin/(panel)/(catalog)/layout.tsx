import { requirePagePermission } from '@/lib/auth/admin'

/** Catalogue management (products, categories, markets, articles) is for admins and editors. */
export default async function CatalogLayout({ children }: { children: React.ReactNode }) {
  await requirePagePermission('catalog:write')
  return children
}
