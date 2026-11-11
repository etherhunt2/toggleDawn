'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Camera,
  X,
  RotateCw,
  Check,
  Upload,
  FolderKanban,
  Target,
  FileText,
  Sparkles,
  Layers,
  Eye,
  Trash2,
  Edit3,
  AlertTriangle,
  ChevronRight,
  ArrowLeft,
  FastForward,
  Save,
  Clock,
  Shield,
  ExternalLink,
} from 'lucide-react'
import {
  useCapturedAssetsStore,
  type CapturedAsset,
  type CapturedAssetType,
  type CapturedAssetDetails,
} from '@/stores/useCapturedAssetsStore'
import { useNotesStore } from '@/stores/useNotesStore'
import { useFlashCardStore } from '@/stores/useFlashCardStore'

export interface CameraCaptureModalProps {
  isOpen: boolean
  onClose: () => void
  onReward?: (message: string, points: number) => void
  projects?: Array<{ id: number | string; title: string }>
  missions?: Array<{ id: number | string; title: string }>
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onReward,
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
  // Store
  const { assets, addAsset, updateAsset, deleteAsset, getDraftCount } =
    useCapturedAssetsStore()
  const draftCount = getDraftCount()

  // View mode: 'capture' (multi-step intake) vs 'vault' (browse & edit saved images)
  const [activeTab, setActiveTab] = useState<'capture' | 'vault'>('capture')

  // Multi-step intake state
  // Step 1: Camera Viewfinder & Frame Capture
  // Step 2: Classification ("What is this image?")
  // Step 3: Structured Details + Skip Option
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // Camera stream state
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Classification & fields
  const [selectedType, setSelectedType] = useState<CapturedAssetType>('note')

  // Step 3 fields state
  const [assetTitle, setAssetTitle] = useState('')
  const [details, setDetails] = useState<CapturedAssetDetails>({
    subject: 'Physics',
    toolkitCategory: 'Architecture',
    resourceType: 'Proof of Completion',
    difficulty: 'medium',
  })

  // Vault browsing state
  const [vaultFilter, setVaultFilter] = useState<'all' | 'draft' | 'structured'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [editingAsset, setEditingAsset] = useState<CapturedAsset | null>(null)

