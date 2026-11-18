import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { headers as getHeaders } from 'next/headers'

/**
 * GET /api/projects?id=<projectId>
 *
 * Returns full project detail: project data, associated missions,
 * recent notes, flash cards, and time logs for computing hours.
 */
export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const headers = await getHeaders()

    let currentUser: any = null
    try {
      const authResult = await payload.auth({ headers })
      currentUser = authResult?.user || null
    } catch {}

    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const projectId = req.nextUrl.searchParams.get('id')

    if (!projectId) {
      // Return all projects for the user
      const allProjects = await payload.find({
        collection: 'projects',
        limit: 100,
        sort: '-updatedAt',
        depth: 1,
      })

      return NextResponse.json({ docs: allProjects.docs })
    }

    // Fetch single project
    const project = await payload.findByID({
      collection: 'projects',
      id: Number(projectId),
      depth: 1,
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Fetch missions linked to this project
    const missions = await payload.find({
      collection: 'missions',
      where: {
        project: { equals: project.id },
      },
      limit: 50,
      depth: 0,
    })

    const missionIds = missions.docs.map((m) => m.id)

    // Fetch time logs linked to missions of this project (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    let timeLogs: any[] = []
    if (missionIds.length > 0) {
      const timeLogsRes = await payload.find({
        collection: 'time-logs',
        where: {
          mission: { in: missionIds },
          startTime: { greater_than: thirtyDaysAgo },
        },
        limit: 500,
        sort: '-startTime',
        depth: 0,
      })
      timeLogs = timeLogsRes.docs
    }

    // Fetch recent notes (last 5)
    const recentNotes = await payload.find({
      collection: 'notes',
      limit: 5,
      sort: '-updatedAt',
      depth: 0,
    })

    // Fetch recent flash cards (last 5)
    const recentFlashCards = await payload.find({
      collection: 'flash-cards',
      limit: 5,
      sort: '-updatedAt',
      depth: 0,
    })

    return NextResponse.json({
      project,
      missions: missions.docs,
      timeLogs,
      recentNotes: recentNotes.docs,
      recentFlashCards: recentFlashCards.docs,
    })
  } catch (error: any) {
    console.error('Error in GET /api/projects:', error)
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
