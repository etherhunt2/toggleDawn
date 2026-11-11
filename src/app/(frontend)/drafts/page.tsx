import type { Metadata } from 'next'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import React from 'react'

import { DraftsManager } from '@/components/Drafts/DraftsManager'

export const metadata: Metadata = {
  title: 'Drafts & Captured Assets — ToggleDawn',
  description: 'Manage, structure, and organize all drafts and quick-saved visual assets.',
}

export default async function DraftsPage() {
  const payload = await getPayload({ config: configPromise })
  const headers = await getHeaders()

  let user = null
  try {
    const authResult = await payload.auth({ headers })
    user = authResult.user || null
  } catch (_e) {
    user = null
  }

  // Redirect to login if unauthenticated
  if (!user) {
    redirect('/login')
  }

  let projects: any[] = []
  let missions: any[] = []

  try {
    const [projectsRes, missionsRes] = await Promise.all([
      payload.find({
        collection: 'projects',
        limit: 20,
        pagination: false,
      }),
      payload.find({
        collection: 'missions',
        limit: 20,
        pagination: false,
      }),
    ])

    projects = projectsRes.docs || []
    missions = missionsRes.docs || []
  } catch (_e) {
    // Database might be uninitialized during build
  }

  const projectOptions = projects.map((p) => ({
    id: p.id,
    title: p.title,
  }))

  const missionOptions = missions.map((m) => ({
    id: m.id,
    title: m.title,
  }))

  return (
    <main className="pt-2">
      <DraftsManager projects={projectOptions} missions={missionOptions} />
    </main>
  )
}

