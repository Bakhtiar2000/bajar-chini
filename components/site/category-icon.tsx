import {
  Apple,
  Beef,
  Carrot,
  Drumstick,
  Egg,
  Fish,
  Flame,
  Leaf,
  Wheat,
  type LucideIcon,
} from 'lucide-react'
import type { CategoryIcon } from '@/lib/types'

export const CATEGORY_ICONS: Record<CategoryIcon, LucideIcon> = {
  fish: Fish,
  chicken: Drumstick,
  beef: Beef,
  mutton: Beef,
  vegetable: Carrot,
  leafy: Leaf,
  fruit: Apple,
  spice: Flame,
  grain: Wheat,
  other: Egg,
}

/** Soft, food-appropriate tints for image-less tiles. */
export const CATEGORY_TINTS: Record<CategoryIcon, { bg: string; fg: string }> = {
  fish: { bg: '#e0f2fe', fg: '#0369a1' },
  chicken: { bg: '#fef3c7', fg: '#b45309' },
  beef: { bg: '#fee2e2', fg: '#b91c1c' },
  mutton: { bg: '#ffe4e6', fg: '#be123c' },
  vegetable: { bg: '#dcfce7', fg: '#166534' },
  leafy: { bg: '#ecfccb', fg: '#3f6212' },
  fruit: { bg: '#ffedd5', fg: '#c2410c' },
  spice: { bg: '#fef9c3', fg: '#a16207' },
  grain: { bg: '#f5f5dc', fg: '#78716c' },
  other: { bg: '#f3f4f6', fg: '#4b5563' },
}
