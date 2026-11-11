import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export default async function BooksLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayload({ config: configPromise })
  const headers = await getHeaders()

  let user = null
  try {
    const authResult = await payload.auth({ headers })
    user = authResult.user || null
  } catch (_e) {
    user = null
  }

  // Restrict books, chapters, and notes to authenticated operators
  if (!user) {
    redirect('/login')
  }

  return <>{children}</>
}

