import { transliterateBengali } from './transliterate'

/*
 * Phonetic key for Latin / Banglish text. Spelling variants that Bangladeshi
 * shoppers use interchangeably collapse to the same key:
 *   aam, Am, AAM        → am
 *   peyaj, piyaj, pyaj  → piaj / peiaj (one edit apart)
 *   mangsho, mangso     → mangs
 *   chingri, cingri     → cingri
 *   kolmi, kalmi        → kalmi
 */

const DIGRAPHS: [RegExp, string][] = [
  [/chh/g, 'C'],
  [/ch/g, 'C'],
  [/ck/g, 'k'],
  [/c/g, 'k'], // English "c" (cauliflower, carrot)
  [/C/g, 'c'],
  [/sh/g, 's'],
  [/ph/g, 'f'],
  [/kh/g, 'k'],
  [/gh/g, 'g'],
  [/jh/g, 'j'],
  [/th/g, 't'],
  [/dh/g, 'd'],
  [/bh/g, 'b'],
  [/rh/g, 'r'],
  [/z/g, 'j'],
  [/q/g, 'k'],
  [/x/g, 'ks'],
  [/v/g, 'b'],
  [/w/g, 'u'],
  [/ee/g, 'i'],
  [/oo/g, 'u'],
  [/y/g, 'i'],
  [/o/g, 'a'], // inherent vowel is written o or a: kolmi / kalmi
]

function keyWord(word: string): string {
  let w = word
  for (const [re, rep] of DIGRAPHS) w = w.replace(re, rep)
  // collapse doubled letters: aam → am, mm → m
  w = w.replace(/(.)\1+/g, '$1')
  // a word-final inherent vowel is often written or dropped: mangsho / mangs
  if (w.length > 3) w = w.replace(/a$/, '')
  return w
}

/** Lower-case, strip accents and punctuation; keeps Latin letters and digits. */
export function latinFold(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/** Phonetic key of any Bengali / English / Banglish text, as space-separated words. */
export function phoneticKey(value: string): string {
  return latinFold(transliterateBengali(value))
    .split(' ')
    .filter(Boolean)
    .map(keyWord)
    .filter(Boolean)
    .join(' ')
}
