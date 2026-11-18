'use client'

import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { HUDToastContainer } from '@/components/Toast/HUDToastContainer'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <HeaderThemeProvider>
        {children}
        <HUDToastContainer />
      </HeaderThemeProvider>
    </ThemeProvider>
  )
}
