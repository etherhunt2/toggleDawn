import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React, { cache } from 'react'
import Link from 'next/link'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'

import { generateMeta } from '@/utilities/generateMeta'

type Args = {
  params: Promise<{ bookSlug: string }>
}

/**
 * Single Book page — /books/{bookSlug}
 * Shows book details and lists its chapters (SEO silo parent).
 */
export default async function BookPage({ params: paramsPromise }: Args) {
  const { bookSlug } = await paramsPromise
  const decodedSlug = decodeURIComponent(bookSlug)

  const book = await queryBookBySlug({ slug: decodedSlug })
  if (!book) return notFound()

  const payload = await getPayload({ config: configPromise })

  // Fetch chapters for this book
  const chapters = await payload.find({
    collection: 'chapters',
    draft: false,
    overrideAccess: false,
    where: {
      book: { equals: book.id },
      _status: { equals: 'published' },
    },
    sort: 'sortOrder',
    limit: 200,
    select: {
      title: true,
      slug: true,
      description: true,
      progressStatus: true,
      completionPercent: true,
      sortOrder: true,
    },
  })

  return (
    <main className="pt-16 pb-24">
      <section className="container py-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
          <Link href="/books" className="hover:underline">
            Books
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-foreground">{book.title}</span>
        </nav>

        <h1 className="text-4xl font-bold mb-4">{book.title}</h1>

        {book.subject && (
          <p className="text-muted-foreground mb-2">
            <strong>Subject:</strong> {book.subject}
          </p>
        )}
        {book.author && (
          <p className="text-muted-foreground mb-2">
            <strong>Author:</strong> {book.author}
          </p>
        )}
        {book.description && <p className="text-muted-foreground mt-4 mb-8">{book.description}</p>}

        {/* Chapters list */}
        <h2 className="text-2xl font-semibold mt-12 mb-6">Chapters</h2>
        {chapters.docs.length === 0 ? (
          <p className="text-muted-foreground">No chapters published yet.</p>
        ) : (
          <div className="grid gap-4">
            {chapters.docs.map((chapter, index) => (
              <Link
                key={chapter.id}
                href={`/books/${decodedSlug}/${chapter.slug}`}
                className="flex items-center gap-4 p-4 border rounded-lg hover:border-primary transition-colors"
              >
                <span className="text-2xl font-bold text-muted-foreground w-10 text-center">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-lg font-medium">{chapter.title}</h3>
                  {chapter.description && (
                    <p className="text-sm text-muted-foreground mt-1">{chapter.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const books = await payload.find({
    collection: 'books',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
  })

  return books.docs?.map(({ slug }) => ({ bookSlug: slug })) || []
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { bookSlug } = await paramsPromise
  const book = await queryBookBySlug({ slug: decodeURIComponent(bookSlug) })
  return generateMeta({ doc: book })
}

const queryBookBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'books',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: { slug: { equals: slug } },
  })

  return result.docs?.[0] || null
})
