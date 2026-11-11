import type { Metadata } from 'next'
import React from 'react'
import LoginPage from '../login/page'

export const metadata: Metadata = {
  title: 'Operator Registration // ToggleDawn',
  description: 'Register a new standard operator account to access the ToggleDawn mission dashboard.',
}

export default function SignupPage() {
  return <LoginPage initialMode="signup" />
}
