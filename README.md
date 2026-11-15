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

Public pages: `/`, `/products`, `/categories/[slug]`, `/products/[slug]`, `/prices`, `/guides`, `/guides/[slug]`, `/about`, `/search`, `/list` (bajar list), `/watchlist`, `/data` (open data).

## Search: Bengali, English and Banglish

`lib/search/` finds the same product whatever script or spelling the shopper uses: `mango`, `Mango`, `Aam`, `aam`, `am` and `আম` all return Mango, and so do `piyaj`/`peyaj`/`pyaj`/`পেঁয়াজ` for onion.

- **Transliteration** (`transliterate.ts`): Bengali names are romanised loosely (আম → am, কলমি → kolmi, পেঁয়াজ → peyaj).
- **Phonetic keys** (`phonetic.ts`): spelling variants collapse to one key (aa/a, o/a, sh/s, ph/f, ee/i, doubled letters, a silent final vowel), so `kolmi` = `kalmi` and `mangsho` = `mangso`.
- **Matching and ranking** (`engine.ts`): exact, prefix, substring and typo-tolerant matching (edit distance) on names, alternative names, built-in aliases, variety and category; English plurals are reduced to the singular. A strong match suppresses weak look-alikes (`mango` does not list মাংস).
- **Aliases** (`aliases.ts`): English and regional names that transliteration can't derive (eggplant → brinjal, lady finger → okra). Admins can add more per product as alternative names.

The same engine drives the header autocomplete, `/search`, the product-list filter and (through phonetic keys stored in `searchText`) the admin product filter. Tests: `tests/search.test.ts`.

## Shopper tools

- **Fair price checker** (product page): enter the seller's quote (Bengali or Latin digits) and see whether it is below, within, slightly above or well above the observed range.
- **Market comparison** (product page): the latest price from every market that observed the product, with the lowest marked.
- **Best time to buy**: the cheapest and dearest calendar months, averaged across years from published observations. If prices vary less than 10% across the year, it says prices are steady instead.
- **Tick-as-you-shop checklist**: the good-quality and warning signs can be ticked, and a verdict appears.
- **Bajar list** (`/list`): quantities and an estimated total (reference price, plus a min–max range), shareable as `/list?items=slug:qty,…`. It is stored in the browser.
- **Watchlist** (`/watchlist`): follow a product and see how its price has changed since you followed it, with a badge when a new month is published. It is stored in the browser, with no accounts and no email.
- **Biggest movers** (home page): the largest month-on-month rises and falls, using the same consecutive-month rules as the product page.
- **Share cards**: `/api/og/products/[slug]` renders a 1200×630 PNG with the price and the change. It uses English text, because the OG renderer cannot shape Bengali conjuncts.
- **Offline / installable**: `app/manifest.ts`, the PNG icons at `/icons/*`, and `public/sw.js`. Pages are network-first with an offline fallback, and the public APIs are stale-while-revalidate. The service worker never touches `/admin` or `/api/admin`.
- **Open data** (`/data`): `GET /api/open-data/prices?format=csv|json&market=&year=&month=` returns every published observation, with the demo flag included.

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

### Roles, audit log and CSV

| Role        | Can                                                                                                  |
| ----------- | ---------------------------------------------------------------------------------------------------- |
| `admin`     | everything, including **Users** (create accounts, change roles, deactivate, reset passwords)         |
| `editor`    | enter, correct, publish and delete draft prices; catalogue, markets and articles; read the audit log |
| `collector` | enter and edit **draft** prices only. An editor publishes, and published rows are rejected per row   |

Roles are checked on the server for every request (`lib/auth/roles.ts`, `adminRoute(…, { permission })`). The session re-reads the account from the database, so deactivating someone or changing their role takes effect immediately. The last active admin cannot be demoted or removed.

**Audit log** (`/admin/audit`): every price create, update, publish, unpublish and delete writes an append-only `PriceAudit` entry. Each entry records the actor, role, source (editor, CSV import, correction or publication) and the values before and after.

**CSV** (bulk editor): **Export CSV** downloads the month's sheet. **Import CSV** (columns `slug, unit, min, max, notes`) fills the editor. Imported rows still go through _Review & save_, and nothing is saved automatically.

## API

Public:

- `GET /api/categories`, `/api/categories/[slug]`
- `GET /api/products?category=&featured=&popular=&page=&limit=`, `/api/products/[slug]`
- `GET /api/products/search?q=`
- `GET /api/products/[id]/prices?marketId=&period=6m|12m|all`
- `GET /api/prices/latest?marketId=&category=`
- `GET /api/prices/history/[productId]?marketId=`
- `GET /api/markets`, `/api/articles`, `/api/articles/[slug]`
- `GET /api/products?slugs=a,b` (cards for the bajar list and watchlist)
- `GET /api/open-data/prices?format=csv|json&market=&year=&month=`
- `GET /api/og/products/[slug]` (share image)

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
- `GET /api/admin/prices/export` (CSV)
- `GET /api/admin/audit`
- CRUD for `users` (admin only)

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
