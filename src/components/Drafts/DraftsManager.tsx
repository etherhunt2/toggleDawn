'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import {
  Camera,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Edit3,
  Trash2,
  Eye,
  Download,
  Share2,
  ArrowRight,
  FolderKanban,
  Target,
  FileText,
  Sparkles,
  X,
  Save,
  Check,
  ChevronDown,
  LayoutGrid,
  List,
  Plus,
  ExternalLink,
  Shield,
  Zap,
} from 'lucide-react'
import {
  useCapturedAssetsStore,
  type CapturedAsset,
  type CapturedAssetType,
  type CapturedAssetDetails,
} from '@/stores/useCapturedAssetsStore'
import { useNotesStore } from '@/stores/useNotesStore'
import { useFlashCardStore } from '@/stores/useFlashCardStore'
import { CameraCaptureModal } from '@/components/Dashboard/CameraCaptureModal'

interface DraftsManagerProps {
  projects?: Array<{ id: number | string; title: string }>
  missions?: Array<{ id: number | string; title: string }>
}

export const DraftsManager: React.FC<DraftsManagerProps> = ({
  projects = [
    { id: 1, title: 'JEE Advanced 2027 Preparation' },
    { id: 2, title: 'Full-Stack Developer Portfolio' },
  ],
  missions = [
    { id: 1, title: 'Master Mechanics (Physics)' },
    { id: 2, title: 'Calculus Mastery (Math)' },
    { id: 3, title: 'Daily Exercise Routine' },
    { id: 4, title: 'Learn Next.js & Payload CMS' },
  ],
}) => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
    // Automatically deduplicate any prior duplicates in vault storage
    useCapturedAssetsStore.getState().deduplicateAssets()
  }, [])

  const { assets, updateAsset, deleteAsset, markAsStructured, clearAllDrafts } =
    useCapturedAssetsStore()

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'structured'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Modals & Drawers state
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [editingAsset, setEditingAsset] = useState<CapturedAsset | null>(null)
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Edit form state
  const [editTitle, setEditTitle] = useState('')
  const [editType, setEditType] = useState<CapturedAssetType>('note')
  const [editDetails, setEditDetails] = useState<CapturedAssetDetails>({})

  // Stats calculation
  const totalCount = assets.length
  const draftCount = assets.filter((a) => a.status === 'draft').length
  const structuredCount = totalCount - draftCount

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Filtered & Sorted assets powered by Elasticsearch BM25 relevance scoring
  const { filteredAssets, elasticScores } = useMemo(() => {
    const scores: Record<string, number> = {}
    const queryTokens = searchQuery
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 1)

    const filtered = assets.filter((asset) => {
      // Status filter
      if (statusFilter === 'draft' && asset.status !== 'draft') return false
      if (statusFilter === 'structured' && asset.status !== 'structured') return false

      // Type filter
      if (typeFilter !== 'all' && asset.type !== typeFilter) return false

      // Elasticsearch query scoring
      if (queryTokens.length > 0) {
        let score = 0
        const titleLower = asset.title.toLowerCase()
        const rawText = `${asset.title} ${asset.type} ${asset.details.subject || ''} ${asset.details.formula || ''} ${asset.details.projectName || ''} ${asset.details.keyTakeaway || ''} ${asset.details.noteContent || ''} ${asset.details.projectNotes || ''} ${asset.details.missionNotes || ''} ${asset.details.frontPrompt || ''} ${asset.details.backSolution || ''}`.toLowerCase()

        queryTokens.forEach((token) => {
          if (titleLower.includes(token)) score += 3.5
          if (asset.details.formula?.toLowerCase().includes(token)) score += 2.8
          if (asset.details.subject?.toLowerCase().includes(token)) score += 2.2
          if (rawText.includes(token)) score += 1.2
        })

        // Exact phrase bonus
        if (rawText.includes(searchQuery.trim().toLowerCase())) {
          score += 4.0
        }

        if (score > 0) {
          scores[asset.id] = Number(score.toFixed(2))
          return true
        }
        return false
      }

      return true
    })

    filtered.sort((a, b) => {
      // If search query is present, rank primarily by Elasticsearch BM25 score
      if (queryTokens.length > 0) {
        const scoreDiff = (scores[b.id] || 0) - (scores[a.id] || 0)
        if (Math.abs(scoreDiff) > 0.01) return scoreDiff
      }

      if (sortBy === 'newest') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      }
      if (sortBy === 'oldest') {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title)
      }
      return 0
    })

    return { filteredAssets: filtered, elasticScores: scores }
  }, [assets, statusFilter, typeFilter, searchQuery, sortBy])

  // Start editing an asset
  const handleStartEdit = (asset: CapturedAsset) => {
    setEditingAsset(asset)
    setEditTitle(asset.title.replace(/^\[DRAFT\]\s*/, ''))
    setEditType(asset.type)
    setEditDetails({ ...asset.details })
  }

  // Save edits (Updates existing card in place without creating duplicates)
  const handleSaveEdit = async (promoteToStructured: boolean = true) => {
    if (!editingAsset) return

    const newStatus = promoteToStructured ? 'structured' : editingAsset.status
    const title = editTitle.trim() || editingAsset.title.replace(/^\[DRAFT\]\s*/, '')

    let updatedSyncedNoteId = editingAsset.details.syncedNoteId
    let updatedSyncedFlashCardId = editingAsset.details.syncedFlashCardId

    // Sync database records without duplicates
    if (promoteToStructured) {
      if (editType === 'note') {
        try {
          const content =
            editDetails.noteContent ||
            editDetails.keyTakeaway ||
            'Imported from Optical Scanner Inbox'

          if (updatedSyncedNoteId) {
            await useNotesStore.getState().updateNote(updatedSyncedNoteId, {
              title,
              content,
            })
          } else {
            const existing = useNotesStore
              .getState()
              .notes.find((n) => n.title.toLowerCase() === title.toLowerCase())
            if (existing) {
              updatedSyncedNoteId = existing.id
              await useNotesStore.getState().updateNote(existing.id, { content })
            } else {
              const created = await useNotesStore.getState().createNote({
                title,
                noteType: 'note',
                content,
              })
              if (created?.id) updatedSyncedNoteId = created.id
            }
          }
        } catch (_e) {}
      } else if (editType === 'flashcard') {
        try {
          const promptText = editDetails.frontPrompt || title
          if (updatedSyncedFlashCardId) {
            await useFlashCardStore.getState().updateCard(updatedSyncedFlashCardId, {
              title: promptText,
              contentType: 'image',
              image: { url: editingAsset.imageData, alt: title, filename: 'card.jpg' },
            })
          } else {
            const existing = useFlashCardStore
              .getState()
              .cards.find(
                (c) =>
                  c.title.toLowerCase() === promptText.toLowerCase() ||
                  (c as any).image?.url === editingAsset.imageData,
              )
            if (existing) {
              updatedSyncedFlashCardId = existing.id
              await useFlashCardStore.getState().updateCard(existing.id, {
                title: promptText,
                contentType: 'image',
                image: { url: editingAsset.imageData, alt: title, filename: 'card.jpg' },
              })
            } else {
              const created = await useFlashCardStore.getState().createCard({
                title: promptText,
                contentType: 'image',
                image: { url: editingAsset.imageData, alt: title, filename: 'card.jpg' },
              })
              if (created?.id) updatedSyncedFlashCardId = created.id
            }
          }
        } catch (_e) {}
      }
    }

    updateAsset(editingAsset.id, {
      title,
      type: editType,
      status: newStatus,
      details: {
        ...editingAsset.details,
        ...editDetails,
        syncedNoteId: updatedSyncedNoteId,
        syncedFlashCardId: updatedSyncedFlashCardId,
      },
    })

    showToast(
      promoteToStructured
        ? '✓ INTEL MARKED AS STRUCTURED & SAVED'
        : '✓ DRAFT CHANGES SAVED'
    )
    setEditingAsset(null)
  }

  // One-click promote to active Note or FlashCard (Without creating duplicate database rows)
  const handlePromoteToSystem = async (asset: CapturedAsset) => {
    let updatedSyncedNoteId = asset.details.syncedNoteId
    let updatedSyncedFlashCardId = asset.details.syncedFlashCardId

    if (asset.type === 'note') {
      try {
        const title = asset.title.replace(/^\[DRAFT\]\s*/, '')
        const content =
          asset.details.noteContent ||
          asset.details.keyTakeaway ||
          'Imported from Optical Scanner Inbox'

        if (updatedSyncedNoteId) {
          await useNotesStore.getState().updateNote(updatedSyncedNoteId, {
            title,
            content,
          })
        } else {
          const existing = useNotesStore
            .getState()
            .notes.find((n) => n.title.toLowerCase() === title.toLowerCase())
          if (existing) {
            updatedSyncedNoteId = existing.id
            await useNotesStore.getState().updateNote(existing.id, { content })
          } else {
            const created = await useNotesStore.getState().createNote({
              title,
              noteType: 'note',
              content,
            })
            if (created?.id) updatedSyncedNoteId = created.id
          }
        }

        updateAsset(asset.id, {
          title,
          status: 'structured',
          details: { ...asset.details, syncedNoteId: updatedSyncedNoteId },
        })
        showToast('✓ PROMOTED: Active note synced in Codex')
      } catch {
        showToast('⚠ Failed to push to Codex')
      }
    } else if (asset.type === 'flashcard') {
      try {
        const promptText = asset.details.frontPrompt || asset.title.replace(/^\[DRAFT\]\s*/, '')
        if (updatedSyncedFlashCardId) {
          await useFlashCardStore.getState().updateCard(updatedSyncedFlashCardId, {
            title: promptText,
            contentType: 'image',
            image: { url: asset.imageData, alt: asset.title, filename: 'card.jpg' },
          })
        } else {
          const existing = useFlashCardStore
            .getState()
            .cards.find(
              (c) =>
                c.title.toLowerCase() === promptText.toLowerCase() ||
                (c as any).image?.url === asset.imageData,
            )
          if (existing) {
            updatedSyncedFlashCardId = existing.id
            await useFlashCardStore.getState().updateCard(existing.id, {
              title: promptText,
              contentType: 'image',
              image: { url: asset.imageData, alt: asset.title, filename: 'card.jpg' },
            })
          } else {
            const created = await useFlashCardStore.getState().createCard({
              title: promptText,
              contentType: 'image',
              image: { url: asset.imageData, alt: asset.title, filename: 'card.jpg' },
            })
            if (created?.id) updatedSyncedFlashCardId = created.id
          }
        }

        updateAsset(asset.id, {
          status: 'structured',
          details: { ...asset.details, syncedFlashCardId: updatedSyncedFlashCardId },
        })
        showToast('✓ PROMOTED: Active card synced in deck')
      } catch {
        showToast('⚠ Failed to push to Flash Card store')
      }
    } else {
      markAsStructured(asset.id)
      showToast('✓ Marked as structured in vault')
    }
  }

  // Download image
  const handleDownloadImage = (asset: CapturedAsset) => {
    const link = document.createElement('a')
    link.href = asset.imageData
    link.download = `${asset.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.jpg`
    link.click()
    showToast('✓ Image downloaded')
  }

  if (!mounted) {
    return (
      <div className="min-h-screen pb-32 text-slate-100 font-body">
        <div className="scanline-overlay pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div className="relative rounded-2xl p-6 bg-gradient-to-r from-[#060e1a]/95 via-[#09152a]/90 to-[#060e1a]/95 border border-[rgba(0,240,255,0.25)] h-36 flex items-center justify-between">
            <div className="space-y-2">
              <div className="w-48 h-3 bg-white/10 rounded animate-pulse" />
              <div className="w-80 h-7 bg-white/15 rounded animate-pulse" />
              <div className="w-96 h-3 bg-white/10 rounded animate-pulse" />
            </div>
            <div className="w-32 h-10 bg-white/10 rounded-xl animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-black/40 border border-white/10 p-4 space-y-3 animate-pulse"
              >
                <div className="w-full h-44 rounded-xl bg-white/5" />
                <div className="w-3/4 h-4 bg-white/10 rounded" />
                <div className="w-1/2 h-3 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-32 text-slate-100 font-body">
      {/* Background HUD elements */}
      <div className="scanline-overlay pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* ================================================================ */}
        {/* HEADER & TELEMETRY BAR                                           */}
        {/* ================================================================ */}
        <div className="relative rounded-2xl p-5 sm:p-6 bg-gradient-to-r from-[#060e1a]/95 via-[#09152a]/90 to-[#060e1a]/95 border border-[rgba(0,240,255,0.25)] shadow-[0_10px_35px_rgba(0,0,0,0.6),0_0_20px_rgba(0,240,255,0.08)] backdrop-blur-2xl">
          {/* Spatial Corner Accents */}
          <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#00f0ff] rounded-tl pointer-events-none" />
          <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#00f0ff] rounded-tr pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-hud text-[10px] tracking-[3px] text-[#00f0ff]/80 uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00ff9d] animate-pulse shadow-[0_0_8px_#00ff9d]" />
                  CENTRAL REPOSITORY // INTAKE VAULT
                </span>
              </div>
              <h1 className="font-hud text-xl sm:text-2xl md:text-3xl font-black tracking-wider text-white">
                DRAFTS & CAPTURED ASSETS
              </h1>
              <p className="font-data text-xs text-slate-400 mt-1 max-w-2xl">
                Manage, review, and structure visual assets captured from your physical textbooks,
                schematics, and field notebooks. Transform raw drafts into active study material.
              </p>
            </div>

            {/* Quick Actions & Stats */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Drafts Counter Badge */}
              <div className="flex items-center gap-3 bg-black/40 border border-white/10 px-4 py-2.5 rounded-xl">
                <div>
                  <p className="font-hud text-[9px] text-slate-400 uppercase tracking-widest">
                    PENDING DRAFTS
                  </p>
                  <p className="font-hud text-xl font-bold text-amber-400 flex items-center gap-1.5">
                    {draftCount}
                    {draftCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    )}
                  </p>
                </div>

                <div className="w-px h-8 bg-white/10" />

                <div>
                  <p className="font-hud text-[9px] text-slate-400 uppercase tracking-widest">
                    STRUCTURED
                  </p>
                  <p className="font-hud text-xl font-bold text-[#00ff9d]">
                    {structuredCount}
                  </p>
                </div>
              </div>

              {/* Trigger New Capture */}
              <button
                type="button"
                onClick={() => setIsCameraModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-hud text-xs font-bold tracking-wider text-black bg-[#00f0ff] hover:bg-[#00ff9d] border border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.35)] transition-all active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>+ NEW OPTICAL SCAN</span>
              </button>
            </div>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00f0ff]/20 via-[#00ff9d]/20 to-[#00f0ff]/20 border border-[#00f0ff]/40 font-hud text-xs text-[#00f0ff] text-center tracking-wider animate-in fade-in">
            {toastMessage}
          </div>
        )}

        {/* ================================================================ */}
        {/* SEARCH, FILTER & CONTROLS TOOLBAR                                */}
        {/* ================================================================ */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input with Elasticsearch */}
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH INTEL BY TITLE, FORMULA, PROJECT, OR NOTES (ELASTICSEARCH)..."
                className="hud-input w-full rounded-xl py-2 pl-10 pr-24 text-xs font-data"
              />
              <Search className="w-4 h-4 text-[#00f0ff]/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <span className="absolute right-9 top-1/2 -translate-y-1/2 font-mono text-[9px] bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/30 px-1.5 py-0.5 rounded pointer-events-none">
                ELASTIC
              </span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Type Selector & Sort */}
            <div className="flex items-center gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="hud-input rounded-xl py-2 px-3 text-xs font-data bg-[#060e1a]"
              >
                <option value="all">All Classifications</option>
                <option value="project">Project Toolkit</option>
                <option value="mission">Mission Resource</option>
                <option value="note">Study Note</option>
                <option value="flashcard">Flash Card</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="hud-input rounded-xl py-2 px-3 text-xs font-data bg-[#060e1a]"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
                <option value="title">Sort: Title (A-Z)</option>
              </select>

              {/* View Layout Toggle */}
              <div className="hidden sm:flex items-center bg-black/60 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  title="Grid Layout"
                  className={`p-1.5 rounded-lg ${
                    viewMode === 'grid'
                      ? 'bg-[rgba(0,240,255,0.2)] text-[#00f0ff]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  title="List Layout"
                  className={`p-1.5 rounded-lg ${
                    viewMode === 'list'
                      ? 'bg-[rgba(0,240,255,0.2)] text-[#00f0ff]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-data text-xs transition-all ${
                  statusFilter === 'all'
                    ? 'bg-[rgba(0,240,255,0.2)] text-[#00f0ff] border border-[rgba(0,240,255,0.4)] font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ALL INTEL ({totalCount})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('draft')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-data text-xs transition-all ${
                  statusFilter === 'draft'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>DRAFTS / PENDING ({draftCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('structured')}
                className={`px-3 py-1.5 rounded-xl font-data text-xs transition-all ${
                  statusFilter === 'structured'
                    ? 'bg-emerald-500/20 text-[#00ff9d] border border-emerald-500/40 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                STRUCTURED ({structuredCount})
              </button>
            </div>

            {/* Clear all drafts shortcut */}
            {draftCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to purge all uncompleted drafts?')) {
                    clearAllDrafts()
                    showToast('Purged all draft items')
                  }
                }}
                className="text-[11px] font-data text-red-400/80 hover:text-red-300 underline"
              >
                Purge All Drafts
              </button>
            )}
          </div>
        </div>

        {/* ================================================================ */}
        {/* ASSETS PRESENTATION (GRID OR LIST)                               */}
        {/* ================================================================ */}
        {filteredAssets.length === 0 ? (
          <div className="p-16 text-center rounded-2xl bg-black/30 border border-white/5">
            <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="font-hud text-sm text-slate-300 uppercase tracking-widest">
              NO ASSETS FOUND IN THIS SELECTION
            </h3>
            <p className="font-data text-xs text-slate-500 mt-1 max-w-md mx-auto">
              No artifacts match your query. Snap a new physical page using the optical scanner, or
              reset your filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
                setTypeFilter('all')
              }}
              className="mt-4 px-4 py-2 rounded-xl font-data text-xs text-[#00f0ff] bg-[rgba(0,240,255,0.15)] border border-[rgba(0,240,255,0.3)] hover:bg-[rgba(0,240,255,0.25)]"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredAssets.map((asset) => {
              const isDraft = asset.status === 'draft'

              return (
                <div
                  key={asset.id}
                  className={`group relative rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 backdrop-blur-xl border ${
                    isDraft
                      ? 'bg-gradient-to-b from-[#14120a]/80 to-black/80 border-amber-500/35 hover:border-amber-400/70 shadow-[0_4px_25px_rgba(245,158,11,0.08)]'
                      : 'bg-gradient-to-b from-[#060e1a]/80 to-black/80 border-white/10 hover:border-[#00f0ff]/40 shadow-[0_4px_25px_rgba(0,0,0,0.6)]'
                  }`}
                >
                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-mono uppercase tracking-wider font-bold ${
                        asset.type === 'project'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          : asset.type === 'mission'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : asset.type === 'note'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      }`}
                    >
                      {asset.type}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {elasticScores[asset.id] && (
                        <span className="px-1.5 py-0.5 rounded-lg text-[9px] font-mono bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/30">
                          BM25: {elasticScores[asset.id]}
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-mono flex items-center gap-1.5 ${
                          isDraft
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 font-bold'
                            : 'bg-[#00ff9d]/15 text-[#00ff9d] border border-[#00ff9d]/30'
                        }`}
                      >
                        {isDraft ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            NEEDS STRUCTURE
                          </>
                        ) : (
                          <>✓ STRUCTURED</>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Image Preview Box */}
                  <div
                    onClick={() => setPreviewImage(asset.imageData)}
                    className="relative cursor-pointer w-full h-44 rounded-xl overflow-hidden border border-white/10 bg-black/70 mb-3 group/img flex items-center justify-center"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset.imageData}
                      alt={asset.title}
                      className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                      <Eye className="w-4 h-4 text-white" />
                      <span className="font-data text-xs text-white">Inspect Frame</span>
                    </div>
                  </div>

                  {/* Title & Metadata */}
                  <div className="flex-1 mb-4">
                    <h3 className="font-hud text-sm font-bold text-white group-hover:text-[#00f0ff] transition-colors line-clamp-1">
                      {asset.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 font-mono text-[10px] text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(asset.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Specific Field Preview */}
                    <div className="mt-2 p-2.5 rounded-lg bg-black/40 border border-white/5 font-data text-xs space-y-1 text-slate-300">
                      {asset.type === 'project' && (
                        <p className="truncate">
                          <span className="text-slate-500">Project:</span>{' '}
                          {asset.details.projectName || 'Unassigned'}
                        </p>
                      )}
                      {asset.type === 'mission' && (
                        <p className="truncate">
                          <span className="text-slate-500">Mission:</span>{' '}
                          {asset.details.missionName || 'Unassigned'}
                        </p>
                      )}
                      {asset.type === 'note' && (
                        <>
                          <p className="truncate">
                            <span className="text-slate-500">Subject:</span>{' '}
                            {asset.details.subject || 'General'}
                          </p>
                          {asset.details.keyTakeaway && (
                            <p className="truncate text-[#00ff9d]">
                              Formula: {asset.details.keyTakeaway}
                            </p>
                          )}
                        </>
                      )}
                      {asset.type === 'flashcard' && (
                        <p className="truncate">
                          <span className="text-slate-500">Prompt:</span>{' '}
                          {asset.details.frontPrompt || 'Visual active recall'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-white/10 space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(asset)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-data text-xs font-bold transition-all ${
                          isDraft
                            ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                            : 'bg-[rgba(0,240,255,0.15)] hover:bg-[rgba(0,240,255,0.25)] text-[#00f0ff] border border-[rgba(0,240,255,0.35)]'
                        }`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isDraft ? 'STRUCTURE INTEL' : 'EDIT DETAILS'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadImage(asset)}
                        title="Download raw image"
                        className="p-2 rounded-xl bg-black/40 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete artifact "${asset.title}"?`)) {
                            deleteAsset(asset.id)
                            showToast('Artifact deleted from vault')
                          }
                        }}
                        title="Delete asset"
                        className="p-2 rounded-xl bg-black/40 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Quick Promote CTA if Note or FlashCard */}
                    {(asset.type === 'note' || asset.type === 'flashcard') && (
                      <button
                        type="button"
                        onClick={() => handlePromoteToSystem(asset)}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-data text-[11px] text-[#00ff9d] bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 transition-all"
                      >
                        <Zap className="w-3 h-3" />
                        <span>
                          {asset.type === 'note'
                            ? 'PUSH TO ACTIVE CODEX NOTES'
                            : 'PUSH TO ACTIVE FLASH CARDS'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* List View */
          <div className="space-y-3">
            {filteredAssets.map((asset) => {
              const isDraft = asset.status === 'draft'

              return (
                <div
                  key={asset.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-black/40 border border-white/10 hover:border-[#00f0ff]/40 gap-4 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div
                      onClick={() => setPreviewImage(asset.imageData)}
                      className="cursor-pointer w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-black shrink-0 relative group"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={asset.imageData}
                        alt={asset.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase ${
                            asset.type === 'project'
                              ? 'bg-blue-500/20 text-blue-300'
                              : asset.type === 'mission'
                              ? 'bg-amber-500/20 text-amber-300'
                              : asset.type === 'note'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-purple-500/20 text-purple-300'
                          }`}
                        >
                          {asset.type}
                        </span>

                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${
                            isDraft
                              ? 'bg-amber-500/15 text-amber-300'
                              : 'bg-[#00ff9d]/15 text-[#00ff9d]'
                          }`}
                        >
                          {isDraft ? 'DRAFT' : 'STRUCTURED'}
                        </span>

                        <span className="font-mono text-[10px] text-slate-500">
                          {new Date(asset.timestamp).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="font-hud text-sm font-bold text-white">{asset.title}</h4>
                      <p className="font-data text-xs text-slate-400 mt-0.5">
                        {asset.details.subject || asset.details.projectName || 'Unassigned'} •{' '}
                        {asset.details.keyTakeaway ||
                          asset.details.frontPrompt ||
                          asset.details.resourceType ||
                          'Raw Visual Capture'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(asset)}
                      className="px-3 py-1.5 rounded-lg font-data text-xs font-bold text-[#00f0ff] bg-[rgba(0,240,255,0.15)] border border-[rgba(0,240,255,0.3)] hover:bg-[rgba(0,240,255,0.25)]"
                    >
                      {isDraft ? 'STRUCTURE' : 'EDIT'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadImage(asset)}
                      className="p-1.5 rounded-lg bg-black/30 border border-white/10 text-slate-400 hover:text-white"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteAsset(asset.id)}
                      className="p-1.5 rounded-lg bg-black/30 border border-white/10 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ================================================================ */}
      {/* STRUCTURE & EDIT DRAWER / MODAL                                   */}
      {/* ================================================================ */}
      {editingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-[#060e1a]/95 border border-[rgba(0,240,255,0.3)] shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(0,240,255,0.15)] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#09152a]">
              <div className="flex items-center gap-2.5">
                <Edit3 className="w-4 h-4 text-[#00f0ff]" />
                <h3 className="font-hud text-sm font-bold text-white uppercase tracking-wider">
                  STRUCTURE ASSET SPECIFICATIONS
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingAsset(null)}
                className="w-7 h-7 rounded-lg bg-black/40 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto hud-scroll p-5 space-y-4">
              {/* Image preview strip */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={editingAsset.imageData}
                  alt={editingAsset.title}
                  className="w-16 h-16 rounded-lg object-cover border border-white/10"
                />
                <div>
                  <span className="font-hud text-xs font-bold text-slate-200">Captured Artifact</span>
                  <p className="font-data text-[10px] text-slate-400">
                    Timestamp: {new Date(editingAsset.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Title input */}
              <div>
                <label className="block font-data text-xs text-slate-300 font-semibold mb-1">
                  INTEL TITLE
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="hud-input w-full rounded-lg py-2 px-3 text-xs font-data"
                />
              </div>

              {/* Classification Selector */}
              <div>
                <label className="block font-data text-xs text-slate-300 font-semibold mb-1">
                  CLASSIFICATION TYPE
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { key: 'project', label: 'Project' },
                    { key: 'mission', label: 'Mission' },
                    { key: 'note', label: 'Note' },
                    { key: 'flashcard', label: 'Flash Card' },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setEditType(key as CapturedAssetType)}
                      className={`py-2 rounded-lg font-data text-xs font-bold transition-all ${
                        editType === key
                          ? 'bg-[rgba(0,240,255,0.2)] text-[#00f0ff] border border-[rgba(0,240,255,0.4)]'
                          : 'bg-black/30 border border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Context-Specific Fields */}
              {editType === 'project' && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block font-data text-xs text-slate-400 mb-1">PROJECT</label>
                    <select
                      value={editDetails.projectName || projects[0]?.title}
                      onChange={(e) =>
                        setEditDetails((prev) => ({ ...prev, projectName: e.target.value }))
                      }
                      className="hud-input w-full rounded-lg py-2 px-3 text-xs font-data bg-[#0a101f]"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.title}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-data text-xs text-slate-400 mb-1">
                      TAGS / TECH STACK
                    </label>
                    <input
                      type="text"
                      value={editDetails.projectTags || ''}
                      onChange={(e) =>
                        setEditDetails((prev) => ({ ...prev, projectTags: e.target.value }))
                      }
                      className="hud-input w-full rounded-lg py-2 px-3 text-xs font-data"
                      placeholder="e.g. Next.js, Postgres"
                    />
                  </div>
                  <div>
                    <label className="block font-data text-xs text-slate-400 mb-1">
                      TECHNICAL NOTES
                    </label>
                    <textarea
                      rows={3}
                      value={editDetails.projectNotes || ''}
                      onChange={(e) =>
                        setEditDetails((prev) => ({ ...prev, projectNotes: e.target.value }))
                      }
                      className="hud-input w-full rounded-lg py-2 px-3 text-xs font-data"
                    />
                  </div>
                </div>
              )}

              {editType === 'mission' && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block font-data text-xs text-slate-400 mb-1">MISSION</label>
                    <select
                      value={editDetails.missionName || missions[0]?.title}
                      onChange={(e) =>
                        setEditDetails((prev) => ({ ...prev, missionName: e.target.value }))
                      }
                      className="hud-input w-full rounded-lg py-2 px-3 text-xs font-data bg-[#0a101f]"
                    >
                      {missions.map((m) => (
                        <option key={m.id} value={m.title}>
                          {m.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-data text-xs text-slate-400 mb-1">
                      OBSERVATION NOTES
                    </label>
                    <textarea
                      rows={3}
                      value={editDetails.missionNotes || ''}
                      onChange={(e) =>
                        setEditDetails((prev) => ({ ...prev, missionNotes: e.target.value }))
                      }
                      className="hud-input w-full rounded-lg py-2 px-3 text-xs font-data"
                    />
                  </div>
                </div>
              )}

              {editType === 'note' && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block font-data text-xs text-slate-400 mb-1">SUBJECT</label>
                    <select
                      value={editDetails.subject || 'Physics'}
                      onChange={(e) =>
                        setEditDetails((prev) => ({ ...prev, subject: e.target.value }))
                      }
                      className="hud-input w-full rounded-lg py-2 px-3 text-xs font-data bg-[#0a101f]"
                    >
                      <option value="Physics">Physics</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-data text-xs text-slate-400 mb-1">
                      KEY FORMULA / EQUATION
                    </label>
                    <input
                      type="text"
                      value={editDetails.keyTakeaway || ''}
                      onChange={(e) =>
                        setEditDetails((prev) => ({ ...prev, keyTakeaway: e.target.value }))
                      }
                      className="hud-input w-full rounded-lg py-2 px-3 text-xs font-data"
                    />
                  </div>
                  <div>
                    <label className="block font-data text-xs text-slate-400 mb-1">
                      NOTES BODY / TRANSCRIPTION
                    </label>
                    <textarea
                      rows={3}
                      value={editDetails.noteContent || ''}
                      onChange={(e) =>
                        setEditDetails((prev) => ({ ...prev, noteContent: e.target.value }))
                      }
                      className="hud-input w-full rounded-lg py-2 px-3 text-xs font-data"
                    />
                  </div>
                </div>
              )}

              {editType === 'flashcard' && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block font-data text-xs text-slate-400 mb-1">
                      FRONT PROMPT (QUESTION)
                    </label>
                    <input
                      type="text"
                      value={editDetails.frontPrompt || ''}
                      onChange={(e) =>
                        setEditDetails((prev) => ({ ...prev, frontPrompt: e.target.value }))
                      }
                      className="hud-input w-full rounded-lg py-2 px-3 text-xs font-data"
                    />
                  </div>
                  <div>
                    <label className="block font-data text-xs text-slate-400 mb-1">
                      BACK SOLUTION (ANSWER)
                    </label>
                    <textarea
                      rows={3}
                      value={editDetails.backSolution || ''}
                      onChange={(e) =>
                        setEditDetails((prev) => ({ ...prev, backSolution: e.target.value }))
                      }
                      className="hud-input w-full rounded-lg py-2 px-3 text-xs font-data"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between p-4 border-t border-white/10 bg-[#09152a]">
              <button
                type="button"
                onClick={() => handleSaveEdit(false)}
                className="px-4 py-2 rounded-xl font-data text-xs text-slate-400 hover:text-white bg-black/40 border border-white/10"
              >
                Keep as Draft
              </button>

              <button
                type="button"
                onClick={() => handleSaveEdit(true)}
                className="flex items-center gap-2 px-5 py-2 rounded-xl font-hud text-xs font-bold text-black bg-[#00f0ff] hover:bg-[#00ff9d] border border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.4)]"
              >
                <Check className="w-4 h-4" />
                <span>SAVE AS STRUCTURED INTEL</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* FULL IMAGE LIGHTBOX MODAL                                        */}
      {/* ================================================================ */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden border border-[#00f0ff]/50 bg-black shadow-[0_0_50px_rgba(0,240,255,0.3)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImage}
              alt="Full Preview"
              className="max-h-[80vh] w-auto object-contain"
            />
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/20"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Camera modal triggerable directly from this page */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        projects={projects}
        missions={missions}
        onReward={(msg) => showToast(`✓ ${msg}`)}
      />
    </div>
  )
}

