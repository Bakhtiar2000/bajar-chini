import type { Metadata } from 'next'
import { AdminPageHeader } from '@/components/admin/shell'
import { ProductsList } from '@/components/admin/products-list'

export const metadata: Metadata = { title: 'Products' }

export default function AdminProductsPage() {
  return (
    <>
      <AdminPageHeader
        title="Products"
        description="Educational content, images and visibility for every market product."
      />
      <ProductsList />
    </>
  )
}
