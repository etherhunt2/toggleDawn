import type { Metadata } from 'next'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import React from 'react'

import { ProjectsListClient } from './ProjectsListClient'

export const metadata: Metadata = {
  title: 'All Projects — ToggleDawn',
  description: 'View and manage all your projects.',
}

export default async function ProjectsIndexPage() {
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

  // Fetch all projects
  const projectsRes = await payload.find({
    collection: 'projects',
    limit: 100,
    sort: '-updatedAt',
    depth: 1,
  })

  // Fetch all missions (for linking time logs to projects)
  const missionsRes = await payload.find({
    collection: 'missions',
    limit: 200,
    depth: 0,
  })

  // Fetch time logs from last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const timeLogsRes = await payload.find({
    collection: 'time-logs',
    where: { startTime: { greater_than: thirtyDaysAgo } },
    limit: 500,
    sort: '-startTime',
    depth: 0,
  })

  const serializedData = {
    projects: (projectsRes.docs || []).map((p: any) => ({
      id: p.id,
      title: p.title,
      slug: p.slug || null,
      description: p.description || null,
      status: p.status,
      adminStatus: p.adminStatus || 'none',
      computedProgress: p.computedProgress ?? null,
      priority: p.priority || 'medium',
      deadline: p.deadline || null,
      color: p.color || null,
      featuredImage: p.featuredImage
        ? {
            url: typeof p.featuredImage === 'object' ? p.featuredImage?.url || null : null,
            alt: typeof p.featuredImage === 'object' ? p.featuredImage?.alt || null : null,
          }
        : null,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    })),
    missions: (missionsRes.docs || []).map((m: any) => ({
      id: m.id,
      title: m.title,
      slug: m.slug || null,
      project: typeof m.project === 'object' && m.project ? m.project.id : m.project,
      targetHours: m.targetHours || 0,
      status: m.status,
    })),
    timeLogs: (timeLogsRes.docs || []).map((tl: any) => ({
      id: tl.id,
      duration: tl.duration || 0,
      startTime: tl.startTime,
      mission: typeof tl.mission === 'object' && tl.mission ? tl.mission.id : tl.mission,
    })),
  }

  return <ProjectsListClient data={serializedData} />
}
