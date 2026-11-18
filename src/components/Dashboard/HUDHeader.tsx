"use client"

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { User, Sun, Moon, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Shield, Wifi, Activity, Eye } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useThemeStore } from '@/stores/useThemeStore';

interface HUDHeaderProps {
  userName?: string | null;
  focusLevel?: number;
}

export const HUDHeader: React.FC<HUDHeaderProps> = ({
  userName: propUserName,
  focusLevel = 72,
}) => {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const activeUserName = mounted
    ? user?.name || user?.email?.split('@')[0] || propUserName
    : propUserName;

  useEffect(() => {
    setMounted(true);
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
      setDate(
        now
          .toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
          .toUpperCase()
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const threatColor =
    focusLevel >= 70
      ? 'text-emerald-400'
      : focusLevel >= 40
        ? 'text-amber-400'
        : 'text-red-400';

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);
  const closeDropdown = () => setDropdownOpen(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    closeDropdown();
    await logout();
    router.replace('/login');
  };

  return (
    <div className="w-full px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 border-b border-[#00f0ff]/10">
      {/* Left: Operator Badge */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-[#00f0ff]/60 shrink-0" />
          <span
            className="font-hud text-[9px] sm:text-[10px] tracking-[2px] text-[#00f0ff]/70 uppercase truncate"
            suppressHydrationWarning
          >
            {activeUserName ? `OPR: ${activeUserName}` : 'SYSTEM ACTIVE'}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 hud-pulse shrink-0" />
          <span className="font-data text-[10px] text-emerald-400/80">ONLINE</span>
        </div>
      </div>

      {/* Center: Clock */}
      <div className="flex flex-col items-center shrink-0">
        <span
          className="font-data text-sm sm:text-base text-[#00f0ff] tracking-[3px] text-glow-cyan"
          suppressHydrationWarning
        >
          {time}
        </span>
        <span
          className="font-hud text-[7px] sm:text-[8px] tracking-[2px] text-slate-500 -mt-0.5"
          suppressHydrationWarning
        >
          {date}
        </span>
      </div>

      {/* Right: Status Indicators + User dropdown + Theme toggle */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Theme Toggle Button */}
        {/* <button
          type="button"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="p-1.5 rounded-lg border border-[#00f0ff]/20 bg-black/20 text-[#00f0ff]/70 hover:text-[#00f0ff] hover:border-[#00f0ff]/40 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button> */}

        <div className="hidden sm:flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-slate-500" />
          <span className={`font-data text-[10px] ${threatColor}`}>{focusLevel}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Wifi className="w-3 h-3 text-[#00f0ff]/40" />
          <Eye className="w-3 h-3 text-[#00f0ff]/40" />
          {/* User dropdown */}
          {/* <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="p-1.5 rounded-lg border border-[#00f0ff]/20 bg-black/20 text-[#00f0ff] hover:border-[#00f0ff]/50 transition-colors flex items-center justify-center"
            >
              <User className="w-3.5 h-3.5" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-[#00f0ff]/30 bg-[var(--bg-secondary,#0d1117)]/95 backdrop-blur-md shadow-xl py-1 z-50 text-xs font-data">
                {activeUserName || isAuthenticated ? (
                  <>
                    <div className="px-3 py-2 border-b border-[#00f0ff]/10">
                      <p className="font-hud text-[10px] text-[#00f0ff] uppercase">Authenticated Operator</p>
                      <p className="text-slate-400 truncate text-[11px] mt-0.5">{activeUserName}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors uppercase font-hud text-[10px]"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={closeDropdown}
                      className="block px-3 py-2 text-[#00f0ff] hover:bg-[#00f0ff]/10 transition-colors uppercase font-hud text-[10px]"
                    >
                      Operator Sign In
                    </Link>
                  </>
                )}
              </div>
            )}
          </div> */}
        </div>
      </div>
    </div>
  );
};
