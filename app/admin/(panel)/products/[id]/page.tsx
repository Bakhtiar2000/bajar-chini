import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import { isObjectId } from '@/lib/api/response'
import { adminGetProduct } from '@/lib/data/admin'
import { AdminPageHeader } from '@/components/admin/shell'
import { ProductForm } from '@/components/admin/product-form'

export const metadata: Metadata = { title: 'Edit product' }

export default async function EditProductPage({ params }: PageProps<'/admin/products/[id]'>) {
  await connection()
  const { id } = await params
  if (!isObjectId(id)) notFound()
  const product = await adminGetProduct(id).catch(() => null)
  if (!product) notFound()
  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        title={`${product.name.bn} · ${product.name.en}`}
        description={`/products/${product.slug}`}
      />
      <ProductForm key={product.updatedAt} product={product} />
    </div>
  )
}
