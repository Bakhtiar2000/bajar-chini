import { ImageResponse } from 'next/og'
import { getProductDetail } from '@/lib/data/public'
import { formatMonthYear } from '@/lib/format'

/*
 * Share card for a product: name, latest observed price range, month-on-month
 * change and observation month. Text is English with Latin digits because the
 * OG renderer (Satori) cannot shape Bengali conjuncts correctly.
 */

const size = { width: 1200, height: 630 }

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n)

/**
 * GET /api/og/products/[slug] — 1200×630 PNG used as the product page's og:image.
 * (A plain route rather than an `opengraph-image` file so the URL never carries
 * the internal /bn locale prefix, which proxy.ts would redirect.)
 */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!/^[a-z0-9-]{1,100}$/.test(slug)) return new Response('Not found', { status: 404 })
  const product = await getProductDetail(slug)
  const history = product?.priceHistories[0]
  const latest = history?.latest ?? null
  const change = history?.change

  const name = product?.name.en || 'Bajarchini'
  const category = product?.category.name.en ?? ''
  const range = latest
    ? latest.minimumPrice === latest.maximumPrice
      ? `Tk ${fmt(latest.minimumPrice)}`
      : `Tk ${fmt(latest.minimumPrice)}–${fmt(latest.maximumPrice)}`
    : null
  const changeText =
    change?.status === 'ok' && change.change !== 0
      ? `${change.change > 0 ? '▲' : '▼'} ${Math.abs(change.percent).toFixed(1)}% vs previous month`
      : null

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 64,
        background: 'linear-gradient(180deg, #f0fdf4 0%, #fffbeb 100%)',
        color: '#14532d',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: '#166534',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 32,
            fontWeight: 700,
          }}
        >
          B
        </div>
        <div style={{ fontSize: 30, fontWeight: 700 }}>Bajarchini</div>
        {category ? (
          <div
            style={{
              marginLeft: 'auto',
              fontSize: 24,
              padding: '8px 20px',
              borderRadius: 999,
              background: 'white',
              border: '2px solid #bbf7d0',
            }}
          >
            {category}
          </div>
        ) : null}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>{name}</div>
        {range && latest ? (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
            <div style={{ fontSize: 96, fontWeight: 800, color: '#166534' }}>{range}</div>
            <div style={{ fontSize: 36, color: '#4b5563' }}>{`/ ${latest.unit.en}`}</div>
          </div>
        ) : (
          <div style={{ fontSize: 40, color: '#4b5563' }}>How to identify it and judge quality</div>
        )}
        {changeText ? (
          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: change?.status === 'ok' && change.change > 0 ? '#b91c1c' : '#166534',
            }}
          >
            {changeText}
          </div>
        ) : null}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 24 }}>
        <div style={{ color: '#4b5563' }}>
          {latest && history
            ? `Observed at ${history.market.name.en} · ${formatMonthYear(latest.month, latest.year, 'en')}`
            : 'Monthly observed market prices for Bangladesh'}
        </div>
        {latest?.isDemo ? <div style={{ color: '#92400e', fontWeight: 700 }}>DEMO DATA</div> : null}
      </div>
    </div>,
    { ...size, headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' } },
  )
}
