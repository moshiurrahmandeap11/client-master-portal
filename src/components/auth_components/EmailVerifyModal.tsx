'use client';

import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, AlertCircle, RotateCcw, ArrowRight, X, ShieldCheck } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { extractErrorMessage } from '@/lib/api-error';
import { storage } from '@/lib/store';

interface EmailVerifyModalProps {
  isOpen: boolean;
  email: string;
  initialDevOtp?: string;
  onClose: () => void;
  onVerified: (user: any) => void;
}

export default function EmailVerifyModal({
  isOpen,
  email,
  initialDevOtp,
  onClose,
  onVerified
}: EmailVerifyModalProps) {
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState(initialDevOtp || '');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    setDevOtp(initialDevOtp || '');
  }, [initialDevOtp]);

  useEffect(() => {
    if (!isOpen || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, countdown]);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!otp.trim() || otp.trim().length < 6) {
      setError('অনুগ্রহ করে ৬-ডিজিটের সঠিক ভেরিফিকেশন কোড প্রদান করুন।');
      return;
    }

    setIsLoading(true);
    try {
      const data = await authService.verifyEmail({
        email: email.trim().toLowerCase(),
        otp: otp.trim()
      });

      if (data?.success) {
        storage.setAuth({
          isLoggedIn: true,
          role: 'candidate',
          name: data.user?.name || data.user?.nameBn || 'চাকরিপ্রার্থী',
          phone: data.user?.phone || '',
          userId: data.user?.id || ''
        });
        setMessage(data.message || 'ইমেইল সফলভাবে ভেরিফাই হয়েছে!');
        setTimeout(() => {
          onVerified(data.user);
        }, 500);
      } else {
        setError(data?.error || 'ভুল ওটিপি কোড!');
        setIsLoading(false);
      }
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'ওটিপি যাচাই করতে ব্যর্থ হয়েছে।'));
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setMessage('');
    setIsLoading(true);
    try {
      const data = await authService.resendVerification({
        email: email.trim().toLowerCase()
      });
      if (data?.success) {
        setMessage(data.message || 'নতুন ভেরিফিকেশন কোড পাঠানো হয়েছে।');
        if (data.devOtp) setDevOtp(data.devOtp);
        setCountdown(60);
      } else {
        setError(data?.error || 'কোড পাঠানো যায়নি।');
      }
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'পুনরায় কোড পাঠাতে ব্যর্থ হয়েছে।'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-slate-900">ইমেইল ভেরিফিকেশন</h3>
          <p className="text-xs text-slate-500">
            আপনার ইমেইল <strong className="text-slate-800">{email}</strong>-এ পাঠানো ৬-সংখ্যার ওটিপি কোডটি দিন:
          </p>
        </div>

        {error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2 font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        {devOtp && (
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
            <span>ডেভ/সিমুলেটেড ওটিপি:</span>
            <strong className="font-mono text-sm tracking-widest bg-amber-100 px-2 py-0.5 rounded">{devOtp}</strong>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">৬-ডিজিটের ওটিপি কোড</label>
            <input
              type="text"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-center text-lg font-black font-mono tracking-[0.4em] text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isLoading ? 'যাচাই করা হচ্ছে...' : 'ইমেইল ভেরিফাই ও লগইন করুন'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">কোড পাননি?</span>
          {countdown > 0 ? (
            <span className="text-slate-400 font-semibold">পুনরায় পাঠাতে অপেক্ষা করুন ({countdown}s)</span>
          ) : (
            <button
              type="button"
              disabled={isLoading}
              onClick={handleResend}
              className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 hover:underline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>নতুন কোড পাঠান</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
