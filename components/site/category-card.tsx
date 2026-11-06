import Link from 'next/link'
import { localizePath, type Locale } from '@/i18n/config'
import { getT } from '@/i18n/server'
import { pick, toLocaleDigits } from '@/lib/format'
import type { CategoryDTO } from '@/lib/types'
import { SmartImage } from './smart-image'

export function CategoryCard({ category, locale }: { category: CategoryDTO; locale: Locale }) {
  const t = getT(locale)
  const other = locale === 'bn' ? 'en' : 'bn'
  return (
    <Link
      href={localizePath(locale, `/categories/${category.slug}`)}
      className="group border-border bg-card relative flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="bg-muted relative aspect-[4/3] overflow-hidden">
        <SmartImage
          src={category.image}
          alt={pick(category.name, locale)}
          icon={category.icon}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          imgClassName="transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex items-end justify-between gap-2 p-3 sm:p-4">
        <div className="min-w-0">
          <h3 className="text-ink truncate text-base font-semibold sm:text-lg">
            {pick(category.name, locale)}
          </h3>
          <p className="text-ink-muted truncate text-xs sm:text-sm" lang={other}>
            {category.name[other]}
          </p>
        </div>
        <span className="bg-soft-green text-brand-dark shrink-0 rounded-full px-2 py-0.5 text-xs font-medium">
          {t('home.productCount', { count: toLocaleDigits(category.productCount, locale) })}
        </span>
      </div>
    </Link>
  )
}
