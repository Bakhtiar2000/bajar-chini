import type { Metadata } from 'next'
import Link from 'next/link'
import { connection } from 'next/server'
import {
  ArrowRight,
  CalendarCheck,
  ChartLine,
  FileText,
  Package,
  Store,
  Tags,
  TriangleAlert,
} from 'lucide-react'
import { getDashboardStats } from '@/lib/services/dashboard'
import { formatDate, formatMonthYear } from '@/lib/format'
import { AdminPageHeader } from '@/components/admin/shell'
import { Badge, Card } from '@/components/ui/misc'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Dashboard' }

function Stat({
  label,
  value,
  icon: Icon,
  href,
}: {
  label: string
  value: string | number
  icon: typeof Package
  href: string
}) {
  return (
    <Link
      href={href}
      className="group border-border rounded-2xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <p className="text-ink-muted text-sm">{label}</p>
        <Icon className="text-brand size-4" />
      </div>
      <p className="tabular text-ink mt-2 text-3xl font-bold">{value}</p>
    </Link>
  )
}

export default async function DashboardPage() {
  await connection()
  const s = await getDashboardStats()
  const monthLabel = formatMonthYear(s.now.month, s.now.year, 'en')

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description={
          s.market
            ? `Reference market: ${s.market.name.en}, ${s.market.city.en}`
            : 'No default reference market set'
        }
        actions={
          <Button asChild>
            <Link href="/admin/prices">
              <ChartLine /> Enter {monthLabel} prices
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Products" value={s.totalProducts} icon={Package} href="/admin/products" />
        <Stat label="Categories" value={s.totalCategories} icon={Tags} href="/admin/categories" />
        <Stat label="Markets" value={s.totalMarkets} icon={Store} href="/admin/markets" />
        <Stat label="Articles" value={s.totalArticles} icon={FileText} href="/admin/articles" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <p className="text-ink-muted text-sm">{monthLabel} completion</p>
          <p className="tabular text-brand-dark mt-1 text-4xl font-bold">{s.completion.percent}%</p>
          <div
            className="bg-muted mt-3 h-2.5 overflow-hidden rounded-full"
            role="progressbar"
            aria-valuenow={s.completion.percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="bg-brand h-full rounded-full"
              style={{ width: `${s.completion.percent}%` }}
            />
          </div>
          <p className="text-ink-muted mt-2 text-sm">
            {s.completion.entered} of {s.completion.total} products entered ·{' '}
            {s.completion.published} published
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-ink-muted flex items-center gap-2 text-sm">
            <CalendarCheck className="size-4" /> Latest published update
          </p>
          {s.latestPublished ? (
            <>
              <p className="text-ink mt-1 text-2xl font-bold">
                {formatMonthYear(s.latestPublished.month, s.latestPublished.year, 'en')}
              </p>
              {s.latestPublished.publishedAt ? (
                <p className="text-ink-muted text-sm">
                  Published {formatDate(s.latestPublished.publishedAt, 'en')}
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-ink-muted mt-1">Nothing published yet</p>
          )}
        </Card>
        <Card className="p-5">
          <p className="text-ink-muted flex items-center gap-2 text-sm">
            <TriangleAlert className="size-4" /> Needs attention
          </p>
          <p className="text-ink mt-1">
            <span className="tabular text-2xl font-bold">{s.missing.length}</span> missing this
            month
          </p>
          <p className="text-ink">
            <span className="tabular text-2xl font-bold">{s.outdated.length}</span> with outdated
            prices
          </p>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-ink font-semibold">Missing {monthLabel} observations</h2>
            <Link
              href="/admin/prices"
              className="text-brand flex items-center gap-1 text-sm hover:underline"
            >
              Enter prices <ArrowRight className="size-3.5" />
            </Link>
          </div>
          {s.missing.length ? (
            <ul className="flex max-h-72 flex-wrap gap-1.5 overflow-auto">
              {s.missing.map((p) => (
                <li key={p.id}>
                  <Badge variant="outline">
                    {p.name.bn} · {p.name.en}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ink-muted text-sm">
              Every product has an observation this month. 🎉
            </p>
          )}
        </Card>
        <Card className="p-5">
          <h2 className="text-ink mb-1 font-semibold">Outdated prices</h2>
          <p className="text-ink-muted mb-3 text-xs">
            Latest published observation is older than last month (based on observation month, not
            edit time).
          </p>
          {s.outdated.length ? (
            <ul className="max-h-72 divide-y overflow-auto text-sm">
              {s.outdated.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 py-2">
                  <span>
                    {p.name.bn} <span className="text-ink-muted">· {p.name.en}</span>
                  </span>
                  <Badge variant={p.latest ? 'warning' : 'muted'}>
                    {p.latest
                      ? formatMonthYear(p.latest.month, p.latest.year, 'en')
                      : 'Never observed'}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ink-muted text-sm">No outdated prices.</p>
          )}
        </Card>
      </div>
    </>
  )
}
