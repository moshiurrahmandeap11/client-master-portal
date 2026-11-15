'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  UserCheck, 
  Phone, 
  Mail,
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2,
  Loader2, 
  Eye, 
  EyeOff, 
  MapPin, 
  Wallet,
  FolderLock,
  Zap
} from 'lucide-react';
import { BD_DIVISIONS_MAP } from '@/constants';
import { loginService } from '@/services/login.service';
import { extractErrorMessage } from '@/lib/api-error';
import { GoogleSignInButton, EmailVerifyModal } from '@/components/auth_components';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect');

  const getRedirectUrl = () => {
    return redirectTarget && /^\/(?!\/)/.test(redirectTarget) ? redirectTarget : '/dashboard';
  };

  // Form States (Email Required, Phone Optional)
  const [nameBn, setNameBn] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('ঢাকা');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Email OTP Verification Modal States
  const [verifyModal, setVerifyModal] = useState<{ open: boolean; email: string; devOtp?: string }>({
    open: false,
    email: '',
    devOtp: ''
  });

  // Live Phone Formatting & Validation helper (optional)
  const cleanPhone = phone
    .replace(/[০-৯]/g, digit => String('০১২৩৪৫৬৭৮৯'.indexOf(digit)))
    .replace(/\D/g, '')
    .replace(/^880/, '0');

  const isPhoneStarted = cleanPhone.length > 0;
  const isPhoneValid = /^01[3-9]\d{8}$/.test(cleanPhone);

  // Password matching state
  const isConfirmMatch = confirmPassword.length > 0 && password === confirmPassword;
  const isConfirmMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!nameBn.trim() && !nameEn.trim()) {
      setErrorMsg('আপনার পূর্ণ নাম প্রদান করুন।');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMsg('অনুগ্রহ করে একটি সঠিক ইমেইল এড্রেস দিন।');
      return;
    }

    if (isPhoneStarted && !isPhoneValid) {
      setErrorMsg('মোবাইল নম্বর দিলে সঠিকভাবে ১১-সংখ্যার বাংলাদেশি নম্বর দিন (অথবা ঘরটি ফাঁকা রাখুন)।');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড দুটি হুবহু মিলতে হবে।');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await loginService.register({
        name: nameEn.trim() || nameBn.trim(),
        nameBn: nameBn.trim() || nameEn.trim(),
        email: cleanEmail,
        phone: isPhoneStarted ? cleanPhone : undefined,
        password,
        district: district.trim() || 'ঢাকা'
      });

      if (data?.success && data?.requiresVerification) {
        setSuccessMsg('রেজিস্ট্রেশন সফল! ইমেইলে পাঠানো ৬-সংখ্যার ওটিপি কোডটি দিয়ে ভেরিফাই করুন।');
        setVerifyModal({
          open: true,
          email: data.email || cleanEmail,
          devOtp: data.devOtp || ''
        });
        setIsSubmitting(false);
      }
    } catch (err: unknown) {
      setErrorMsg(extractErrorMessage(err, 'রেজিস্ট্রেশনে ত্রুটি হয়েছে।'));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-5 shadow-2xl relative">
        
        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-xs">
            <UserCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            প্রার্থী <span className="text-slate-800">ফ্রি রেজিস্ট্রেশন</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            ইমেইল ও ন্যূনতম তথ্য দিয়ে মাত্র ২ মিনিটে অ্যাকাউন্ট তৈরি করুন
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="p-3 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-between text-[11px] font-bold text-slate-900 shadow-2xs">
          <div className="flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-slate-800" />
            <span>শূন্য ব্যালেন্সের ওয়ালেট</span>
          </div>
          <div className="h-3 w-px bg-slate-300"></div>
          <div className="flex items-center gap-1.5">
            <FolderLock className="w-3.5 h-3.5 text-teal-700" />
            <span>৮-স্লটের ডকুমেন্ট ভল্ট</span>
          </div>
          <div className="h-3 w-px bg-slate-300"></div>
          <div className="flex items-center gap-1.5 text-amber-800">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>১-ক্লিকে আবেদন</span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-2 shadow-2xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3 bg-slate-100 border border-slate-200 rounded-2xl text-slate-900 text-xs flex items-center gap-2 shadow-2xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-slate-700" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-4 text-sm">
          
          {/* Dual Bilingual Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                পূর্ণ নাম (বাংলায় - NID অনুযায়ী) *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={nameBn}
                  onChange={(e) => setNameBn(e.target.value)}
                  placeholder="যেমন: মোঃ তানভীর হাসান"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-slate-400/20 focus:outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name (in English - SSC)
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. MD. TANVIR HASAN"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-slate-400/20 focus:outline-none placeholder:text-slate-400 uppercase"
                />
              </div>
            </div>
          </div>

          {/* Primary Email Address (Required) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ইমেইল এড্রেস (ভেরিফিকেশনের জন্য আবশ্যক) *
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-slate-400/20 focus:outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Optional Phone Number & District */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  মোবাইল নম্বর (ঐচ্ছিক)
                </label>
                {isPhoneStarted && (
                  <span className={`text-[10px] font-mono font-bold ${
                    isPhoneValid ? 'text-slate-800' : 'text-amber-600'
                  }`}>
                    {isPhoneValid ? 'সঠিক' : `${cleanPhone.length}/১১`}
                  </span>
                )}
              </div>
              <div className="relative">
                <Phone className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  isPhoneValid ? 'text-slate-700' : 'text-slate-400'
                }`} />
                <input
                  type="tel"
                  maxLength={14}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono font-bold focus:ring-2 focus:ring-slate-400/20 focus:outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                নিজ জেলা *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-slate-400/20 focus:outline-none bg-white"
                >
                  {Object.entries(BD_DIVISIONS_MAP).map(([divKey, divData]) => (
                    <optgroup key={divKey} label={`${divData.bn} বিভাগ (${divKey})`}>
                      {divData.districts.map((d) => (
                        <option key={d.en} value={d.bn}>
                          {d.bn} ({d.en})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Password & Confirmation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="পাসওয়ার্ড দিন"
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-slate-400/20 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  কনফার্ম পাসওয়ার্ড *
                </label>
                {confirmPassword && (
                  <span className={`text-[10px] font-bold ${
                    isConfirmMatch ? 'text-slate-800' : 'text-rose-600'
                  }`}>
                    {isConfirmMatch ? 'মিল রয়েছে' : 'অমিল'}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  isConfirmMatch ? 'text-slate-700' : 'text-slate-400'
                }`} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="পুনরায় পাসওয়ার্ড লিখুন"
                  className={`w-full pl-10 pr-9 py-2.5 rounded-xl border text-xs text-slate-900 font-medium focus:ring-2 focus:outline-none ${
                    isConfirmMatch 
                      ? 'border-slate-400 bg-slate-100/20 focus:ring-slate-400/20' 
                      : isConfirmMismatch 
                      ? 'border-rose-400 focus:ring-rose-500' 
                      : 'border-slate-300 focus:ring-slate-400/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>অ্যাকাউন্ট তৈরি হচ্ছে...</span>
              </>
            ) : (
              <>
                <span>ফ্রি অ্যাকাউন্ট তৈরি করুন</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Social Sign Up Divider */}
          <div className="relative py-1 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <span className="relative bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              অথবা গুগল দিয়ে সাইনআপ
            </span>
          </div>

          <GoogleSignInButton
            label="Google দিয়ে সাইন-আপ করুন"
            onSuccess={() => {
              setSuccessMsg('গুগল সাইন-আপ সফল হয়েছে! ড্যাশবোর্ডে যাওয়া হচ্ছে...');
              setTimeout(() => {
                window.location.href = getRedirectUrl();
              }, 500);
            }}
            onError={(msg) => setErrorMsg(msg)}
          />
        </form>

        {/* Existing User Login Link */}
        <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
          আগে থেকেই অ্যাকাউন্ট আছে?{' '}
          <Link 
            href={redirectTarget ? `/login?redirect=${encodeURIComponent(redirectTarget)}` : '/login'} 
            className="text-slate-800 font-bold hover:underline"
          >
            সরাসরি লগইন করুন
          </Link>
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
          setSuccessMsg('ইমেইল ভেরিফিকেশন সফল হয়েছে! ড্যাশবোর্ডে যাওয়া হচ্ছে...');
          window.location.href = getRedirectUrl();
        }}
      />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-3 sm:px-6 py-6 sm:py-10 bg-slate-50/60">
      <Suspense fallback={<div className="text-xs text-slate-400 font-bold">লোড হচ্ছে...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
