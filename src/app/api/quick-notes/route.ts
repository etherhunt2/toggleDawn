import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })
    const notes = await payload.find({
      collection: 'notes',
      sort: '-createdAt',
      limit: 20,
      pagination: false,
    })

    return NextResponse.json({
      success: true,
      docs: notes.docs,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch quick notes' },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await req.json()

    const {
      title,
      content,
      noteType = 'note',
      chapterId,
    } = body

    if (!title && !content) {
      return NextResponse.json(
        { success: false, error: 'Note title or content is required' },
        { status: 400 },
      )
    }

    let targetChapterId = chapterId

    // If no chapter was provided, associate with the first active study chapter for frictionless ADHD capture
    if (!targetChapterId) {
      const firstChapter = await payload.find({
        collection: 'chapters',
        limit: 1,
        pagination: false,
      })
      if (firstChapter.docs && firstChapter.docs.length > 0) {
        targetChapterId = firstChapter.docs[0].id
      }
    }

    if (!targetChapterId) {
      return NextResponse.json(
        { success: false, error: 'No active study chapter found to attach note to' },
        { status: 400 },
      )
    }

    const noteTitle = title || (typeof content === 'string' ? content.slice(0, 50) : 'Quick Brain Dump')
    const rawText = typeof content === 'string' ? content : JSON.stringify(content || '')
    const baseSlug = (noteTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'note')
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`

    const doc = await payload.create({
      collection: 'notes',
      data: {
        title: noteTitle,
        slug,
        chapter: targetChapterId,
        noteType,
        _status: 'published',
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    text: rawText,
                    version: 1,
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      doc: {
        id: doc.id,
        title: doc.title,
        slug: doc.slug,
        createdAt: doc.createdAt,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create quick note' },
      { status: 500 },
    )
  }
}
