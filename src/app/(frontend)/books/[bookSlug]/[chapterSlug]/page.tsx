import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React, { cache } from 'react'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'

import { generateMeta } from '@/utilities/generateMeta'

type Args = {
  params: Promise<{ bookSlug: string; chapterSlug: string }>
}

/**
 * Single Chapter page — /books/{bookSlug}/{chapterSlug}
 * Shows chapter details and lists its notes (SEO silo mid-level).
 */
export default async function ChapterPage({ params: paramsPromise }: Args) {
  const { bookSlug, chapterSlug } = await paramsPromise
  const decodedBookSlug = decodeURIComponent(bookSlug)
  const decodedChapterSlug = decodeURIComponent(chapterSlug)

  const { book, chapter } = await queryChapterBySlug({
    bookSlug: decodedBookSlug,
    chapterSlug: decodedChapterSlug,
  })

  if (!book || !chapter) return notFound()

  const payload = await getPayload({ config: configPromise })

  // Fetch notes for this chapter
  const notes = await payload.find({
    collection: 'notes',
    draft: false,
    overrideAccess: false,
    where: {
      chapter: { equals: chapter.id },
      _status: { equals: 'published' },
    },
    sort: 'sortOrder',
    limit: 200,
    select: {
      title: true,
      slug: true,
      noteType: true,
      isCompleted: true,
      sortOrder: true,
    },
  })

  return (
    <main className="pt-16 pb-24">
      <section className="container py-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
          <a href="/books" className="hover:underline">
            Books
          </a>
          <span className="mx-2">/</span>
          <a href={`/books/${decodedBookSlug}`} className="hover:underline">
            {book.title}
          </a>
          <span className="mx-2">/</span>
          <span className="font-medium text-foreground">{chapter.title}</span>
        </nav>

        <h1 className="text-4xl font-bold mb-4">{chapter.title}</h1>

        {chapter.description && (
          <p className="text-muted-foreground mt-2 mb-8">{chapter.description}</p>
        )}

        {/* Notes list */}
        <h2 className="text-2xl font-semibold mt-12 mb-6">Notes</h2>
        {notes.docs.length === 0 ? (
          <p className="text-muted-foreground">No notes published yet.</p>
        ) : (
          <div className="grid gap-4">
            {notes.docs.map((note, index) => (
              <a
                key={note.id}
                href={`/books/${decodedBookSlug}/${decodedChapterSlug}/${note.slug}`}
                className="flex items-center gap-4 p-4 border rounded-lg hover:border-primary transition-colors"
              >
                <span className="text-2xl font-bold text-muted-foreground w-10 text-center">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <h3 className="text-lg font-medium">{note.title}</h3>
                  {note.noteType && (
                    <span className="text-xs uppercase tracking-wider text-muted-foreground mt-1 inline-block">
                      {note.noteType}
                    </span>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })

  const chapters = await payload.find({
    collection: 'chapters',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    depth: 1,
    select: { slug: true, book: true },
  })

  return (
    chapters.docs
      ?.filter((doc) => typeof doc.book === 'object' && doc.book?.slug)
      .map((doc) => ({
        bookSlug: (doc.book as any).slug,
        chapterSlug: doc.slug,
      })) || []
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { bookSlug, chapterSlug } = await paramsPromise
  const { chapter } = await queryChapterBySlug({
    bookSlug: decodeURIComponent(bookSlug),
    chapterSlug: decodeURIComponent(chapterSlug),
  })
  return generateMeta({ doc: chapter })
}

const queryChapterBySlug = cache(
  async ({ bookSlug, chapterSlug }: { bookSlug: string; chapterSlug: string }) => {
    const { isEnabled: draft } = await draftMode()
    const payload = await getPayload({ config: configPromise })

    // First find the book
    const bookResult = await payload.find({
      collection: 'books',
      draft,
      limit: 1,
      pagination: false,
      overrideAccess: draft,
      where: { slug: { equals: bookSlug } },
      select: { id: true, title: true, slug: true },
    })

    const book = bookResult.docs?.[0] || null
    if (!book) return { book: null, chapter: null }

    // Then find the chapter within that book
    const chapterResult = await payload.find({
      collection: 'chapters',
      draft,
      limit: 1,
      pagination: false,
      overrideAccess: draft,
      where: {
        slug: { equals: chapterSlug },
        book: { equals: book.id },
      },
    })

    return {
      book,
      chapter: chapterResult.docs?.[0] || null,
    }
  },
)
