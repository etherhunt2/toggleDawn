import type { Metadata } from 'next/types'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { CodexSearchClient } from '@/search/CodexSearchClient'

export const dynamic = 'force-dynamic'

type Args = {
  searchParams: Promise<{
    q?: string
  }>
}

export default async function Page({ searchParams: searchParamsPromise }: Args) {
  const payload = await getPayload({ config: configPromise })
  const headers = await getHeaders()

  let user = null
  try {
    const authResult = await payload.auth({ headers })
    user = authResult.user || null
  } catch (_e) {
    user = null
  }

  // Restrict access to authenticated operators
  if (!user) {
    redirect('/login')
  }

  const { q = '' } = (await searchParamsPromise) || {}

  return (
    <div className="min-h-screen pt-20 pb-24 bg-[#02060d] text-slate-100">
      <div className="scanline-overlay pointer-events-none" />
      <CodexSearchClient initialQuery={q} />
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Elasticsearch Codex // ToggleDawn`,
    description: `High-dimensional fuzzy BM25 neural search across books, formulas, notes, and flashcards.`,
  }
}
