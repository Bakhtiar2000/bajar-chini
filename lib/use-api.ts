'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { api, errorMessage } from './client-api'

/**
 * Fetches `url` (admin JSON API) and re-fetches when it changes or `reload()` is called.
 * State is only updated from the async callback; `loading` is derived.
 */
export function useApi<T>(url: string | null) {
  const [version, setVersion] = useState(0)
  const [state, setState] = useState<{ key: string | null; data?: T }>({ key: null })
  const key = url ? `${url}#${version}` : null

  useEffect(() => {
    if (!url) return
    let cancelled = false
    const k = `${url}#${version}`
    api<T>(url)
      .then((data) => !cancelled && setState({ key: k, data }))
      .catch((e) => {
        if (cancelled) return
        toast.error(errorMessage(e))
        setState((s) => ({ ...s, key: k }))
      })
    return () => {
      cancelled = true
    }
  }, [url, version])

  const reload = useCallback(() => setVersion((v) => v + 1), [])
  return { data: state.data, loading: key !== null && state.key !== key, reload }
}
