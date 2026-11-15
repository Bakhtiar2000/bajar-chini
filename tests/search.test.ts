import { test } from 'node:test'
import assert from 'node:assert/strict'
import { transliterateBengali } from '../lib/search/transliterate'
import { phoneticKey } from '../lib/search/phonetic'
import { buildSearchIndex, editDistance, productSearchDoc, searchIndex } from '../lib/search/engine'
import { PRODUCTS } from '../scripts/seed/products'
import { CATEGORIES } from '../scripts/seed/categories'

const catBySlug = new Map<string, (typeof CATEGORIES)[number]>(CATEGORIES.map((c) => [c.slug, c]))
const index = buildSearchIndex(
  PRODUCTS.map((p) =>
    productSearchDoc({
      id: p.slug,
      slug: p.slug,
      name: { bn: p.name[0], en: p.name[1] },
      alternativeNames: p.alt,
      variety: p.variety ? { bn: p.variety[0], en: p.variety[1] } : undefined,
      category: { name: catBySlug.get(p.category)!.name },
    }),
  ),
)

const top = (q: string) => searchIndex(index, q, 5)[0]?.id
const ids = (q: string, n = 50) => searchIndex(index, q, n).map((h) => h.id)

test('transliteration of common Bengali words', () => {
  assert.equal(transliterateBengali('আম'), 'am')
  assert.equal(transliterateBengali('কলমি'), 'kolmi')
  assert.equal(transliterateBengali('পালং'), 'palong')
  assert.equal(transliterateBengali('রসুন'), 'rosun')
  assert.equal(transliterateBengali('মরিচ'), 'morich')
  assert.equal(transliterateBengali('কাতলা'), 'katla')
  assert.equal(transliterateBengali('ডিম'), 'dim')
  assert.equal(transliterateBengali('পেঁয়াজ'), 'peyaj')
})

test('phonetic keys collapse spelling variants', () => {
  assert.equal(phoneticKey('aam'), phoneticKey('am'))
  assert.equal(phoneticKey('Aam'), phoneticKey('আম'))
  assert.equal(phoneticKey('kolmi'), phoneticKey('kalmi'))
  assert.equal(phoneticKey('mangsho'), phoneticKey('mangso'))
  assert.equal(phoneticKey('roshun'), phoneticKey('রসুন'))
})

test('edit distance', () => {
  assert.equal(editDistance('mango', 'mango'), 0)
  assert.equal(editDistance('mnago', 'mango'), 1) // transposition
  assert.equal(editDistance('mangoo', 'mango'), 1)
})

test('mango in every script and spelling', () => {
  for (const q of [
    'mango',
    'Mango',
    'MANGO',
    'Aam',
    'aam',
    'am',
    'Am',
    'আম',
    'আম ',
    'mangoes',
    'mangu',
    'himsagar',
    'হিমসাগর',
  ]) {
    assert.equal(top(q), 'mango', `query "${q}"`)
  }
})

test('common Banglish / English / Bengali queries', () => {
  const cases: [string, string][] = [
    ['piyaj', 'onion'],
    ['peyaj', 'onion'],
    ['pyaj', 'onion'],
    ['পেঁয়াজ', 'onion'],
    ['onion', 'onion'],
    ['roshun', 'garlic'],
    ['রসুন', 'garlic'],
    ['alu', 'potato'],
    ['aloo', 'potato'],
    ['potato', 'potato'],
    ['dim', 'farm-egg'],
    ['egg', 'farm-egg'],
    ['ilish', 'hilsa'],
    ['elish', 'hilsa'],
    ['hilsha', 'hilsa'],
    ['ইলিশ', 'hilsa'],
    ['rui', 'rui-fish'],
    ['rui mach', 'rui-fish'],
    ['রুই মাছ', 'rui-fish'],
    ['begun', 'brinjal'],
    ['eggplant', 'brinjal'],
    ['kolmi', 'kolmi-shak'],
    ['kalmi shak', 'kolmi-shak'],
    ['palong', 'palong-shak'],
    ['dherosh', 'okra'],
    ['lady finger', 'okra'],
    ['kacha morich', 'green-chili'],
    ['khasi', 'goat-meat'],
    ['gorur mangsho', 'beef'],
    ['tormuj', 'watermelon'],
    ['peyara', 'guava'],
    ['chingri', 'golda-chingri'],
    ['cauliflower', 'cauliflower'],
    ['fulkopi', 'cauliflower'],
    ['ফুলকপি', 'cauliflower'],
    ['masur dal', 'masoor-dal'],
    ['broilar', 'broiler-chicken'],
    ['tomato', 'tomato'],
    ['tometo', 'tomato'],
  ]
  for (const [q, slug] of cases)
    assert.equal(top(q), slug, `query "${q}" → ${ids(q, 3).join(', ')}`)
})

test('category words return all products of that category', () => {
  const fish = PRODUCTS.filter((p) => p.category === 'fish').map((p) => p.slug)
  for (const q of ['fish', 'মাছ', 'mach']) {
    const got = ids(q)
    for (const s of fish) assert.ok(got.includes(s), `"${q}" should include ${s}`)
  }
})

test('short queries do not match unrelated categories', () => {
  // "rui" must not pull in every fruit through the word "fruits".
  assert.deepEqual(ids('rui'), ['rui-fish'])
})

test('no results for gibberish', () => {
  assert.deepEqual(ids('xqzvw'), [])
})

test('plural English does not drag in look-alike products', () => {
  assert.deepEqual(ids('mangoes'), ['mango'])
})
