import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import { isObjectId } from '@/lib/api/response'
import { adminGetArticle } from '@/lib/data/admin'
import { AdminPageHeader } from '@/components/admin/shell'
import { ArticleForm } from '@/components/admin/articles-manager'

export const metadata: Metadata = { title: 'Edit article' }

export default async function EditArticlePage({ params }: PageProps<'/admin/articles/[id]'>) {
  await connection()
  const { id } = await params
  if (!isObjectId(id)) notFound()
  const article = await adminGetArticle(id).catch(() => null)
  if (!article) notFound()
  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader title={article.title.en} description={`/guides/${article.slug}`} />
      <ArticleForm key={article.updatedAt} article={article} />
    </div>
  )
}
