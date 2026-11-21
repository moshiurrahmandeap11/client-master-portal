'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Briefcase, 
  Wallet, 
  UserCheck, 
  ShieldCheck, 
  Menu, 
  X,
  MessageSquare,
  LogIn,
  LogOut,
  ChevronDown,
  FileText,
  Bell
} from 'lucide-react';
import { storage, AuthState } from '@/lib/store';
import { useAuthSession } from '@/hooks/useAuthSession';

interface DropdownItem {
  label: string;
  href: string;
  badge?: string;
}

interface NavMenuItem {
  id: string;
  label: string;
  href: string;
  badge?: string;
  badgeColor?: string;
  target?: string;
  visibility?: string;
  dropdown?: DropdownItem[];
}

// Navigation Menu Configuration in exact required order
const DEFAULT_NAV_ITEMS: NavMenuItem[] = [
  {
    id: 'home',
    label: 'হোম',
    href: '/'
  },
  {
    id: 'all-jobs',
    label: 'সকল চাকরি',
    href: '/jobs',
    dropdown: [
      { label: 'চলমান সকল বিজ্ঞপ্তি', href: '/jobs' },
      { label: 'সর্বশেষ প্রকাশিত চাকরি', href: '/latest-jobs' },
      { label: 'আবেদনের শেষ সময় কাছাকাছি', href: '/deadline-approaching' },
      { label: 'সকল চাকরির প্রতিষ্ঠান', href: '/organizations' },
      { label: 'যোগ্যতা অনুযায়ী চাকরি', href: '/job-categories' }
    ]
  },
  {
    id: 'govt',
    label: 'সরকারি চাকরি',
    href: '/government-jobs',
    dropdown: [
      { label: 'সকল সরকারি চাকরি', href: '/government-jobs' },
      { label: 'বিপিএসসি (BPSC) চাকরি', href: '/organizations/bpsc' },
      { label: 'বাংলাদেশ ব্যাংক নিয়োগ', href: '/organizations/bangladesh-bank' },
      { label: 'সরকারি মন্ত্রণালয়সমূহ', href: '/organizations/government-ministries' },
      { label: 'সরকারি অধিদপ্তরসমূহ', href: '/organizations/government-directorates' }
    ]
  },
  {
    id: 'private',
    label: 'বেসরকারি চাকরি',
    href: '/private-jobs',
    dropdown: [
      { label: 'সকল বেসরকারি চাকরি', href: '/private-jobs' },
      { label: 'ব্যাংক ও আর্থিক প্রতিষ্ঠান', href: '/bank-jobs' },
      { label: 'এনজিও (NGO) চাকরি', href: '/ngo-jobs' },
      { label: 'আইটি ও সফটওয়্যার জবস', href: '/it-jobs' },
      { label: 'মেডিকেল ও ফার্মাসিউটিক্যাল', href: '/medical-jobs' }
    ]
  },
  {
    id: 'categories',
    label: 'চাকরির ক্যাটাগরি',
    href: '/job-categories',
    dropdown: [
      { label: 'সকল ক্যাটাগরি ব্রাউজ করুন', href: '/job-categories' },
      { label: 'শিক্ষক নিয়োগ', href: '/teacher-jobs' },
      { label: 'ইঞ্জিনিয়ারিং চাকরি', href: '/engineering-jobs' },
      { label: 'হিসাব ও ফাইন্যান্স চাকরি', href: '/accounting-finance-jobs' },
      { label: 'মার্কেটিং ও সেলস', href: '/marketing-jobs' },
      { label: 'প্রবাসী ও আন্তর্জাতিক চাকরি', href: '/international-jobs' },
      { label: 'ফ্রেশারদের চাকরি', href: '/fresher-jobs' },
      { label: 'পার্ট-টাইম ও ইন্টার্নশিপ', href: '/part-time-jobs' }
    ]
  },
  {
    id: 'exam',
    label: 'পরীক্ষা ও ফলাফল',
    href: '/exam-notices',
    dropdown: [
      { label: 'পরীক্ষার নোটিশ ও তারিখ', href: '/exam-notices' },
      { label: 'প্রবেশপত্র / Admit Card', href: '/admit-cards' },
      { label: 'লিখিত পরীক্ষার ফলাফল', href: '/written-exam-results' },
      { label: 'মৌখিক পরীক্ষার নোটিশ (Viva)', href: '/viva-notices' },
      { label: 'সকল পরীক্ষার ফলাফল', href: '/exam-results' },
      { label: 'বিগত বছরের প্রশ্ন ও সমাধান', href: '/previous-year-questions' },
      { label: 'অনলাইন মডেল টেস্ট', href: '/model-tests' }
    ]
  },
  {
    id: 'career',
    label: 'ক্যারিয়ার গাইড',
    href: '/career-guides',
    dropdown: [
      { label: 'ক্যারিয়ার গাইড হাব', href: '/career-guides' },
      { label: 'সিভি লেখার সঠিক নিয়ম', href: '/career-guides/cv-writing' },
      { label: 'অনলাইনে চাকরির আবেদন গাইড', href: '/career-guides/online-job-application' },
      { label: 'ইন্টারভিউ ও ভাইভা প্রস্তুতি', href: '/career-guides/interview-preparation' },
      { label: 'চাকরির পরীক্ষার প্রস্তুতি', href: '/career-guides/job-exam-preparation' },
      { label: 'ক্যারিয়ার পরামর্শ ও ব্লগ', href: '/blog' }
    ]
  }
];

