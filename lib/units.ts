export const UNITS = {
  kg: { key: 'kg', bn: 'কেজি', en: 'kg' },
  piece: { key: 'piece', bn: 'পিস', en: 'piece' },
  hali: { key: 'hali', bn: 'হালি', en: 'hali (4 pcs)' },
  dozen: { key: 'dozen', bn: 'ডজন', en: 'dozen' },
  bundle: { key: 'bundle', bn: 'আঁটি', en: 'bundle' },
  litre: { key: 'litre', bn: 'লিটার', en: 'litre' },
  '100g': { key: '100g', bn: '১০০ গ্রাম', en: '100 g' },
  '250g': { key: '250g', bn: '২৫০ গ্রাম', en: '250 g' },
} as const

export type UnitKey = keyof typeof UNITS
export type Unit = { key: string; bn: string; en: string }

export const UNIT_KEYS = Object.keys(UNITS) as UnitKey[]

export function isUnitKey(value: unknown): value is UnitKey {
  return typeof value === 'string' && value in UNITS
}

export function unitFromKey(key: string): Unit {
  return isUnitKey(key) ? { ...UNITS[key] } : { ...UNITS.kg }
}
