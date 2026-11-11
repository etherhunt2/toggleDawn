import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'

import { Book, Chapter, Note, Page } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

/**
 * Generate SEO title:
 * Note: "Note Title | Chapter Title | Book Title | ToggleDawn"
 * Chapter: "Chapter Title | Book Title | ToggleDawn"
 * Book: "Book Title | ToggleDawn"
 * Page: "Page Title | ToggleDawn"
 */
const generateTitle: GenerateTitle<Book | Chapter | Note | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | ToggleDawn` : 'ToggleDawn'
}

/**
 * Generate SEO URL:
 * Book: /books/{slug}
 * Chapter: /books/{book-slug}/{slug}
 * Note: /books/{book-slug}/{chapter-slug}/{slug}
 * Page: /{slug}
 */
const generateURL: GenerateURL<Book | Chapter | Note | Page> = ({ doc }) => {
  const url = getServerSideURL()
  if (!doc?.slug) return url
  if ('mission' in doc) {
    // Book
    return `${url}/books/${doc.slug}`
  }
  if ('book' in doc) {
    // Chapter
    return `${url}/books/${doc.slug}`
  }
  if ('chapter' in doc) {
    // Note
    return `${url}/books/${doc.slug}`
  }
  return doc.slug === 'home' ? url : `${url}/${doc.slug}`
}

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages', 'books', 'chapters', 'notes'],
    overrides: {
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'You will need to rebuild the website when changing this field.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  seoPlugin({
    collections: ['pages', 'books', 'chapters', 'notes'],
    generateTitle,
    generateURL,
  }),
  searchPlugin({
    collections: ['pages', 'books', 'chapters', 'notes'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
]
