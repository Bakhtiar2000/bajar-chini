import Link from 'next/link'
import { ArrowRight, BookOpen } from 'lucide-react'
import { localizePath, type Locale } from '@/i18n/config'
import { getT } from '@/i18n/server'
import { pick } from '@/lib/format'
import type { ArticleDTO } from '@/lib/types'
import { SmartImage } from './smart-image'

export function ArticleCard({ article, locale }: { article: ArticleDTO; locale: Locale }) {
  const t = getT(locale)
  return (
    <article className="group border-border bg-card relative flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md">
      <div className="bg-muted relative aspect-[16/9]">
        <SmartImage
          src={article.coverImage}
          alt={pick(article.title, locale)}
          icon={article.category?.icon ?? 'vegetable'}
          sizes="(max-width: 768px) 100vw, 25vw"
          imgClassName="transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {article.category ? (
          <p className="text-brand flex items-center gap-1.5 text-xs font-medium">
            <BookOpen className="size-3.5" />
            {pick(article.category.name, locale)}
          </p>
        ) : null}
        <h3 className="text-ink text-lg leading-snug font-semibold">
          <Link
            href={localizePath(locale, `/guides/${article.slug}`)}
            className="after:absolute after:inset-0"
          >
            {pick(article.title, locale)}
          </Link>
        </h3>
        <p className="text-ink-muted line-clamp-3 text-sm">{pick(article.excerpt, locale)}</p>
        <span className="text-brand mt-auto inline-flex items-center gap-1 pt-1 text-sm font-medium">
          {t('guides.readMore')}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  )
}
