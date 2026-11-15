import type { Metadata } from 'next'
import { AdminPageHeader } from '@/components/admin/shell'
import { ProductForm } from '@/components/admin/product-form'

export const metadata: Metadata = { title: 'New product' }

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader title="New product" />
      <ProductForm />
    </div>
  )
}
