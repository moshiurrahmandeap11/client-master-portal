'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  User, 
  FileBox, 
  Bookmark, 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  Award, 
  Calendar, 
  Bell, 
  Briefcase, 
  FileCheck, 
  BrainCircuit, 
  TrendingUp, 
  Wallet, 
  History, 
  Settings, 
  LogOut,
  Lock, 
  Menu, 
  X, 
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  PhoneCall,
  ArrowUpRight,
  Camera
} from 'lucide-react';
import { storage } from '@/lib/store';
import axiosInstance, { fetchWithAuth } from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';
import { useAuthSession } from '@/hooks/useAuthSession';
import { CandidateProfile } from '@/types';
import { emptyCandidateProfile as mockUserProfile } from '@/data/candidateDefaults';

interface SidebarNavItem {
  title: string;
  href: string;
  badge?: string;
  badgeColor?: string;
}

function getNavSections(unreadCount: number): { sectionTitle: string; items: SidebarNavItem[] }[] {
  return [
    {
      sectionTitle: 'মূল ড্যাশবোর্ড',
      items: [
        { title: 'ওভারভিউ', href: '/dashboard' },
        { title: 'ব্যক্তিগত প্রোফাইল', href: '/dashboard/profile' },
        { title: 'স্মার্ট ডকুমেন্ট ভল্ট', href: '/dashboard/vault' }
      ]
    },
    {
      sectionTitle: 'চাকরি ও আবেদন',
      items: [
        { title: 'সুপারিশকৃত চাকরি', href: '/dashboard/recommended-jobs' },
        { title: 'সংরক্ষিত সার্কুলার', href: '/dashboard/saved-jobs' },
        { title: 'আবেদন প্রস্তুতি ও যাচাই', href: '/dashboard/application-check' },
        { title: 'আমার আবেদন ট্র্যাকিং', href: '/dashboard/applications' }
      ]
    },
    {
      sectionTitle: 'পরীক্ষা ও নোটিশ',
      items: [
        { title: 'অ্যাডমিট কার্ড ট্র্যাকার', href: '/dashboard/admit-cards' },
        { title: 'পরীক্ষার ক্যালেন্ডার', href: '/dashboard/exam-calendar' },
        { 
          title: 'নোটিফিকেশন সেন্টার', 
          href: '/dashboard/notifications', 
          badge: unreadCount > 0 ? `${unreadCount} নতুন` : undefined, 
          badgeColor: 'bg-rose-50 text-rose-700 border border-rose-200' 
        },
        { title: 'ব্যক্তিগত জব অ্যালার্ট', href: '/dashboard/alerts' }
      ]
    },
    {
      sectionTitle: 'প্রস্তুতি ও সিভি',
      items: [
        { title: 'স্মার্ট সিভি বিল্ডার', href: '/dashboard/cv-builder' },
        { title: 'পরীক্ষার প্রস্তুতি', href: '/dashboard/preparation' },
        { title: 'পারফরম্যান্স অ্যানালিটিক্স', href: '/dashboard/performance' }
      ]
    },
    {
      sectionTitle: 'অ্যাকাউন্ট ও ফিন্যান্স',
      items: [
        { title: 'আমার ওয়ালেট', href: '/dashboard/wallet' },
        { title: 'লেনদেন হিস্ট্রি', href: '/dashboard/transactions' },
        { title: 'অ্যাকাউন্ট সেটিংস', href: '/dashboard/settings' }
      ]
    }
  ];
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<CandidateProfile>(mockUserProfile);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [completion, setCompletion] = useState(0);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState<number>(0);
  const [isMounted, setIsMounted] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [impersonatingName, setImpersonatingName] = useState<string | null>(null);

  const navSections = useMemo(() => getNavSections(unreadNotifsCount), [unreadNotifsCount]);
  const { session } = useAuthSession();

  // Live unread notifications sync cached via TanStack Query
  const { data: notificationsData } = useQuery({
    queryKey: ['candidate', 'notifications'],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get('/api/candidate/notifications');
        return res.data?.notifications || [];
      } catch {
        return [];
      }
    },
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    if (Array.isArray(notificationsData)) {
      const unread = notificationsData.filter((n: any) => !(n.isRead ?? n.read)).length;
      setUnreadNotifsCount(unread);
    }
  }, [notificationsData]);

  // Automatically close mobile sidebar on navigation
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  // Synchronize session from TanStack Query (shares cache with Navbar - 0 duplicate requests!)
  useEffect(() => {
    if (session) {
      if (session.impersonatingName) {
        setImpersonatingName(session.impersonatingName);
      }
      if (session.isLoggedIn && session.user && session.role === 'candidate') {
        storage.setAuth({ isLoggedIn: true, role: 'candidate', userId: session.user.id, name: session.user.name, phone: session.user.phone });
        storage.updateUser(session.user);
        setProfile(session.user);
        setCompletion(storage.calculateProfileCompletion(session.user, storage.getDocuments()));
      }
      setSessionChecked(true);
    }
  }, [session]);

  useEffect(() => {
    setIsMounted(true);

    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/(?:^|;\s*)cs_impersonating=([^;]+)/);
      if (match) {
        try {
          let name = decodeURIComponent(match[1]);
          if (name.includes('%')) name = decodeURIComponent(name);
          setImpersonatingName(name);
        } catch {
          setImpersonatingName(match[1]);
        }
      }
    }

    // Synchronously restore from client storage (zero flickering & no unwanted logouts)
    const currentAuth = storage.getAuth();
    if (currentAuth.isLoggedIn && currentAuth.role === 'candidate') {
      const cachedUser = storage.getUser();
      const cachedDocs = storage.getDocuments();
      setProfile(cachedUser);
      setCompletion(storage.calculateProfileCompletion(cachedUser, cachedDocs));
      setSessionChecked(true);

      const notifs = storage.getNotifications();
      const unread = notifs.filter(n => !n.read).length;
      setUnreadNotifsCount(unread);
    }

    const handleUserChange = () => {
      const u = storage.getUser();
      setProfile(u);
      setCompletion(storage.calculateProfileCompletion(u, storage.getDocuments()));
    };

    const handleDocsChange = () => {
      const u = storage.getUser();
      setCompletion(storage.calculateProfileCompletion(u, storage.getDocuments()));
    };

    const handleNotifsChange = () => {
      const notifs = storage.getNotifications();
      const unread = notifs.filter(n => !n.read).length;
      setUnreadNotifsCount(unread);
    };

    window.addEventListener('cs_user_changed', handleUserChange);
    window.addEventListener('cs_documents_changed', handleDocsChange);
    window.addEventListener('cs_notifications_changed', handleNotifsChange);

    return () => {
      window.removeEventListener('cs_user_changed', handleUserChange);
      window.removeEventListener('cs_documents_changed', handleDocsChange);
      window.removeEventListener('cs_notifications_changed', handleNotifsChange);
    };
  }, [router, pathname]);

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/api/auth/logout');
    } catch {}
    storage.logout();
    router.push('/login');
  };

  const handleExitImpersonation = async () => {
    try {
      await fetch('/api/admin/impersonate', { method: 'DELETE' });
    } catch {}
    if (typeof window !== 'undefined') {
      document.cookie = 'cs_impersonating=; path=/; max-age=0; SameSite=Lax';
      document.cookie = 'cs_impersonating_id=; path=/; max-age=0; SameSite=Lax';
      window.location.href = '/admin?tab=candidate-directory';
    }
  };

  const handleQuickPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('docType', 'photo');
    formData.append('docTitle', 'প্রার্থীর ছবি');
    try {
      const res = await fetchWithAuth('/api/candidate/upload-document', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.success && data?.fileUrl) {
        const updated = { ...profile, photoUrl: data.fileUrl };
        setProfile(updated);
        storage.updateUser(updated);
        window.dispatchEvent(new Event('cs_user_changed'));
      }
    } catch (err) {
      console.warn('Quick photo upload warning:', err);
    }
  };

  if (!sessionChecked) {
    return (
      <div role="status" className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="flex items-center gap-3 text-slate-700 font-bold text-sm bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm animate-pulse">
          <div className="w-4 h-4 rounded-full border-2 border-slate-800 border-t-transparent animate-spin" />
          <span>ড্যাশবোর্ড লোড হচ্ছে...</span>
        </div>
      </div>
    );
  }

  // Unauthorized Redirect Guard
  if (isMounted && !storage.getAuth().isLoggedIn && !impersonatingName) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-800 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">লগইন আবশ্যক</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            প্রার্থী ড্যাশবোর্ড ও ব্যক্তিগত তথ্য অ্যাক্সেস করতে অনুগ্রহ করে প্রথমে আপনার অ্যাকাউন্টে লগইন করুন।
          </p>
          <div className="pt-2">
            <Link
              href={`/login?redirect=${encodeURIComponent(pathname)}`}
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
            >
              <span>লগইন পেজে যান</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full max-h-full w-full flex flex-col overflow-hidden bg-slate-50" suppressHydrationWarning>
      {/* Sticky Admin Impersonation Banner */}
      {impersonatingName && (
        <div className="bg-red-600 text-white px-4 py-2 text-xs font-black flex items-center justify-between shadow-xs z-50 border-b border-red-700 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-black text-white rounded-md">
              <ShieldAlert className="w-3.5 h-3.5" />
            </span>
            <span>
              সতর্কবার্তা: আপনি সাপোর্ট দেওয়ার জন্য এই প্রার্থীর অ্যাকাউন্টে অ্যাডমিন হিসেবে প্রবেশ করেছেন (&ldquo;{impersonatingName}&rdquo;)।
            </span>
          </div>
          <button
            onClick={handleExitImpersonation}
            className="px-3.5 py-1.5 bg-black hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer shrink-0 border border-red-400"
          >
            <span>অ্যাডমিন প্যানেলে ফিরুন</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Mobile Sticky Header Bar */}
      <div className="lg:hidden bg-white/95 backdrop-blur-md text-slate-800 px-4 py-2.5 flex items-center justify-between border-b border-slate-200 z-30 shadow-xs flex-shrink-0">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/90 hover:bg-slate-200/80 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200/80 transition-all cursor-pointer"
          aria-label="ড্যাশবোর্ড মেনু খুলুন"
        >
          <Menu className="w-4 h-4 text-slate-600" />
          <span>ড্যাশবোর্ড মেনু</span>
        </button>

        <div className="flex items-center gap-2.5 text-xs">
          {isMounted ? (
            <Link 
              href="/dashboard/wallet" 
              className="bg-slate-100/80 border border-slate-200/80 text-slate-800 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 hover:bg-slate-200/60 transition-colors"
            >
              <span>৳{profile.walletBalance ?? 0}</span>
            </Link>
          ) : (
            <div className="w-16 h-6 bg-slate-100 rounded animate-pulse" />
          )}
          <Link href="/dashboard/profile" className="flex items-center gap-1.5 flex-shrink-0">
            <img 
              src={(isMounted ? profile.photoUrl : '') || '/images/avatar-placeholder.png'} 
              alt={profile.name || 'প্রোফাইল'} 
              className="w-7 h-7 rounded-full border border-slate-200/90 object-cover" 
            />
            <span className="font-semibold text-slate-700 text-xs hidden sm:inline-block truncate max-w-[120px]">
              {profile.nameBn || profile.name}
            </span>
          </Link>
        </div>
      </div>

      <div className="flex-1 flex w-full overflow-hidden min-h-0">
        {/* Mobile Backdrop */}
        {mobileSidebarOpen && (
          <div 
            onClick={() => setMobileSidebarOpen(false)} 
            className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-xs lg:hidden animate-in fade-in"
          />
        )}

        {/* Desktop Sidebar & Mobile Drawer Navigation */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-72 sm:w-80 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
          lg:static lg:w-64 xl:w-72 2xl:w-80 lg:min-w-[16rem] xl:min-w-[18rem] 2xl:min-w-[20rem] lg:h-full lg:max-h-full lg:overflow-hidden lg:flex-shrink-0
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Sidebar Candidate Profile Snapshot Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-white flex-shrink-0">
            <div className="flex items-center justify-between mb-3 lg:hidden">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">মেনু নেভিগেশন</span>
              <button onClick={() => setMobileSidebarOpen(false)} aria-label="মেনু বন্ধ করুন" className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0 group">
                <img 
                  src={(isMounted ? profile.photoUrl : '') || '/images/avatar-placeholder.png'}
                  alt={isMounted ? profile.name : "প্রোফাইল ছবি"} 
                  className="w-11 h-11 rounded-lg object-cover border border-slate-200/80 shadow-xs"
                />
                <label 
                  htmlFor="sidebar-photo-upload" 
                  className="absolute inset-0 bg-black/40 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="ছবি আপলোড / পরিবর্তন করুন"
                >
                  <Camera className="w-3.5 h-3.5 text-white" />
                  <input
                    id="sidebar-photo-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    onChange={handleQuickPhotoUpload}
                  />
                </label>
              </div>
              <div className="min-w-0 flex-1">
                {isMounted ? (
                  <>
                    <h3 className="font-semibold text-sm text-slate-900 truncate">
                      {profile.nameBn || profile.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                      <span>আইডি: {profile.id || (profile.nid ? profile.nid.slice(0, 6) + '...' : profile.username || 'প্রার্থী')}</span>
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] font-medium text-slate-700 bg-slate-100/90 px-2 py-0.5 rounded-md border border-slate-200/60">
                        ব্যালেন্স: ৳{profile.walletBalance ?? 0}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="space-y-1.5 animate-pulse">
                    <div className="h-4 w-28 bg-slate-200 rounded" />
                    <div className="h-3 w-20 bg-slate-100 rounded" />
                    <div className="h-4 w-16 bg-slate-100 rounded-full" />
                  </div>
                )}
              </div>
            </div>

            {/* Profile Completion Meter */}
            <div className="mt-3.5 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 mb-1">
                <span>প্রোফাইল সম্পূর্ণতা</span>
                <span className="text-slate-800 font-semibold">{isMounted ? completion : 0}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)]" 
                  style={{ width: `${isMounted ? completion : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Navigation Links (Scrollable: 5 Sections, 17 Items) */}
          <div className="flex-1 overflow-y-auto px-3 py-3.5 space-y-5 text-xs custom-scrollbar">
            {navSections.map((sec, sIdx) => (
              <div key={sIdx} className="space-y-0.5">
                <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {sec.sectionTitle}
                </div>
                {sec.items.map((item, idx) => {
                  const isActive = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`relative flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)] ${
                        isActive 
                          ? 'bg-white/90 backdrop-blur-md text-slate-950 font-semibold shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-slate-200/80 ring-1 ring-slate-900/[0.04]' 
                          : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/60 font-medium'
                      }`}
                    >
                      <span className="truncate">{item.title}</span>
                      {item.badge && (
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${item.badgeColor || 'bg-slate-100 text-slate-700'}`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Sidebar Footer Support & Logout */}
          <div className="p-3 border-t border-slate-200/80 bg-slate-50/50 space-y-1.5">
            <Link 
              href="/contact" 
              className="flex items-center justify-center py-2 px-3 bg-white/90 hover:bg-white text-slate-800 hover:text-slate-950 border border-slate-200/80 rounded-lg text-xs font-semibold shadow-xs transition-all backdrop-blur-sm"
            >
              <span>সহায়তা ও হেল্পলাইন</span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center py-1.5 text-xs text-rose-600 hover:bg-rose-50/80 rounded-lg transition-colors font-medium cursor-pointer"
            >
              <span>লগআউট করুন</span>
            </button>
          </div>
        </aside>

        {/* Main Workspace Content Area (Independently Scrollable!) */}
        <main className="flex-1 h-full max-h-full overflow-y-auto min-w-0 p-3 sm:p-5 md:p-6 lg:p-8 xl:p-10 w-full custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