export default function Navbar({ initialSettings }: { initialSettings?: any } = {}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [expandedMobileAccordions, setExpandedMobileAccordions] = useState<Record<string, boolean>>({});
  const [isMounted, setIsMounted] = useState(false);
  const [auth, setAuth] = useState<AuthState>({ isLoggedIn: false, role: null, name: '' });
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [platformSettings, setPlatformSettings] = useState<any>(initialSettings || null);
  const navRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const rightAreaRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Dynamic visible count for nav menu items based on exact available space
  // Initial state matches SSR to guarantee 0 hydration mismatches; useEffect fine-tunes post-mount
  const [visibleCount, setVisibleCount] = useState<number>(DEFAULT_NAV_ITEMS.length);
  const { session } = useAuthSession();

  useEffect(() => {
    if (initialSettings) {
      setPlatformSettings(initialSettings);
    }
  }, [initialSettings]);

  // Sync session from TanStack Query
  useEffect(() => {
    if (session && session.isLoggedIn && session.user) {
      const authState = {
        isLoggedIn: true,
        role: session.role || 'candidate',
        name: session.user.name,
        phone: session.user.phone,
        userId: session.user.id
      };
      storage.setAuth(authState);
      setAuth(authState);
      if (session.role === 'candidate') {
        storage.updateUser(session.user);
        setUserProfile(session.user);
        setWalletBalance(session.user.walletBalance ?? 0);
      }
    }
  }, [session]);

  // Sync auth and user state
  useEffect(() => {
    setIsMounted(true);

    const syncUserData = () => {
      try {
        const a = storage.getAuth();
        setAuth(a);
        const u = storage.getUser();
        setUserProfile(u);
        setWalletBalance(u?.walletBalance || 0);
        setAvatarError(false);
        const localUnread = storage.getNotifications().filter((n: any) => !n.read).length;
        setUnreadNotificationsCount(localUnread);
        if (a.isLoggedIn && a.role === 'candidate') {
          fetch('/api/candidate/notifications', { credentials: 'include' })
            .then(r => (r.ok ? r.json() : null))
            .then(d => {
              if (d && Array.isArray(d.notifications)) {
                const count = typeof d.unreadCount === 'number'
                  ? d.unreadCount
                  : d.notifications.filter((n: any) => !(n.isRead ?? n.read)).length;
                setUnreadNotificationsCount(count);
              }
            })
            .catch(() => {});
        }
      } catch (e) {
        console.error('[Navbar] storage error:', e);
      }
    };

    syncUserData();

    const handleAuthChange = () => syncUserData();
    const handleUserChange = () => syncUserData();
    const handleDocsChange = () => syncUserData();
    const handleNotifsChange = () => syncUserData();

    // Platform settings are provided via SSR initialSettings + centralized usePlatformSettings hook

    window.addEventListener('cs_auth_changed', handleAuthChange);
    window.addEventListener('cs_user_changed', handleUserChange);
    window.addEventListener('cs_documents_changed', handleDocsChange);
    window.addEventListener('cs_docs_changed', handleDocsChange);
    window.addEventListener('cs_notifications_changed', handleNotifsChange);

    return () => {
      window.removeEventListener('cs_auth_changed', handleAuthChange);
      window.removeEventListener('cs_user_changed', handleUserChange);
      window.removeEventListener('cs_documents_changed', handleDocsChange);
      window.removeEventListener('cs_docs_changed', handleDocsChange);
      window.removeEventListener('cs_notifications_changed', handleNotifsChange);
    };
  }, [initialSettings]);

  // Close desktop dropdown on outside click or escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(target)) {
        setProfileDropdownOpen(false);
      }
      if (navRef.current && !navRef.current.contains(target)) {
        setActiveDropdown(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveDropdown(null);
        setProfileDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    storage.logout();
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    window.location.href = '/login';
  };

  const toggleMobileAccordion = (id: string) => {
    setExpandedMobileAccordions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const navItems: NavMenuItem[] = (platformSettings?.general?.headerMenuItems && Array.isArray(platformSettings.general.headerMenuItems))
    ? platformSettings.general.headerMenuItems
    : DEFAULT_NAV_ITEMS;

  // Dynamic visible count calculation based on calibrated typographical metrics and real DOM
  useEffect(() => {
    const calculateVisibleItems = () => {
      if (!navRef.current) return;
      const headerWidth = navRef.current.clientWidth;
      
      // Determine real or reliable fallback right area width based on actual DOM measurement and auth state
      const measuredRightWidth = rightAreaRef.current?.offsetWidth || 0;
      const rightWidth = measuredRightWidth > 60
        ? measuredRightWidth
        : (auth.isLoggedIn ? (auth.role === 'admin' ? 205 : 350) : 375);

      // Determine real or reliable logo width
      const measuredLogoWidth = logoRef.current?.offsetWidth || 0;
      const logoWidth = measuredLogoWidth > 60
        ? measuredLogoWidth
        : (headerWidth >= 1800 ? 350 : 205);

      // Container horizontal padding (64px on lg) + flex item gaps (12px)
      const containerDeduction = 76;
      
      const availableSpace = headerWidth - logoWidth - rightWidth - containerDeduction;

      if (availableSpace <= 0) {
        setVisibleCount(1);
        return;
      }

      // Exact pixel width mapping (including flex gap) based on rendered Bengali typography
      const itemWidthsMap: Record<string, number> = {
        'home': 45,
        'all-jobs': 122,
        'govt': 116,
        'private': 126,
        'categories': 128,
        'exam': 130,
        'career': 114,
        'urgent-jobs': 116
      };

      const getItemEstimatedWidth = (item: NavMenuItem) => {
        if (itemWidthsMap[item.id]) return itemWidthsMap[item.id];
        const textLen = (item.label || '').length;
        const hasDropdown = Boolean(item.dropdown && item.dropdown.length > 0);
        const hasBadge = Boolean(item.badge);
        return Math.max(45, Math.round(14 + (textLen * 7.0) + (hasDropdown ? 12 : 0) + (hasBadge ? 22 : 0)));
      };

      let accumulatedWidth = 0;
      let count = 0;
      const moreButtonWidth = 50;

      for (let i = 0; i < navItems.length; i++) {
        const item = navItems[i];
        const itemWidth = getItemEstimatedWidth(item);
        const isLast = (i === navItems.length - 1);
        const neededWidth = accumulatedWidth + itemWidth + (isLast ? 0 : moreButtonWidth);

        if (neededWidth <= availableSpace) {
          accumulatedWidth += itemWidth;
          count++;
        } else if (isLast && (accumulatedWidth + itemWidth <= availableSpace)) {
          count++;
        } else {
          break;
        }
      }

      setVisibleCount(Math.max(1, count));
    };

    calculateVisibleItems();
    const timer = setTimeout(calculateVisibleItems, 80);
    const timer2 = setTimeout(calculateVisibleItems, 250);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        calculateVisibleItems();
      });
      if (navRef.current) resizeObserver.observe(navRef.current);
      if (rightAreaRef.current) resizeObserver.observe(rightAreaRef.current);
    }

    window.addEventListener('resize', calculateVisibleItems);
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', calculateVisibleItems);
    };
  }, [navItems, auth.isLoggedIn, auth.role, isMounted, walletBalance, platformSettings]);

  const userPhoto = (isMounted && !avatarError)
    ? (userProfile?.photoUrl || userProfile?.avatarUrl || (typeof window !== 'undefined' ? storage.getUser()?.photoUrl : ''))
    : '';
  const initialLetter = auth.name ? auth.name.trim().charAt(0).toUpperCase() : 'U';

  return (
    <header className={`z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm w-full max-w-full ${platformSettings?.general?.stickyHeader !== false ? 'sticky top-0' : 'relative'}`} ref={navRef}>
      
      {/* 2. MAIN HEADER NAVIGATION BAR */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4 w-full">
          
          {/* Logo (Clean text branding) */}
          <Link ref={logoRef} href="/" className="flex items-center group flex-shrink-0">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {platformSettings?.general?.siteName ? (
                    platformSettings.general.siteName
                  ) : (
                    <>চাকরিসেবা</>
                  )}
                </span>
                <span className="bg-slate-100 text-slate-800 text-[10px] font-black px-1.5 py-0.5 rounded border border-slate-200">
                  BD
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 2xl:gap-1.5 font-normal text-slate-800 whitespace-nowrap min-w-0 flex-shrink">
            {navItems.slice(0, visibleCount).map((item) => {
              const hasDropdown = Boolean(item.dropdown && item.dropdown.length > 0);
              const isCurrentOpen = activeDropdown === item.id;
              const isActive = (item.href === '/' && pathname === '/') || (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <div 
                  key={item.id} 
                  className="relative flex-shrink-0"
                  onMouseEnter={() => hasDropdown && setActiveDropdown(item.id)}
                  onMouseLeave={() => hasDropdown && setActiveDropdown(null)}
                >
                  <Link
                    href={item.href}
                    onClick={() => setActiveDropdown(null)}
                    aria-expanded={hasDropdown ? isCurrentOpen : undefined}
                    aria-haspopup={hasDropdown ? 'true' : undefined}
                    className={`px-1.5 xl:px-2 2xl:px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-slate-400/20 text-[13px] xl:text-[14px] 2xl:text-[15px] whitespace-nowrap ${
                      isActive 
                        ? 'text-slate-950 bg-slate-100/90 font-medium' 
                        : 'text-slate-800 hover:text-slate-950 hover:bg-slate-100/60 font-normal'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                        item.badgeColor === 'rose' ? 'bg-rose-100 text-rose-700' :
                        item.badgeColor === 'amber' ? 'bg-amber-100 text-amber-800' :
                        item.badgeColor === 'blue' ? 'bg-blue-100 text-blue-700' :
                        item.badgeColor === 'purple' ? 'bg-purple-100 text-purple-700' :
                        'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {hasDropdown && (
                      <ChevronDown 
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                          isCurrentOpen ? 'rotate-180 text-slate-900' : ''
                        }`} 
                      />
                    )}
                  </Link>

                  {/* Dropdown Menu */}
                  {hasDropdown && isCurrentOpen && (
                    <div className="absolute top-full pt-2 z-50 left-0 min-w-[260px] w-max">
                      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
                        {item.dropdown!.map((subItem, idx) => (
                          <Link
                            key={idx}
                            href={subItem.href}
                            onClick={() => setActiveDropdown(null)}
                            className="block px-4 py-2 text-[14px] text-slate-700 hover:bg-slate-100 hover:text-slate-950 font-semibold transition-colors whitespace-nowrap"
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* "আরও" (More) Dropdown for items that overflow the current viewport */}
            {visibleCount < navItems.length && (
              <div 
                className="relative flex-shrink-0"
                onMouseEnter={() => setActiveDropdown('more-nav-items')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveDropdown(activeDropdown === 'more-nav-items' ? null : 'more-nav-items')}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveDropdown(activeDropdown === 'more-nav-items' ? null : 'more-nav-items'); } }}
                  aria-expanded={activeDropdown === 'more-nav-items'}
                  className={`cursor-pointer px-2 py-1.5 rounded-xl transition-all flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-slate-400/20 text-[13px] xl:text-[14px] whitespace-nowrap font-bold ${
                    activeDropdown === 'more-nav-items'
                      ? 'text-slate-950 bg-slate-100/90'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/60'
                  }`}
                >
                  <span>আরও</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${activeDropdown === 'more-nav-items' ? 'rotate-180 text-slate-900' : ''}`} />
                </div>

                {activeDropdown === 'more-nav-items' && (
                  <div className="absolute top-full pt-2 z-50 right-0 min-w-[280px] w-max max-h-[75vh] overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 py-2 divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
                      {navItems.slice(visibleCount).map((item) => (
                        <div key={`more-${item.id}`} className="py-1.5 px-2">
                          <Link
                            href={item.href}
                            onClick={() => setActiveDropdown(null)}
                            className="flex items-center justify-between px-3 py-1.5 rounded-lg text-[14px] font-bold text-slate-800 hover:bg-slate-100 hover:text-slate-950 transition-colors"
                          >
                            <span>{item.label}</span>
                            {item.badge && (
                              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                          {item.dropdown && item.dropdown.length > 0 && (
                            <div className="mt-1 pl-4 space-y-0.5 border-l-2 border-slate-200 ml-3">
                              {item.dropdown.map((sub, sIdx) => (
                                <Link
                                  key={sIdx}
                                  href={sub.href}
                                  onClick={() => setActiveDropdown(null)}
                                  className="block py-1 text-xs text-slate-600 hover:text-slate-950 transition-colors"
                                >
                                  {sub.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Right Action Area: Customizable Guest Buttons & User Widgets */}
          <div ref={rightAreaRef} className="hidden sm:flex items-center gap-2 flex-shrink-0 ml-auto z-10">
            
            {!isMounted ? (
              <div className="w-28 h-9 rounded-xl bg-slate-100/60 animate-pulse border border-slate-200" />
            ) : !auth.isLoggedIn ? (
              /* GUEST BUTTONS: Track Application | Login | Free Register */
              <div className="flex items-center gap-2">
                {platformSettings?.general?.guestButtons?.showTrackApplication !== false && (
                  <Link
                    href="/dashboard/application-check"
                    className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-[7px] border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold transition-all shadow-2xs"
                    title="আবেদনের ট্র্যাকিং ও স্ট্যাটাস যাচাই"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-600" />
                    <span>{platformSettings?.general?.guestButtons?.trackApplicationText || 'আবেদন ট্র্যাক'}</span>
                  </Link>
                )}

                {platformSettings?.general?.guestButtons?.showLogin !== false && (
                  <Link
                    href="/login"
                    className="px-3 py-1.5 2xl:py-2 rounded-[7px] border border-slate-300 text-slate-800 bg-white hover:bg-slate-50 text-xs 2xl:text-sm font-semibold transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <LogIn className="w-3.5 h-3.5 text-slate-700" />
                    <span>{platformSettings?.general?.guestButtons?.loginText || 'লগইন'}</span>
                  </Link>
                )}

                {platformSettings?.general?.guestButtons?.showRegister !== false && (
                  <Link
                    href="/register"
                    className="px-3.5 py-1.5 2xl:py-2 rounded-[7px] bg-emerald-700 hover:bg-emerald-800 text-white text-xs 2xl:text-sm font-semibold shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-white" />
                    <span>{platformSettings?.general?.guestButtons?.registerText || 'ফ্রি রেজিস্ট্রেশন'}</span>
                  </Link>
                )}
              </div>
            ) : (
              /* LOGGED IN USER: Notification Bell + Profile Dropdown */
              <div className="flex items-center gap-2">
                {/* Notification Bell Widget */}
                {auth.role === 'candidate' && platformSettings?.general?.userWidgets?.showNotificationBell !== false && (
                  <Link
                    href="/dashboard/notifications"
                    className="relative p-2 rounded-[7px] border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all"
                    title="নোটিফিকেশন"
                  >
                    <Bell className="w-4 h-4 text-slate-600" />
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
                    )}
                  </Link>
                )}

                {/* 4. Admin Direct Link */}
                {auth.role === 'admin' && (
                  <Link 
                    href="/admin"
                    className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-[7px] text-xs font-bold shadow"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-300" />
                    <span>অ্যাডমিন</span>
                  </Link>
                )}

                {/* 5. Profile Avatar & Dropdown */}
                {platformSettings?.general?.userWidgets?.showAvatarDropdown !== false && (
                  <div className="relative" ref={profileDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="flex items-center justify-center p-0 m-0 bg-transparent border-0 shadow-none outline-none focus:outline-none cursor-pointer hover:opacity-90 active:scale-95 transition-all rounded-full"
                      aria-label="প্রোফাইল মেনু"
                      aria-expanded={profileDropdownOpen}
                    >
                      {userPhoto ? (
                        <img
                          src={userPhoto}
                          alt={auth.name || 'প্রোফাইল ছবি'}
                          onError={() => setAvatarError(true)}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                          {initialLetter}
                        </div>
                      )}
                    </button>

                    {profileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-xs space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2.5">
                          {userPhoto ? (
                            <img
                              src={userPhoto}
                              alt={auth.name || 'ইউজার'}
                              className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                              {initialLetter}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-800 truncate">{auth.name || 'ইউজার'}</div>
                            <div className="text-[10px] text-slate-500 font-medium">
                              {auth.role === 'admin' ? 'Super Admin' : 'ভেরিফাইড প্রার্থী'}
                            </div>
                          </div>
                        </div>

                        {auth.role === 'candidate' ? (
                          <>
                            <Link
                              href="/dashboard/profile"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors"
                            >
                              <UserCheck className="w-4 h-4 text-slate-500" />
                              <span>আমার প্রোফাইল</span>
                            </Link>
                            <Link
                              href="/dashboard/applications"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors"
                            >
                              <FileText className="w-4 h-4 text-slate-500" />
                              <span>আমার আবেদন ও ট্র্যাকিং</span>
                            </Link>
                            <Link
                              href="/dashboard/vault"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors"
                            >
                              <ShieldCheck className="w-4 h-4 text-slate-500" />
                              <span>মাস্টার ডকুমেন্ট ভল্ট</span>
                            </Link>
                            <Link
                              href="/dashboard/wallet"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors"
                            >
                              <Wallet className="w-4 h-4 text-slate-500" />
                              <span>ডিজিটাল ওয়ালেট</span>
                            </Link>
                          </>
                        ) : (
                          <Link
                            href="/admin"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4 text-slate-500" />
                            <span>টিম ড্যাশবোর্ড</span>
                          </Link>
                        )}

                        <div className="border-t border-slate-100 my-1"></div>

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 font-medium transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>লগআউট করুন</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex lg:hidden items-center gap-2">
            {!isMounted ? (
              <div className="w-14 h-8 rounded-xl bg-slate-100 animate-pulse" />
            ) : !auth.isLoggedIn ? (
              <Link 
                href="/login"
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-[7px] text-xs font-semibold"
              >
                লগইন
              </Link>
            ) : (
              <Link 
                href="/dashboard"
                className="bg-slate-100 text-slate-800 px-2.5 py-1.5 rounded-[7px] text-xs font-semibold flex items-center gap-1 border border-slate-200"
              >
                <Wallet className="w-3.5 h-3.5 text-slate-600" />
                <span>৳{walletBalance}</span>
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* 3. TABLET & MOBILE ACCORDION DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 max-h-[85vh] overflow-y-auto">
          <nav className="space-y-1 text-[16px] font-bold text-slate-800">
            {navItems.map((item) => {
              const hasDropdown = Boolean(item.dropdown && item.dropdown.length > 0);
              const isExpanded = Boolean(expandedMobileAccordions[item.id]);

              return (
                <div key={item.id} className="border-b border-slate-100 pb-1">
                  <div className="flex items-center justify-between">
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 px-2 rounded-xl hover:bg-slate-100 text-slate-900 font-semibold flex-1 text-left transition-colors"
                    >
                      {item.label}
                    </Link>
                    {hasDropdown && (
                      <button
                        type="button"
                        onClick={() => toggleMobileAccordion(item.id)}
                        className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors flex items-center justify-center cursor-pointer"
                        aria-label={`${item.label} সাবমেনু ড্রপডাউন`}
                      >
                        <ChevronDown 
                          className={`w-4 h-4 transition-transform duration-200 text-slate-500 ${
                            isExpanded ? 'rotate-180 text-slate-900' : ''
                          }`} 
                        />
                      </button>
                    )}
                  </div>

                  {/* Expandable Accordion */}
                  {hasDropdown && isExpanded && (
                    <div className="pl-4 pr-2 py-1.5 space-y-1 bg-slate-50/80 rounded-xl mb-1">
                      {item.dropdown!.map((subItem, idx) => (
                        <Link
                          key={idx}
                          href={subItem.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block py-2 px-3 text-[16px] text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-lg font-medium"
                        >
                          • {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Mobile Bottom Actions (WhatsApp + Guest Buttons / User Widgets) */}
          <div className="pt-4 space-y-2">
            {platformSettings?.general?.guestButtons?.showWhatsApp !== false && (
              <a
                href={`https://wa.me/${platformSettings?.general?.whatsappNumber || '8801774366643'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 border border-slate-200 bg-slate-50 text-slate-800 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-slate-600" />
                <span>{platformSettings?.general?.guestButtons?.whatsAppText || 'WhatsApp হেল্পলাইন'}</span>
              </a>
            )}

            {!auth.isLoggedIn ? (
              <div className="space-y-2">
                {platformSettings?.general?.guestButtons?.showLogin !== false && (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 border border-slate-300 text-slate-800 bg-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4 text-slate-700" />
                    <span>{platformSettings?.general?.guestButtons?.loginText || 'লগইন'}</span>
                  </Link>
                )}
                {platformSettings?.general?.guestButtons?.showRegister !== false && (
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-xs"
                  >
                    <UserCheck className="w-4 h-4 text-white" />
                    <span>{platformSettings?.general?.guestButtons?.registerText || 'ফ্রি রেজিস্ট্রেশন'}</span>
                  </Link>
                )}
                {platformSettings?.general?.guestButtons?.showTrackApplication !== false && (
                  <Link
                    href="/dashboard/application-check"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-slate-600" />
                    <span>{platformSettings?.general?.guestButtons?.trackApplicationText || 'আবেদন ট্র্যাক করুন'}</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <Link
                  href="/dashboard/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-medium text-sm flex items-center justify-center gap-2 border border-slate-200 transition-colors"
                >
                  {userPhoto ? (
                    <img src={userPhoto} alt={auth.name || 'প্রোফাইল'} className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <UserCheck className="w-4 h-4 text-slate-700" />
                  )}
                  <span>আমার প্রোফাইল</span>
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>আমার ড্যাশবোর্ড</span>
                </Link>
                <Link
                  href="/dashboard/wallet"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 bg-slate-100 text-slate-800 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border border-slate-200"
                >
                  <Wallet className="w-4 h-4 text-slate-600" />
                  <span>ওয়ালেট ব্যালেন্স: ৳{walletBalance}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full py-2 text-rose-600 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-rose-50 border border-rose-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>লগআউট</span>
                </button>
              </div>
            )}
          </div></div>
      )}

    </header>
  );
}
