import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'

export async function Footer() {
  const footerData = await getCachedGlobal('footer', 1)()

  const navItems = footerData?.navItems || []

  return (
    <footer className="mt-auto">
      {/* ===== MOBILE FOOTER (unchanged) ===== */}
      <div className="md:hidden border-t border-border bg-black dark:bg-card text-white">
        <div className="container py-8 gap-8 flex flex-col">
          <Link className="flex items-center" href="/">
            <img
              alt="ToggleDawn"
              width={193}
              height={34}
              loading="lazy"
              decoding="async"
              className="max-w-[9.375rem] w-full h-[34px]"
              src="https://raw.githubusercontent.com/payloadcms/payload/3.x/packages/ui/src/assets/payload-logo-light.svg"
            />
          </Link>
          <div className="flex flex-col-reverse items-start gap-4">
            <ThemeSelector />
            <nav className="flex flex-col gap-4">
              {navItems.map(({ link }, i) => {
                return <CMSLink className="text-white" key={i} {...link} />
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* ===== DESKTOP APP-STYLE STATUS BAR ===== */}
      <div className="hidden md:block">
        <div className="mx-auto max-w-[86rem] px-4">
          <div className="flex items-center h-8 rounded-t-xl bg-[#0c1017]/80 backdrop-blur-2xl border border-b-0 border-[#1d2638]/60 px-4 text-[11px] -mx-2">
            {/* Left: status indicator */}
            <div className="flex items-center gap-2 text-slate-500 mr-auto">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
                <span className="text-slate-400">ToggleDawn</span>
              </span>
              <span className="text-[#1d2638]">|</span>
              <span>v1.0.0</span>
            </div>

            {/* Center: nav links */}
            <nav className="flex items-center gap-3">
              {navItems.map(({ link }, i) => (
                <CMSLink
                  key={i}
                  {...link}
                  appearance="link"
                  className="!text-slate-500 hover:!text-slate-300 text-[11px] no-underline transition-colors"
                />
              ))}
            </nav>

            {/* Right: powered by + keyboard shortcut hints */}
            <div className="flex items-center gap-3 ml-auto text-slate-600">
              <span className="text-[#1d2638]">|</span>
              <span className="flex items-center gap-1">
                Powered by
                <Link
                  href="https://payloadcms.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-slate-200 transition-colors font-medium"
                >
                  Payload
                </Link>
              </span>
              <span className="text-[#1d2638]">|</span>
              <span className="text-slate-600">
                Next.js {new Date().getFullYear()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
