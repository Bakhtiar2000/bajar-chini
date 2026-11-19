import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

/*
 * PNG app icons for the web manifest: /icons/icon-192.png, /icons/icon-512.png
 * and maskable variants (/icons/maskable-512.png) with safe-zone padding.
 * The file names contain a dot, so proxy.ts never rewrites them.
 */

const VARIANTS: Record<string, { size: number; maskable: boolean }> = {
  'icon-192.png': { size: 192, maskable: false },
  'icon-512.png': { size: 512, maskable: false },
  'maskable-192.png': { size: 192, maskable: true },
  'maskable-512.png': { size: 512, maskable: true },
  'apple-touch-icon.png': { size: 180, maskable: true },
}

export function generateStaticParams() {
  return Object.keys(VARIANTS).map((file) => ({ file }))
}

export async function GET(_req: Request, ctx: { params: Promise<{ file: string }> }) {
  const { file } = await ctx.params
  const variant = VARIANTS[file]
  if (!variant) return new Response('Not found', { status: 404 })
  const svg = await readFile(join(process.cwd(), 'public', 'icon.svg'), 'utf8')
  const src = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
  const { size, maskable } = variant
  const inner = maskable ? Math.round(size * 0.72) : size

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: maskable ? '#166534' : 'transparent',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} width={inner} height={inner} alt="" />
    </div>,
    {
      width: size,
      height: size,
      headers: { 'Cache-Control': 'public, max-age=604800, immutable' },
    },
  )
}
