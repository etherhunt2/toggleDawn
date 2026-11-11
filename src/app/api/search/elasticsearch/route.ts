import { NextRequest, NextResponse } from 'next/server'
import { searchElastic, syncDocumentToElastic } from '@/utilities/elasticsearch/client'
import { ElasticSearchQuery } from '@/utilities/elasticsearch/types'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || ''
    const index = searchParams.get('index') || 'all'
    const docType = searchParams.get('docType') || undefined
    const category = searchParams.get('category') || undefined
    const status = searchParams.get('status') || undefined
    const difficulty = searchParams.get('difficulty') || undefined
    const from = parseInt(searchParams.get('from') || '0', 10)
    const size = parseInt(searchParams.get('size') || '20', 10)
    const fuzziness = (searchParams.get('fuzziness') as 'AUTO') || 'AUTO'

    const queryParams: ElasticSearchQuery = {
      q,
      index,
      docType,
      category,
      status,
      difficulty,
      from,
      size,
      fuzziness,
    }

    const response = await searchElastic(queryParams)
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[Elasticsearch API GET Error]:', error)
    return NextResponse.json(
      {
        error: 'Failed to execute Elasticsearch query',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // 1. If syncing document
    if (body.action === 'index' && body.doc && body.index) {
      await syncDocumentToElastic(body.index, body.doc)
      return NextResponse.json({ success: true, indexed: body.doc.id })
    }

    // 2. Standard Elasticsearch Query DSL
    let queryParams: ElasticSearchQuery = {}

    if (body.query) {
      // Parse multi_match or match from body
      const multiMatch = body.query?.bool?.must?.[0]?.multi_match || body.query?.multi_match
      const match = body.query?.match
      const q = multiMatch?.query || match?.title || match?.content || body.q || ''

      queryParams = {
        q,
        index: body.index || 'all',
        from: body.from || 0,
        size: body.size || 20,
        fuzziness: multiMatch?.fuzziness || 'AUTO',
        docType: body.docType,
        category: body.category,
        status: body.status,
      }
    } else {
      queryParams = body
    }

    const response = await searchElastic(queryParams)
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[Elasticsearch API POST Error]:', error)
    return NextResponse.json(
      {
        error: 'Failed to process Elasticsearch request',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

