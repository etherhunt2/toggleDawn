'use client'

import type { PayloadAdminBarProps, PayloadMeUser } from '@payloadcms/admin-bar'

import { cn } from '@/utilities/ui'
import { useSelectedLayoutSegments } from 'next/navigation'
import { PayloadAdminBar } from '@payloadcms/admin-bar'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/useAuthStore'

import './index.scss'

import { getClientSideURL } from '@/utilities/getURL'

const baseClass = 'admin-bar'

const collectionLabels = {
  books: {
    plural: 'Books',
    singular: 'Book',
  },
  chapters: {
    plural: 'Chapters',
    singular: 'Chapter',
  },
  notes: {
    plural: 'Notes',
    singular: 'Note',
  },
  projects: {
    plural: 'Projects',
    singular: 'Project',
  },
}

const Title: React.FC = () => <span>Dashboard</span>

export const AdminBar: React.FC<{
  adminBarProps?: PayloadAdminBarProps
}> = (props) => {
  const { adminBarProps } = props || {}
  const segments = useSelectedLayoutSegments()
  const [show, setShow] = useState(false)

  // Completely hide AdminBar on Login and Signup pages
  const isAuthPage = segments?.[0] === 'login' || segments?.[0] === 'signup'
  if (isAuthPage) {
    return null
  }
  const collection = (
    collectionLabels[segments?.[1] as keyof typeof collectionLabels] ? segments[1] : 'books'
  ) as keyof typeof collectionLabels
  const router = useRouter()

  const onAuthChange = React.useCallback((user: PayloadMeUser) => {
    // Only display Payload Admin Bar to administrators with /admin clearance
    const u = user as (PayloadMeUser & { role?: string }) | undefined
    setShow(Boolean(u?.id && (u.role === 'admin' || u.email?.startsWith('admin@'))))
  }, [])

  const handleLogout = React.useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    try {
      await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // Ignore network errors
    }
    useAuthStore.getState().logout()
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('toggle-dawn-auth')
      window.location.href = '/login'
    }
  }, [])

  return (
    <div
      className={cn(baseClass, 'py-2 bg-black text-white', {
        block: show,
        hidden: !show,
      })}
    >
      <div className="container">
        <PayloadAdminBar
          {...adminBarProps}
          className="py-2 text-white"
          classNames={{
            controls: 'font-medium text-white',
            logo: 'text-white',
            user: 'text-white',
          }}
          cmsURL={getClientSideURL()}
          collectionSlug={collection}
          collectionLabels={{
            plural: collectionLabels[collection]?.plural || 'Pages',
            singular: collectionLabels[collection]?.singular || 'Page',
          }}
          logo={<Title />}
          logoutProps={{
            ...(adminBarProps?.logoutProps || {}),
            target: '_self',
            href: '/login',
            onClick: handleLogout,
          }}
          onAuthChange={onAuthChange}
          onPreviewExit={() => {
            fetch('/next/exit-preview').then(() => {
              router.push('/')
              router.refresh()
            })
          }}
          style={{
            backgroundColor: 'transparent',
            padding: 0,
            position: 'relative',
            zIndex: 'unset',
          }}
        />
      </div>
    </div>
  )
}
