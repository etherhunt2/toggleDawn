import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date')

    let where: any = {}
    if (date) {
      const startOfDay = `${date}T00:00:00.000Z`
      const endOfDay = `${date}T23:59:59.999Z`
      where = {
        and: [
          { startTime: { greater_than_equal: startOfDay } },
          { startTime: { less_than_equal: endOfDay } },
        ],
      }
    }

    const logs = await payload.find({
      collection: 'time-logs',
      where,
      sort: '-startTime',
      limit: 100,
      pagination: false,
    })

    return NextResponse.json({
      success: true,
      docs: logs.docs,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch time logs' },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await req.json()

    const {
      category = 'study',
      startTime,
      endTime,
      duration,
      description,
      mission,
      isRetroactive = false,
    } = body

    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]

    let parsedStart: Date
    if (
      typeof startTime === 'string' &&
      startTime.includes(':') &&
      !startTime.includes('T') &&
      !startTime.includes('-')
    ) {
      parsedStart = new Date(`${todayStr}T${startTime}:00`)
    } else if (startTime) {
      parsedStart = new Date(startTime)
    } else {
      parsedStart = new Date(now.getTime() - (duration || 45) * 60000)
    }

    let parsedEnd: Date
    if (
      typeof endTime === 'string' &&
      endTime.includes(':') &&
      !endTime.includes('T') &&
      !endTime.includes('-')
    ) {
      parsedEnd = new Date(`${todayStr}T${endTime}:00`)
    } else if (endTime) {
      parsedEnd = new Date(endTime)
    } else {
      parsedEnd = now
    }

    const validStart = isNaN(parsedStart.getTime())
      ? new Date(now.getTime() - (duration || 45) * 60000)
      : parsedStart
    const validEnd = isNaN(parsedEnd.getTime()) ? now : parsedEnd

    const doc = await payload.create({
      collection: 'time-logs',
      data: {
        category,
        startTime: validStart.toISOString(),
        endTime: validEnd.toISOString(),
        description: description || `Focus block - ${category}`,
        isRetroactive: Boolean(isRetroactive),
        ...(mission ? { mission } : {}),
      },
    })

    return NextResponse.json({
      success: true,
      doc,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create time log' },
      { status: 500 },
    )
  }
}
