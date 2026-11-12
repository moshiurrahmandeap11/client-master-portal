export const COUNTRIES = [
  { name: 'Bangladesh', bn: 'বাংলাদেশ', code: 'BD', dialCode: '+880' },
  { name: 'United States', bn: 'যুক্তরাষ্ট্র', code: 'US', dialCode: '+1' },
  { name: 'United Kingdom', bn: 'যুক্তরাজ্য', code: 'GB', dialCode: '+44' },
  { name: 'Canada', bn: 'কানাডা', code: 'CA', dialCode: '+1' },
  { name: 'Australia', bn: 'অস্ট্রেলিয়া', code: 'AU', dialCode: '+61' },
  { name: 'United Arab Emirates', bn: 'সংযুক্ত আরব আমিরাত', code: 'AE', dialCode: '+971' },
  { name: 'Saudi Arabia', bn: 'সৌদি আরব', code: 'SA', dialCode: '+966' },
  { name: 'Malaysia', bn: 'মালয়েশিয়া', code: 'MY', dialCode: '+60' },
  { name: 'Singapore', bn: 'সিঙ্গাপুর', code: 'SG', dialCode: '+65' },
  { name: 'Japan', bn: 'জাপান', code: 'JP', dialCode: '+81' },
  { name: 'South Korea', bn: 'দক্ষিণ কোরিয়া', code: 'KR', dialCode: '+82' },
  { name: 'Germany', bn: 'জার্মানি', code: 'DE', dialCode: '+49' },
] as const;

export type CountryOption = (typeof COUNTRIES)[number];
