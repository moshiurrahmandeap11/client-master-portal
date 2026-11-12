const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function toBanglaNumber(input: number | string): string {
  return String(input).replace(/\d/g, (d) => BN_DIGITS[Number(d)] ?? d);
}

export function formatCurrencyBDT(amount: number): string {
  const clean = Number.isFinite(amount) ? Math.round(amount) : 0;
  return `৳${toBanglaNumber(clean.toLocaleString('en-US'))}`;
}

export function formatDateBn(dateInput: string | Date): string {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(date.getTime())) return String(dateInput);
  const months = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
  ];
  return `${toBanglaNumber(date.getDate())} ${months[date.getMonth()]} ${toBanglaNumber(date.getFullYear())}`;
}
