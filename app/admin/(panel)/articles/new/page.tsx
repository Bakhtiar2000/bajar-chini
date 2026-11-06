import type { Metadata } from 'next'
import { AdminPageHeader } from '@/components/admin/shell'
import { ArticleForm } from '@/components/admin/articles-manager'

export const metadata: Metadata = { title: 'New article' }

export default function NewArticlePage() {
  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader title="New article" />
      <ArticleForm />
    </div>
  )
}