  // Save feedback state
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null)

  // --------------------------------------------------------------------------
  // Camera Life Cycle
  // --------------------------------------------------------------------------
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }, [])

  const startCamera = useCallback(async () => {
    stopCamera()
    setCameraError(null)

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera API is not supported on this device or browser.')
      return
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => {})
      }
      setCameraActive(true)
    } catch (err: any) {
      console.warn('Camera access issue:', err)
      if (err.name === 'NotAllowedError') {
        setCameraError('Camera access denied. Please permit camera permissions or upload an image file.')
      } else if (err.name === 'NotFoundError') {
        setCameraError('No video input hardware detected. You can upload an image file below.')
      } else {
        setCameraError('Could not start video stream. You can upload an image file below.')
      }
      setCameraActive(false)
    }
  }, [facingMode, stopCamera])

  // Manage camera based on modal open state and step
  useEffect(() => {
    if (isOpen) {
      useCapturedAssetsStore.getState().deduplicateAssets()
    }
    if (isOpen && activeTab === 'capture' && step === 1 && !capturedImage) {
      startCamera()
    } else {
      stopCamera()
    }
    return () => {
      stopCamera()
    }
  }, [isOpen, activeTab, step, capturedImage, startCamera, stopCamera])

  // Flip camera between front / rear
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
  }

  // Capture frame from video feed to canvas
  const handleCaptureFrame = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88)
    setCapturedImage(dataUrl)
    stopCamera()
  }

  // Handle fallback file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      if (dataUrl) {
        setCapturedImage(dataUrl)
        stopCamera()
      }
    }
    reader.readAsDataURL(file)
  }

  const handleRetake = () => {
    setCapturedImage(null)
    startCamera()
  }

  // --------------------------------------------------------------------------
  // Reset Intake Form
  // --------------------------------------------------------------------------
  const resetIntake = () => {
    setStep(1)
    setCapturedImage(null)
    setSelectedType('note')
    setAssetTitle('')
    setDetails({
      subject: 'Physics',
      toolkitCategory: 'Architecture',
      resourceType: 'Proof of Completion',
      difficulty: 'medium',
    })
    setEditingAsset(null)
    setSaveSuccessMessage(null)
  }

  // --------------------------------------------------------------------------
  // Save Structured Data (Complete — Updates Existing Card Without Duplicates)
  // --------------------------------------------------------------------------
  const handleSaveStructured = async () => {
    if (!capturedImage) return

    const title =
      assetTitle.trim() ||
      `${selectedType.toUpperCase()} // ${new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}`

    // Find existing asset by active editing target OR by identical image data
    const existingAsset = editingAsset || assets.find((a) => a.imageData === capturedImage)

    let updatedSyncedNoteId = existingAsset?.details?.syncedNoteId
    let updatedSyncedFlashCardId = existingAsset?.details?.syncedFlashCardId

    // 1. If Note, update existing in database or create new if not present (avoid duplicates)
    if (selectedType === 'note') {
      try {
        const cleanTitle = title.replace(/^\[DRAFT\]\s*/, '')
        const noteContent =
          details.noteContent || details.keyTakeaway || 'Captured via Tactical Camera'

        if (updatedSyncedNoteId) {
          // Update existing database record
          await useNotesStore.getState().updateNote(updatedSyncedNoteId, {
            title: cleanTitle,
            content: noteContent,
          })
        } else {
          // Check if a note with this title already exists in store
          const existingNote = useNotesStore
            .getState()
            .notes.find((n) => n.title.toLowerCase() === cleanTitle.toLowerCase())

          if (existingNote) {
            updatedSyncedNoteId = existingNote.id
            await useNotesStore.getState().updateNote(existingNote.id, {
              content: noteContent,
            })
          } else {
            const created = await useNotesStore.getState().createNote({
              title: cleanTitle,
              noteType: 'note',
              content: noteContent,
            })
            if (created?.id) updatedSyncedNoteId = created.id
          }
        }
      } catch (_e) {}
    }

    // 2. If FlashCard, update existing in database or create new if not present (avoid duplicates)
    if (selectedType === 'flashcard') {
      try {
        const promptText = details.frontPrompt || title.replace(/^\[DRAFT\]\s*/, '')

        if (updatedSyncedFlashCardId) {
          // Update existing flash card in database
          await useFlashCardStore.getState().updateCard(updatedSyncedFlashCardId, {
            title: promptText,
            contentType: 'image',
            image: { url: capturedImage, alt: title, filename: 'captured-card.jpg' },
          })
        } else {
          // Check if a card with this prompt or image already exists
          const existingCard = useFlashCardStore
            .getState()
            .cards.find(
              (c) =>
                c.title.toLowerCase() === promptText.toLowerCase() ||
                (c as any).image?.url === capturedImage,
            )

          if (existingCard) {
            updatedSyncedFlashCardId = existingCard.id
            await useFlashCardStore.getState().updateCard(existingCard.id, {
              title: promptText,
              contentType: 'image',
              image: { url: capturedImage, alt: title, filename: 'captured-card.jpg' },
            })
          } else {
            const created = await useFlashCardStore.getState().createCard({
              title: promptText,
              contentType: 'image',
              image: { url: capturedImage, alt: title, filename: 'captured-card.jpg' },
            })
            if (created?.id) updatedSyncedFlashCardId = created.id
          }
        }
      } catch (_e) {}
    }

    const mergedDetails = {
      ...existingAsset?.details,
      ...details,
      noteTitle: selectedType === 'note' ? title : details.noteTitle,
      syncedNoteId: updatedSyncedNoteId,
      syncedFlashCardId: updatedSyncedFlashCardId,
    }

    if (existingAsset) {
      // UPDATE EXISTING CARD IN-PLACE — ZERO DUPLICATES
      updateAsset(existingAsset.id, {
        title: title.replace(/^\[DRAFT\]\s*/, ''),
        type: selectedType,
        status: 'structured',
        details: mergedDetails,
      })
    } else {
      // Fresh new capture
      addAsset({
        imageData: capturedImage,
        type: selectedType,
        status: 'structured',
        title: title,
        details: mergedDetails,
      })
    }

    onReward?.('STRUCTURED INTEL RECORDED', 45)
    setSaveSuccessMessage(`// SAVED AS STRUCTURED INTEL: "${title}" //`)

    setTimeout(() => {
      resetIntake()
      setActiveTab('vault')
    }, 800)
  }

  // --------------------------------------------------------------------------
  // Save Existing Asset Edits from Vault (Reuses deduplicated save handler)
  // --------------------------------------------------------------------------
  const handleSaveVaultEdit = handleSaveStructured

  // --------------------------------------------------------------------------
  // Skip & Quick Save as Draft Inbox
  // --------------------------------------------------------------------------
  const handleSkipAndSaveDraft = () => {
    if (!capturedImage) return

    const typeLabel =
      selectedType === 'project'
        ? 'Project Toolkit'
        : selectedType === 'mission'
        ? 'Mission Resource'
        : selectedType === 'note'
        ? 'Note'
        : 'Flash Card'

    const dateStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    const title = `[DRAFT] ${typeLabel} Scan - ${dateStr}`

    // Check if an existing asset already exists with this image
    const existingAsset = editingAsset || assets.find((a) => a.imageData === capturedImage)

    if (existingAsset) {
      updateAsset(existingAsset.id, {
        title: existingAsset.title || title,
        type: selectedType,
        status: 'draft',
        details: {
          ...existingAsset.details,
          ...details,
        },
      })
    } else {
      addAsset({
        imageData: capturedImage,
        type: selectedType,
        status: 'draft',
        title: title,
        details: {
          ...details,
        },
      })
    }

    onReward?.('RAW INTEL SAVED TO VAULT INBOX', 20)
    setSaveSuccessMessage(
      `// ARTIFACT SAVED TO DRAFT INBOX // You can structure or modify its fields anytime from the Vault.`
    )

    setTimeout(() => {
      resetIntake()
      setActiveTab('vault')
    }, 800)
  }

  // --------------------------------------------------------------------------
  // Prepare Editing an Asset from Vault
  // --------------------------------------------------------------------------
  const startEditingAsset = (asset: CapturedAsset) => {
    setEditingAsset(asset)
    setCapturedImage(asset.imageData)
    setSelectedType(asset.type)
    // Strip [DRAFT] prefix for a cleaner structuring experience
    setAssetTitle(asset.title.replace(/^\[DRAFT\]\s*/, ''))
    setDetails({ ...asset.details })
    setStep(3)
    setActiveTab('capture')
  }

  if (!isOpen) return null

  // Filtered assets for Vault
  const filteredAssets = assets.filter((a) => {
    if (vaultFilter === 'draft' && a.status !== 'draft') return false
    if (vaultFilter === 'structured' && a.status !== 'structured') return false
    if (typeFilter !== 'all' && a.type !== typeFilter) return false
    return true
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Container */}
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-[#060e1a]/95 border border-[rgba(0,240,255,0.25)] shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(0,240,255,0.12)] overflow-hidden">
        
        {/* Spatial Corner Accents */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#00f0ff] rounded-tl pointer-events-none z-10" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#00f0ff] rounded-tr pointer-events-none z-10" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#00f0ff] rounded-bl pointer-events-none z-10" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#00f0ff] rounded-br pointer-events-none z-10" />

        {/* ================================================================ */}
        {/* MODAL HEADER WITH MODE TABS                                      */}
        {/* ================================================================ */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[rgba(0,240,255,0.15)] bg-gradient-to-r from-[#060e1a] via-[#09152a] to-[#060e1a]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/35 flex items-center justify-center text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-hud text-xs sm:text-sm font-bold tracking-widest text-[#00f0ff] uppercase flex items-center gap-2">
                OPTICAL SENSOR // ASSET INTAKE
                <span className="w-2 h-2 rounded-full bg-[#00ff9d] animate-pulse shadow-[0_0_6px_#00ff9d]" />
              </h2>
              <p className="font-data text-[10px] text-slate-400">
                Snap physical assets & organize into project, mission, note, or flash card
              </p>
            </div>
          </div>

          {/* Mode Switcher Pills */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => {
                  setEditingAsset(null)
                  setActiveTab('capture')
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-data text-xs transition-all ${
                  activeTab === 'capture'
                    ? 'bg-[rgba(0,240,255,0.2)] text-[#00f0ff] border border-[rgba(0,240,255,0.4)] font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>CAMERA SCANNER</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  stopCamera()
                  setActiveTab('vault')
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-data text-xs transition-all ${
                  activeTab === 'vault'
                    ? 'bg-[rgba(0,240,255,0.2)] text-[#00f0ff] border border-[rgba(0,240,255,0.4)] font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>CAPTURED VAULT ({assets.length})</span>
                {draftCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500/25 border border-amber-500/50 text-amber-300 text-[9px] font-mono animate-pulse">
                    {draftCount} DRAFT
                  </span>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                stopCamera()
                onClose()
              }}
              className="w-8 h-8 rounded-lg bg-black/40 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Save Notification Banner */}
        {saveSuccessMessage && (
          <div className="px-4 py-2 bg-gradient-to-r from-emerald-500/20 via-[#00ff9d]/20 to-emerald-500/20 border-b border-[#00ff9d]/40 font-hud text-xs text-[#00ff9d] text-center tracking-wider animate-in fade-in">
            {saveSuccessMessage}
          </div>
        )}

        {/* ================================================================ */}
        {/* BODY CONTENT: TAB 1 (CAPTURE) VS TAB 2 (VAULT)                   */}
        {/* ================================================================ */}
        <div className="flex-1 overflow-y-auto hud-scroll p-4 sm:p-6">
          {activeTab === 'capture' ? (
            <div>
              {/* Stepper Progress Bar */}
              {!editingAsset && (
                <div className="mb-5">
                  <div className="grid grid-cols-3 gap-2">
                    <div
                      className={`p-2 rounded-xl border font-data text-xs transition-all flex items-center gap-2 ${
                        step === 1
                          ? 'bg-[rgba(0,240,255,0.15)] border-[#00f0ff]/50 text-[#00f0ff] font-bold shadow-[0_0_12px_rgba(0,240,255,0.15)]'
                          : step > 1
                          ? 'bg-black/30 border-white/10 text-emerald-400'
                          : 'bg-black/20 border-white/5 text-slate-500'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-black/50 border border-current flex items-center justify-center text-[10px]">
                        {step > 1 ? '✓' : '1'}
                      </span>
                      <span className="truncate">01. OPTICAL SCAN</span>
                    </div>

                    <div
                      className={`p-2 rounded-xl border font-data text-xs transition-all flex items-center gap-2 ${
                        step === 2
                          ? 'bg-[rgba(0,240,255,0.15)] border-[#00f0ff]/50 text-[#00f0ff] font-bold shadow-[0_0_12px_rgba(0,240,255,0.15)]'
                          : step > 2
                          ? 'bg-black/30 border-white/10 text-emerald-400'
                          : 'bg-black/20 border-white/5 text-slate-500'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-black/50 border border-current flex items-center justify-center text-[10px]">
                        {step > 2 ? '✓' : '2'}
                      </span>
                      <span className="truncate">02. CLASSIFY</span>
                    </div>

                    <div
                      className={`p-2 rounded-xl border font-data text-xs transition-all flex items-center gap-2 ${
                        step === 3
                          ? 'bg-[rgba(0,240,255,0.15)] border-[#00f0ff]/50 text-[#00f0ff] font-bold shadow-[0_0_12px_rgba(0,240,255,0.15)]'
                          : 'bg-black/20 border-white/5 text-slate-500'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-black/50 border border-current flex items-center justify-center text-[10px]">
                        3
                      </span>
                      <span className="truncate">03. STRUCTURE / SKIP</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------ */}
              {/* STEP 1: CAMERA SCANNER & CAPTURE                             */}
              {/* ------------------------------------------------------------ */}
              {step === 1 && (
                <div className="space-y-4">
                  {!capturedImage ? (
                    <div className="relative rounded-2xl overflow-hidden border border-[rgba(0,240,255,0.3)] bg-black/90 aspect-video max-h-[460px] flex items-center justify-center shadow-[inset_0_0_30px_rgba(0,240,255,0.1)]">
                      {/* Video Stream */}
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />

                      {/* HUD Optical Reticle & Scanning Overlay */}
                      <div className="absolute inset-0 pointer-events-none">
                        {/* Center Reticle */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-dashed border-[#00f0ff]/40 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-ping" />
                          <div className="absolute inset-x-0 h-px bg-[#00f0ff]/30" />
                          <div className="absolute inset-y-0 w-px bg-[#00f0ff]/30" />
                        </div>

                        {/* Corner Target Brackets */}
                        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#00ff9d]" />
                        <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#00ff9d]" />
                        <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#00ff9d]" />
                        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#00ff9d]" />

                        {/* Scanner Status Bar */}
                        <div className="absolute top-3 left-12 flex items-center gap-2 font-mono text-[10px] text-[#00f0ff] bg-black/60 px-2 py-0.5 rounded border border-[#00f0ff]/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] animate-pulse" />
                          OPTICAL SCANNER READY // FACING: {facingMode.toUpperCase()}
                        </div>
                      </div>

                      {/* Camera Error or Fallback Message */}
                      {cameraError && (
                        <div className="absolute inset-0 bg-black/90 p-6 flex flex-col items-center justify-center text-center">
                          <AlertTriangle className="w-10 h-10 text-amber-400 mb-3" />
                          <p className="font-hud text-sm text-slate-200 mb-2">
                            {cameraError}
                          </p>
                          <label className="cursor-pointer mt-3 flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgba(0,240,255,0.15)] hover:bg-[rgba(0,240,255,0.25)] border border-[rgba(0,240,255,0.4)] text-[#00f0ff] font-data text-xs transition-all">
                            <Upload className="w-4 h-4" />
                            <span>UPLOAD PHOTO FROM DEVICE</span>
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      )}

                      {/* Controls on Camera Stream */}
                      {cameraActive && !cameraError && (
                        <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4">
                          <button
                            type="button"
                            onClick={toggleFacingMode}
                            title="Flip Camera"
                            className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-95"
                          >
                            <RotateCw className="w-4 h-4" />
                          </button>

                          {/* Shutter Button */}
                          <button
                            type="button"
                            onClick={handleCaptureFrame}
                            className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-red-600/80 hover:bg-red-500 border-4 border-white/80 shadow-[0_0_20px_rgba(239,68,68,0.7)] active:scale-95 transition-all"
                          >
                            <div className="w-6 h-6 rounded-full bg-white group-hover:scale-110 transition-transform" />
                          </button>

                          {/* Upload fallback button */}
                          <label
                            title="Upload existing image"
                            className="cursor-pointer w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-95"
                          >
                            <Upload className="w-4 h-4" />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Captured Image Preview */
                    <div className="space-y-4">
                      <div className="relative rounded-2xl overflow-hidden border border-[#00f0ff]/40 bg-black max-h-[440px] flex items-center justify-center shadow-[0_0_25px_rgba(0,240,255,0.15)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={capturedImage}
                          alt="Captured Asset"
                          className="w-full h-auto max-h-[440px] object-contain"
                        />
                        <div className="absolute top-3 left-3 bg-black/70 px-2.5 py-1 rounded font-mono text-[10px] text-[#00ff9d] border border-[#00ff9d]/30">
                          ✓ FRAME CAPTURED SUCCESSFULLY
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleRetake}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-data text-xs text-slate-300 hover:text-white bg-black/40 hover:bg-white/10 border border-white/10 transition-all"
                        >
                          <RotateCw className="w-4 h-4" />
                          <span>RETAKE PHOTO</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-hud text-xs font-bold tracking-wider text-black bg-[#00f0ff] hover:bg-[#00ff9d] border border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all active:scale-95"
                        >
                          <span>CONTINUE TO CLASSIFICATION</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Fallback upload strip */}
                  {!capturedImage && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/5 font-data text-xs text-slate-400">
                      <span>Prefer choosing an existing file from your hard drive?</span>
                      <label className="cursor-pointer text-[#00f0ff] hover:underline flex items-center gap-1 font-semibold">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Browse File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* ------------------------------------------------------------ */}
              {/* STEP 2: CLASSIFICATION ("What is this image?")                */}
              {/* ------------------------------------------------------------ */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-hud text-base font-bold text-[#00f0ff] tracking-wider uppercase mb-1">
                      What is this image?
                    </h3>
                    <p className="font-data text-xs text-slate-400">
                      Classify this visual capture so the intelligence system can route and structure it:
                    </p>
                  </div>

                  {/* 4 Interactive Category Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* 1. Project Toolkit */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedType('project')
                        setStep(3)
                      }}
                      className={`text-left p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden ${
                        selectedType === 'project'
                          ? 'bg-[rgba(0,240,255,0.12)] border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.2)]'
                          : 'bg-black/30 hover:bg-black/50 border-white/10 hover:border-[#00f0ff]/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                          <FolderKanban className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-hud text-xs font-bold text-white group-hover:text-[#00f0ff] transition-colors block">
                            PROJECT TOOLKIT
                          </span>
                          <span className="font-mono text-[9px] text-[#00f0ff]/70 uppercase">
                            CODE // ARCHITECTURE
                          </span>
                        </div>
                      </div>
                      <p className="font-body text-xs text-slate-400 leading-relaxed">
                        System topology, architecture diagram, code algorithms, schematics, or dev assets.
                      </p>
                    </button>

                    {/* 2. Mission Resource */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedType('mission')
                        setStep(3)
                      }}
                      className={`text-left p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden ${
                        selectedType === 'mission'
                          ? 'bg-[rgba(245,158,11,0.12)] border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                          : 'bg-black/30 hover:bg-black/50 border-white/10 hover:border-amber-400/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                          <Target className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-hud text-xs font-bold text-white group-hover:text-amber-400 transition-colors block">
                            MISSION RESOURCE
                          </span>
                          <span className="font-mono text-[9px] text-amber-400/70 uppercase">
                            OBJECTIVES // PROOFS
                          </span>
                        </div>
                      </div>
                      <p className="font-body text-xs text-slate-400 leading-relaxed">
                        Milestone verification, field problem proof, mission briefing, or task documentation.
                      </p>
                    </button>

                    {/* 3. Study Note / Codex */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedType('note')
                        setStep(3)
                      }}
                      className={`text-left p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden ${
                        selectedType === 'note'
                          ? 'bg-[rgba(0,255,157,0.12)] border-[#00ff9d] shadow-[0_0_20px_rgba(0,255,157,0.2)]'
                          : 'bg-black/30 hover:bg-black/50 border-white/10 hover:border-[#00ff9d]/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-[#00ff9d]">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-hud text-xs font-bold text-white group-hover:text-[#00ff9d] transition-colors block">
                            STUDY NOTE
                          </span>
                          <span className="font-mono text-[9px] text-[#00ff9d]/70 uppercase">
                            ACADEMIC // FORMULAS
                          </span>
                        </div>
                      </div>
                      <p className="font-body text-xs text-slate-400 leading-relaxed">
                        Textbook page, handwritten formulas, lecture whiteboard notes, or chapter cheat sheet.
                      </p>
                    </button>

                    {/* 4. Flash Card Drill */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedType('flashcard')
                        setStep(3)
                      }}
                      className={`text-left p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden ${
                        selectedType === 'flashcard'
                          ? 'bg-[rgba(168,85,247,0.12)] border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                          : 'bg-black/30 hover:bg-black/50 border-white/10 hover:border-purple-400/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-hud text-xs font-bold text-white group-hover:text-purple-400 transition-colors block">
                            FLASH CARD
                          </span>
                          <span className="font-mono text-[9px] text-purple-400/70 uppercase">
                            ACTIVE RECALL // DRILL
                          </span>
                        </div>
                      </div>
                      <p className="font-body text-xs text-slate-400 leading-relaxed">
                        Visual diagram recognition, formula test prompt, or question/answer memory card.
                      </p>
                    </button>
                  </div>

                  {/* Navigation Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl font-data text-xs text-slate-300 hover:text-white bg-black/40 hover:bg-white/10 border border-white/10 transition-all"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>BACK TO CAMERA</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl font-hud text-xs font-bold text-black bg-[#00f0ff] hover:bg-[#00ff9d] transition-all"
                    >
                      <span>PROCEED TO STEP 3</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------ */}
              {/* STEP 3: CONTEXT-SPECIFIC FIELDS + SKIP OPTION                */}
              {/* ------------------------------------------------------------ */}
              {step === 3 && (
                <div className="space-y-5">
                  {/* Top Bar with Thumbnail & Selected Type */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
                    <div className="flex items-center gap-3">
                      {capturedImage && (
                        <div
                          onClick={() => setPreviewImage(capturedImage)}
                          className="relative cursor-pointer w-14 h-14 rounded-lg overflow-hidden border border-[#00f0ff]/40 bg-black group shrink-0"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={capturedImage}
                            alt="Thumbnail"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-hud text-xs font-bold text-white">
                            {editingAsset ? 'MODIFY ASSET' : 'STEP 3: STRUCTURE INTEL'}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/30">
                            {selectedType.toUpperCase()}
                          </span>
                        </div>
                        <p className="font-data text-[10px] text-slate-400 mt-0.5">
                          Fill fields below to save structured, or click{' '}
                          <strong className="text-amber-300">SKIP & QUICK SAVE</strong> to save as
                          a draft now and structure later!
                        </p>
                      </div>
                    </div>

                    {!editingAsset && (
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="text-xs font-data text-slate-400 hover:text-[#00f0ff] underline"
                      >
                        Change Type
                      </button>
                    )}
                  </div>

                  {/* Form Container */}
                  <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-4">
                    {/* Common Field: Asset Title */}
                    <div>
                      <label className="block font-data text-xs text-slate-300 font-semibold mb-1">
                        ASSET / INTEL TITLE
                      </label>
                      <input
                        type="text"
                        value={assetTitle}
                        onChange={(e) => setAssetTitle(e.target.value)}
                        placeholder={`e.g. ${
                          selectedType === 'project'
                            ? 'Next.js App Topology Diagram'
                            : selectedType === 'mission'
                            ? 'Mechanics Assignment 4 Verification'
                            : selectedType === 'note'
                            ? 'Kepler Planetary Laws Note'
                            : 'Lorentz Factor Formulation'
                        }`}
                        className="hud-input w-full rounded-lg py-2 px-3 text-xs font-data"
                      />
                    </div>

                    {/* DYNAMIC FIELDS: PROJECT TOOLKIT */}
                    {selectedType === 'project' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                        <div>
                          <label className="block font-data text-xs text-slate-400 mb-1">
                            TARGET PROJECT
                          </label>
                          <select
                            value={details.projectName || projects[0]?.title}
                            onChange={(e) =>
                              setDetails((prev) => ({ ...prev, projectName: e.target.value }))
                            }
                            className="hud-input w-full rounded-lg py-2 px-3 text-xs font-data bg-[#0a101f]"
                          >
                            {projects.map((p) => (
                              <option key={p.id} value={p.title}>
                                {p.title}
                              </option>
                            ))}
                            <option value="New Core Initiative">New Core Initiative</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-data text-xs text-slate-400 mb-1">
                            TOOLKIT SUBCATEGORY
                          </label>
                          <select
                            value={details.toolkitCategory || 'Architecture'}
                            onChange={(e) =>
                              setDetails((prev) => ({
                                ...prev,
                                toolkitCategory: e.target.value,
                              }))
                            }
                            className="hud-input w-full rounded-lg py-2 px-3 text-xs font-data bg-[#0a101f]"
                          >
                            <option value="Architecture">System Architecture / Flow</option>
                            <option value="Code Snippet">Code / Algorithm Snippet</option>
                            <option value="Schematic">Technical Schematic / Hardware</option>
                            <option value="Wireframe">UI / UX Wireframe</option>
                            <option value="Other">General Technical Asset</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-data text-xs text-slate-400 mb-1">
                            TAGS / STACK (Comma Separated)
                          </label>
                          <input
                            type="text"
                            value={details.projectTags || ''}
                            onChange={(e) =>
                              setDetails((prev) => ({ ...prev, projectTags: e.target.value }))
                            }
                            placeholder="e.g. TypeScript, React 19, Postgres, Docker"
                            className="hud-input w-full rounded-lg py-2 px-3 text-xs font-data"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-data text-xs text-slate-400 mb-1">
                            TECHNICAL NOTES / SPECIFICATION
                          </label>
                          <textarea
                            rows={3}
                            value={details.projectNotes || ''}
                            onChange={(e) =>
                              setDetails((prev) => ({ ...prev, projectNotes: e.target.value }))
                            }
                            placeholder="Add implementation notes, caveats, or key takeaways..."
                            className="hud-input w-full rounded-lg py-2 px-3 text-xs font-data"
                          />
                        </div>
                      </div>
                    )}

                    {/* DYNAMIC FIELDS: MISSION RESOURCE */}
                    {selectedType === 'mission' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                        <div>
                          <label className="block font-data text-xs text-slate-400 mb-1">
                            ASSOCIATED MISSION
                          </label>
                          <select
                            value={details.missionName || missions[0]?.title}
                            onChange={(e) =>
                              setDetails((prev) => ({ ...prev, missionName: e.target.value }))
                            }
                            className="hud-input w-full rounded-lg py-2 px-3 text-xs font-data bg-[#0a101f]"
                          >
                            {missions.map((m) => (
                              <option key={m.id} value={m.title}>
                                {m.title}
                              </option>
                            ))}
                            <option value="Custom Tactical Objective">Custom Tactical Objective</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-data text-xs text-slate-400 mb-1">
                            RESOURCE NATURE
                          </label>
                          <select
                            value={details.resourceType || 'Proof of Completion'}
                            onChange={(e) =>
                              setDetails((prev) => ({
                                ...prev,
                                resourceType: e.target.value,
                              }))
                            }
                            className="hud-input w-full rounded-lg py-2 px-3 text-xs font-data bg-[#0a101f]"
                          >
                            <option value="Proof of Completion">Proof of Completion / Result</option>
                            <option value="Intel Briefing">Intel Briefing / Guide</option>
                            <option value="Worksheet">Worksheet / Problem Set</option>
                            <option value="Field Photo">Field Photo / Lab Setup</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-data text-xs text-slate-400 mb-1">
                            MISSION OBSERVATION NOTES
                          </label>
                          <textarea
                            rows={3}
                            value={details.missionNotes || ''}
                            onChange={(e) =>
                              setDetails((prev) => ({ ...prev, missionNotes: e.target.value }))
                            }
                            placeholder="Describe how this resource contributes to completing the mission..."
                            className="hud-input w-full rounded-lg py-2 px-3 text-xs font-data"
                          />
                        </div>
                      </div>
                    )}

                    {/* DYNAMIC FIELDS: NOTE / CODEX */}
                    {selectedType === 'note' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                        <div>
                          <label className="block font-data text-xs text-slate-400 mb-1">
                            SUBJECT / CATEGORY
                          </label>
                          <select
                            value={details.subject || 'Physics'}
                            onChange={(e) =>
                              setDetails((prev) => ({ ...prev, subject: e.target.value }))
                            }
                            className="hud-input w-full rounded-lg py-2 px-3 text-xs font-data bg-[#0a101f]"
                          >
                            <option value="Physics">Physics</option>
                            <option value="Mathematics">Mathematics</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Competitive Exam">Competitive Exam</option>
                            <option value="General Science">General Science</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-data text-xs text-slate-400 mb-1">
                            KEY FORMULA / CORE PRINCIPLE
                          </label>
                          <input
                            type="text"
                            value={details.keyTakeaway || ''}
                            onChange={(e) =>
                              setDetails((prev) => ({ ...prev, keyTakeaway: e.target.value }))
                            }
                            placeholder="e.g. τ = I · α or E = mc²"
                            className="hud-input w-full rounded-lg py-2 px-3 text-xs font-data"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-data text-xs text-slate-400 mb-1">
                            SUMMARY / TRANSCRIPTION NOTES
                          </label>
                          <textarea
                            rows={3}
                            value={details.noteContent || ''}
                            onChange={(e) =>
                              setDetails((prev) => ({ ...prev, noteContent: e.target.value }))
                            }
                            placeholder="Add notes, key definitions, or steps transcribed from this image..."
                            className="hud-input w-full rounded-lg py-2 px-3 text-xs font-data"
                          />
                        </div>
                      </div>
                    )}

                    {/* DYNAMIC FIELDS: FLASH CARD */}
                    {selectedType === 'flashcard' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                        <div>
                          <label className="block font-data text-xs text-slate-400 mb-1">
                            SUBJECT / TOPIC
                          </label>
                          <select
                            value={details.flashCardSubject || 'Physics'}
                            onChange={(e) =>
                              setDetails((prev) => ({
                                ...prev,
                                flashCardSubject: e.target.value,
                              }))
                            }
                            className="hud-input w-full rounded-lg py-2 px-3 text-xs font-data bg-[#0a101f]"
                          >
                            <option value="Physics">Physics</option>
                            <option value="Mathematics">Mathematics</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Algorithms">Algorithms & Data Structures</option>
                            <option value="General">General</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-data text-xs text-slate-400 mb-1">
                            DRILL DIFFICULTY
                          </label>
                          <select
                            value={details.difficulty || 'medium'}
                            onChange={(e) =>
                              setDetails((prev) => ({
                                ...prev,
                                difficulty: e.target.value as any,
                              }))
                            }
                            className="hud-input w-full rounded-lg py-2 px-3 text-xs font-data bg-[#0a101f]"
                          >
                            <option value="easy">Recruit (Easy)</option>
                            <option value="medium">Operative (Medium)</option>
                            <option value="hard">Veteran (Hard)</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-data text-xs text-slate-400 mb-1">
                            FRONT PROMPT (Question or Diagram Query)
                          </label>
                          <input
                            type="text"
                            value={details.frontPrompt || ''}
                            onChange={(e) =>
                              setDetails((prev) => ({ ...prev, frontPrompt: e.target.value }))
                            }
                            placeholder="e.g. State the formula represented by this schematic..."
                            className="hud-input w-full rounded-lg py-2 px-3 text-xs font-data"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-data text-xs text-slate-400 mb-1">
                            BACK SOLUTION (Answer or Explanation)
                          </label>
                          <textarea
                            rows={3}
                            value={details.backSolution || ''}
                            onChange={(e) =>
                              setDetails((prev) => ({ ...prev, backSolution: e.target.value }))
                            }
                            placeholder="Enter the correct answer or explanation that will be revealed during the drill..."
                            className="hud-input w-full rounded-lg py-2 px-3 text-xs font-data"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ========================================================== */}
                  {/* STEP 4: PRIMARY ACTION BUTTONS (STRUCTURED VS SKIP)       */}
                  {/* ========================================================== */}
                  <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (editingAsset) {
                          setEditingAsset(null)
                          setActiveTab('vault')
                        } else {
                          setStep(2)
                        }
                      }}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-data text-xs text-slate-400 hover:text-white bg-black/40 hover:bg-white/10 border border-white/10 transition-all"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>{editingAsset ? 'CANCEL EDIT' : 'BACK TO CLASSIFICATION'}</span>
                    </button>

                    <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2.5">
                      {/* SKIP & QUICK SAVE BUTTON (Available when creating new intake) */}
                      {!editingAsset && (
                        <button
                          type="button"
                          onClick={handleSkipAndSaveDraft}
                          title="Skip fields and quick-save to draft inbox to structure later"
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-data text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/60 transition-all active:scale-95"
                        >
                          <FastForward className="w-4 h-4 text-amber-400" />
                          <span>SKIP & QUICK SAVE (DRAFT)</span>
                        </button>
                      )}

                      {/* SAVE STRUCTURED DATA BUTTON */}
                      <button
                        type="button"
                        onClick={editingAsset ? handleSaveVaultEdit : handleSaveStructured}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-hud text-xs font-bold tracking-wider text-black bg-[#00f0ff] hover:bg-[#00ff9d] border border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all active:scale-95"
                      >
                        <Save className="w-4 h-4" />
                        <span>{editingAsset ? 'SAVE CHANGES' : 'SAVE STRUCTURED DATA'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ============================================================== */
            /* TAB 2: CAPTURED INTEL VAULT & DRAFT INBOX                       */
            /* ============================================================== */
            <div className="space-y-4">
              {/* Filter controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-black/40 border border-white/10">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-data text-[11px] text-slate-400 mr-1">STATUS:</span>
                  <button
                    type="button"
                    onClick={() => setVaultFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-data text-xs ${
                      vaultFilter === 'all'
                        ? 'bg-[rgba(0,240,255,0.2)] text-[#00f0ff] border border-[rgba(0,240,255,0.4)] font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ALL ({assets.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setVaultFilter('draft')}
                    className={`px-2.5 py-1 rounded-lg font-data text-xs flex items-center gap-1 ${
                      vaultFilter === 'draft'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    DRAFTS ({draftCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setVaultFilter('structured')}
                    className={`px-2.5 py-1 rounded-lg font-data text-xs ${
                      vaultFilter === 'structured'
                        ? 'bg-emerald-500/20 text-[#00ff9d] border border-emerald-500/40 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    STRUCTURED ({assets.length - draftCount})
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="font-data text-[11px] text-slate-400 mr-1">TYPE:</span>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="hud-input rounded-lg py-1 px-2.5 text-xs font-data bg-[#0a101f]"
                  >
                    <option value="all">All Types</option>
                    <option value="project">Project Toolkit</option>
                    <option value="mission">Mission Resource</option>
                    <option value="note">Study Note</option>
                    <option value="flashcard">Flash Card</option>
                  </select>
                </div>
              </div>

              {/* Assets Grid */}
              {filteredAssets.length === 0 ? (
                <div className="p-12 text-center rounded-xl bg-black/20 border border-white/5">
                  <Camera className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="font-hud text-xs text-slate-400 uppercase tracking-wider">
                    NO ARTIFACTS IN THIS VIEW
                  </p>
                  <p className="font-data text-[11px] text-slate-500 mt-1">
                    Switch to Camera Scanner tab to snap and intake physical documents.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      resetIntake()
                      setActiveTab('capture')
                    }}
                    className="mt-4 px-4 py-2 rounded-xl font-data text-xs text-[#00f0ff] bg-[rgba(0,240,255,0.15)] border border-[rgba(0,240,255,0.3)] hover:bg-[rgba(0,240,255,0.25)]"
                  >
                    + Open Camera Scanner
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {filteredAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className="group flex flex-col justify-between p-3 rounded-xl bg-black/40 border border-white/10 hover:border-[#00f0ff]/40 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                    >
                      {/* Top bar */}
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase ${
                            asset.type === 'project'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : asset.type === 'mission'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : asset.type === 'note'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}
                        >
                          {asset.type}
                        </span>

                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono flex items-center gap-1 ${
                            asset.status === 'draft'
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : 'bg-[#00ff9d]/15 text-[#00ff9d] border border-[#00ff9d]/30'
                          }`}
                        >
                          {asset.status === 'draft' ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                              DRAFT
                            </>
                          ) : (
                            <>✓ STRUCTURED</>
                          )}
                        </span>
                      </div>

                      {/* Thumbnail Container */}
                      <div
                        onClick={() => setPreviewImage(asset.imageData)}
                        className="relative cursor-pointer w-full h-36 rounded-lg overflow-hidden border border-white/10 bg-black/60 mb-2.5 flex items-center justify-center group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={asset.imageData}
                          alt={asset.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                          <Eye className="w-4 h-4 text-white" />
                          <span className="font-data text-xs text-white">Full View</span>
                        </div>
                      </div>

                      {/* Information Snippet */}
                      <div className="flex-1 mb-3">
                        <p className="font-hud text-xs font-bold text-slate-200 line-clamp-1 group-hover:text-[#00f0ff] transition-colors">
                          {asset.title}
                        </p>
                        <div className="mt-1 flex items-center gap-2 font-mono text-[9px] text-slate-500">
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

                        {/* Extra Context */}
                        <div className="mt-1.5 font-data text-[10px] text-slate-400 line-clamp-2">
                          {asset.type === 'project' && (
                            <span>Project: {asset.details.projectName || 'General'}</span>
                          )}
                          {asset.type === 'mission' && (
                            <span>Mission: {asset.details.missionName || 'General'}</span>
                          )}
                          {asset.type === 'note' && (
                            <span>
                              {asset.details.subject} • {asset.details.keyTakeaway || 'Note'}
                            </span>
                          )}
                          {asset.type === 'flashcard' && (
                            <span>Q: {asset.details.frontPrompt || 'Flash card prompt'}</span>
                          )}
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => startEditingAsset(asset)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-data text-xs font-semibold text-[#00f0ff] hover:text-white bg-[rgba(0,240,255,0.1)] hover:bg-[rgba(0,240,255,0.25)] border border-[rgba(0,240,255,0.3)] transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{asset.status === 'draft' ? 'STRUCTURE NOW' : 'EDIT'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteAsset(asset.id)}
                          title="Delete artifact"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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
    </div>
  )
}
