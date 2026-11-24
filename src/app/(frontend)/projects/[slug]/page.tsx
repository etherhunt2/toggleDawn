import type { Metadata } from 'next'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { redirect, notFound } from 'next/navigation'
import React from 'react'

import { ProjectDetailClient } from './ProjectDetailClient'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)

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

  // Find project by slug (or fallback to ID if numeric)
  let project: any = null
  try {
    const projectRes = await payload.find({
      collection: 'projects',
      where: { slug: { equals: decodedSlug } },
      limit: 1,
      depth: 1,
    })
    project = projectRes.docs?.[0] || null

    if (!project && !isNaN(Number(decodedSlug))) {
      project = await payload.findByID({
        collection: 'projects',
        id: Number(decodedSlug),
        depth: 1,
      })
    }
  } catch {
    notFound()
  }

  if (!project) notFound()

  // Fetch missions linked to this project
  const missionsRes = await payload.find({
    collection: 'missions',
    where: { project: { equals: project.id } },
    limit: 50,
    depth: 1,
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
      slug: project.slug || null,
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
      slug: m.slug || null,
      type: m.type,
      status: m.status,
      targetHours: m.targetHours || 0,
      description: m.description || null,
      missionType:
        typeof m.missionType === 'object' && m.missionType
          ? {
              id: m.missionType.id,
              name: m.missionType.name,
              presetIcon: m.missionType.presetIcon || null,
            }
          : null,
      adminStatus: m.adminStatus || 'none',
      computedProgress: m.computedProgress ?? 0,
      priority: m.priority || 'medium',
      deadline: m.deadline || null,
      startDate: m.startDate || null,
      streakData: m.streakData || null,
      targetConfig: m.targetConfig || null,
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
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)

  try {
    const payload = await getPayload({ config: configPromise })
    let project = (await payload.find({
      collection: 'projects',
      where: { slug: { equals: decodedSlug } },
      limit: 1,
      depth: 0,
    })).docs?.[0] || null

    if (!project && !isNaN(Number(decodedSlug))) {
      project = await payload.findByID({
        collection: 'projects',
        id: Number(decodedSlug),
        depth: 0,
      })
    }

    if (!project) return { title: 'Project — ToggleDawn' }

    return {
      title: `${project.title} — ToggleDawn Project`,
      description: project.description || `Project detail for ${project.title}`,
    }
  } catch {
    return { title: 'Project — ToggleDawn' }
  }
}

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config: configPromise })
    const projects = await payload.find({
      collection: 'projects',
      limit: 1000,
      pagination: false,
      select: { slug: true },
    })
    return (projects.docs || []).map((p: any) => ({ slug: p.slug }))
  } catch {
    return []
  }
}
