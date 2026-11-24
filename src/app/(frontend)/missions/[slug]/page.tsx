import type { Metadata } from 'next'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { redirect, notFound } from 'next/navigation'
import React from 'react'

import { MissionDetailClient } from './MissionDetailClient'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function MissionDetailPage({ params }: Props) {
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

  // Find mission by slug (or fallback to ID if numeric)
  let mission: any = null
  try {
    const missionRes = await payload.find({
      collection: 'missions',
      where: { slug: { equals: decodedSlug } },
      limit: 1,
      depth: 1,
    })
    mission = missionRes.docs?.[0] || null

    if (!mission && !isNaN(Number(decodedSlug))) {
      mission = await payload.findByID({
        collection: 'missions',
        id: Number(decodedSlug),
        depth: 1,
      })
    }
  } catch {
    notFound()
  }

  if (!mission) notFound()

  // Fetch time logs linked to this mission (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const timeLogsRes = await payload.find({
    collection: 'time-logs',
    where: {
      mission: { equals: mission.id },
      startTime: { greater_than: thirtyDaysAgo },
    },
    limit: 500,
    sort: '-startTime',
    depth: 0,
  })
  const timeLogs = timeLogsRes.docs || []

  // Fetch mission planners linked to this mission
  const plannersRes = await payload.find({
    collection: 'mission-planners',
    where: { mission: { equals: mission.id } },
    limit: 50,
    sort: 'sortOrder',
    depth: 0,
  })
  const planners = plannersRes.docs || []

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

  // Resolve missionType (could be object at depth:1 or just an ID)
  const resolvedMissionType =
    mission.missionType && typeof mission.missionType === 'object'
      ? {
          id: mission.missionType.id,
          name: mission.missionType.name || null,
          presetIcon: mission.missionType.presetIcon || null,
          description: mission.missionType.description || null,
        }
      : null

  // Resolve project (could be object at depth:1 or just an ID)
  const resolvedProject =
    mission.project && typeof mission.project === 'object'
      ? {
          id: mission.project.id,
          title: mission.project.title || null,
          slug: mission.project.slug || null,
          color: mission.project.color || null,
        }
      : typeof mission.project === 'number'
        ? { id: mission.project, title: null, slug: null, color: null }
        : null

  const serializedData = {
    mission: {
      id: mission.id,
      title: mission.title,
      slug: mission.slug || null,
      description: mission.description || null,
      type: mission.type || null,
      missionType: resolvedMissionType,
      status: mission.status,
      adminStatus: mission.adminStatus || 'none',
      computedProgress: mission.computedProgress ?? 0,
      adminForcedProgress: mission.adminForcedProgress ?? null,
      priority: mission.priority || 'medium',
      deadline: mission.deadline || null,
      startDate: mission.startDate || null,
      notes: mission.notes || null,
      targetHours: mission.targetHours || 0,
      targetConfig: mission.targetConfig || null,
      streakData: mission.streakData || null,
      project: resolvedProject,
      createdAt: mission.createdAt,
      updatedAt: mission.updatedAt,
    },
    timeLogs: timeLogs.map((tl: any) => ({
      id: tl.id,
      category: tl.category,
      duration: tl.duration || 0,
      startTime: tl.startTime,
      endTime: tl.endTime,
      description: tl.description || null,
      mission: typeof tl.mission === 'object' && tl.mission ? tl.mission.id : tl.mission,
    })),
    planners: planners.map((p: any) => ({
      id: p.id,
      title: p.title,
      description: p.description || null,
      planType: p.planType || 'checklist',
      status: p.status || 'draft',
      color: p.color || '#00f0ff',
      sortOrder: p.sortOrder || 0,
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

  return <MissionDetailClient data={serializedData} />
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)

  try {
    const payload = await getPayload({ config: configPromise })
    let mission = (await payload.find({
      collection: 'missions',
      where: { slug: { equals: decodedSlug } },
      limit: 1,
      depth: 0,
    })).docs?.[0] || null

    if (!mission && !isNaN(Number(decodedSlug))) {
      mission = await payload.findByID({
        collection: 'missions',
        id: Number(decodedSlug),
        depth: 0,
      })
    }

    if (!mission) return { title: 'Mission — ToggleDawn' }

    return {
      title: `${mission.title} — ToggleDawn Mission`,
      description: mission.description || `Mission detail for ${mission.title}`,
    }
  } catch {
    return { title: 'Mission — ToggleDawn' }
  }
}

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config: configPromise })
    const missions = await payload.find({
      collection: 'missions',
      limit: 1000,
      pagination: false,
      select: { slug: true },
    })
    return (missions.docs || []).map((m: any) => ({ slug: m.slug }))
  } catch {
    return []
  }
}
