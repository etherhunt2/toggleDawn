import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })
    const res = await payload.find({
      collection: 'test-scores',
      sort: '-examDate',
      limit: 50,
      pagination: false,
    })

    const scores = res.docs || []
    const avgScore =
      scores.length > 0
        ? Math.round(
            scores.reduce((sum: number, s: any) => sum + (s.percentage || (s.scoreObtained / s.totalScore) * 100), 0) /
              scores.length,
          )
        : 0

    return NextResponse.json({
      success: true,
      docs: scores,
      analytics: {
        totalTests: scores.length,
        averagePercentage: avgScore,
        latest: scores[0] || null,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch test scores' },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await req.json()

    const {
      examName,
      subject,
      scoreObtained,
      totalScore = 100,
      examDate = new Date().toISOString(),
      examType = 'test',
      notes = '',
      mission,
    } = body

    if (!examName || !subject || scoreObtained === undefined) {
      return NextResponse.json(
        { success: false, error: 'examName, subject, and scoreObtained are required' },
        { status: 400 },
      )
    }

    const doc = await payload.create({
      collection: 'test-scores',
      data: {
        examName,
        subject,
        scoreObtained: Number(scoreObtained),
        totalScore: Number(totalScore),
        examDate,
        examType,
        notes,
        ...(mission ? { mission } : {}),
      },
    })

    // Fetch all scores for this subject to compute updated analytics
    const subjectScores = await payload.find({
      collection: 'test-scores',
      where: {
        subject: { equals: subject },
      },
      sort: 'examDate',
      limit: 20,
      pagination: false,
    })

    const allDocs = subjectScores.docs || []
    const trend = allDocs.map((s: any) => ({
      examName: s.examName,
      percentage: s.percentage || Math.round((s.scoreObtained / s.totalScore) * 100),
      examDate: s.examDate,
    }))

    const avg =
      trend.length > 0
        ? Math.round(trend.reduce((acc: number, t: any) => acc + t.percentage, 0) / trend.length)
        : 0

    return NextResponse.json({
      success: true,
      doc,
      analytics: {
        subject,
        trend,
        averageScore: avg,
        latestScore: trend[trend.length - 1]?.percentage || 0,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to record test score' },
      { status: 500 },
    )
  }
}
