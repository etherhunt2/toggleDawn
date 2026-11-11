import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })

    const [notesRes, timeLogsRes, missionsRes, testScoresRes] = await Promise.all([
      payload.find({
        collection: 'notes',
        limit: 5,
        sort: '-updatedAt',
        pagination: false,
      }),
      payload.find({
        collection: 'time-logs',
        limit: 30,
        sort: '-startTime',
        pagination: false,
      }),
      payload.find({
        collection: 'missions',
        limit: 10,
        pagination: false,
      }),
      payload.find({
        collection: 'test-scores',
        limit: 10,
        sort: '-examDate',
        pagination: false,
      }),
    ])

    const notes = notesRes.docs || []
    const timeLogs = timeLogsRes.docs || []
    const missions = missionsRes.docs || []
    const testScores = testScoresRes.docs || []

    // Category distribution for pie / bar chart
    const categoryMinutes: Record<string, number> = {
      study: 0,
      habit: 0,
      work: 0,
      exercise: 0,
      hobby: 0,
      rest: 0,
    }

    timeLogs.forEach((log: any) => {
      const cat = (log.category || 'other').toLowerCase()
      const dur = Number(log.duration) || 30
      if (categoryMinutes[cat] !== undefined) {
        categoryMinutes[cat] += dur
      } else {
        categoryMinutes[cat] = (categoryMinutes[cat] || 0) + dur
      }
    })

    const totalLoggedMinutes = Object.values(categoryMinutes).reduce((a, b) => a + b, 0)
    const targetDailyMinutes = 8 * 60 // 8 hours daily target

    // Missing logs calculation: check blocks in the day
    const missingHoursCount = Math.max(0, Math.round((targetDailyMinutes - totalLoggedMinutes) / 60))
    const missingLogsAlert =
      missingHoursCount > 0
        ? `You have ${missingHoursCount} untracked hour(s) today. Use one-tap retroactive fill!`
        : 'All core blocks tracked for today!'

    // Active reading note
    const activeReadNote = notes[0] || {
      title: 'Moment of Inertia Formulas & Parallel Axis Theorem',
      slug: 'moment-of-inertia-formulas',
    }

    // Pie chart / category metrics
    const distribution = Object.entries(categoryMinutes).map(([category, minutes]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      minutes,
      percentage: totalLoggedMinutes > 0 ? Math.round((minutes / totalLoggedMinutes) * 100) : 0,
    }))

    return NextResponse.json({
      success: true,
      summary: {
        totalLoggedMinutes,
        missingHoursCount,
        missingLogsAlert,
        activeReadNote: {
          id: activeReadNote.id,
          title: activeReadNote.title,
          slug: activeReadNote.slug,
        },
        distribution,
        missionsCount: missions.length,
        latestTestScore: testScores[0] || null,
        forgivenessBufferAvailable: true,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch dashboard summary' },
      { status: 500 },
    )
  }
}
