/**
 * ToggleDawn — Demo Data Seeding Script
 * Run: npx tsx src/seed.ts
 *
 * Seeds realistic demo data into the database:
 *   Categories → Projects → Missions → Books → Chapters → Notes
 *   → FlashCards → TimeLogs → TestScores
 *
 * Safe to re-run — clears existing data first (for the demo user only).
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from './payload.config'

// Admin account for Payload CMS Admin Panel (/super-master)
const ADMIN_EMAIL = 'admin@toggledawn.com'
const ADMIN_PASSWORD = 'password'
const ADMIN_NAME = 'ToggleDawn Administrator'

// Demo author account for frontend user dashboard testing
const DEMO_EMAIL = 'demo-author@example.com'
const DEMO_PASSWORD = 'password'
const DEMO_NAME = 'Demo Author'

// Helper to build Lexical rich-text JSON
function richText(text: string) {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', text, format: 0, mode: 'normal', style: '', detail: 0, version: 1 }],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          textFormat: 0,
          textStyle: '',
          version: 1,
        },
      ],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}

// Helper to slugify a title
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function seed() {
  console.log('🌱 Starting ToggleDawn seed...\n')

  const payload = await getPayload({ config })

  // ─── 1. Ensure Admin User (for Payload CMS Admin Panel /super-master) ───
  let adminUser: any
  const existingAdmins = await payload.find({
    collection: 'users',
    where: { email: { equals: ADMIN_EMAIL } },
    limit: 1,
    overrideAccess: true,
  })

  if (existingAdmins.docs.length > 0) {
    adminUser = await payload.update({
      collection: 'users',
      id: existingAdmins.docs[0].id,
      data: { password: ADMIN_PASSWORD, name: ADMIN_NAME, role: 'admin' },
      overrideAccess: true,
    })
    console.log(`✓ Admin user verified & password reset: ${adminUser.email} (id: ${adminUser.id}, role: admin)`)
  } else {
    adminUser = await payload.create({
      collection: 'users',
      data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, name: ADMIN_NAME, role: 'admin' },
      overrideAccess: true,
    })
    console.log(`✓ Created admin user: ${adminUser.email} (id: ${adminUser.id}, role: admin)`)
  }

  // ─── 2. Ensure Demo User (for Frontend Dashboard /) ───
  let user: any
  const existingUsers = await payload.find({
    collection: 'users',
    where: { email: { equals: DEMO_EMAIL } },
    limit: 1,
    overrideAccess: true,
  })

  if (existingUsers.docs.length > 0) {
    user = await payload.update({
      collection: 'users',
      id: existingUsers.docs[0].id,
      data: { password: DEMO_PASSWORD, name: DEMO_NAME, role: 'user' },
      overrideAccess: true,
    })
    console.log(`✓ Demo user verified & password reset: ${user.email} (id: ${user.id}, role: user)`)
  } else {
    user = await payload.create({
      collection: 'users',
      data: { email: DEMO_EMAIL, password: DEMO_PASSWORD, name: DEMO_NAME, role: 'user' },
      overrideAccess: true,
    })
    console.log(`✓ Created demo user: ${user.email} (id: ${user.id}, role: user)`)
  }

  // ─── 2. Clean existing demo data ───
  // Delete in dependency order: leaf → parent
  const ownedCollections = [
    'schedules', 'habits', 'flash-cards', 'notes', 'test-scores', 'time-logs',
    'chapters', 'books', 'missions', 'projects',
  ] as const

  for (const slug of ownedCollections) {
    try {
      await payload.delete({
        collection: slug as any,
        where: { owner: { equals: user.id } },
        overrideAccess: true,
      })
    } catch (e: any) {
      // Ignore "nothing to delete" errors
      console.log(`  (skip clean ${slug}: ${e.message?.slice(0, 60)})`)
    }
  }

  // Categories don't have owner field
  try {
    const allCats = await payload.find({ collection: 'categories', limit: 200 })
    for (const cat of allCats.docs) {
      await payload.delete({ collection: 'categories', id: cat.id, overrideAccess: true })
    }
  } catch {}
  console.log('✓ Cleaned previous demo data\n')

  // ─── 3. Categories ───
  const cats: Record<string, any> = {}
  const categoryData = [
    { title: 'Physics', type: 'book' as const, color: '#6C5CE7' },
    { title: 'Mathematics', type: 'book' as const, color: '#00b894' },
    { title: 'Computer Science', type: 'book' as const, color: '#0984e3' },
    { title: 'Competitive Exam', type: 'exam' as const, color: '#e17055' },
    { title: 'Daily Habit', type: 'general' as const, color: '#00cec9' },
    { title: 'Fitness', type: 'general' as const, color: '#fdcb6e' },
    { title: 'Self Improvement', type: 'mission' as const, color: '#a29bfe' },
  ]
  for (const c of categoryData) {
    const doc = await payload.create({
      collection: 'categories',
      data: { ...c, slug: slugify(c.title) },
      overrideAccess: true,
    })
    cats[c.title] = doc
  }
  console.log(`✓ Created ${categoryData.length} categories`)

  // ─── 4. Projects ───
  const proj1 = await payload.create({
    collection: 'projects',
    data: {
      title: 'JEE Advanced 2027 Preparation',
      slug: 'jee-advanced-2027-preparation',
      description: 'Complete preparation roadmap for JEE Advanced including Physics, Mathematics, and Chemistry modules.',
      status: 'active',
      deadline: '2027-05-15',
      color: '#6C5CE7',
      owner: user.id,
    },
    overrideAccess: true,
  })

  const proj2 = await payload.create({
    collection: 'projects',
    data: {
      title: 'Full-Stack Developer Portfolio',
      slug: 'full-stack-developer-portfolio',
      description: 'Build production-grade web apps, contribute to open source, and create a strong GitHub profile.',
      status: 'active',
      deadline: '2027-03-01',
      color: '#0984e3',
      owner: user.id,
    },
    overrideAccess: true,
  })
  console.log('✓ Created 2 projects')

  // ─── 5. Missions ───
  const mission1 = await payload.create({
    collection: 'missions',
    data: {
      title: 'Master Mechanics & Thermodynamics',
      slug: 'master-mechanics-thermodynamics',
      type: 'study',
      description: 'Complete HC Verma Vol 1 and solve all exercises for Mechanics and Thermodynamics.',
      targetHours: 200,
      targetConfig: { mode: 'total', totalTargetHours: 200 },
      status: 'active',
      project: proj1.id,
      owner: user.id,
    },
    overrideAccess: true,
  })

  const mission2 = await payload.create({
    collection: 'missions',
    data: {
      title: 'Calculus Mastery',
      slug: 'calculus-mastery',
      type: 'study',
      description: 'Differential and Integral calculus from basic limits to multivariable. Cover all PYQ patterns.',
      targetHours: 150,
      targetConfig: { mode: 'total', totalTargetHours: 150 },
      status: 'active',
      project: proj1.id,
      owner: user.id,
    },
    overrideAccess: true,
  })

  const mission3 = await payload.create({
    collection: 'missions',
    data: {
      title: 'Daily Exercise Routine',
      slug: 'daily-exercise-routine',
      type: 'habit',
      description: '30-minute daily workout — alternating cardio and strength training.',
      targetHours: 50,
      targetConfig: { mode: 'daily', dailyTargetHours: 0.5 },
      status: 'active',
      project: proj2.id,
      owner: user.id,
    },
    overrideAccess: true,
  })

  const mission4 = await payload.create({
    collection: 'missions',
    data: {
      title: 'Learn Next.js & Payload CMS',
      slug: 'learn-next-js-payload-cms',
      type: 'study',
      description: 'Build 3 full-stack projects using Next.js 15+ and Payload CMS 3.x.',
      targetHours: 120,
      targetConfig: { mode: 'weekly', weeklyActiveDays: ['mon', 'tue', 'wed', 'thu', 'fri'], hoursPerActiveDay: 2 },
      status: 'active',
      project: proj2.id,
      owner: user.id,
    },
    overrideAccess: true,
  })
  console.log('✓ Created 4 missions')

  // ─── 6. Books (versioned — need _status: published) ───
  const book1 = await payload.create({
    collection: 'books',
    data: {
      title: 'HC Verma — Concepts of Physics Vol 1',
      slug: 'hc-verma-concepts-of-physics-vol-1',
      author: 'H.C. Verma',
      subject: 'Physics',
      totalPages: 478,
      description: 'Classical mechanics, waves, and thermodynamics for competitive exams.',
      mission: mission1.id,
      completionPercent: 35,
      progressStatus: 'in-progress',
      owner: user.id,
      _status: 'published',
    },
    overrideAccess: true,
    draft: false,
  })

  const book2 = await payload.create({
    collection: 'books',
    data: {
      title: 'Thomas Calculus — 14th Edition',
      slug: 'thomas-calculus-14th-edition',
      author: 'George B. Thomas Jr.',
      subject: 'Mathematics',
      totalPages: 1200,
      description: 'Comprehensive calculus textbook covering single and multivariable calculus.',
      mission: mission2.id,
      completionPercent: 20,
      progressStatus: 'in-progress',
      owner: user.id,
      _status: 'published',
    },
    overrideAccess: true,
    draft: false,
  })

  const book3 = await payload.create({
    collection: 'books',
    data: {
      title: 'Fullstack React with Next.js',
      slug: 'fullstack-react-with-nextjs',
      author: 'Vercel Team',
      subject: 'Computer Science',
      totalPages: 650,
      description: 'Modern full-stack patterns with React Server Components and Next.js App Router.',
      mission: mission4.id,
      completionPercent: 55,
      progressStatus: 'in-progress',
      owner: user.id,
      _status: 'published',
    },
    overrideAccess: true,
    draft: false,
  })
  console.log('✓ Created 3 books')

  // ─── 7. Chapters (versioned) ───
  const ch1 = await payload.create({
    collection: 'chapters',
    data: {
      title: 'Rotational Mechanics',
      slug: 'rotational-mechanics',
      book: book1.id,
      description: 'Moment of inertia, angular momentum, torque, and rolling motion.',
      pageCount: 42,
      sortOrder: 1,
      progressStatus: 'in-progress',
      completionPercent: 60,
      owner: user.id,
      _status: 'published',
    },
    overrideAccess: true,
    draft: false,
  })

  const ch2 = await payload.create({
    collection: 'chapters',
    data: {
      title: 'Work, Energy & Power',
      slug: 'work-energy-power',
      book: book1.id,
      description: 'Work-energy theorem, conservative forces, potential energy curves.',
      pageCount: 38,
      sortOrder: 2,
      progressStatus: 'completed',
      completionPercent: 100,
      owner: user.id,
      _status: 'published',
    },
    overrideAccess: true,
    draft: false,
  })

  const ch3 = await payload.create({
    collection: 'chapters',
    data: {
      title: 'Limits and Continuity',
      slug: 'limits-and-continuity',
      book: book2.id,
      description: "Epsilon-delta definition, squeeze theorem, L\u2019H\u00F4pital\u2019s rule.",
      pageCount: 55,
      sortOrder: 1,
      progressStatus: 'completed',
      completionPercent: 100,
      owner: user.id,
      _status: 'published',
    },
    overrideAccess: true,
    draft: false,
  })

  const ch4 = await payload.create({
    collection: 'chapters',
    data: {
      title: 'Derivatives & Applications',
      slug: 'derivatives-applications',
      book: book2.id,
      description: 'Chain rule, implicit differentiation, optimization problems, related rates.',
      pageCount: 72,
      sortOrder: 2,
      progressStatus: 'in-progress',
      completionPercent: 45,
      owner: user.id,
      _status: 'published',
    },
    overrideAccess: true,
    draft: false,
  })

  const ch5 = await payload.create({
    collection: 'chapters',
    data: {
      title: 'React Server Components',
      slug: 'react-server-components',
      book: book3.id,
      description: 'RSC architecture, streaming, data fetching patterns, and server actions.',
      pageCount: 48,
      sortOrder: 1,
      progressStatus: 'in-progress',
      completionPercent: 70,
      owner: user.id,
      _status: 'published',
    },
    overrideAccess: true,
    draft: false,
  })
  console.log('✓ Created 5 chapters')

  // ─── 8. Notes (versioned) ───
  const noteData: Array<{ title: string; chapter: number; noteType: 'note' | 'flashcard' | 'summary' | 'formula'; sortOrder: number }> = [
    { title: 'Moment of Inertia Formulas', chapter: ch1.id, noteType: 'formula', sortOrder: 1 },
    { title: 'Angular Momentum Conservation — Solved Examples', chapter: ch1.id, noteType: 'note', sortOrder: 2 },
    { title: 'Work-Energy Theorem Proof', chapter: ch2.id, noteType: 'note', sortOrder: 1 },
    { title: 'Limits Quick Reference Card', chapter: ch3.id, noteType: 'flashcard', sortOrder: 1 },
    { title: 'Chain Rule Cheat Sheet', chapter: ch4.id, noteType: 'formula', sortOrder: 1 },
    { title: 'RSC vs Client Components — Decision Tree', chapter: ch5.id, noteType: 'summary', sortOrder: 1 },
  ]
  for (const n of noteData) {
    await payload.create({
      collection: 'notes',
      data: {
        ...n,
        slug: slugify(n.title),
        content: richText(`Study notes for: ${n.title}. This contains detailed explanations, worked examples, and key takeaways for revision.`),
        owner: user.id,
        _status: 'published',
      },
      overrideAccess: true,
      draft: false,
    })
  }
  console.log(`✓ Created ${noteData.length} notes`)

  // ─── 9. Flash Cards ───
  const flashCardData = [
    { title: 'What is Moment of Inertia?', text: 'Moment of inertia (I) is the rotational analog of mass. I = \u03A3m\u1D62r\u1D62\u00B2. It quantifies resistance to angular acceleration. For a solid cylinder: I = \u00BDMR\u00B2. For a hollow sphere: I = \u2154MR\u00B2.', book: book1.id, chapter: ch1.id, sortOrder: 1 },
    { title: 'Parallel Axis Theorem', text: 'I = Icm + Md\u00B2. The moment of inertia about any axis parallel to an axis through the center of mass equals Icm plus the product of mass and the square of the distance between axes.', book: book1.id, chapter: ch1.id, sortOrder: 2 },
    { title: 'Work-Energy Theorem', text: 'The net work done on an object equals the change in its kinetic energy: W_net = \u0394KE = \u00BDmv\u2082\u00B2 - \u00BDmv\u2081\u00B2. This is valid for both constant and variable forces.', book: book1.id, chapter: ch2.id, sortOrder: 3 },
    { title: "L\u2019H\u00F4pital\u2019s Rule", text: "If lim f(x)/g(x) gives 0/0 or \u221E/\u221E, then lim f(x)/g(x) = lim f\u2032(x)/g\u2032(x), provided the latter limit exists. Can be applied repeatedly. Always verify the indeterminate form first!", book: book2.id, chapter: ch3.id, sortOrder: 1 },
    { title: "Chain Rule Formula", text: "If y = f(g(x)), then dy/dx = f\u2032(g(x)) \u00B7 g\u2032(x). In Leibniz notation: dy/dx = (dy/du) \u00B7 (du/dx). Essential for composite functions and implicit differentiation.", book: book2.id, chapter: ch4.id, sortOrder: 1 },
    { title: 'Squeeze Theorem', text: 'If g(x) \u2264 f(x) \u2264 h(x) near a, and lim g(x) = lim h(x) = L, then lim f(x) = L. Classic application: proving lim(sin x)/x = 1 as x\u21920.', book: book2.id, chapter: ch3.id, sortOrder: 2 },
    { title: 'RSC vs Client Components', text: 'Server Components: run on server only, can access DB directly, zero JS bundle cost. Client Components: marked with "use client", needed for interactivity (useState, useEffect, event handlers). Default is Server Component in Next.js App Router.', book: book3.id, chapter: ch5.id, sortOrder: 1 },
    { title: 'React Server Actions', text: 'Async functions that run on the server, invoked from client. Declared with "use server" directive. Used for form submissions, data mutations. Automatically handle revalidation and error boundaries.', book: book3.id, chapter: ch5.id, sortOrder: 2 },
  ]
  for (const fc of flashCardData) {
    await payload.create({
      collection: 'flash-cards',
      data: {
        title: fc.title,
        contentType: 'text',
        textContent: richText(fc.text),
        book: fc.book,
        chapter: fc.chapter,
        sortOrder: fc.sortOrder,
        owner: user.id,
      },
      overrideAccess: true,
    })
  }
  console.log(`✓ Created ${flashCardData.length} flash cards`)

  // ─── 10. Time Logs (last 7 days) ───
  const today = new Date()
  const timeLogEntries = [
    // Today
    { cat: 'study', desc: 'Physics — Rotational Mechanics problems', hoursAgo: 2, dur: 90, mission: mission1.id },
    { cat: 'exercise', desc: 'Morning jog + stretching', hoursAgo: 6, dur: 35, mission: mission3.id },
    { cat: 'study', desc: 'Calculus — Chain rule practice', hoursAgo: 4, dur: 60, mission: mission2.id },
    // Yesterday
    { cat: 'study', desc: 'Next.js — Server Components deep-dive', daysAgo: 1, hoursAgo: 3, dur: 120, mission: mission4.id },
    { cat: 'work', desc: 'ToggleDawn frontend development', daysAgo: 1, hoursAgo: 7, dur: 180 },
    { cat: 'rest', desc: 'Power nap', daysAgo: 1, hoursAgo: 5, dur: 30 },
    // 2 days ago
    { cat: 'study', desc: 'Physics — Work-Energy theorem', daysAgo: 2, hoursAgo: 2, dur: 75, mission: mission1.id },
    { cat: 'hobby', desc: 'Guitar practice — fingerpicking', daysAgo: 2, hoursAgo: 8, dur: 45 },
    { cat: 'exercise', desc: 'Strength training — upper body', daysAgo: 2, hoursAgo: 6, dur: 40, mission: mission3.id },
    // 3 days ago
    { cat: 'study', desc: 'Calculus limits and continuity', daysAgo: 3, hoursAgo: 3, dur: 90, mission: mission2.id },
    { cat: 'social', desc: 'Study group meet — JEE prep', daysAgo: 3, hoursAgo: 6, dur: 60 },
    { cat: 'chores', desc: 'Room cleanup and laundry', daysAgo: 3, hoursAgo: 9, dur: 45 },
    // 5 days ago
    { cat: 'study', desc: 'Mock test revision — Physics', daysAgo: 5, hoursAgo: 2, dur: 120, mission: mission1.id },
    { cat: 'commute', desc: 'Library visit', daysAgo: 5, hoursAgo: 5, dur: 40 },
    // 6 days ago
    { cat: 'sleep', desc: 'Full rest day', daysAgo: 6, hoursAgo: 0, dur: 480 },
    { cat: 'study', desc: 'Light revision — formulas', daysAgo: 6, hoursAgo: 10, dur: 30, mission: mission2.id },
  ]

  for (const tl of timeLogEntries) {
    const start = new Date(today)
    start.setDate(start.getDate() - (tl.daysAgo || 0))
    start.setHours(start.getHours() - (tl.hoursAgo || 0))
    start.setMinutes(0, 0, 0)
    const end = new Date(start.getTime() + tl.dur * 60 * 1000)

    await payload.create({
      collection: 'time-logs',
      data: {
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        category: tl.cat as any,
        description: tl.desc,
        ...(tl.mission ? { mission: tl.mission } : {}),
        owner: user.id,
      },
      overrideAccess: true,
    })
  }
  console.log(`✓ Created ${timeLogEntries.length} time logs`)

  // ─── 11. Test Scores ───
  const testScoreData = [
    { examName: 'JEE Mock Test 1', subject: 'Physics', scoreObtained: 42, totalScore: 60, examType: 'mock', daysAgo: 2 },
    { examName: 'JEE Mock Test 1', subject: 'Mathematics', scoreObtained: 38, totalScore: 60, examType: 'mock', daysAgo: 2 },
    { examName: 'Chapter Test — Rotational Mechanics', subject: 'Physics', scoreObtained: 28, totalScore: 30, examType: 'test', daysAgo: 5 },
    { examName: 'Calculus Quiz 3', subject: 'Mathematics', scoreObtained: 18, totalScore: 25, examType: 'quiz', daysAgo: 7 },
    { examName: 'Weekly Practice Set', subject: 'Physics', scoreObtained: 85, totalScore: 100, examType: 'practice', daysAgo: 10 },
    { examName: 'Mid-Semester — Calculus', subject: 'Mathematics', scoreObtained: 72, totalScore: 100, examType: 'midterm', daysAgo: 14 },
    { examName: 'DSA Online Assessment', subject: 'Computer Science', scoreObtained: 340, totalScore: 400, examType: 'test', daysAgo: 8 },
    { examName: 'JEE Mock Test 2', subject: 'Physics', scoreObtained: 51, totalScore: 60, examType: 'mock', daysAgo: 0 },
  ]

  for (const ts of testScoreData) {
    const d = new Date(today)
    d.setDate(d.getDate() - ts.daysAgo)
    await payload.create({
      collection: 'test-scores',
      data: {
        examName: ts.examName,
        subject: ts.subject,
        scoreObtained: ts.scoreObtained,
        totalScore: ts.totalScore,
        examType: ts.examType as any,
        examDate: d.toISOString().split('T')[0],
        mission: ts.subject === 'Physics' ? mission1.id : ts.subject === 'Mathematics' ? mission2.id : mission4.id,
        owner: user.id,
      },
      overrideAccess: true,
    })
  }
  console.log(`✓ Created ${testScoreData.length} test scores`)

  // ─── 12. Habits ───
  const habitData = [
    {
      title: 'Morning Cold Shower & Hydration',
      description: 'Drink 500ml water and cold shower for morning alertness.',
      frequency: 'daily' as const,
      streak: 12,
      bestStreak: 18,
      color: '#00b894',
      isActive: true,
      completedDates: [
        today.toISOString().split('T')[0],
        new Date(Date.now() - 86400000).toISOString().split('T')[0],
        new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      ],
    },
    {
      title: '30-min Deep Problem Solving',
      description: 'HC Verma physics problem sets without phone distraction.',
      frequency: 'daily' as const,
      streak: 6,
      bestStreak: 14,
      color: '#6C5CE7',
      isActive: true,
      mission: mission1.id,
      completedDates: [
        today.toISOString().split('T')[0],
        new Date(Date.now() - 86400000).toISOString().split('T')[0],
      ],
    },
    {
      title: 'Flash Card Spaced Repetition',
      description: 'Review 15-20 flash cards daily using Leitner intervals.',
      frequency: 'daily' as const,
      streak: 5,
      bestStreak: 10,
      color: '#fdcb6e',
      isActive: true,
      completedDates: [
        today.toISOString().split('T')[0],
        new Date(Date.now() - 86400000).toISOString().split('T')[0],
      ],
    },
    {
      title: 'Night Review & Log Hours',
      description: 'Audit daily time log blocks and plan top 3 objectives for tomorrow.',
      frequency: 'daily' as const,
      streak: 9,
      bestStreak: 15,
      color: '#00cec9',
      isActive: true,
      completedDates: [
        new Date(Date.now() - 86400000).toISOString().split('T')[0],
        new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      ],
    },
    {
      title: '5km Cardio Run',
      description: 'High-intensity interval cardio run for cardiovascular stamina.',
      frequency: 'weekly' as const,
      streak: 3,
      bestStreak: 6,
      color: '#e17055',
      isActive: true,
      mission: mission3.id,
      completedDates: [
        new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      ],
    },
  ]

  for (const h of habitData) {
    await payload.create({
      collection: 'habits',
      data: {
        ...h,
        owner: user.id,
      },
      overrideAccess: true,
    })
  }
  console.log(`✓ Created ${habitData.length} habits`)

  // ─── 13. Schedules ───
  const todayStr = today.toISOString().split('T')[0]
  const scheduleData = [
    {
      title: 'Morning Workout & Physical Readiness',
      description: 'Dynamic warmups, calisthenics, and high-protein breakfast.',
      date: todayStr,
      startTime: '07:30',
      endTime: '08:30',
      category: 'exercise' as const,
      color: '#fdcb6e',
      isCompleted: true,
      mission: mission3.id,
    },
    {
      title: 'Physics: Rotational Dynamics Problem Set',
      description: 'HC Verma Chapter 10 — Torque and Angular Momentum numericals.',
      date: todayStr,
      startTime: '09:00',
      endTime: '11:00',
      category: 'study' as const,
      color: '#6C5CE7',
      isCompleted: true,
      mission: mission1.id,
    },
    {
      title: 'Mathematics: Differential Calculus & Limits',
      description: 'Thomas Calculus section 2.4 — Epsilon-delta and L\'Hôpital theorem.',
      date: todayStr,
      startTime: '11:30',
      endTime: '13:00',
      category: 'study' as const,
      color: '#00b894',
      isCompleted: false,
      mission: mission2.id,
    },
    {
      title: 'Full-Stack Development: Next.js & Payload',
      description: 'Implement Zustand stores and HUD dashboard widgets.',
      date: todayStr,
      startTime: '14:00',
      endTime: '16:00',
      category: 'work' as const,
      color: '#0984e3',
      isCompleted: false,
      mission: mission4.id,
    },
    {
      title: 'Flash Card Spaced Review Session',
      description: 'Quick fire 20-card drill on Physics & Math formulas.',
      date: todayStr,
      startTime: '16:30',
      endTime: '17:30',
      category: 'study' as const,
      color: '#fdcb6e',
      isCompleted: false,
    },
    {
      title: 'Tactical Rest & Evening Walk',
      description: 'Screen-free walk to recharge cognitive bandwidth.',
      date: todayStr,
      startTime: '18:00',
      endTime: '19:00',
      category: 'rest' as const,
      color: '#00cec9',
      isCompleted: false,
    },
  ]

  for (const s of scheduleData) {
    await payload.create({
      collection: 'schedules',
      data: {
        ...s,
        owner: user.id,
      },
      overrideAccess: true,
    })
  }
  console.log(`✓ Created ${scheduleData.length} schedules`)

  // ─── Summary ───
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎯 SEED COMPLETE — ToggleDawn Demo Data')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('   🔑 PAYLOAD CMS ADMIN PANEL:')
  console.log('      URL:      http://localhost:3000/super-master')
  console.log(`      Email:    ${ADMIN_EMAIL}`)
  console.log(`      Password: ${ADMIN_PASSWORD}`)
  console.log('   👤 FRONTEND OPERATOR / DEMO USER:')
  console.log('      URL:      http://localhost:3000/login')
  console.log(`      Email:    ${DEMO_EMAIL}`)
  console.log(`      Password: ${DEMO_PASSWORD}`)
  console.log('   ─────────────────────────────────────')
  console.log(`   Categories:  ${categoryData.length}`)
  console.log(`   Projects:    2`)
  console.log(`   Missions:    4`)
  console.log(`   Books:       3`)
  console.log(`   Chapters:    5`)
  console.log(`   Notes:       ${noteData.length}`)
  console.log(`   Flash Cards: ${flashCardData.length}`)
  console.log(`   Time Logs:   ${timeLogEntries.length}`)
  console.log(`   Test Scores: ${testScoreData.length}`)
  console.log(`   Habits:      ${habitData.length}`)
  console.log(`   Schedules:   ${scheduleData.length}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
