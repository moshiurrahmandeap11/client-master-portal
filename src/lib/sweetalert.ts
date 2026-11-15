'use client';

import Swal from 'sweetalert2';

// Chakri Sheba Emerald Brand Theme Configuration
export const customSwal = Swal.mixin({
  customClass: {
    popup: 'rounded-3xl p-6 shadow-2xl border border-slate-100 font-solaiman',
    title: 'text-lg font-bold text-slate-800 tracking-tight',
    htmlContainer: 'text-sm text-slate-600 leading-relaxed',
    confirmButton: 'px-5 py-2.5 rounded-[7px] bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm shadow-md transition-all outline-none cursor-pointer',
    cancelButton: 'px-5 py-2.5 rounded-[7px] bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-sm transition-all outline-none ml-2 cursor-pointer',
    actions: 'gap-2 mt-4',
  },
  buttonsStyling: false,
});

export const toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3500,
  timerProgressBar: true,
  customClass: {
    popup: 'rounded-2xl shadow-xl border border-slate-100 font-solaiman p-3',
    title: 'text-sm font-semibold text-slate-800',
  },
  didOpen: (toastEl) => {
    toastEl.addEventListener('mouseenter', Swal.stopTimer);
    toastEl.addEventListener('mouseleave', Swal.resumeTimer);
  },
});

export const showAlert = (
  message: string,
  type: 'success' | 'error' | 'warning' | 'info' = 'info',
  title?: string
) => {
  if (typeof window === 'undefined') return Promise.resolve();

  const defaultTitles: Record<string, string> = {
    success: 'সফল হয়েছে!',
    error: 'বিজ্ঞপ্তি / ত্রুটি',
    warning: 'সতর্কতা',
    info: 'বিজ্ঞপ্তি',
  };

  return customSwal.fire({
    icon: type,
    title: title || defaultTitles[type] || 'বিজ্ঞপ্তি',
    text: message,
    confirmButtonText: 'ঠিক আছে',
  });
};

export const showSuccess = (message: string, title: string = 'সফল হয়েছে!') => {
  return showAlert(message, 'success', title);
};

export const showError = (message: string, title: string = 'ব্যর্থ হয়েছে') => {
  return showAlert(message, 'error', title);
};

export const showConfirm = async (message: string, title: string = 'আপনি কি নিশ্চিত?'): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  const res = await customSwal.fire({
    icon: 'warning',
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: 'হ্যাঁ, নিশ্চিত',
    cancelButtonText: 'বাতিল',
    reverseButtons: true,
  });

  return res.isConfirmed;
};

// Global interceptor to replace window.alert everywhere in the frontend seamlessly
export function initSweetAlert() {
  if (typeof window === 'undefined') return;

  const originalAlert = window.alert;

  window.alert = (message?: any) => {
    const text = typeof message === 'object' ? JSON.stringify(message, null, 2) : String(message ?? '');

    const lower = text.toLowerCase();
    const isError =
      text.includes('ব্যর্থ') ||
      text.includes('ভুল') ||
      text.includes('ত্রুটি') ||
      text.includes('সমস্যা') ||
      lower.includes('error') ||
      lower.includes('failed') ||
      lower.includes('invalid');

    const isSuccess =
      text.includes('সফল') ||
      text.includes('সংরক্ষিত') ||
      text.includes('ধন্যবাদ') ||
      lower.includes('success') ||
      lower.includes('saved');

    const isWarning =
      text.includes('সতর্ক') ||
      text.includes('সাবধান') ||
      text.includes('প্রয়োজন') ||
      lower.includes('warning') ||
      lower.includes('required');

    const iconType: 'success' | 'error' | 'warning' | 'info' = isError
      ? 'error'
      : isSuccess
      ? 'success'
      : isWarning
      ? 'warning'
      : 'info';

    const defaultTitle = isError ? 'ব্যর্থ হয়েছে' : isSuccess ? 'সফল হয়েছে!' : 'বিজ্ঞপ্তি';

    customSwal.fire({
      icon: iconType,
      title: defaultTitle,
      text: text,
      confirmButtonText: 'ঠিক আছে',
    });
  };

  // Keep a reference to the native alert if ever needed
  (window as any).__originalNativeAlert = originalAlert;
}

export default customSwal;
