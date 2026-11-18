import type { Metadata } from 'next'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { redirect, notFound } from 'next/navigation'
import React from 'react'

import { ProjectDetailClient } from './ProjectDetailClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })
  const headers = await getHeaders()

  let user = null
  try {
    const authResult = await payload.auth({ headers })
    user = authResult.user || null
  } catch {
    user = null
  }

  if (!user) redirect('/login')

  // Fetch the project
  let project: any = null
  try {
    project = await payload.findByID({
      collection: 'projects',
      id: Number(id),
      depth: 1,
    })
  } catch {
    notFound()
  }

  if (!project) notFound()

  // Fetch missions linked to this project
  const missionsRes = await payload.find({
    collection: 'missions',
    where: { project: { equals: project.id } },
    limit: 50,
    depth: 0,
  })
  const missions = missionsRes.docs || []
  const missionIds = missions.map((m: any) => m.id)

  // Fetch time logs linked to these missions (last 30 days)
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
    timeLogs = timeLogsRes.docs || []
  }

  // Fetch recent notes
  const notesRes = await payload.find({
    collection: 'notes',
    limit: 10,
    sort: '-updatedAt',
    depth: 0,
  })

  // Fetch recent flash cards
  const flashCardsRes = await payload.find({
    collection: 'flash-cards',
    limit: 10,
    sort: '-updatedAt',
    depth: 0,
  })

  const serializedData = {
    project: {
      id: project.id,
      title: project.title,
      description: project.description || null,
      status: project.status,
      adminStatus: project.adminStatus || 'none',
      computedProgress: project.computedProgress ?? 0,
      priority: project.priority || 'medium',
      deadline: project.deadline || null,
      color: project.color || null,
      featuredImage: project.featuredImage
        ? {
            url: typeof project.featuredImage === 'object' ? project.featuredImage?.url || null : null,
            alt: typeof project.featuredImage === 'object' ? project.featuredImage?.alt || null : null,
          }
        : null,
      videoResource: project.videoResource
        ? { url: typeof project.videoResource === 'object' ? project.videoResource?.url || null : null }
        : null,
      videoTitle: project.videoTitle || null,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    },
    missions: missions.map((m: any) => ({
      id: m.id,
      title: m.title,
      type: m.type,
      status: m.status,
      targetHours: m.targetHours || 0,
      description: m.description || null,
    })),
    timeLogs: timeLogs.map((tl: any) => ({
      id: tl.id,
      category: tl.category,
      duration: tl.duration || 0,
      startTime: tl.startTime,
      endTime: tl.endTime,
      description: tl.description || null,
      mission: typeof tl.mission === 'object' && tl.mission ? tl.mission.id : tl.mission,
    })),
    recentNotes: (notesRes.docs || []).slice(0, 5).map((n: any) => ({
      id: n.id,
      title: n.title,
      updatedAt: n.updatedAt,
    })),
    recentFlashCards: (flashCardsRes.docs || []).slice(0, 5).map((fc: any) => ({
      id: fc.id,
      title: fc.title,
      updatedAt: fc.updatedAt,
    })),
  }

  return <ProjectDetailClient data={serializedData} />
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const payload = await getPayload({ config: configPromise })
    const project = await payload.findByID({
      collection: 'projects',
      id: Number(id),
      depth: 0,
    })
    return {
      title: `${project.title} — ToggleDawn Project`,
      description: project.description || `Project detail for ${project.title}`,
    }
  } catch {
    return { title: 'Project — ToggleDawn' }
  }
}
