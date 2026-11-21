'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Briefcase, 
  UserCheck, 
  Lock, 
  Phone, 
  Mail,
  User,
  ArrowRight, 
  ArrowLeft,
  RotateCcw,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  Sparkles,
  MapPin,
  HelpCircle,
  ChevronDown,
  Check
} from 'lucide-react';
import { storage } from '@/lib/store';
import { BD_DIVISIONS_MAP } from '@/constants';
import { loginService, authService } from '@/services';
import { ApiError, extractErrorMessage } from '@/lib/api-error';
import { GoogleSignInButton, EmailVerifyModal } from '@/components/auth_components';

function CustomDistrictSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  let currentLabel = value;
  for (const div of Object.values(BD_DIVISIONS_MAP)) {
    const found = div.districts.find(d => d.bn === value || d.en === value);
    if (found) {
      currentLabel = `${found.bn} (${found.en})`;
      break;
    }
  }

  const q = search.trim().toLowerCase();
  const filteredDivisions = Object.entries(BD_DIVISIONS_MAP).map(([key, div]) => {
    const matchingDistricts = div.districts.filter(d => 
      !q || d.bn.toLowerCase().includes(q) || d.en.toLowerCase().includes(q) || div.bn.toLowerCase().includes(q)
    );
    return {
      key,
      bn: div.bn,
      districts: matchingDistricts
    };
  }).filter(group => group.districts.length > 0);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full pl-8 pr-7 py-2.5 rounded-[4px] border border-slate-300 text-xs text-slate-800 font-normal focus:ring-1 focus:ring-slate-400/20 focus:border-slate-400 focus:outline-none bg-white flex items-center justify-between text-left transition-all cursor-pointer shadow-2xs hover:border-slate-400"
      >
        <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <span className="truncate">{currentLabel || 'জেলা নির্বাচন করুন'}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 pointer-events-none shrink-0 ${isOpen ? 'rotate-180 text-slate-800' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 max-h-60 bg-white rounded-[4px] border border-slate-200 shadow-xl z-50 overflow-hidden flex flex-col text-xs animate-in fade-in duration-150">
          <div className="p-1.5 border-b border-slate-100 bg-slate-50/70">
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="জেলা খুঁজুন..."
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-[4px] text-xs font-normal text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400/20 placeholder:text-slate-400"
            />
          </div>
          <div className="overflow-y-auto max-h-48 divide-y divide-slate-100 custom-scrollbar">
            {filteredDivisions.length === 0 ? (
              <div className="p-3 text-center text-slate-400 text-xs font-normal">
                কোনো জেলা পাওয়া যায়নি
              </div>
            ) : (
              filteredDivisions.map((group) => (
                <div key={group.key} className="py-1">
                  <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/40">
                    {group.bn} বিভাগ
                  </div>
                  {group.districts.map((d) => {
                    const isSelected = value === d.bn;
                    return (
                      <button
                        key={d.en}
                        type="button"
                        onClick={() => {
                          onChange(d.bn);
                          setIsOpen(false);
                          setSearch('');
                        }}
                        className={`w-full px-3 py-1.5 text-left flex items-center justify-between text-xs font-normal transition-colors cursor-pointer ${
                          isSelected 
                            ? 'bg-slate-100 text-slate-900 font-medium' 
                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span>{d.bn} ({d.en})</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-slate-700" />}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') === 'register' ? 'register' : 'login';

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab as 'login' | 'register');

  // Forward legacy admin tab requests directly to dedicated admin portal
  React.useEffect(() => {
    if (searchParams.get('tab') === 'admin') {
      if (typeof window !== 'undefined') {
        window.location.replace('/admin');
      }
    }
  }, [searchParams]);

  // Login Form States (Email based)
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Email OTP Verification Modal States
  const [verifyModal, setVerifyModal] = useState<{ open: boolean; email: string; devOtp?: string }>({
    open: false,
    email: '',
    devOtp: ''
  });

  // Helper for safe deep-link redirecting
  const getRedirectTarget = () => {
    const target = searchParams.get('redirect');
    return target && /^\/(?!\/)/.test(target) ? target : '/dashboard/profile';
  };

  // Register Form States (Email Required, Phone Optional)
  const [regName, setRegName] = useState('');
  const [regNameBn, setRegNameBn] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDistrict, setRegDistrict] = useState('ঢাকা');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Forgot Password Modal States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [forgotId, setForgotId] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotConfirmPass, setForgotConfirmPass] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotTestOtp, setForgotTestOtp] = useState('');
  const [forgotMaskedTarget, setForgotMaskedTarget] = useState('');
  const [forgotCountdown, setForgotCountdown] = useState(60);
  const [forgotCanResend, setForgotCanResend] = useState(false);
  const [showForgotNewPass, setShowForgotNewPass] = useState(false);
  const [showForgotConfirmPass, setShowForgotConfirmPass] = useState(false);
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  // Liquid Height Transition Measurement
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const [animatedHeight, setAnimatedHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!contentWrapperRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = Math.round(entry.contentRect.height);
        if (h > 0) {
          setAnimatedHeight(h);
        }
      }
    });
    resizeObserver.observe(contentWrapperRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Automatically open forgot password modal if navigated with ?tab=forgot or ?forgot=1
  React.useEffect(() => {
    if (searchParams.get('tab') === 'forgot' || searchParams.get('forgot') === '1') {
      setShowForgotModal(true);
      setForgotStep(1);
    }
  }, [searchParams]);

  // 60-Second countdown timer for Step 2 of forgot modal
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showForgotModal && forgotStep === 2 && forgotCountdown > 0) {
      setForgotCanResend(false);
      timer = setInterval(() => {
        setForgotCountdown((prev) => {
          if (prev <= 1) {
            setForgotCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showForgotModal, forgotStep, forgotCountdown]);

  // Handle Email-based Login (HttpOnly Cookies set by Server)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!loginIdentifier.trim() || !loginPassword) {
      setError('ইমেইল এড্রেস এবং পাসওয়ার্ড প্রদান করুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await loginService.login({
        email: loginIdentifier.trim(),
        identifier: loginIdentifier.trim(),
        password: loginPassword,
        rememberMe,
        role: 'candidate'
      });

      if (data?.success) {
        storage.setAuth({
          isLoggedIn: true,
          role: 'candidate',
          name: data.user?.name || data.user?.nameBn || 'চাকরিপ্রার্থী',
          phone: data.user?.phone || '',
          userId: data.user?.id || ''
        });

        setSuccessMsg('লগইন সফল হয়েছে! ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...');
        setTimeout(() => {
          window.location.href = getRedirectTarget();
        }, 500);
      }
    } catch (err: unknown) {
      if (err instanceof ApiError && err.statusCode === 403 && (err.responseData as Record<string, unknown>)?.requiresVerification) {
        const resData = err.responseData as Record<string, string>;
        setVerifyModal({
          open: true,
          email: resData.email || loginIdentifier.trim()
        });
        setIsSubmitting(false);
        return;
      }
      setError(extractErrorMessage(err, 'লগইন ব্যর্থ হয়েছে। সঠিক তথ্য প্রদান করুন।'));
      setIsSubmitting(false);
    }
  };



  // Handle New Email-Based Registration (Phone Optional) -> Triggers Verification OTP
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setError('পূর্ণ নাম, ইমেইল এবং পাসওয়ার্ড পূরণ করুন।');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) {
      setError('সঠিক ইমেইল এড্রেস প্রদান করুন।');
      return;
    }

    if (regPassword.length < 6) {
      setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    if (regConfirmPassword && regPassword !== regConfirmPassword) {
      setError('পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড দুটি হুবহু মিলতে হবে।');
      return;
    }

    let cleanRegPhone = '';
    if (regPhone.trim()) {
      cleanRegPhone = regPhone
        .replace(/[০-৯]/g, digit => String('০১২৩৪৫৬৭৮৯'.indexOf(digit)))
        .replace(/\D/g, '')
        .replace(/^880/, '0');

      if (!/^01[3-9]\d{8}$/.test(cleanRegPhone)) {
        setError('সঠিক ১১-সংখ্যার বাংলাদেশি মোবাইল নম্বর দিন (অথবা ঘরটি ফাঁকা রাখুন)।');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const data = await loginService.register({
        name: regName.trim(),
        nameBn: regNameBn.trim() || regName.trim(),
        email: regEmail.trim().toLowerCase(),
        phone: cleanRegPhone || undefined,
        district: regDistrict,
        password: regPassword
      });

      if (data?.success && data?.requiresVerification) {
        setSuccessMsg('রেজিস্ট্রেশন সফল! ইমেইল ভেরিফিকেশন কোড প্রদান করুন।');
        setVerifyModal({
          open: true,
          email: data.email || regEmail.trim().toLowerCase(),
          devOtp: data.devOtp || ''
        });
        setIsSubmitting(false);
      }
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'রেজিস্ট্রেশন ব্যর্থ হয়েছে।'));
      setIsSubmitting(false);
    }
  };

  // Forgot Password Step 1: Request OTP
  const handleForgotRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setForgotError('');
    setForgotMessage('');
    if (!forgotId.trim()) {
      setForgotError('অনুগ্রহ করে আপনার নিবন্ধিত ইমেইল অথবা মোবাইল নম্বর লিখুন।');
      return;
    }
    setIsForgotLoading(true);
    try {
      const data = await authService.requestForgotPasswordOtp({
        identifier: forgotId.trim()
      });
      setForgotMessage(data.message || 'আপনার ইমেইলে ৬-ডিজিটের ভেরিফিকেশন কোড পাঠানো হয়েছে।');
      setForgotTestOtp(data.devOtp || data.testOtp || '');
      setForgotMaskedTarget(data.maskedTarget || forgotId.trim());
      setForgotStep(2);
      setForgotCountdown(60);
    } catch (err: unknown) {
      setForgotError(extractErrorMessage(err, 'রিকোয়েস্ট ব্যর্থ হয়েছে।'));
    } finally {
      setIsForgotLoading(false);
    }
  };

  // Forgot Password Step 2: Verify OTP
  const handleForgotVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (!forgotOtp.trim()) {
      setForgotError('৬-ডিজিটের ভেরিফিকেশন কোড লিখুন।');
      return;
    }
    setIsForgotLoading(true);
    try {
      await authService.verifyForgotPasswordOtp({
        identifier: forgotId.trim(),
        otp: forgotOtp.trim()
      });
      setForgotMessage('');
      setForgotStep(3);
    } catch (err: unknown) {
      setForgotError(extractErrorMessage(err, 'ভুল ওটিপি কোড।'));
    } finally {
      setIsForgotLoading(false);
    }
  };

  // Forgot Password Step 3: Reset Password
  const handleForgotResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (!forgotNewPass || forgotNewPass.length < 6) {
      setForgotError('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }
    if (forgotNewPass !== forgotConfirmPass) {
      setForgotError('পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড দুটি হুবহু মিলতে হবে।');
      return;
    }
    setIsForgotLoading(true);
    try {
      const data = await authService.resetPassword({
        identifier: forgotId.trim(),
        otp: forgotOtp.trim(),
        newPassword: forgotNewPass
      });
      if (data.user) {
        storage.setAuth({
          isLoggedIn: true,
          role: 'candidate',
          name: data.user.name,
          phone: data.user.phone || '',
          userId: data.user.id
        });
      }

      setForgotMessage('পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...');
      setTimeout(() => {
        setShowForgotModal(false);
        window.location.href = getRedirectTarget();
      }, 700);
    } catch (err: unknown) {
      setForgotError(extractErrorMessage(err, 'পাসওয়ার্ড পরিবর্তনের সময় সমস্যা হয়েছে।'));
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div className="max-w-[520px] w-full mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-xl p-7 sm:p-9 space-y-6 relative overflow-hidden text-slate-800">
      
      {/* Top Header */}
      <div className="text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          চাকরিসেবা অ্যাকাউন্টে প্রবেশ
        </h1>
      </div>

      {/* Mode Switcher Tabs (Login & Register) */}
      <div className="relative p-1 bg-slate-100 rounded-[6px] flex select-none">
        {/* Fluid Animated Sliding Pill Indicator */}
        <div
          className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-[4px] shadow-xs transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            activeTab === 'register' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'
          }`}
        />
        <button
          type="button"
          onClick={() => { setActiveTab('login'); setError(''); setSuccessMsg(''); }}
          className={`relative z-10 w-1/2 py-2 text-center rounded-[4px] transition-colors duration-200 text-xs font-normal cursor-pointer ${
            activeTab === 'login' ? 'text-slate-900 font-medium' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          লগইন
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('register'); setError(''); setSuccessMsg(''); }}
          className={`relative z-10 w-1/2 py-2 text-center rounded-[4px] transition-colors duration-200 text-xs font-normal cursor-pointer ${
            activeTab === 'register' ? 'text-slate-900 font-medium' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          নিবন্ধন
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-[4px] text-xs text-rose-800 flex items-start gap-2 shadow-2xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span className="font-normal leading-relaxed">{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-slate-100 border border-slate-200 rounded-[4px] text-xs text-slate-900 flex items-start gap-2 shadow-2xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
          <span className="font-normal leading-relaxed">{successMsg}</span>
        </div>
      )}

      {/* Liquid Height Animated Container */}
      <div 
        className="relative overflow-hidden transition-[height] duration-350 ease-[cubic-bezier(0.2,0,0,1)]"
        style={{ height: animatedHeight ? `${animatedHeight}px` : 'auto' }}
      >
        <div ref={contentWrapperRef}>
          <div key={activeTab} className="animate-fluid-form">
            {/* 1. CANDIDATE LOGIN FORM */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                
                {/* Primary Email Input */}
                <div>
                  <label className="text-xs font-normal text-slate-700 block mb-1.5">
                    ইমেইল এড্রেস *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="যেমন: tanvir.jobseeker@gmail.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-[4px] border border-slate-300 text-xs text-slate-900 font-normal focus:ring-1 focus:ring-slate-400/20 focus:border-slate-400 focus:outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Password Input with Show/Hide */}
                <div>
                  <label className="text-xs font-normal text-slate-700 block mb-1.5">
                    পাসওয়ার্ড *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-[4px] border border-slate-300 text-xs text-slate-900 font-normal focus:ring-1 focus:ring-slate-400/20 focus:border-slate-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password Controls */}
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 font-normal text-xs">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded-[2px] border-slate-300 text-slate-800 focus:ring-slate-400/20 accent-slate-800 cursor-pointer"
                    />
                    <span>আমাকে মনে রাখুন</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(true);
                      setForgotStep(1);
                      setForgotId(loginIdentifier || '');
                      setForgotError('');
                      setForgotMessage('');
                    }}
                    className="text-xs font-normal text-slate-800 hover:text-slate-900 hover:underline cursor-pointer"
                  >
                    পাসওয়ার্ড ভুলে গেছেন?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-medium text-xs rounded-[4px] shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{isSubmitting ? 'প্রবেশ করা হচ্ছে...' : 'লগইন করুন'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Social Login Divider */}
                <div className="relative py-1 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <span className="relative bg-white px-3 text-xs font-normal text-slate-400">
                    অথবা
                  </span>
                </div>

                {/* Real Google OAuth Sign-In */}
                <GoogleSignInButton
                  label="Google দিয়ে প্রবেশ করুন"
                  onSuccess={() => {
                    setSuccessMsg('গুগল সাইন-ইন সফল হয়েছে! ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...');
                    setTimeout(() => {
                      window.location.href = getRedirectTarget();
                    }, 500);
                  }}
                  onError={(msg) => setError(msg)}
                />
              </form>
            )}

            {/* 2. CANDIDATE REGISTRATION FORM (Email Required, Phone Optional) */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="text-xs font-normal text-slate-700 block mb-1">
                    পূর্ণ নাম (বাংলা বা ইংরেজি) *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="যেমন: মোঃ তানভীর হাসান"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-[4px] border border-slate-300 text-xs text-slate-900 font-normal focus:ring-1 focus:ring-slate-400/20 focus:border-slate-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-normal text-slate-700 block mb-1">
                    ইমেইল এড্রেস *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="name@email.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-[4px] border border-slate-300 text-xs text-slate-900 font-normal focus:ring-1 focus:ring-slate-400/20 focus:border-slate-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs font-normal text-slate-700 block mb-1">
                      মোবাইল (ঐচ্ছিক)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="w-full pl-8 pr-2.5 py-2.5 rounded-[4px] border border-slate-300 text-xs text-slate-900 font-normal focus:ring-1 focus:ring-slate-400/20 focus:border-slate-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-normal text-slate-700 block mb-1">
                      নিজ জেলা *
                    </label>
                    <CustomDistrictSelect
                      value={regDistrict}
                      onChange={setRegDistrict}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs font-normal text-slate-700 block mb-1">
                      পাসওয়ার্ড *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="কমপক্ষে ৬ অক্ষর"
                        className="w-full pl-10 pr-9 py-2.5 rounded-[4px] border border-slate-300 text-xs text-slate-900 font-normal focus:ring-1 focus:ring-slate-400/20 focus:border-slate-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-normal text-slate-700 block mb-1">
                      কনফার্ম পাসওয়ার্ড *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showRegConfirmPassword ? 'text' : 'password'}
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="পুনরায় পাসওয়ার্ড"
                        className="w-full pl-10 pr-9 py-2.5 rounded-[4px] border border-slate-300 text-xs text-slate-900 font-normal focus:ring-1 focus:ring-slate-400/20 focus:border-slate-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-medium text-xs rounded-[4px] shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{isSubmitting ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'ফ্রি অ্যাকাউন্ট তৈরি করুন'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Social Sign Up Divider */}
                <div className="relative py-1 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <span className="relative bg-white px-3 text-xs font-normal text-slate-400">
                    অথবা
                  </span>
                </div>

                <GoogleSignInButton
                  label="Google দিয়ে সাইন-আপ করুন"
                  onSuccess={() => {
                    setSuccessMsg('গুগল সাইন-আপ সফল হয়েছে! ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...');
                    setTimeout(() => {
                      window.location.href = getRedirectTarget();
                    }, 500);
                  }}
                  onError={(msg) => setError(msg)}
                />
              </form>
            )}
          </div>
        </div>
      </div>

      {/* EMAIL VERIFICATION OTP MODAL */}
      <EmailVerifyModal
        isOpen={verifyModal.open}
        email={verifyModal.email}
        initialDevOtp={verifyModal.devOtp}
        onClose={() => setVerifyModal({ ...verifyModal, open: false })}
        onVerified={() => {
          setVerifyModal({ ...verifyModal, open: false });
          setSuccessMsg('ইমেইল ভেরিফিকেশন সম্পন্ন হয়েছে! ড্যাশবোর্ডে যাওয়া হচ্ছে...');
          window.location.href = getRedirectTarget();
        }}
      />

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200 relative">
            
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                <HelpCircle className="w-5 h-5 text-amber-700" />
              </div>
              <h3 className="text-lg font-black text-slate-900">পাসওয়ার্ড রিকভারি</h3>
              <p className="text-xs text-slate-500">
                ৩-স্টেপ ইমেইল ওটিপি ভেরিফিকেশন
              </p>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-bold">
              <div className={`p-1.5 rounded-xl transition-all ${
                forgotStep === 1 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-400'
              }`}>
                ১. তথ্য দিন
              </div>
              <div className={`p-1.5 rounded-xl transition-all ${
                forgotStep === 2 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-400'
              }`}>
                ২. ওটিপি যাচাই
              </div>
              <div className={`p-1.5 rounded-xl transition-all ${
                forgotStep === 3 ? 'bg-slate-100 text-slate-900 border border-slate-300' : 'bg-slate-100 text-slate-400'
              }`}>
                ৩. নতুন পাসওয়ার্ড
              </div>
            </div>

            {forgotError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotMessage && (
              <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-900 text-xs flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-slate-700" />
                <span>{forgotMessage}</span>
              </div>
            )}

            {/* STEP 1 */}
            {forgotStep === 1 && (
              <form onSubmit={handleForgotRequestOtp} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    নিবন্ধিত ইমেইল অথবা মোবাইল নম্বর
                  </label>
                  <input
                    type="text"
                    required
                    value={forgotId}
                    onChange={(e) => setForgotId(e.target.value)}
                    placeholder="যেমন: user@email.com"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-slate-400/20 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isForgotLoading}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  {isForgotLoading ? 'পাঠানো হচ্ছে...' : 'ওটিপি কোড পাঠান'}
                </button>
              </form>
            )}

            {/* STEP 2 */}
            {forgotStep === 2 && (
              <form onSubmit={handleForgotVerifyOtp} className="space-y-3">
                {forgotMaskedTarget && (
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-center justify-between">
                    <span>প্রেরিত গন্তব্য:</span>
                    <strong className="font-mono text-slate-800">{forgotMaskedTarget}</strong>
                  </div>
                )}

                {forgotTestOtp && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                    <span>টেস্টিং ওটিপি কোড:</span>
                    <strong className="font-mono text-sm tracking-widest bg-amber-100 px-2 py-0.5 rounded">{forgotTestOtp}</strong>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">৬-ডিজিটের ওটিপি কোড</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-center text-sm font-black font-mono tracking-widest text-slate-900 focus:ring-2 focus:ring-slate-400/20 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>পেছনে যান</span>
                  </button>

                  {forgotCountdown > 0 ? (
                    <span className="text-slate-400">অপেক্ষা করুন ({forgotCountdown}s)</span>
                  ) : (
                    <button
                      type="button"
                      disabled={isForgotLoading}
                      onClick={() => handleForgotRequestOtp()}
                      className="text-slate-800 hover:text-slate-900 font-bold flex items-center gap-1 hover:underline"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>পুনরায় পাঠান</span>
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isForgotLoading}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  {isForgotLoading ? 'যাচাই হচ্ছে...' : 'কোড যাচাই করুন'}
                </button>
              </form>
            )}

            {/* STEP 3 */}
            {forgotStep === 3 && (
              <form onSubmit={handleForgotResetPassword} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)</label>
                  <div className="relative">
                    <input
                      type={showForgotNewPass ? 'text' : 'password'}
                      required
                      value={forgotNewPass}
                      onChange={(e) => setForgotNewPass(e.target.value)}
                      placeholder="নতুন পাসওয়ার্ড"
                      className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-slate-400/20 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotNewPass(!showForgotNewPass)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showForgotNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">কনফার্ম পাসওয়ার্ড</label>
                  <div className="relative">
                    <input
                      type={showForgotConfirmPass ? 'text' : 'password'}
                      required
                      value={forgotConfirmPass}
                      onChange={(e) => setForgotConfirmPass(e.target.value)}
                      placeholder="পুনরায় পাসওয়ার্ড লিখুন"
                      className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-slate-400/20 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotConfirmPass(!showForgotConfirmPass)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showForgotConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isForgotLoading}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <span>{isForgotLoading ? 'সংরক্ষণ হচ্ছে...' : 'পাসওয়ার্ড পরিবর্তন ও লগইন'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-3 sm:px-6 py-8 sm:py-12 bg-slate-50/60">
      <Suspense fallback={<div className="text-xs text-slate-400 font-bold">লোড হচ্ছে...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
