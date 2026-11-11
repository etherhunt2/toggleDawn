import type { Metadata } from 'next'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { FlashCardViewer } from '@/components/FlashCards/FlashCardViewer'
import type { Book } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Flash Cards — ToggleDawn',
  description: 'Study with flash cards — swipe through your revision material.',
}

export default async function FlashCardsPage() {
  const payload = await getPayload({ config: configPromise })
  const headers = await getHeaders()

  let user = null
  try {
    const authResult = await payload.auth({ headers })
    user = authResult.user || null
  } catch (_e) {
    user = null
  }

  // Restrict access to authenticated operators
  if (!user) {
    redirect('/login')
  }

  let books: Book[] = []
  try {
    const booksRes = await payload.find({
      collection: 'books',
      limit: 100,
      pagination: false,
    })
    books = (booksRes.docs as Book[]) || []
  } catch (_e) {
    // Database might be empty
  }

  const bookOptions = books.map((b) => ({
    id: b.id,
    title: b.title,
  }))

  return <FlashCardViewer bookOptions={bookOptions} />
}
