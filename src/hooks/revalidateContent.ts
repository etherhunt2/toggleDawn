import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * Revalidates Next.js cached pages for Books, Chapters, and Notes
 * after content changes. Builds the correct SEO silo path.
 */
export const revalidateContent: CollectionAfterChangeHook = async ({
  doc,
  collection,
  req,
  context,
}) => {
  if (context.skipRevalidate || context.disableRevalidate) return doc

  const slug = collection?.slug

  try {
    req.payload.logger.info(`Revalidating ${slug}: ${doc.slug || doc.id}`)

    // Revalidate the collection tag for list pages
    revalidateTag(slug, 'max')

    // Revalidate specific paths based on collection type
    if (slug === 'books' && doc.slug) {
      revalidatePath(`/books/${doc.slug}`)
    }

  if (slug === 'chapters' && doc.slug && doc.book) {
    // Need to resolve the book slug for the full path
    const book =
      typeof doc.book === 'object'
        ? doc.book
        : await req.payload.findByID({
            collection: 'books',
            id: doc.book,
            depth: 0,
            select: { slug: true },
            req,
          })

    if (book?.slug) {
      revalidatePath(`/books/${book.slug}/${doc.slug}`)
      // Also revalidate parent book page (chapter list may have changed)
      revalidatePath(`/books/${book.slug}`)
    }
  }

  if (slug === 'notes' && doc.slug && doc.chapter) {
    // Need to resolve the full path: /books/{book}/{chapter}/{note}
    const chapter =
      typeof doc.chapter === 'object'
        ? doc.chapter
        : await req.payload.findByID({
            collection: 'chapters',
            id: doc.chapter,
            depth: 1,
            select: { slug: true, book: true },
            req,
          })

    if (chapter?.slug) {
      const book =
        typeof chapter.book === 'object'
          ? chapter.book
          : await req.payload.findByID({
              collection: 'books',
              id: chapter.book,
              depth: 0,
              select: { slug: true },
              req,
            })

      if (book?.slug) {
        revalidatePath(`/books/${book.slug}/${chapter.slug}/${doc.slug}`)
        // Also revalidate parent chapter page
        revalidatePath(`/books/${book.slug}/${chapter.slug}`)
      }
    }
  }
  } catch (_e) {
    // Ignore cache revalidation errors outside of request context (e.g. CLI seeding)
  }

  return doc
}

/**
 * Revalidate on deletion of SEO content.
 */
export const revalidateContentDelete: CollectionAfterDeleteHook = async ({
  doc,
  collection,
  req,
}) => {
  const slug = collection?.slug
  try {
    req.payload.logger.info(`Revalidating after delete: ${slug}`)
    revalidateTag(slug, 'max')
  } catch (_e) {
    // Ignore cache revalidation errors outside of request context
  }
  return doc
}
