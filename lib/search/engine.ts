import { phoneticKey } from './phonetic'
import { SLUG_ALIASES } from './aliases'

/*
 * Multilingual product search: Bengali (আম), English (Mango) and Banglish
 * (aam / am / Aam) all reach the same product.
 *
 * Every searchable name is indexed in two forms:
 *   raw — NFC, lower-case script text (exact Bengali / English matching)
 *   key — phonetic key of the romanised text (Banglish, spelling variants)
 * Queries are converted the same way, then matched per word with exact,
 * prefix, substring and typo-tolerant (edit distance) rules.
 */

export type SearchTermInput = {
  text: string
  /** 0–1 multiplier; e.g. the product name is 1, its category name 0.5. */
  weight: number
  /** Allow substring and typo matches (off for category names, which are broad). */
  loose?: boolean
}

export type SearchDocInput = { id: string; terms: SearchTermInput[] }

type IndexedTerm = {
  raw: string
  key: string
  rawWords: string[]
  keyWords: string[]
  weight: number
  loose: boolean
}

export type SearchIndex = { docs: { id: string; terms: IndexedTerm[] }[] }

export type SearchHit = { id: string; score: number }

export function normalizeText(value: string) {
  return value
    .normalize('NFC')
    .toLowerCase()
    .replace(/[()\[\]{},.;:!?'"“”‘’/\\|_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const words = (s: string) => s.split(' ').filter(Boolean)

function indexTerm(t: SearchTermInput): IndexedTerm | null {
  const raw = normalizeText(t.text)
  if (!raw) return null
  const key = phoneticKey(raw)
  return {
    raw,
    key,
    rawWords: words(raw),
    keyWords: words(key),
    weight: t.weight,
    loose: t.loose ?? true,
  }
}

export function buildSearchIndex(docs: SearchDocInput[]): SearchIndex {
  return {
    docs: docs.map((d) => ({
      id: d.id,
      terms: d.terms.map(indexTerm).filter((t): t is IndexedTerm => t !== null),
    })),
  }
}

/** Optimal-string-alignment edit distance with an early exit above `max`. */
export function editDistance(a: string, b: string, max = 3): number {
  if (a === b) return 0
  if (Math.abs(a.length - b.length) > max) return max + 1
  const prev2 = new Array<number>(b.length + 1).fill(0)
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]
    let rowMin = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        v = Math.min(v, prev2[j - 2] + 1)
      }
      cur[j] = v
      if (v < rowMin) rowMin = v
    }
    if (rowMin > max) return max + 1
    for (let j = 0; j <= b.length; j++) prev2[j] = prev[j]
    prev = cur
  }
  return prev[b.length]
}

const typoBudget = (len: number) => (len >= 7 ? 2 : len >= 4 ? 1 : 0)

/** Best score of one query word against one word of a term (0 = no match). */
function scoreWord(qRaw: string, qKey: string, rawWord: string, keyWord: string, loose: boolean) {
  if (qRaw === rawWord) return 100
  if (qKey && qKey === keyWord) return 92
  if (qRaw.length >= 1 && rawWord.startsWith(qRaw))
    return 75 - Math.min(15, rawWord.length - qRaw.length)
  if (qKey.length >= 2 && keyWord.startsWith(qKey))
    return 70 - Math.min(15, keyWord.length - qKey.length)
  if (!loose) return 0
  if (qRaw.length >= 4 && rawWord.includes(qRaw)) return 45
  if (qKey.length >= 4 && keyWord.includes(qKey)) return 42
  const budget = typoBudget(qKey.length)
  if (budget && keyWord.length >= 3) {
    const d = editDistance(qKey, keyWord, budget)
    // tie-break: prefer words whose own Latin spelling is also close (mangu → mango, not মাংস)
    const latinClose = /^[a-z0-9]+$/.test(rawWord) && editDistance(qRaw, rawWord, budget) <= budget
    if (d <= budget) return 55 - d * 10 + (latinClose ? 5 : 0)
    // typo while still typing: compare with the word's prefix of the same length
    if (keyWord.length > qKey.length) {
      const dp = editDistance(qKey, keyWord.slice(0, qKey.length), budget)
      if (dp <= budget) return 40 - dp * 8
    }
  }
  return 0
}

export type PreparedQuery = {
  raw: string
  key: string
  rawWords: string[]
  keyWords: string[]
  /** Singular forms of English plurals (mangoes → mango), compared as an alternative. */
  singularWords: string[]
}

