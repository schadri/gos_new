'use client'

import * as React from 'react'
import { RedirectLoading } from './redirect-loading'

export function AuthHashCatcher() {
  const [isCatching, setIsCatching] = React.useState(false)

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      const search = window.location.search
      if (hash.includes('access_token') || search.includes('code=')) {
        setIsCatching(true)
      }
    }
  }, [])

  if (!isCatching) return null

  return <RedirectLoading />
}
