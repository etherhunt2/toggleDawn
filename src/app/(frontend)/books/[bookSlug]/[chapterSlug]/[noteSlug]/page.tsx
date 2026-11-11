import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React, { cache } from 'react'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'

import { RichText } from '@payloadcms/richtext-lexical/react'
import { generateMeta } from '@/utilities/generateMeta'

type Args = {
  params: Promise<{ bookSlug: string; chapterSlug: string; noteSlug: string }>
}

/**
 * Single Note page — /books/{bookSlug}/{chapterSlug}/{noteSlug}
 * Leaf-level SEO content in the silo hierarchy.
 * Renders the rich text note content.
 */
export default async function NotePage({ params: paramsPromise }: Args) {
  const { bookSlug, chapterSlug, noteSlug } = await paramsPromise
  const decodedBookSlug = decodeURIComponent(bookSlug)
  const decodedChapterSlug = decodeURIComponent(chapterSlug)
  const decodedNoteSlug = decodeURIComponent(noteSlug)

  const { book, chapter, note } = await queryNoteBySlug({
    bookSlug: decodedBookSlug,
    chapterSlug: decodedChapterSlug,
    noteSlug: decodedNoteSlug,
  })

  if (!book || !chapter || !note) return notFound()

  return (
    <main className="pt-16 pb-24">
      <article className="container py-12 max-w-3xl mx-auto">
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
          <a
            href={`/books/${decodedBookSlug}/${decodedChapterSlug}`}
            className="hover:underline"
          >
            {chapter.title}
          </a>
          <span className="mx-2">/</span>
          <span className="font-medium text-foreground">{note.title}</span>
        </nav>

        {/* Note type badge */}
        {note.noteType && (
          <span className="inline-block text-xs uppercase tracking-wider px-2 py-1 rounded bg-muted text-muted-foreground mb-4">
            {note.noteType}
          </span>
        )}

        <h1 className="text-4xl font-bold mb-8">{note.title}</h1>

        {/* Rich text content */}
        {note.content && (
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <RichText data={note.content} />
          </div>
        )}
      </article>
    </main>
  )
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })

  const notes = await payload.find({
    collection: 'notes',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    depth: 2,
    select: { slug: true, chapter: true },
  })

  return (
    notes.docs
      ?.filter(
        (doc) =>
          typeof doc.chapter === 'object' &&
          doc.chapter?.slug &&
          typeof doc.chapter?.book === 'object' &&
          (doc.chapter.book as any)?.slug,
      )
      .map((doc) => ({
        bookSlug: ((doc.chapter as any).book as any).slug,
        chapterSlug: (doc.chapter as any).slug,
        noteSlug: doc.slug,
      })) || []
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { bookSlug, chapterSlug, noteSlug } = await paramsPromise
  const { note } = await queryNoteBySlug({
    bookSlug: decodeURIComponent(bookSlug),
    chapterSlug: decodeURIComponent(chapterSlug),
    noteSlug: decodeURIComponent(noteSlug),
  })
  return generateMeta({ doc: note })
}

const queryNoteBySlug = cache(
  async ({
    bookSlug,
    chapterSlug,
    noteSlug,
  }: {
    bookSlug: string
    chapterSlug: string
    noteSlug: string
  }) => {
    const { isEnabled: draft } = await draftMode()
    const payload = await getPayload({ config: configPromise })

    // Find the book
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
    if (!book) return { book: null, chapter: null, note: null }

    // Find the chapter
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
      select: { id: true, title: true, slug: true },
    })
    const chapter = chapterResult.docs?.[0] || null
    if (!chapter) return { book, chapter: null, note: null }

    // Find the note
    const noteResult = await payload.find({
      collection: 'notes',
      draft,
      limit: 1,
      pagination: false,
      overrideAccess: draft,
      where: {
        slug: { equals: noteSlug },
        chapter: { equals: chapter.id },
      },
    })

    return {
      book,
      chapter,
      note: noteResult.docs?.[0] || null,
    }
  },
)
