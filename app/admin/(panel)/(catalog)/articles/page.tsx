import type { Metadata } from 'next'
import { AdminPageHeader } from '@/components/admin/shell'
import { ArticlesList } from '@/components/admin/articles-manager'

export const metadata: Metadata = { title: 'Articles' }

export default function AdminArticlesPage() {
  return (
    <>
      <AdminPageHeader
        title="Articles"
        description="Educational buying guides shown under “কেনাকাটার টিপস”."
      />
      <ArticlesList />
    </>
  )
}
