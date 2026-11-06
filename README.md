# বাজারচিনি · Bajarchini

**বাজার চিনি, ভালো পণ্য কিনি।** — A Bengali-first digital bajar guide for Bangladesh: how to identify products, how to tell good quality from poor, and monthly observed market prices from a named reference market.

Not an e-commerce site: there is no cart, checkout or ordering.

## Stack

Next.js 16 (App Router, Cache Components, `proxy.ts`) · TypeScript · Tailwind CSS v4 · shadcn/ui-style components on `radix-ui` · lucide-react · MongoDB + Mongoose · Zod · next-intl (use-intl) · React Hook Form · Sonner · Recharts · Cloudinary · jose (JWT sessions) · bcryptjs.

## Getting started

```bash
cp .env.example .env.local   # fill in the values (see below)
npm install
npm run seed                 # categories, 49 products, reference market, guides, DEMO price history, admin user
npm run dev                  # http://localhost:3000
```

| Variable                            | Notes                                                                                                                                  |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `MONGODB_URI`                       | Any MongoDB 6+. Replica sets/Atlas get multi-document transactions; standalone servers fall back gracefully.                           |
| `CLOUDINARY_*`                      | Needed for admin image uploads. Without it, uploads return a clear 503 and you can paste image URLs instead.                           |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Seeded as the admin account (password stored only as a bcrypt hash).                                                                   |
| `AUTH_SECRET`                       | ≥ 32 random characters, used to sign the session JWT. `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| `NEXT_PUBLIC_APP_URL`               | Public base URL, used for canonical URLs, sitemap and Open Graph.                                                                      |

Scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `format`, `test` (price-calculation unit tests), `seed`, `seed:clear-demo`.

## Routing & languages

- Bengali is the default and lives at clean URLs (`/products/rui-fish`); English is at `/en/...`.
- `proxy.ts` rewrites clean URLs to the `[locale]` root segment, redirects `/bn/...` to the clean URL, and sends visitors who chose English (`NEXT_LOCALE` cookie) to `/en/...`.
- The language switcher keeps the current page and query string, and stores the choice in a cookie.
- UI strings: `messages/bn.json`, `messages/en.json`. All content (products, categories, markets, articles) is stored as `{ bn, en }`.

Public pages: `/`, `/products`, `/categories/[slug]`, `/products/[slug]`, `/prices`, `/guides`, `/guides/[slug]`, `/about`, `/search`.

## Monthly prices: the rules the code enforces

- A `PriceRecord` is one product × one market × one calendar month, with a unique index on `productId + marketId + month + year`. It stores min, max, unit, observation date, source, notes, status (`DRAFT`/`PUBLISHED`), `createdBy`/`updatedBy` and timestamps.
- `referencePrice = (min + max) / 2` is always calculated on the server.
- **Saving a month never touches other months.** Missing observations stay missing: the bulk editor never copies last month's value. A per-row "copy previous" button exists, but it is an explicit action you must still review and save.
- New entries are saved as **drafts** and stay hidden until you **publish** the month. Corrections to an already-published record go live immediately.
- Each record's observation date must fall inside its month and cannot be in the future.
- **Freshness** ("updated this month", "last month", "older", "not yet observed") comes from the observation month, never from the edit timestamp.
- **Month-on-month change** only compares consecutive months of the same product in the same market. A gap is never treated as zero, and a zero previous price is handled safely.
- Charts show missing months as shaded gaps, with no interpolation. Each market is its own series: when a product has prices from several markets, the product page shows a market selector.
- Publishing or correcting prices calls `revalidateTag(..., { expire: 0 })`, so public pages refresh immediately.

### Demo data

Every seeded price is **illustrative DEMO DATA**: it has `isDemo: true`, carries a source note saying so, and shows a "ডেমো ডেটা / Demo data" badge on the public site. The seed deliberately includes gaps, out-of-season months, older-only observations, drafts and products with no prices at all.

- `npm run seed:clear-demo` deletes only demo price records.
- Any price you enter or correct in the admin panel is stored as a real observation (`isDemo: false`).
- `npm run seed` refuses to run if real observations exist, unless you pass `-- --force`.

## Admin

Admin lives at `/admin/login`. It has a dashboard, monthly prices (a bulk editor plus history and corrections), products, categories, markets and articles.

- **Sessions:** an httpOnly, SameSite=Lax cookie holding an HS256 JWT that expires after 8 hours.
- **Passwords:** bcrypt (cost 12), with per-IP login throttling.
- **Server-side checks:** every admin page and every `/api/admin/*` handler verifies the session on the server. The proxy redirect is only an extra convenience layer. State-changing admin requests from a different origin are rejected.
- **Validation:** all input is validated with Zod. Errors come back in one shape: `{ error: { code, message, details } }`.

Bulk editor keyboard shortcuts: Enter or ↓ moves to the next row in the same column, ↑ moves back, and Tab moves across. Row statuses are updated, unchanged, not entered and invalid. A price that moves more than 30% from the previous month shows an "unusual change" warning. A review dialog lists every change before saving. On mobile the table becomes one card per product.

## API

Public:

- `GET /api/categories`, `/api/categories/[slug]`
- `GET /api/products?category=&featured=&popular=&page=&limit=`, `/api/products/[slug]`
- `GET /api/products/search?q=`
- `GET /api/products/[id]/prices?marketId=&period=6m|12m|all`
- `GET /api/prices/latest?marketId=&category=`
- `GET /api/prices/history/[productId]?marketId=`
- `GET /api/markets`, `/api/articles`, `/api/articles/[slug]`

Admin (authenticated):

- CRUD for `categories`, `products` and `markets`
- `GET /api/admin/prices/monthly`
- `POST /api/admin/prices/bulk`
- `PATCH`/`DELETE /api/admin/prices/[id]`
- `POST /api/admin/prices/publish`
- `GET /api/admin/prices/history`
- CRUD for `articles`
- `POST /api/admin/upload` (Cloudinary)
- `GET /api/admin/dashboard`

## Project layout

```
app/[locale]/…        public pages (root layout per locale)
app/admin/…           admin (separate root layout, noindex)
app/api/…             route handlers
lib/models            Mongoose models
lib/data              cached public read models ('use cache' + cacheTag), admin queries
lib/services          business logic (bulk prices, publication, catalogue rules)
lib/prices/calc.ts    price calculations (unit-tested in tests/)
components/site|admin|ui
scripts/seed          seed data and script
```
