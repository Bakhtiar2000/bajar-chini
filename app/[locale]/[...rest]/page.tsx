import { notFound } from 'next/navigation'

// The catch-all always renders the 404 page, so instant-navigation validation does not apply.
export const instant = false

// Any unmatched path renders the localized 404 page.
export default function CatchAll() {
  notFound()
}
