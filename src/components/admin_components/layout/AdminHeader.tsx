'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  Search,
  ExternalLink,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
  onSelectTab: (tabId: string) => void;
  onLogout?: () => void;
  unreadNotificationsCount?: number;
  adminName?: string;
}

export default function AdminHeader({
  onToggleSidebar,
  onOpenSearch,
  onSelectTab,
  onLogout,
  unreadNotificationsCount = 0,
  adminName = 'সুপার অ্যাডমিন'
}: AdminHeaderProps) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6 py-2.5 bg-white border-b border-slate-200 shadow-2xs font-solaiman">
      {/* Left Area: Toggle & Search */}
      <div className="flex items-center gap-3 lg:gap-4 flex-1 max-w-2xl">
        {/* Sidebar Toggle Button */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
          title="মেনু টগল করুন"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar (opens search modal) */}
        <div
          onClick={onOpenSearch}
          className="flex-1 flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100/70 cursor-pointer transition-all text-slate-500 group shadow-2xs"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors flex-shrink-0" />
            <span className="text-xs lg:text-sm truncate text-slate-500">
              সার্কুলার, প্রতিষ্ঠান বা প্রার্থী খুঁজুন...
            </span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-medium text-slate-400 bg-white border border-slate-200 rounded-md shadow-2xs">
            Ctrl + K
          </kbd>
        </div>
      </div>

      {/* Right Area: Live Site, Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-3 ml-3">
        {/* Live Site Link */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all"
        >
          <span>লাইভ ওয়েবসাইট</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </Link>

        {/* Notification Bell */}
        <button
          type="button"
          onClick={() => onSelectTab('notifications')}
          className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="নোটিফিকেশন"
        >
          <Bell className="w-4.5 h-4.5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Profile Avatar & Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-indigo-500/20 transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center text-white text-xs font-bold shadow-xs">
              সি এস
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {profileDropdownOpen && (
            <>
              <div
                onClick={() => setProfileDropdownOpen(false)}
                className="fixed inset-0 z-30"
              />
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-40 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-900">{adminName}</p>
                  <p className="text-xs text-slate-500">admin@chakrisheba.com</p>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('settings');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>প্ল্যাটফর্ম সেটিংস</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('staff-roles');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>প্রোফাইল ও রোলস</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      if (onLogout) onLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>লগআউট করুন</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

