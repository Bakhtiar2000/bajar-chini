import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  analyzePeriod,
  buildPeriodSeries,
  calculateMonthlyChange,
  calculateReferencePrice,
  getFreshness,
  isUnusualChange,
} from '../lib/prices/calc'

const rec = (year: number, month: number, min: number, max: number) => ({
  year,
  month,
  minimumPrice: min,
  maximumPrice: max,
})

test('reference price is the midpoint', () => {
  assert.equal(calculateReferencePrice(300, 380), 340)
  assert.equal(calculateReferencePrice(25, 36), 30.5)
})

test('monthly change compares consecutive months of the same series', () => {
  const r = calculateMonthlyChange([rec(2026, 11, 300, 380), rec(2026, 10, 280, 350)])
  assert.equal(r.status, 'ok')
  if (r.status === 'ok') {
    assert.equal(r.change, 25)
    assert.equal(r.percent, 7.94)
  }
})

test('monthly change across a year boundary', () => {
  const r = calculateMonthlyChange([rec(2026, 1, 110, 110), rec(2025, 12, 100, 100)])
  assert.equal(r.status, 'ok')
  if (r.status === 'ok') assert.equal(r.percent, 10)
})

test('no previous observation is never treated as zero', () => {
  assert.equal(
    calculateMonthlyChange([rec(2026, 11, 300, 380), rec(2026, 9, 280, 350)]).status,
    'no-previous',
  )
  assert.equal(calculateMonthlyChange([]).status, 'no-data')
})

test('zero previous price is handled safely', () => {
  assert.equal(
    calculateMonthlyChange([rec(2026, 11, 10, 20), rec(2026, 10, 0, 0)]).status,
    'zero-previous',
  )
})

test('series keeps missing months as gaps without interpolation', () => {
  const pts = buildPeriodSeries([rec(2026, 11, 300, 380), rec(2026, 9, 280, 350)], '6m', {
    year: 2026,
    month: 11,
  })
  assert.equal(pts.length, 6)
  const oct = pts.find((p) => p.month === 10)!
  assert.equal(oct.observed, false)
  assert.equal(oct.ref, null)
})

test('period extremes use min of minimums and max of maximums', () => {
  const a = analyzePeriod(
    [rec(2026, 11, 300, 380), rec(2026, 10, 280, 400), rec(2025, 1, 10, 20)],
    '12m',
    { year: 2026, month: 11 },
  )
  assert.equal(a.highest?.value, 400)
  assert.equal(a.lowest?.value, 280) // Jan 2025 is outside the 12-month window
  assert.equal(a.observedCount, 2)
})

test('freshness is based on observation month', () => {
  const now = { year: 2026, month: 11 }
  assert.equal(getFreshness({ year: 2026, month: 11 }, now), 'current')
  assert.equal(getFreshness({ year: 2026, month: 10 }, now), 'last-month')
  assert.equal(getFreshness({ year: 2026, month: 8 }, now), 'older')
  assert.equal(getFreshness({ year: 2025, month: 12 }, { year: 2026, month: 1 }), 'last-month')
})

test('unusual change threshold', () => {
  assert.equal(isUnusualChange(100, 131), true)
  assert.equal(isUnusualChange(100, 120), false)
  assert.equal(isUnusualChange(0, 50), false)
})
