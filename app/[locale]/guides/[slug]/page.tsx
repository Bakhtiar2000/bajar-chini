import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { ArrowLeft } from 'lucide-react'
import { localizePath, type Locale } from '@/i18n/config'
import { getLocale, getT } from '@/i18n/server'
import { getAllSlugs, toSlugParams, getArticleBySlug } from '@/lib/data/public'
import { formatDate, pick } from '@/lib/format'
import { jsonLd, pageAlternates } from '@/lib/seo'
import { absoluteUrl } from '@/lib/utils'
import { Breadcrumbs } from '@/components/site/page-header'
import { SmartImage } from '@/components/site/smart-image'
import { ArticleBody } from '@/components/site/article-body'
import { Skeleton } from '@/components/ui/misc'

type Props = PageProps<'/[locale]/guides/[slug]'>

export async function generateStaticParams() {
  const { articles } = await getAllSlugs()
  return toSlugParams(articles)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const locale = await getLocale()
  const article = await getArticleBySlug(slug)
  if (!article) return {}
  const title = pick(article.title, locale)
  const description = pick(article.excerpt, locale)
  return {
    title,
    description,
    alternates: pageAlternates(locale, `/guides/${slug}`),
    openGraph: {
      type: 'article',
      title,
      description,
      images: article.coverImage ? [article.coverImage] : [],
      publishedTime: article.publishedAt,
    },
  }
}

async function ArticleContent({ params, locale }: { params: Props['params']; locale: Locale }) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) notFound()
  const t = getT(locale)
  const title = pick(article.title, locale)

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: pick(article.excerpt, locale),
    image: article.coverImage ? [article.coverImage] : undefined,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    inLanguage: locale,
    publisher: { '@type': 'Organization', name: t('common.appName') },
    mainEntityOfPage: absoluteUrl(localizePath(locale, `/guides/${slug}`)),
  }

  return (
    <article className="container-page max-w-3xl py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(ld)} />
      <Breadcrumbs
        items={[
          { label: t('nav.home'), href: localizePath(locale, '/') },
          { label: t('guides.title'), href: localizePath(locale, '/guides') },
          { label: title },
        ]}
      />
      <header className="mt-4 space-y-3">
        {article.category ? (
          <Link
            href={localizePath(locale, `/categories/${article.category.slug}`)}
            className="text-brand text-sm font-medium hover:underline"
          >
            {pick(article.category.name, locale)}
          </Link>
        ) : null}
        <h1 className="text-brand-dark text-3xl leading-tight font-bold sm:text-4xl">{title}</h1>
        <p className="text-ink-muted text-lg">{pick(article.excerpt, locale)}</p>
        {article.publishedAt ? (
          <p className="text-ink-muted text-sm">
            {t('guides.published')}: {formatDate(article.publishedAt, locale)}
          </p>
        ) : null}
      </header>
      {article.coverImage ? (
        <div className="relative my-8 aspect-[16/9] overflow-hidden rounded-2xl">
          <SmartImage
            src={article.coverImage}
            alt={title}
            icon={article.category?.icon}
            priority
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      ) : (
        <div className="my-8" />
      )}
      <ArticleBody content={pick(article.content, locale)} />
      <div className="border-border mt-12 border-t pt-6">
        <Link
          href={localizePath(locale, '/guides')}
          className="text-brand inline-flex items-center gap-2 font-medium hover:underline"
        >
          <ArrowLeft className="size-4" /> {t('guides.back')}
        </Link>
      </div>
    </article>
  )
}

export default async function GuidePage(props: Props) {
  const locale = await getLocale()
  return (
    <Suspense
      fallback={
        <div className="container-page max-w-3xl space-y-4 py-10">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="aspect-[16/9] w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      }
    >
      <ArticleContent params={props.params} locale={locale} />
    </Suspense>
  )
}
