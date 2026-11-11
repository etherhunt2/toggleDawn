import { NextResponse, type NextRequest } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * GET  /api/flash-cards
 *   ?book=<id>           — filter by book
 *   ?chapter=<id>        — filter by chapter
 *   ?search=<term>       — title search (case-insensitive contains)
 *   ?sort=serial|random  — ordering (default serial by sortOrder)
 *   ?limit=<n>           — max cards to return (default 50)
 *
 * POST /api/flash-cards  — create a new flash card
 */

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const url = new URL(req.url)
    const bookId = url.searchParams.get('book')
    const chapterId = url.searchParams.get('chapter')
    const search = url.searchParams.get('search')
    const sortMode = url.searchParams.get('sort') || 'serial'
    const limit = Math.min(Number(url.searchParams.get('limit')) || 50, 200)

    const where: any = {}
    if (bookId) where.book = { equals: bookId }
    if (chapterId) where.chapter = { equals: chapterId }
    if (search) where.title = { contains: search }

    const result = await payload.find({
      collection: 'flash-cards',
      where,
      sort: sortMode === 'random' ? undefined : 'sortOrder',
      limit,
      depth: 1, // populate book & chapter titles
    })

    let docs = result.docs
    // Client-side shuffle for random mode
    if (sortMode === 'random') {
      docs = [...docs].sort(() => Math.random() - 0.5)
    }

    return NextResponse.json({ docs, totalDocs: result.totalDocs })
  } catch (err: any) {
    console.error('[flash-cards GET]', err)
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch flash cards' },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await req.json()

    const { title, contentType, textContent, image, pdf, book, chapter, sortOrder } = body

    if (!title || !book) {
      return NextResponse.json(
        { error: 'title and book are required' },
        { status: 400 },
      )
    }

    const doc = await payload.create({
      collection: 'flash-cards',
      data: {
        title,
        contentType: contentType || 'text',
        ...(textContent && { textContent }),
        ...(image && { image }),
        ...(pdf && { pdf }),
        book,
        ...(chapter && { chapter }),
        sortOrder: sortOrder ?? 0,
      },
    })

    return NextResponse.json({ doc })
  } catch (err: any) {
    console.error('[flash-cards POST]', err)
    return NextResponse.json(
      { error: err?.message || 'Failed to create flash card' },
      { status: 500 },
    )
  }
}

