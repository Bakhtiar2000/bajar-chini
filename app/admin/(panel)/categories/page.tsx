import type { Metadata } from 'next'
import { AdminPageHeader } from '@/components/admin/shell'
import { CategoriesManager } from '@/components/admin/categories-manager'

export const metadata: Metadata = { title: 'Categories' }

export default function AdminCategoriesPage() {
  return (
    <>
      <AdminPageHeader
        title="Categories"
        description="Bengali and English names, images, display order and visibility."
      />
      <CategoriesManager />
    </>
  )
}
