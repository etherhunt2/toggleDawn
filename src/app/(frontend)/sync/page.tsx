import type { Metadata } from 'next'
import { SyncPageClient } from './SyncPageClient'

export const metadata: Metadata = {
  title: 'Data Sync // ToggleDawn',
  description: 'View and sync all offline-created data to the Neon database.',
}

export default function SyncPage() {
  return <SyncPageClient />
}