function singularKey(k: string) {
  if (k.length <= 4) return k
  const s = k.replace(/(es|s)$/, '')
  return s.length > 3 ? s.replace(/a$/, '') : s
}

export function prepareQuery(q: string): PreparedQuery | null {
  const raw = normalizeText(q)
  if (!raw) return null
  const key = phoneticKey(raw)
  const keyWords = words(key)
  return { raw, key, rawWords: words(raw), keyWords, singularWords: keyWords.map(singularKey) }
}

function scoreDoc(q: PreparedQuery, terms: IndexedTerm[]): number {
  let best = 0

  // Whole-phrase matches (strongest signal).
  for (const t of terms) {
    let s = 0
    if (t.raw === q.raw) s = 120
    else if (q.key && t.key === q.key) s = 112
    else if (t.raw.startsWith(q.raw)) s = 95
    else if (q.key.length >= 2 && t.key.startsWith(q.key)) s = 90
    if (s) best = Math.max(best, s * t.weight)
  }

  // Per-word matching: every query word must match some term word.
  const n = Math.max(q.rawWords.length, q.keyWords.length)
  if (n === 0) return best
  let total = 0
  for (let i = 0; i < n; i++) {
    const qr = q.rawWords[i] ?? ''
    const qk = q.keyWords[i] ?? ''
    const qs = q.singularWords[i] ?? ''
    let wordBest = 0
    for (const t of terms) {
      const m = Math.max(t.rawWords.length, t.keyWords.length)
      for (let j = 0; j < m; j++) {
        const rw = t.rawWords[j] ?? ''
        const kw = t.keyWords[j] ?? ''
        let s = scoreWord(qr, qk, rw, kw, t.loose)
        if (qs !== qk) s = Math.max(s, scoreWord(qr, qs, rw, kw, t.loose) - 2)
        if (s) wordBest = Math.max(wordBest, s * t.weight)
      }
    }
    if (!wordBest) return best
    total += wordBest
  }
  return Math.max(best, total / n)
}

const MIN_SCORE = 20

export function searchIndex(index: SearchIndex, query: string, limit = 20): SearchHit[] {
  const q = prepareQuery(query)
  if (!q) return []
  const hits: SearchHit[] = []
  for (const d of index.docs) {
    const score = scoreDoc(q, d.terms)
    if (score >= MIN_SCORE) hits.push({ id: d.id, score })
  }
  hits.sort((a, b) => b.score - a.score)
  // With a confident hit, drop weak look-alikes ("mango" should not list মাংস products).
  const topScore = hits[0]?.score ?? 0
  const floor = topScore >= 100 ? topScore * 0.65 : topScore >= 85 ? topScore * 0.8 : 0
  return hits.filter((h) => h.score >= floor).slice(0, limit)
}

type Loc = { bn?: string; en?: string }
type LocList = { bn?: string[]; en?: string[] }

/** Searchable fields of a product, shared by the server corpus and client-side filters. */
export function productSearchDoc(p: {
  id: string
  slug: string
  name: Loc
  alternativeNames?: LocList
  variety?: Loc
  category?: { name: Loc }
}): SearchDocInput {
  const terms: SearchTermInput[] = []
  const add = (text: string | undefined, weight: number, loose = true) => {
    if (text) terms.push({ text, weight, loose })
  }
  add(p.name.bn, 1)
  add(p.name.en, 1)
  for (const n of p.alternativeNames?.bn ?? []) add(n, 0.95)
  for (const n of p.alternativeNames?.en ?? []) add(n, 0.95)
  for (const n of SLUG_ALIASES[p.slug] ?? []) add(n, 0.93)
  add(p.slug.replace(/-/g, ' '), 0.9)
  add(p.variety?.bn, 0.55, false)
  add(p.variety?.en, 0.55, false)
  add(p.category?.name.bn, 0.7, false)
  add(p.category?.name.en, 0.7, false)
  return { id: p.id, terms }
}

/** Space-joined searchable text including romanised forms, for simple substring/regex search. */
export function searchableText(texts: (string | undefined)[]): string {
  const raw = texts.filter(Boolean).map((t) => normalizeText(t!))
  const keys = raw.map(phoneticKey)
  return Array.from(new Set([...raw, ...keys])).join(' | ')
}
