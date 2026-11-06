import 'server-only'
import { revalidateTag } from 'next/cache'
import type { CacheTag } from './cache-tags'

/**
 * Expire cached public data immediately after an admin change so the next
 * visitor sees fresh content (no stale window after publication).
 */
export function invalidate(...tags: CacheTag[]) {
  for (const tag of new Set(tags)) revalidateTag(tag, { expire: 0 })
}
