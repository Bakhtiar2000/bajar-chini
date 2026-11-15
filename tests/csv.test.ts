import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseCsv, parseCsvObjects, toCsv } from '../lib/csv'

test('toCsv escapes quotes, commas and newlines and adds a BOM', () => {
  const csv = toCsv(
    ['a', 'b'],
    [
      ['x,y', 'say "hi"'],
      ['line\nbreak', 5],
    ],
  )
  assert.ok(csv.startsWith('﻿'))
  assert.equal(csv.slice(1), 'a,b\r\n"x,y","say ""hi"""\r\n"line\nbreak",5\r\n')
})

test('toCsv neutralises formula injection', () => {
  assert.equal(toCsv(['a'], [['=SUM(A1)']], { bom: false }), "a\r\n'=SUM(A1)\r\n")
  assert.equal(toCsv(['a'], [[-5]], { bom: false }), 'a\r\n-5\r\n') // numbers untouched
})

test('parseCsv round-trips', () => {
  const rows = [
    ['slug', 'name'],
    ['rui-fish', 'রুই মাছ, বড়'],
    ['x', 'quote "here"'],
  ]
  assert.deepEqual(parseCsv(toCsv(rows[0], rows.slice(1))), rows)
})

test('parseCsvObjects keys by lower-cased header and skips blank lines', () => {
  const objs = parseCsvObjects('Slug,Min\r\nonion,80\r\n\r\ngarlic,200\n')
  assert.deepEqual(objs, [
    { slug: 'onion', min: '80' },
    { slug: 'garlic', min: '200' },
  ])
})
