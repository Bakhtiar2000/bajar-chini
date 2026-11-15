/*
 * Loose Bengali → Latin romanisation, tuned for matching what people type in
 * "Banglish" (আম → am, পেঁয়াজ → peyaj, কলমি → kolmi, মাংস → mangs).
 * It is not a scholarly transliteration: it only has to land close enough for
 * the phonetic key (see phonetic.ts) and fuzzy matching to do the rest.
 */

const INDEPENDENT_VOWELS: Record<string, string> = {
  অ: 'o',
  আ: 'a',
  ই: 'i',
  ঈ: 'i',
  উ: 'u',
  ঊ: 'u',
  ঋ: 'ri',
  এ: 'e',
  ঐ: 'oi',
  ও: 'o',
  ঔ: 'ou',
}

const VOWEL_SIGNS: Record<string, string> = {
  'া': 'a',
  'ি': 'i',
  'ী': 'i',
  'ু': 'u',
  'ূ': 'u',
  'ৃ': 'ri',
  'ে': 'e',
  'ৈ': 'oi',
  'ো': 'o',
  'ৌ': 'ou',
}

const CONSONANTS: Record<string, string> = {
  ক: 'k',
  খ: 'kh',
  গ: 'g',
  ঘ: 'gh',
  ঙ: 'ng',
  চ: 'ch',
  ছ: 'chh',
  জ: 'j',
  ঝ: 'jh',
  ঞ: 'n',
  ট: 't',
  ঠ: 'th',
  ড: 'd',
  ঢ: 'dh',
  ণ: 'n',
  ত: 't',
  থ: 'th',
  দ: 'd',
  ধ: 'dh',
  ন: 'n',
  প: 'p',
  ফ: 'f',
  ব: 'b',
  ভ: 'bh',
  ম: 'm',
  য: 'j',
  র: 'r',
  ল: 'l',
  শ: 'sh',
  ষ: 'sh',
  স: 's',
  হ: 'h',
  ৎ: 't',
  ড়: 'r',
  ঢ়: 'rh',
  য়: 'y',
}

/** Consonant + nukta (়) pairs; NFC keeps these decomposed. */
const NUKTA: Record<string, string> = { ড: 'r', ঢ: 'rh', য: 'y' }

const HASANT = '্'
const NUKTA_SIGN = '়'
const ANUSVARA = 'ং'
const VISARGA = 'ঃ'
const CHANDRABINDU = 'ঁ'
const BN_DIGITS = '০১২৩৪৫৬৭৮৯'

export const BENGALI_RE = /[ঀ-৿]/

export function hasBengali(value: string) {
  return BENGALI_RE.test(value)
}

function isConsonant(ch: string | undefined) {
  return ch !== undefined && ch in CONSONANTS
}

/** Romanise one Bengali word (no spaces). */
function transliterateWord(word: string): string {
  const chars = Array.from(word)
  let out = ''
  let prevWasVowel = false

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]

    if (ch in INDEPENDENT_VOWELS) {
      out += INDEPENDENT_VOWELS[ch]
      prevWasVowel = true
      continue
    }
    if (ch in VOWEL_SIGNS) {
      out += VOWEL_SIGNS[ch]
      prevWasVowel = true
      continue
    }
    if (ch === ANUSVARA) {
      out += 'ng'
      prevWasVowel = false
      continue
    }
    if (ch === VISARGA) {
      out += 'h'
      prevWasVowel = false
      continue
    }
    if (ch === CHANDRABINDU || ch === HASANT || ch === NUKTA_SIGN) continue
    const digit = BN_DIGITS.indexOf(ch)
    if (digit >= 0) {
      out += String(digit)
      prevWasVowel = false
      continue
    }

    if (isConsonant(ch)) {
      let j = i + 1
      let roman = CONSONANTS[ch]
      if (chars[j] === NUKTA_SIGN && NUKTA[ch]) {
        roman = NUKTA[ch]
        j++
      }
      out += roman
      i = j - 1

      // Decide whether this consonant carries the inherent vowel "o".
      while (chars[j] === CHANDRABINDU) j++
      const next = chars[j]
      if (next === undefined || !BENGALI_RE.test(next)) {
        // word-final: inherent vowel is silent (আম → am)
        prevWasVowel = false
      } else if (next in VOWEL_SIGNS || next === HASANT) {
        prevWasVowel = false // the sign (or conjunct) decides
      } else if (next === ANUSVARA || next === VISARGA) {
        out += 'o' // পালং → palong
        prevWasVowel = true
      } else if (isConsonant(next) && !prevWasVowel) {
        // syllable-initial consonant before another consonant: কলমি → ko-lmi → kolmi
        out += 'o'
        prevWasVowel = true
      } else {
        prevWasVowel = false
      }
      continue
    }

    // Anything else (punctuation inside the word etc.) passes through.
    out += ch
    prevWasVowel = false
  }
  return out
}

/** Romanise Bengali text; Latin text passes through unchanged. */
export function transliterateBengali(value: string): string {
  if (!hasBengali(value)) return value
  return value
    .normalize('NFC')
    .split(/(\s+)/)
    .map((part) => (hasBengali(part) ? transliterateWord(part) : part))
    .join('')
}
