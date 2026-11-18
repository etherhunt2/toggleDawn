import type { Metadata } from 'next'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import React from 'react'

import { Dashboard } from '@/components/Dashboard'
import type { DashboardData } from '@/components/Dashboard/types'
import { getServerSideURL } from '@/utilities/getURL'

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })
  const headers = await getHeaders()

  let user = null
  try {
    const authResult = await payload.auth({ headers })
    user = authResult.user || null
  } catch (_e) {
    user = null
  }

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login')
  }

  // Fetch recent data for initial dashboard population
  let projects: any[] = []
  let missions: any[] = []
  let books: any[] = []
  let notes: any[] = []
  let testScores: any[] = []
  let timeLogs: any[] = []
  let habits: any[] = []
  let chapters: any[] = []

  try {
    const [projectsRes, missionsRes, booksRes, notesRes, testScoresRes, timeLogsRes, habitsRes, chaptersRes] =
      await Promise.all([
        payload.find({
          collection: 'projects',
          limit: 50,
          sort: '-updatedAt',
          depth: 1,
          pagination: false,
        }),
        payload.find({
          collection: 'missions',
          limit: 50,
          pagination: false,
        }),
        payload.find({
          collection: 'books',
          limit: 10,
          pagination: false,
        }),
        payload.find({
          collection: 'notes',
          limit: 10,
          pagination: false,
        }),
        payload.find({
          collection: 'test-scores',
          limit: 10,
          pagination: false,
        }),
        payload.find({
          collection: 'time-logs',
          limit: 200,
          sort: '-startTime',
          pagination: false,
        }),
        payload.find({
          collection: 'habits',
          limit: 20,
          pagination: false,
        }),
        payload.find({
          collection: 'chapters',
          limit: 50,
          pagination: false,
        }),
      ])

    projects = projectsRes.docs || []
    missions = missionsRes.docs || []
    books = booksRes.docs || []
    notes = notesRes.docs || []
    testScores = testScoresRes.docs || []
    timeLogs = timeLogsRes.docs || []
    habits = habitsRes.docs || []
    chapters = chaptersRes.docs || []
  } catch (_e) {
    // Database might be uninitialized during static build or fresh setup
  }

  const initialData: DashboardData = {
    user: user
      ? {
        id: user.id,
        name: user.name,
        email: user.email,
        preferences: (user as any).preferences,
      }
      : null,
    projects: projects.map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      adminStatus: p.adminStatus || 'none',
      description: p.description,
      deadline: p.deadline,
      startDate: p.startDate || null,
      color: p.color,
      priority: p.priority || 'medium',
      computedProgress: p.computedProgress ?? 0,
      featuredImage: p.featuredImage
        ? {
            url: typeof p.featuredImage === 'object' ? p.featuredImage?.url : null,
            alt: typeof p.featuredImage === 'object' ? p.featuredImage?.alt : null,
          }
        : null,
      videoResource: p.videoResource
        ? { url: typeof p.videoResource === 'object' ? p.videoResource?.url : null }
        : null,
      videoTitle: p.videoTitle || null,
      plannerId: p.plannerId || null,
      updatedAt: p.updatedAt,
      createdAt: p.createdAt,
    })),
    missions: missions.map((m) => ({
      id: m.id,
      title: m.title,
      type: m.type,
      targetHours: m.targetHours,
      project: typeof m.project === 'object' && m.project ? m.project.id : m.project,
    })),
    books: books.map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      slug: b.slug,
      totalPages: b.totalPages,
    })),
    notes: notes.map((n) => ({
      id: n.id,
      title: n.title,
      slug: n.slug,
    })),
    testScores: testScores.map((t) => ({
      id: t.id,
      examName: t.examName,
      subject: t.subject,
      scoreObtained: t.scoreObtained,
      totalScore: t.totalScore,
      examDate: t.examDate,
    })),
    timeLogs: timeLogs.map((tl) => ({
      id: tl.id,
      category: tl.category,
      duration: tl.duration,
      startTime: tl.startTime,
      endTime: tl.endTime,
      description: tl.description,
      mission: typeof tl.mission === 'object' && tl.mission ? tl.mission.id : tl.mission,
    })),
    habits: habits.map((h) => ({
      id: h.id,
      title: h.title,
      frequency: h.frequency,
      streak: h.streak,
    })),
    chapters: chapters.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      bookTitle: typeof c.book === 'object' && c.book ? c.book.title : undefined,
    })),
  }

  return (
    <main className="min-h-screen">
      <Dashboard initialData={initialData} />
    </main>
  )
}

export const metadata: Metadata = {
  title: 'ToggleDawn — Mission Mode',
  description:
    'A unified daily management and study platform for neurodivergent individuals. Track study materials, log focus time, visualize exam trends, and build habit streaks.',
  openGraph: {
    title: 'ToggleDawn — Mission Mode',
    description:
      'Low-friction study planning, time tracking, and streak-forgiving habit management.',
    url: getServerSideURL(),
    siteName: 'ToggleDawn',
    type: 'website',
  },
}
