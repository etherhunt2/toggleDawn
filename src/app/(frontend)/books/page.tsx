import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import Link from 'next/link'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getServerSideURL } from '@/utilities/getURL'

/**
 * Books listing page — /books
 * Lists all published books with SEO metadata.
 */
export default async function BooksPage() {
  const payload = await getPayload({ config: configPromise })
  const headers = await getHeaders()

  let user = null
  try {
    const authResult = await payload.auth({ headers })
    user = authResult.user || null
  } catch (_e) {
    user = null
  }

  if (!user) {
    redirect('/login')
  }

  const books = await payload.find({
    collection: 'books',
    draft: false,
    limit: 100,
    overrideAccess: false,
    sort: '-createdAt',
    where: {
      _status: { equals: 'published' },
    },
    select: {
      title: true,
      slug: true,
      subject: true,
      author: true,
      description: true,
      completionPercent: true,
      meta: true,
    },
  })

  return (
    <main className="pt-16 pb-24">
      <section className="container py-12">
        <h1 className="text-4xl font-bold mb-8">Study Books</h1>

        {books.docs.length === 0 ? (
          <p className="text-muted-foreground">No books published yet.</p>
        ) : (
          <div className="grid gap-6">
            {books.docs.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.slug}`}
                className="block p-6 border rounded-lg hover:border-primary transition-colors"
              >
                <h2 className="text-2xl font-semibold mb-2">{book.title}</h2>
                {book.subject && (
                  <p className="text-sm text-muted-foreground mb-1">Subject: {book.subject}</p>
                )}
                {book.author && (
                  <p className="text-sm text-muted-foreground mb-1">Author: {book.author}</p>
                )}
                {book.description && (
                  <p className="text-muted-foreground mt-2">{book.description}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export const metadata: Metadata = {
  title: 'Study Books | ToggleDawn',
  description: 'Browse all study books and materials on ToggleDawn.',
  openGraph: {
    title: 'Study Books | ToggleDawn',
    description: 'Browse all study books and materials on ToggleDawn.',
    url: `${getServerSideURL()}/books`,
    siteName: 'ToggleDawn',
    type: 'website',
  },
}
