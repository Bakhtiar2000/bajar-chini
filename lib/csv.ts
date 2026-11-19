/*
 * Minimal RFC 4180 CSV helpers (no dependencies). Output starts with a UTF-8
 * BOM so Excel opens Bengali text correctly.
 */

export type CsvValue = string | number | boolean | null | undefined

function cell(value: CsvValue): string {
  if (value === null || value === undefined) return ''
  const s = String(value)
  // Neutralise spreadsheet formula injection (=, +, -, @ at the start of text).
  const safe = typeof value === 'string' && /^[=+\-@\t\r]/.test(s) ? `'${s}` : s
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

export function toCsv(headers: string[], rows: CsvValue[][], { bom = true } = {}): string {
  const lines = [headers, ...rows].map((r) => r.map(cell).join(','))
  return (bom ? '﻿' : '') + lines.join('\r\n') + '\r\n'
}

/** Parses CSV text into rows of strings. Handles quotes, escaped quotes and CRLF. */
export function parseCsv(text: string): string[][] {
  const src = text.replace(/^﻿/, '')
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"'
          i++
        } else quoted = false
      } else field += ch
      continue
    }
    if (ch === '"' && field === '') quoted = true
    else if (ch === ',') {
      row.push(field)
      field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else field += ch
  }
  if (field !== '' || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ''))
}

/** Parses CSV with a header row into objects keyed by (trimmed, lower-cased) header. */
export function parseCsvObjects(text: string): Record<string, string>[] {
  const [header, ...rows] = parseCsv(text)
  if (!header) return []
  const keys = header.map((h) => h.trim().toLowerCase())
  return rows.map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? '').trim()])))
}
