export const JOB_CATEGORY_OPTIONS = [
  { key: 'govt', labelBn: 'সরকারি চাকরি', labelEn: 'Government Jobs', href: '/government-jobs' },
  { key: 'bank', labelBn: 'ব্যাংক ও আর্থিক', labelEn: 'Bank & Finance', href: '/bank-jobs' },
  { key: 'private', labelBn: 'বেসরকারি ও কর্পোরেট', labelEn: 'Private & Corporate', href: '/private-jobs' },
  { key: 'it', labelBn: 'আইটি ও সফটওয়্যার', labelEn: 'IT & Software', href: '/it-jobs' },
  { key: 'ngo', labelBn: 'এনজিও ও উন্নয়ন', labelEn: 'NGO & Development', href: '/ngo-jobs' },
  { key: 'teacher', labelBn: 'শিক্ষক ও একাডেমিক', labelEn: 'Teaching & Academic', href: '/teacher-jobs' },
  { key: 'health', labelBn: 'চিকিৎসা ও স্বাস্থ্য', labelEn: 'Medical & Health', href: '/medical-jobs' },
  { key: 'engineer', labelBn: 'প্রকৌশল ও কারিগরি', labelEn: 'Engineering', href: '/engineering-jobs' },
  { key: 'international', labelBn: 'বিদেশি ও আন্তর্জাতিক', labelEn: 'International', href: '/international-jobs' },
] as const;

export const PAYMENT_METHOD_OPTIONS = [
  { id: 'bKash', label: 'বিকাশ (bKash)', number: '01774366643' },
  { id: 'Nagad', label: 'নগদ (Nagad)', number: '01774366643' },
  { id: 'Wallet', label: 'চাকরি সেবা ওয়ালেট', number: '' },
] as const;

export const QUOTA_OPTIONS = [
  'সাধারণ (General)',
  'মুক্তিযোদ্ধা / শহীদ মুক্তিযোদ্ধা সন্তান',
  'প্রতিবন্ধী (Physically Challenged)',
  'ক্ষুদ্র নৃ-গোষ্ঠী (Ethnic Minority)',
  'আনসার ও ভিডিপি',
  'এতিম ও শারীরিক প্রতিবন্ধী',
] as const;
