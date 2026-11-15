'use client';

import React, { useEffect, useRef, useState } from 'react';
import { loginService } from '@/services/login.service';
import { extractErrorMessage } from '@/lib/api-error';
import { storage } from '@/lib/store';

interface GoogleSignInButtonProps {
  onSuccess?: (user: any) => void;
  onError?: (msg: string) => void;
  label?: string;
}

declare global {
  interface Window {
    google?: any;
  }
}

export default function GoogleSignInButton({ 
  onSuccess, 
  onError,
  label = 'Google দিয়ে প্রবেশ করুন'
}: GoogleSignInButtonProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCredentialResponse = async (response: any) => {
    if (!response?.credential) {
      onError?.('গুগল থেকে ক্রেডেনশিয়াল পাওয়া যায়নি।');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginService.googleSignIn(response.credential);
      const user = res?.user || res?.data?.user;

      if (res?.success && user) {
        storage.setAuth({
          isLoggedIn: true,
          role: 'candidate',
          name: user.name || user.nameBn || 'চাকরিপ্রার্থী',
          phone: user.phone || '',
          userId: user.id || ''
        });
        onSuccess?.(user);
      } else {
        onError?.(res?.error || 'গুগল সাইন-ইন ব্যর্থ হয়েছে।');
      }
    } catch (err: unknown) {
      onError?.(extractErrorMessage(err, 'গুগল সাইন-ইন প্রক্রিয়াকরণে ত্রুটি হয়েছে।'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!clientId) return;

    const initializeGoogle = () => {
      if (window.google?.accounts?.id && googleBtnRef.current) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'continue_with',
          shape: 'rectangular',
          locale: 'bn'
        });
        setIsScriptLoaded(true);
      }
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
      return;
    }

    const scriptId = 'google-gsi-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', initializeGoogle);
    }
  }, [clientId]);

  const handleFallbackClick = () => {
    if (!clientId) {
      onError?.('Google OAuth এখনো কনফিগার করা হয়নি। frontend/.env.local এবং backend/.env ফাইলে GOOGLE_CLIENT_ID সেট করলে গুগল লগইন সরাসরি কাজ করবে।');
      return;
    }
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    }
  };

  if (clientId) {
    return (
      <div className="w-full space-y-1">
        <div ref={googleBtnRef} className="w-full flex justify-center min-h-[42px]" />
        {!isScriptLoaded && (
          <button
            type="button"
            disabled={isLoading}
            onClick={handleFallbackClick}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-[4px] text-xs font-normal text-slate-700 shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>{isLoading ? 'প্রক্রিয়াকরণ হচ্ছে...' : label}</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleFallbackClick}
      className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-[4px] text-xs font-normal text-slate-700 shadow-2xs flex items-center justify-center gap-2 transition-all hover:border-slate-400 cursor-pointer"
    >
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
      </svg>
      <span>{label}</span>
    </button>
  );
}
