import type { Metadata } from 'next'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import React from 'react'

import { MissionsListClient } from './MissionsListClient'

export const metadata: Metadata = {
  title: 'All Missions — ToggleDawn',
  description: 'View and manage all your missions.',
}

export default async function MissionsIndexPage() {
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

  // Fetch all missions with resolved relationships (missionType, project)
  const missionsRes = await payload.find({
    collection: 'missions',
    limit: 200,
    sort: '-updatedAt',
    depth: 1,
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
    missions: (missionsRes.docs || []).map((m: any) => ({
      id: m.id,
      title: m.title,
      slug: m.slug || null,
      type: m.type || null,
      missionType:
        typeof m.missionType === 'object' && m.missionType
          ? {
              id: m.missionType.id,
              name: m.missionType.name,
              presetIcon: m.missionType.presetIcon || null,
            }
          : null,
      status: m.status,
      adminStatus: m.adminStatus || 'none',
      computedProgress: m.computedProgress ?? 0,
      priority: m.priority || 'medium',
      deadline: m.deadline || null,
      startDate: m.startDate || null,
      description: m.description || null,
      targetHours: m.targetHours || 0,
      targetConfig: m.targetConfig
        ? {
            mode: m.targetConfig.mode || 'total',
            totalTargetHours: m.targetConfig.totalTargetHours || null,
            dailyTargetHours: m.targetConfig.dailyTargetHours || null,
            weeklyActiveDays: m.targetConfig.weeklyActiveDays || null,
            hoursPerActiveDay: m.targetConfig.hoursPerActiveDay || null,
            weeklyTotalTarget: m.targetConfig.weeklyTotalTarget || null,
          }
        : null,
      streakData: m.streakData
        ? {
            currentStreak: m.streakData.currentStreak || 0,
            longestStreak: m.streakData.longestStreak || 0,
            totalFollowed: m.streakData.totalFollowed || 0,
            totalMissed: m.streakData.totalMissed || 0,
          }
        : null,
      project:
        typeof m.project === 'object' && m.project
          ? {
              id: m.project.id,
              title: m.project.title,
              slug: m.project.slug || null,
              color: m.project.color || null,
            }
          : null,
      updatedAt: m.updatedAt,
      createdAt: m.createdAt,
    })),
    timeLogs: (timeLogsRes.docs || []).map((tl: any) => ({
      id: tl.id,
      duration: tl.duration || 0,
      startTime: tl.startTime,
      mission: typeof tl.mission === 'object' && tl.mission ? tl.mission.id : tl.mission,
    })),
  }

  return <MissionsListClient data={serializedData} />
}
