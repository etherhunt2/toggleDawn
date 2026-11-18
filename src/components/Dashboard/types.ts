export interface DashboardData {
  user?: {
    id?: string | number
    name?: string | null
    email?: string | null
    preferences?: {
      theme?: 'light' | 'dark' | 'system' | null
      dailyGoalHours?: number | null
      streakForgivenessBuffer?: number | null
      enableNotifications?: boolean | null
    } | null
  } | null
  projects?: Array<{
    id: string | number
    title: string
    status?: string | null
    adminStatus?: string | null
    description?: string | null
    deadline?: string | null
    startDate?: string | null
    color?: string | null
    priority?: string | null
    computedProgress?: number | null
    featuredImage?: { url?: string | null; alt?: string | null } | null
    videoResource?: { url?: string | null } | null
    videoTitle?: string | null
    plannerId?: string | null
    updatedAt?: string | null
    createdAt?: string | null
  }>
  missions?: Array<{
    id: string | number
    title: string
    type?: string | null
    targetHours?: number | null
    project?: string | number | null
  }>
  habits?: Array<{
    id: string | number
    title: string
    frequency?: string | null
    streak?: number | null
  }>
  books?: Array<{
    id: string | number
    title: string
    author?: string | null
    slug?: string | null
    totalPages?: number | null
  }>
  chapters?: Array<{
    id: string | number
    title: string
    slug?: string | null
    status?: string | null
    pageCount?: number | null
    bookTitle?: string | null
  }>
  notes?: Array<{
    id: string | number
    title: string
    slug?: string | null
    chapterTitle?: string | null
  }>
  testScores?: Array<{
    id: string | number
    examName: string
    subject?: string | null
    scoreObtained: number
    totalScore: number
    examDate?: string | null
  }>
  timeLogs?: Array<{
    id: string | number
    category?: string | null
    duration?: number | null
    startTime?: string | null
    endTime?: string | null
    description?: string | null
    mission?: string | number | null
  }>
}
